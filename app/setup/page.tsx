'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const createProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/create-products', {
        method: 'POST',
      })
      const data = await response.json()
      console.log('[v0] Response:', data)
      setResults(data)
    } catch (error) {
      console.error('[v0] Error:', error)
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Hubs & Babydoll Store Setup</h1>

        <div className="bg-card rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Create Sample Products</h2>
          <p className="mb-6 text-muted-foreground">
            Click the button below to create 3 sample products in your Shopify store.
          </p>

          <Button
            onClick={createProducts}
            disabled={loading}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? 'Creating Products...' : 'Create Products'}
          </Button>
        </div>

        {results && (
          <div className="bg-card rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">Results:</h3>
            <pre className="bg-secondary p-4 rounded overflow-auto max-h-96 text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
