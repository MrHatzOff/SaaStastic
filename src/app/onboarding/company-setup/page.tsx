'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, ArrowRight } from 'lucide-react'

export default function CompanySetupPage() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-generate slug from name if slug is empty or matches auto-generated pattern
    if (name === 'name' && !formData.slug) {
      const baseSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      // Add short random suffix for uniqueness (3 characters)
      const randomSuffix = Math.random().toString(36).substr(2, 3)
      const uniqueSlug = `${baseSlug}-${randomSuffix}`
      setFormData(prev => ({
        ...prev,
        slug: uniqueSlug
      }))
    }

    // Clean up slug as user types (allow letters, numbers, and hyphens)
    if (name === 'slug') {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9-]+/g, '').replace(/^-|-$/g, '')
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to dashboard after successful company creation
        router.push('/dashboard')
      } else {
        // Handle specific error cases
        if (response.status === 409 && data.error?.includes('slug')) {
          // Generate a new unique slug for them
          const baseSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          const randomSuffix = Math.random().toString(36).substr(2, 3)
          const newSlug = `${baseSlug}-${randomSuffix}`
          setFormData(prev => ({
            ...prev,
            slug: newSlug
          }))
          setError(`That slug is taken. Try this instead: ${newSlug}`)
        } else {
          setError(data.error || 'Failed to create company')
        }
      }
    } catch (error) {
      setError('An error occurred while creating your company')
      console.error('Company creation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to SaaStastic!</CardTitle>
          <CardDescription>
            Let's set up your company to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Your Company Name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Company Slug *</Label>
              <Input
                id="slug"
                name="slug"
                type="text"
                required
                placeholder="your-company-slug"
                value={formData.slug}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500">
                This will be your unique URL identifier
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !formData.name.trim() || !formData.slug.trim()}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Company...
                </>
              ) : (
                <>
                  Create Company
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
