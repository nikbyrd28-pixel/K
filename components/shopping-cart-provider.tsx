'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface CartItem {
  id: string
  variantId: string
  title: string
  price: number
  quantity: number
  image: string
}

interface ShoppingCartContextType {
  cart: CartItem[]
  cartCount: number
  subtotal: number
  isOpen: boolean
  isCheckingOut: boolean
  checkoutError: string | null
  openCart: () => void
  closeCart: () => void
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  checkout: () => Promise<void>
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined)

export function ShoppingCartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      }
      return [...prev, item]
    })
    setIsOpen(true)
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    setCart([])
  }

  // Orders are placed directly with Hubs & Babydoll (email/Instagram) rather than
  // an online checkout — we confirm total, availability, and pickup/delivery personally.
  const checkout = async () => {
    if (cart.length === 0) return
    const lines = cart
      .map((item) => `- ${item.title} x ${item.quantity}  ($${(item.price * item.quantity).toFixed(2)})`)
      .join('\n')
    const body =
      `Hi Hubs & Babydoll,\n\nI'd love to order:\n\n${lines}\n\n` +
      `Estimated subtotal: $${subtotal.toFixed(2)}\n\n` +
      `My name:\nPickup or delivery:\nAnything else:\n\nThank you!`
    const href = `mailto:hubsbabydoll@gmail.com?subject=${encodeURIComponent(
      'Order from hubsandbabydoll.com',
    )}&body=${encodeURIComponent(body)}`
    if (typeof window !== 'undefined') window.location.href = href
  }

  return (
    <ShoppingCartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        isOpen,
        isCheckingOut,
        checkoutError,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  )
}

export function useShoppingCart() {
  const context = useContext(ShoppingCartContext)
  if (!context) {
    throw new Error('useShoppingCart must be used within ShoppingCartProvider')
  }
  return context
}
