// src/app/admin/products/new/page.tsx
import ProductForm from '@/components/admin/ProductForm'

export const metadata = { title: 'New Product — Admin' }

export default function NewProductPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#f0f5ec' }}>Add Product</h1>
        <p style={{ color: 'rgba(240,245,236,0.45)', marginTop: '0.3rem', fontSize: '0.9rem' }}>Create a new item for the shop</p>
      </div>
      <div style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '2rem' }}>
        <ProductForm />
      </div>
    </div>
  )
}
