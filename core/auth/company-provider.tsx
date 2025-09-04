'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'

/**
 * Company Context Provider for Multi-Tenant SaaS
 * 
 * Manages the current company context for the authenticated user.
 * Uses API calls instead of direct database access for client-side safety.
 */

export interface Company {
  id: string
  name: string
  slug: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
}

export interface CompanyContextType {
  currentCompany: Company | null
  companies: Company[]
  isLoading: boolean
  error: string | null
  switchCompany: (companyId: string) => Promise<void>
  refreshCompanies: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

interface CompanyProviderProps {
  children: ReactNode
}

export function CompanyProvider({ children }: CompanyProviderProps) {
  const { user, isLoaded } = useUser()
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Detect dev keyless mode from server and then load companies appropriately
  useEffect(() => {
    let mounted = true
    const detectMode = async () => {
      try {
        const res = await fetch('/api/health')
        const json = await res.json()
        if (mounted && json?.success) {
          // Always use Clerk authentication - no dev keyless mode
        }
      } catch {
        // Ignore errors, default behavior is Clerk auth
      }
    }
    detectMode()
    return () => { mounted = false }
  }, [])

  // Load companies when user is available (always use Clerk authentication)
  useEffect(() => {
    if (isLoaded && user) {
      loadUserCompanies()
    } else if (isLoaded && !user) {
      // User not authenticated, clear state
      setCurrentCompany(null)
      setCompanies([])
      setIsLoading(false)
    }
  }, [isLoaded, user])

  // Update Clerk metadata when company changes (only if user exists)
  useEffect(() => {
    if (currentCompany && user) {
      // Use unsafeMetadata instead of publicMetadata for client-side updates
      user.update({
        unsafeMetadata: { 
          ...user.unsafeMetadata,
          companyId: currentCompany.id 
        }
      }).catch(console.error)
    }
  }, [currentCompany, user])

  const loadUserCompanies = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Always use the real API; server handles Clerk authentication
      const response = await fetch('/api/companies')
      if (!response.ok) {
        throw new Error('Failed to fetch companies')
      }
      const companiesData = await response.json()

      if (companiesData.success) {
        setCompanies(companiesData.data)

        // Determine stored company preference from Clerk metadata
        const storedCompanyId = (user?.unsafeMetadata?.companyId as string) || null
        const storedCompany = storedCompanyId
          ? companiesData.data.find((c: Company) => c.id === storedCompanyId)
          : null

        if (storedCompany) {
          setCurrentCompany(storedCompany)
        } else if (companiesData.data.length > 0) {
          setCurrentCompany(companiesData.data[0])
        } else {
          // No companies yet
          setCurrentCompany(null)
        }
      }

    } catch (err) {
      console.error('Failed to load companies:', err)
      setError('Failed to load companies')
    } finally {
      setIsLoading(false)
    }
  }

  const switchCompany = async (companyId: string) => {
    const company = companies.find(c => c.id === companyId)
    if (!company) {
      throw new Error('Company not found')
    }

    try {
      setCurrentCompany(company)
      
      // The useEffect above will handle updating Clerk metadata for production
    } catch (err) {
      console.error('Failed to switch company:', err)
      throw new Error('Failed to switch company')
    }
  }

  const refreshCompanies = async () => {
    await loadUserCompanies()
  }

  const value: CompanyContextType = {
    currentCompany,
    companies,
    isLoading,
    error,
    switchCompany,
    refreshCompanies
  }

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  )
}

/**
 * Hook to use company context
 */
export function useCompany() {
  const context = useContext(CompanyContext)
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}

/**
 * Hook to get current company (throws if no company selected)
 */
export function useCurrentCompany() {
  const { currentCompany, isLoading } = useCompany()
  
  // Don't throw error while still loading
  if (isLoading) {
    return null
  }
  
  if (!currentCompany) {
    throw new Error('No company selected')
  }
  return currentCompany
}

/**
 * Hook to check if user has specific role in current company
 */
export function useCompanyRole(requiredRole?: 'OWNER' | 'ADMIN' | 'MEMBER') {
  const { currentCompany } = useCompany()
  
  if (!requiredRole) {
    return { hasRole: true, role: currentCompany?.role || null }
  }

  const roleHierarchy = { OWNER: 3, ADMIN: 2, MEMBER: 1 }
  const userRoleLevel = currentCompany ? roleHierarchy[currentCompany.role] : 0
  const requiredRoleLevel = roleHierarchy[requiredRole]

  return {
    hasRole: userRoleLevel >= requiredRoleLevel,
    role: currentCompany?.role || null
  }
}
