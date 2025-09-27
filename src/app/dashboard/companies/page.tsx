'use client'

import { useState, useEffect } from 'react'
import { useCompany } from '@/core/shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Plus, Building2, Users, Settings, Trash2, Edit } from 'lucide-react'
import { CompanyFormModal } from '@/features/companies/company-form-modal'

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

export default function CompaniesPage() {
  const { companies: contextCompanies, switchCompany, refreshCompanies } = useCompany()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      const data = await response.json()
      
      if (data.success) {
        setCompanies(data.data)
      } else {
        setError(data.error || 'Failed to fetch companies')
      }
    } catch (_err) {
      console.error('Failed to fetch companies:', _err)
    } finally {
      setLoading(false)
    }
  }

  const deleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone and will delete all associated data.')) return

    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      
      if (data.success) {
        setCompanies(companies.filter(c => c.id !== id))
        // Refresh company context
        await refreshCompanies()
      } else {
        alert(data.error || 'Failed to delete company')
      }
    } catch (err) {
      alert('Network error')
    }
  }

  const handleAddCompany = () => {
    setModalMode('create')
    setEditingCompany(null)
    setIsModalOpen(true)
  }

  const handleEditCompany = (company: Company) => {
    setModalMode('edit')
    setEditingCompany(company)
    setIsModalOpen(true)
  }

  const handleModalSuccess = async (company: Company) => {
    if (modalMode === 'create') {
      setCompanies([company, ...companies])
    } else {
      setCompanies(companies.map(c => c.id === company.id ? company : c))
    }
    // Refresh company context to update the provider
    await refreshCompanies()
  }

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'MEMBER':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
              <p className="text-sm text-gray-500">
                Manage your companies and switch between different organizations
              </p>
            </div>
            <Button onClick={handleAddCompany}>
              <Plus className="h-4 w-4 mr-2" />
              Create Company
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {companies.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Building2 className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first company.</p>
              <Button onClick={handleAddCompany}>
                <Plus className="h-4 w-4 mr-2" />
                Create Company
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={getRoleBadgeColor(company.role)}
                        >
                          {company.role}
                        </Badge>
                      </div>
                      <CardDescription>
                        @{company.slug}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      {(company.role === 'OWNER' || company.role === 'ADMIN') && (
                        <Button variant="ghost" size="sm" onClick={() => handleEditCompany(company)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {company.role === 'OWNER' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteCompany(company.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {company.description && (
                    <p className="text-sm text-gray-600">{company.description}</p>
                  )}
                  
                  {company.industry && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2" />
                      {company.industry}
                    </div>
                  )}
                  
                  {company.size && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {company.size}
                    </div>
                  )}
                  
                  <div className="pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => switchCompany(company.id)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Switch to Company
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Development Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>API Endpoint:</strong> /api/companies</p>
                <p><strong>User Access:</strong> Multi-company with role-based permissions</p>
                <p><strong>Total Companies:</strong> {companies.length}</p>
                <p><strong>Context Companies:</strong> {contextCompanies.length}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <CompanyFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          company={editingCompany}
          mode={modalMode}
        />
      </div>
    </div>
  )
}
