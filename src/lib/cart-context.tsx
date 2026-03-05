'use client'
// src/lib/cart-context.tsx

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { CartItem, Product } from './types'
import { createClient } from './supabase/client'

export interface CartItemWithStock extends CartItem {
  soldOut?: boolean
}

interface CartContextType {
  items: CartItemWithStock[]
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  changeQty: (id: string, delta: number) => void
  clearCart: () => void
  checkStock: () => Promise<any>
  total: number
  count: number
  hasSoldOut: boolean
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemWithStock[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Auth listener
  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load cart on auth change
  useEffect(() => {
    async function load() {
      if (userId) {
        const sb = createClient()
        const { data } = await sb
          .from('carts').select('items').eq('user_id', userId).single()
        const local = getLocalCart()
        if (data?.items?.length) {
          const merged = mergeCarts(data.items, local)
          setItems(merged)
          saveLocalCart([])
          await saveSupabaseCart(userId, merged)
        } else {
          setItems(local)
          if (local.length) await saveSupabaseCart(userId, local)
          saveLocalCart([])
        }
      } else {
        setItems(getLocalCart())
      }
      setLoaded(true)
    }
    load()
  }, [userId])

  // Persist on change
  useEffect(() => {
    if (!loaded) return
    if (userId) saveSupabaseCart(userId, items)
    else saveLocalCart(items)
  }, [items, userId, loaded])

  // Stock check:
  // - Products that no longer exist (deleted) → removed from cart silently
  // - Products with stock === 0 → marked soldOut
  // Returns { hadSoldOut, deletedNames }
  const checkStock = useCallback(async () => {
    if (!items.length) return { hadSoldOut: false, deletedNames: [] }
    const sb = createClient()
    const ids = items.map(i => i.id)

    const { data: products } = await sb
      .from('products').select('id, stock, name, active').in('id', ids)

    // Products not returned = deleted from DB entirely
    const returnedIds = new Set((products || []).map((p: any) => p.id))
    const deletedItems = items.filter(i => !returnedIds.has(i.id))
    const deletedNames = deletedItems.map(i => i.name)

    // Remove deleted items silently
    if (deletedItems.length) {
      setItems(prev => {
        const filtered = prev.filter(i => returnedIds.has(i.id))
        if (userId) saveSupabaseCart(userId, filtered)
        else saveLocalCart(filtered)
        return filtered
      })
    }

    // Mark sold-out (stock === 0 or active === false)
    const stockMap = Object.fromEntries(
      (products || []).map((p: any) => [p.id, { stock: p.stock, active: p.active }])
    )
    let hadSoldOut = false

    setItems(prev => prev
      .filter(i => returnedIds.has(i.id)) // double-ensure deleted are gone
      .map(item => {
        const info = stockMap[item.id]
        const soldOut = !info || info.stock === 0 || !info.active
        if (soldOut) hadSoldOut = true
        return { ...item, soldOut, stock: info?.stock ?? 0 }
      })
    )

    return { hadSoldOut, deletedNames }
  }, [items, userId])

  function addItem(product: Product) {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1, soldOut: false }]
    })
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function changeQty(id: string, delta: number) {
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
    )
  }

  function clearCart() {
    setItems([])
    if (userId) saveSupabaseCart(userId, [])
    saveLocalCart([])
  }

  const total = items.filter(i => !i.soldOut).reduce((s, i) => s + i.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)
  const hasSoldOut = items.some(i => i.soldOut)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, changeQty, clearCart, checkStock, total, count, hasSoldOut }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}

function getLocalCart(): CartItemWithStock[] {
  try {
    const stored = localStorage.getItem('dc_cart')
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

function saveLocalCart(items: CartItemWithStock[]) {
  try { localStorage.setItem('dc_cart', JSON.stringify(items)) } catch {}
}

async function saveSupabaseCart(userId: string, items: CartItemWithStock[]) {
  const sb = createClient()
  await sb.from('carts').upsert(
    { user_id: userId, items, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )
}

function mergeCarts(cloud: CartItemWithStock[], local: CartItemWithStock[]): CartItemWithStock[] {
  const merged = [...cloud]
  for (const localItem of local) {
    const existing = merged.find(i => i.id === localItem.id)
    if (existing) existing.qty += localItem.qty
    else merged.push(localItem)
  }
  return merged
}
