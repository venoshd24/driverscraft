// src/lib/types.ts

export interface Product {
  id: string
  name: string
  description: string
  price: number        // cents
  category: 'apparel' | 'headwear' | 'accessories'
  emoji: string
  badge: string | null
  stock: number
  stripe_price_id: string | null
  active: boolean
  created_at: string
}

export interface CartItem extends Product {
  qty: number
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  tag: string
  author_name: string
  author_initials: string
  emoji: string
  image_url: string | null
  featured: boolean
  published_at: string
}

export interface Order {
  id: string
  stripe_session_id: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  created_at: string
  order_items: OrderItem[]
}

export interface OrderItem {
  id: string
  product_name: string
  product_emoji: string
  quantity: number
  unit_price: number
}

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  favourite_driver: string | null
  avatar_url: string | null
}
