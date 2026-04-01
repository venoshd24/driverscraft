'use client'
// src/app/members/[id]/MemberGallery.tsx

import { useState } from 'react'

type Photo = { url: string; caption: string | null; meet: string | null }

export default function MemberGallery({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<Photo | null>(null)
  const [active, setActive]     = useState(0)

  if (photos.length === 0) return null

  const main = photos[0]

  return (
    <>
      <style>{`
        @keyframes lbIn { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:none } }
        .mg-thumb { transition: transform 0.2s, opacity 0.2s, border-color 0.2s; cursor: pointer; }
        .mg-thumb:hover { transform: scale(1.04); opacity: 1 !important; }
        .mg-main-img { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); cursor: zoom-in; }
        .mg-main-img:hover { transform: scale(1.02); }
      `}</style>

      <div>
        {/* Main image */}
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: '0.6rem', background: '#111', aspectRatio: '16/9', maxHeight: 420 }}
          onClick={() => setLightbox(photos[active])}>
          <img className="mg-main-img" src={photos[active].url} alt={photos[active].caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          {photos[active].meet && (
            <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.55)', color: 'var(--accent)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 10, backdropFilter: 'blur(6px)' }}>
              {photos[active].meet}
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 10, right: 12, background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', padding: '2px 8px', borderRadius: 8, backdropFilter: 'blur(4px)' }}>
            🔍 tap to expand
          </div>
        </div>

        {/* Caption */}
        {photos[active].caption && (
          <p style={{ color: 'rgba(240,245,236,0.5)', fontSize: '0.8rem', marginBottom: '0.75rem', lineHeight: 1.5, fontStyle: 'italic', paddingLeft: '0.25rem' }}>
            {photos[active].caption}
          </p>
        )}

        {/* Thumbnails */}
        {photos.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {photos.map((p, i) => (
              <button key={i} className="mg-thumb" onClick={() => setActive(i)} style={{
                width: 'clamp(52px,12vw,72px)', height: 'clamp(40px,9vw,54px)',
                borderRadius: 6, overflow: 'hidden', border: `2px solid ${i === active ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                padding: 0, background: '#111', flexShrink: 0,
                opacity: i === active ? 1 : 0.55,
              }}>
                <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', cursor: 'zoom-out' }}>
          <img src={lightbox.url} alt="" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8, objectFit: 'contain', animation: 'lbIn 0.25s ease both', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }} />
          {lightbox.caption && (
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '1rem', fontStyle: 'italic', textAlign: 'center', maxWidth: 500 }}>{lightbox.caption}</p>
          )}
          <button onClick={() => setLightbox(null)} style={{ position: 'fixed', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 40, height: 40, color: '#fff', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      )}
    </>
  )
}
