'use client'
// src/app/admin/AdminAnalytics.tsx

import { useState } from 'react'

interface DayData { date: string; revenue: number; orders: number }
interface ProductData { name: string; emoji: string; qty: number }

export default function AdminAnalytics({ dailyRevenue, topProducts }: {
  dailyRevenue: DayData[]
  topProducts: ProductData[]
}) {
  const [view, setView] = useState<'revenue' | 'orders'>('revenue')

  const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1)
  const maxOrders = Math.max(...dailyRevenue.map(d => d.orders), 1)
  const maxVal = view === 'revenue' ? maxRevenue : maxOrders

  const totalRevenue30 = dailyRevenue.reduce((s, d) => s + d.revenue, 0)
  const totalOrders30 = dailyRevenue.reduce((s, d) => s + d.orders, 0)
  const maxQty = Math.max(...topProducts.map(p => p.qty), 1)

  // Show every 5th label to avoid crowding
  const showLabel = (i: number) => i % 5 === 0 || i === dailyRevenue.length - 1

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem', marginBottom: '2.5rem' }}>

      {/* Revenue chart */}
      <div style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: '#f0f5ec', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {view === 'revenue' ? 'Revenue' : 'Orders'} — Last 30 Days
            </h2>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '1.4rem', fontWeight: 700, color: '#c8a84b' }}>
              {view === 'revenue' ? `RM ${totalRevenue30.toFixed(2)}` : `${totalOrders30} orders`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['revenue', 'orders'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '0.3rem 0.75rem', borderRadius: 6, border: '1px solid',
                borderColor: view === v ? '#c8a84b' : 'rgba(255,255,255,0.1)',
                background: view === v ? 'rgba(200,168,75,0.15)' : 'transparent',
                color: view === v ? '#c8a84b' : 'rgba(240,245,236,0.4)',
                fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                textTransform: 'capitalize',
              }}>{v}</button>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120, paddingBottom: '1.5rem', position: 'relative' }}>
          {/* Y-axis guide lines */}
          {[0.25, 0.5, 0.75, 1].map(pct => (
            <div key={pct} style={{
              position: 'absolute', left: 0, right: 0,
              bottom: `calc(1.5rem + ${pct * 120}px - 1px)`,
              borderTop: '1px solid rgba(255,255,255,0.04)',
              pointerEvents: 'none',
            }} />
          ))}

          {dailyRevenue.map((day, i) => {
            const val = view === 'revenue' ? day.revenue : day.orders
            const height = maxVal > 0 ? Math.max((val / maxVal) * 100, val > 0 ? 4 : 0) : 0
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, height: '100%', position: 'relative' }}>
                {/* Tooltip on hover */}
                <div className="chart-bar-tooltip" style={{
                  position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                  background: '#0a1510', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 5, padding: '4px 8px', fontSize: '0.65rem',
                  color: '#f0f5ec', whiteSpace: 'nowrap', pointerEvents: 'none',
                  opacity: 0, transition: 'opacity 0.15s', zIndex: 10, marginBottom: 4,
                }}>
                  {view === 'revenue' ? `RM ${val.toFixed(2)}` : `${val} orders`}
                  <br /><span style={{ color: 'rgba(240,245,236,0.4)' }}>{day.date}</span>
                </div>
                <div
                  style={{
                    width: '100%', height: `${height}%`, minHeight: val > 0 ? 3 : 0,
                    background: val > 0 ? 'linear-gradient(to top, #0e6640, #2d8a5e)' : 'transparent',
                    borderRadius: '2px 2px 0 0', transition: 'height 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    const tooltip = e.currentTarget.previousElementSibling as HTMLElement
                    if (tooltip) tooltip.style.opacity = '1'
                  }}
                  onMouseLeave={e => {
                    const tooltip = e.currentTarget.previousElementSibling as HTMLElement
                    if (tooltip) tooltip.style.opacity = '0'
                  }}
                />
                {showLabel(i) && (
                  <span style={{ fontSize: '0.55rem', color: 'rgba(240,245,236,0.25)', position: 'absolute', bottom: -18, whiteSpace: 'nowrap' }}>
                    {day.date}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Top products */}
      <div style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '1.5rem' }}>
        <h2 style={{ color: '#f0f5ec', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Top Products</h2>
        {topProducts.length === 0 ? (
          <p style={{ color: 'rgba(240,245,236,0.3)', fontSize: '0.82rem' }}>No sales yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topProducts.map((p, i) => (
              <div key={p.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span style={{ fontSize: '1rem' }}>{p.emoji}</span>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(240,245,236,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  </div>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: '#c8a84b', fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>×{p.qty}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    width: `${(p.qty / maxQty) * 100}%`,
                    background: i === 0 ? '#c8a84b' : i === 1 ? '#0e6640' : 'rgba(255,255,255,0.2)',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: '1.25rem', paddingTop: '1.25rem' }}>
          <Link href="/admin/customers" style={{ color: 'rgba(240,245,236,0.4)', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            View all customers →
          </Link>
        </div>
      </div>
    </div>
  )
}

// Need to import Link
import Link from 'next/link'
