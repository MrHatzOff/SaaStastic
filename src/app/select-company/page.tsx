'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useCompany } from '@/core/auth/company-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Plus, Users } from 'lucide-react'

/**
 * Company Selection Page
 * 
 * Allows users to select which company they want to work with.
 * Redirects to dashboard once a company is selected.
 */

export default function SelectCompanyPage() {
  const router = useRouter()
  const { user } = useUser()
  const { companies, currentCompany, switchCompany, isLoading, error } = useCompany()
  const [switching, setSwitching] = useState<string | null>(null)

  // Redirect if user already has a company selected
  useEffect(() => {
    if (currentCompany && !switching) {
      router.push('/dashboard')
    }
  }, [currentCompany, switching, router])

  const handleCompanySelect = async (companyId: string) => {
    try {
      setSwitching(companyId)
      await switchCompany(companyId)
      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to select company:', err)
      setSwitching(null)
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your companies...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle>No Companies Found</CardTitle>
            <CardDescription>
              You don't have access to any companies yet. Contact your administrator or create a new company.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => router.push('/create-company')}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Company
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Select Company</h1>
          <p className="text-gray-600 mt-2">
            Choose which company you'd like to work with today
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Card 
              key={company.id}
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200"
              onClick={() => handleCompanySelect(company.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <CardDescription className="mt-1">
                      @{company.slug}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getRoleBadgeColor(company.role)}
                  >
                    {company.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  disabled={switching === company.id}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    handleCompanySelect(company.id)
                  }}
                >
                  {switching === company.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Switching...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Select Company
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => router.push('/create-company')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Company
          </Button>
        </div>

        {/* Development info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Development Info</h3>
            <p className="text-sm text-yellow-700">
              User ID: {user?.id}<br />
              Current Company: {currentCompany?.id || 'None'}<br />
              Total Companies: {companies.length}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
