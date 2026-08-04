'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShoppingCart } from './shopping-cart-provider'
import { useProducts } from '@/hooks/use-products'
import { getMerch } from '@/lib/merchandising'

export function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    subtotal,
    updateQuantity,
    removeFromCart,
    cartCount,
  } = useShoppingCart()

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-card border-l border-border flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Shopping cart drawer"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-border">
          <h2 className="font-serif text-2xl tracking-wide text-primary">
            Your Cart{cartCount > 0 ? ` (${cartCount})` : ''}
          </h2>
          <button
            onClick={closeCart}
            className="text-foreground/70 hover:text-primary transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button
              onClick={closeCart}
              className="rounded-none text-xs uppercase tracking-[0.18em] mt-2"
            >
              Explore the Collection
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative w-20 h-20 bg-muted flex-shrink-0 overflow-hidden rounded-sm">
                  {item.image && (
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-serif text-lg leading-snug truncate">{item.title}</h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                      aria-label={`Remove ${item.title}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-primary mt-1">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-primary transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-primary transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Complete your order — gentle cross-sell */}
        {cart.length > 0 && <CompleteYourOrder />}

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-border px-6 py-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Estimated Total
              </span>
              <span className="font-serif text-2xl text-primary">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No card charged online — you&apos;ll add your details, then we confirm your total,
              availability, and payment personally.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full inline-flex items-center justify-center rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-12 font-medium transition-colors"
            >
              Proceed to Checkout
            </Link>
            <a
              href="https://www.instagram.com/hubs_babydoll"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center rounded-none border border-primary/40 text-foreground hover:bg-primary/10 text-xs uppercase tracking-[0.2em] h-12 transition-colors"
            >
              Order on Instagram
            </a>
          </div>
        )}
      </aside>
    </>
  )
}

// Suggests a couple of products not already in the cart — one tap to add.
function CompleteYourOrder() {
  const { cart, addToCart } = useShoppingCart()
  const { products } = useProducts()

  const inCart = (name: string) => cart.some((i) => i.title.startsWith(name))

  const suggestions = products
    .map((product) => ({ product, merch: getMerch(product) }))
    .filter(({ merch }) => !merch.allSoldOut && !inCart(merch.name))
    .slice(0, 2)

  if (suggestions.length === 0) return null

  return (
    <div className="border-t border-border px-6 py-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
        Complete your order
      </p>
      <div className="flex flex-col gap-3">
        {suggestions.map(({ product, merch }) => {
          const size = merch.sizes.find((s) => !s.soldOut) ?? merch.sizes[0]
          return (
            <div key={product.handle} className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-sm bg-muted">
                {product.image && (
                  <Image src={product.image} alt={merch.name} fill className="object-cover" sizes="48px" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug truncate">{merch.name}</p>
                <p className="text-xs text-primary mt-0.5">${size.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() =>
                  addToCart({
                    id: size.variantId ?? `${product.id}-${size.label}`,
                    variantId: size.variantId ?? product.variantId,
                    title: `${merch.name} — ${size.label}`,
                    price: size.price,
                    quantity: 1,
                    image: product.image,
                  })
                }
                className="flex-shrink-0 inline-flex items-center gap-1 border border-primary/40 text-primary hover:bg-primary/10 text-[11px] uppercase tracking-[0.14em] px-3 h-9 transition-colors"
                aria-label={`Add ${merch.name}`}
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
