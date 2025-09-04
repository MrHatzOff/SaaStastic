'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Company {
  id: string
  name: string
  slug: string
  description?: string
  industry?: string
  size?: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  createdAt: string
  updatedAt: string
}

interface CompanyFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (company: Company) => void
  company?: Company | null
  mode: 'create' | 'edit'
}

export function CompanyFormModal({ isOpen, onClose, onSuccess, company, mode }: CompanyFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: company?.name || '',
    slug: company?.slug || '',
    description: company?.description || '',
    industry: company?.industry || '',
    size: company?.size || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const url = mode === 'create' ? '/api/companies' : `/api/companies/${company?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess(data.data)
        onClose()
        // Reset form
        setFormData({
          name: '',
          slug: '',
          description: '',
          industry: '',
          size: '',
        })
      } else {
        if (data.details) {
          // Handle validation errors
          const fieldErrors: Record<string, string> = {}
          data.details.forEach((detail: any) => {
            fieldErrors[detail.path] = detail.message
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ general: data.error || 'An error occurred' })
        }
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setErrors({})
    if (mode === 'create') {
      setFormData({
        name: '',
        slug: '',
        description: '',
        industry: '',
        size: '',
      })
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData({ ...formData, name })
    
    if (mode === 'create' && !formData.slug) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, name, slug }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Company' : 'Edit Company'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new company to manage customers and team members.'
              : 'Update your company information and settings.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="My Company"
              required
            />
            {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Company Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="my-company"
              required
            />
            <p className="text-xs text-gray-500">
              Used in URLs. Only lowercase letters, numbers, and hyphens allowed.
            </p>
            {errors.slug && <p className="text-red-600 text-sm">{errors.slug}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of your company..."
              rows={3}
            />
            {errors.description && <p className="text-red-600 text-sm">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="Technology, Healthcare, Finance..."
            />
            {errors.industry && <p className="text-red-600 text-sm">{errors.industry}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Company Size</Label>
            <select
              id="size"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select company size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
            {errors.size && <p className="text-red-600 text-sm">{errors.size}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Company' : 'Update Company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
