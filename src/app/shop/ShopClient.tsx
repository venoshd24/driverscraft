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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [mobileSortOpen, setMobileSortOpen]   = useState(false)

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

  const sortLabel = SORTS.find(s => s.value === sort)?.label || 'Sort'
  const catLabel = cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)

  return (
    <>
      {/* ── MOBILE STICKY FILTER BAR ── */}
      <div className="shop-mobile-bar">
        {/* Filters button */}
        <div style={{ position: 'relative', flex: 1 }}>
          <button
            onClick={() => { setMobileFilterOpen(o => !o); setMobileSortOpen(false) }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)',
              padding: '0.75rem 0',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Filters {cat !== 'all' || stockFilter !== 'all' ? '·' : ''} {cat !== 'all' ? catLabel : ''}
          </button>

          {/* Filter dropdown */}
          {mobileFilterOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: '0 0 10px 10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 200, padding: '1rem',
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>Category</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CATS.map(c => (
                    <button key={c} onClick={() => setCat(c)} style={{
                      padding: '0.3rem 0.75rem', borderRadius: 20, border: '1px solid',
                      borderColor: cat === c ? 'var(--green-brand)' : 'var(--border)',
                      background: cat === c ? 'var(--green-brand)' : 'transparent',
                      color: cat === c ? '#fff' : 'var(--text-dark)',
                      fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
                    }}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>Availability</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {([['all','All'], ['in','In Stock'], ['out','Sold Out']] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setStockFilter(val)} style={{
                      padding: '0.3rem 0.75rem', borderRadius: 20, border: '1px solid',
                      borderColor: stockFilter === val ? 'var(--green-brand)' : 'var(--border)',
                      background: stockFilter === val ? 'var(--green-brand)' : 'transparent',
                      color: stockFilter === val ? '#fff' : 'var(--text-dark)',
                      fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
                    }}>{label}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => setMobileFilterOpen(false)} style={{
                width: '100%', marginTop: '1rem', padding: '0.6rem',
                background: 'var(--green-brand)', color: '#fff', border: 'none',
                borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
              }}>Apply</button>
            </div>
          )}
        </div>

        <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch' }} />

        {/* Sort button */}
        <div style={{ position: 'relative', flex: 1 }}>
          <button
            onClick={() => { setMobileSortOpen(o => !o); setMobileFilterOpen(false) }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)',
              padding: '0.75rem 0',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4l3-3 3 3M5 1v12M12 10l-3 3-3-3M9 13V1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sort by: {sortLabel}
          </button>

          {/* Sort dropdown */}
          {mobileSortOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: '0 0 10px 10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 200, overflow: 'hidden',
            }}>
              {SORTS.map(s => (
                <button key={s.value} onClick={() => { setSort(s.value); setMobileSortOpen(false) }} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.75rem 1rem', border: 'none',
                  background: sort === s.value ? 'rgba(14,102,64,0.06)' : '#fff',
                  color: sort === s.value ? 'var(--green-brand)' : 'var(--text-dark)',
                  fontWeight: sort === s.value ? 600 : 400,
                  fontSize: '0.85rem', cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                }}>{s.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="shop-layout">

        {/* SIDEBAR — desktop only */}
        <aside className="shop-sidebar">
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Filters</div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Category</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {CATS.map(c => (
                <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', color: cat === c ? 'var(--green-brand)' : 'var(--text-dark)', fontWeight: cat === c ? 600 : 400 }}>
                  <input type="radio" name="cat" value={c} checked={cat === c} onChange={() => setCat(c)} style={{ accentColor: 'var(--green-brand)', width: 14, height: 14 }} />
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <button className="sidebar-toggle" onClick={() => setAvailOpen(o => !o)}>
              <span>Availability</span>
              <span style={{ transition: 'transform 0.2s', transform: availOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
            </button>
            {availOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                {([['all','All'], ['in','In Stock'], ['out','Sold Out']] as const).map(([val, label]) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', color: stockFilter === val ? 'var(--green-brand)' : 'var(--text-dark)', fontWeight: stockFilter === val ? 600 : 400 }}>
                    <input type="radio" name="stock" value={val} checked={stockFilter === val} onChange={() => setStockFilter(val)} style={{ accentColor: 'var(--green-brand)', width: 14, height: 14 }} />
                    {label}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <button className="sidebar-toggle" onClick={() => setPriceOpen(o => !o)}>
              <span>Price</span>
              <span style={{ transition: 'transform 0.2s', transform: priceOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
            </button>
            {priceOpen && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  <span>RM {priceMin}</span><span>RM {priceMax}</span>
                </div>
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

          <div className="sidebar-section">
            <button className="sidebar-toggle" onClick={() => setSortOpen(o => !o)}>
              <span>Sort By</span>
              <span style={{ transition: 'transform 0.2s', transform: sortOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
            </button>
            {sortOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                {SORTS.map(s => (
                  <label key={s.value} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', color: sort === s.value ? 'var(--green-brand)' : 'var(--text-dark)', fontWeight: sort === s.value ? 600 : 400 }}>
                    <input type="radio" name="sort" value={s.value} checked={sort === s.value} onChange={() => setSort(s.value)} style={{ accentColor: 'var(--green-brand)', width: 14, height: 14 }} />
                    {s.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* PRODUCTS */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
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
    </>
  )
}
