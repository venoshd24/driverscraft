'use client'
// src/app/shop/ShopClient.tsx

import { useState, useMemo } from 'react'
import ProductCard from '@/components/ui/ProductCard'
import { Product } from '@/lib/types'

const CATS = ['all', 'apparel', 'headwear', 'accessories']
const SORTS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'oldest',    label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc',label: 'Price: High → Low' },
  { value: 'az',        label: 'A → Z' },
  { value: 'za',        label: 'Z → A' },
]

export default function ShopClient({ products, initialCat }: { products: Product[]; initialCat: string }) {
  const [cat, setCat]             = useState(initialCat)
  const [sort, setSort]           = useState('newest')
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out'>('all')
  const [availOpen, setAvailOpen] = useState(true)
  const [priceOpen, setPriceOpen] = useState(true)
  const [sortOpen, setSortOpen]   = useState(true)

  const prices = products.map(p => p.price / 100)
  const absMin = Math.floor(Math.min(...prices))
  const absMax = Math.ceil(Math.max(...prices))
  const [priceMin, setPriceMin] = useState(absMin)
  const [priceMax, setPriceMax] = useState(absMax)

  const filtered = useMemo(() => {
    let list = [...products]
    if (cat !== 'all') list = list.filter(p => p.category === cat)
    if (stockFilter === 'in')  list = list.filter(p => p.stock > 0)
    if (stockFilter === 'out') list = list.filter(p => p.stock === 0)
    list = list.filter(p => p.price / 100 >= priceMin && p.price / 100 <= priceMax)
    switch (sort) {
      case 'newest':     list.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break
      case 'oldest':     list.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break
      case 'price-asc':  list.sort((a,b) => a.price - b.price); break
      case 'price-desc': list.sort((a,b) => b.price - a.price); break
      case 'az':         list.sort((a,b) => a.name.localeCompare(b.name)); break
      case 'za':         list.sort((a,b) => b.name.localeCompare(a.name)); break
    }
    return list
  }, [products, cat, sort, stockFilter, priceMin, priceMax])

  return (
    <div className="shop-layout">

      {/* ── SIDEBAR ── */}
      <aside className="shop-sidebar">
        <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Filters</div>

        {/* Category */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Category</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {CATS.map(c => (
              <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', color: cat === c ? 'var(--green-brand)' : 'var(--text-dark)', fontWeight: cat === c ? 600 : 400 }}>
                <input type="radio" name="cat" value={c} checked={cat === c} onChange={() => setCat(c)}
                  style={{ accentColor: 'var(--green-brand)', width: 14, height: 14 }} />
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="sidebar-section">
          <button className="sidebar-toggle" onClick={() => setAvailOpen(o => !o)}>
            <span>Availability</span>
            <span style={{ transition: 'transform 0.2s', transform: availOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>
          {availOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
              {([['all','All'], ['in','In Stock'], ['out','Sold Out']] as const).map(([val, label]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', color: stockFilter === val ? 'var(--green-brand)' : 'var(--text-dark)', fontWeight: stockFilter === val ? 600 : 400 }}>
                  <input type="radio" name="stock" value={val} checked={stockFilter === val} onChange={() => setStockFilter(val)}
                    style={{ accentColor: 'var(--green-brand)', width: 14, height: 14 }} />
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price range */}
        <div className="sidebar-section">
          <button className="sidebar-toggle" onClick={() => setPriceOpen(o => !o)}>
            <span>Price</span>
            <span style={{ transition: 'transform 0.2s', transform: priceOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>
          {priceOpen && (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                <span>RM {priceMin}</span>
                <span>RM {priceMax}</span>
              </div>
              {/* Dual range using two overlapping inputs */}
              <div className="price-slider-wrap">
                <input type="range" min={absMin} max={absMax} value={priceMin}
                  onChange={e => setPriceMin(Math.min(Number(e.target.value), priceMax - 1))}
                  className="price-slider price-slider-min" />
                <input type="range" min={absMin} max={absMax} value={priceMax}
                  onChange={e => setPriceMax(Math.max(Number(e.target.value), priceMin + 1))}
                  className="price-slider price-slider-max" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                <span>RM {absMin}</span><span>RM {absMax}</span>
              </div>
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="sidebar-section">
          <button className="sidebar-toggle" onClick={() => setSortOpen(o => !o)}>
            <span>Sort By</span>
            <span style={{ transition: 'transform 0.2s', transform: sortOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>
          {sortOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
              {SORTS.map(s => (
                <label key={s.value} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', color: sort === s.value ? 'var(--green-brand)' : 'var(--text-dark)', fontWeight: sort === s.value ? 600 : 400 }}>
                  <input type="radio" name="sort" value={s.value} checked={sort === s.value} onChange={() => setSort(s.value)}
                    style={{ accentColor: 'var(--green-brand)', width: 14, height: 14 }} />
                  {s.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── PRODUCTS ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
          {/* Category pills — also shown up top for quick access */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`btn btn-sm ${cat === c ? 'btn-green' : 'btn-outline'}`}
                style={cat !== c ? { color: 'var(--text-dark)', borderColor: 'var(--cream-dark)', fontSize: '0.75rem', padding: '0.3rem 0.8rem' } : { fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="shop-grid">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <p>No products match your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
