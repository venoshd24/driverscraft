'use client'
// src/lib/cart-context.tsx

import React, { createContext, useContext, useEffect, useState } from 'react'
import { CartItem, Product } from './types'

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  changeQty: (id: string, delta: number) => void
  clearCart: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dc_cart')
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('dc_cart', JSON.stringify(items))
  }, [items])

  function addItem(product: Product) {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function changeQty(id: string, delta: number) {
    setItems(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
      return updated.filter(i => i.qty > 0)
    })
  }

  function clearCart() { setItems([]) }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, changeQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
