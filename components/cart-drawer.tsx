'use client'

import Image from 'next/image'
import { X, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShoppingCart } from './shopping-cart-provider'

export function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    subtotal,
    updateQuantity,
    removeFromCart,
    checkout,
    isCheckingOut,
    checkoutError,
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
        aria-label="Care routine drawer"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-border">
          <h2 className="font-serif text-2xl tracking-wide text-primary">
            Your Routine{cartCount > 0 ? ` (${cartCount})` : ''}
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
            <p className="text-muted-foreground">Your routine is waiting.</p>
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

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-border px-6 py-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Subtotal
              </span>
              <span className="font-serif text-2xl text-primary">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping and taxes are calculated securely at checkout.
            </p>
            {checkoutError && <p className="text-xs text-destructive">{checkoutError}</p>}
            <Button
              onClick={checkout}
              disabled={isCheckingOut}
              className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-12"
            >
              {isCheckingOut ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Preparing Your Routine
                </span>
              ) : (
                'Complete Securely'
              )}
            </Button>
          </div>
        )}
      </aside>
    </>
  )
}
