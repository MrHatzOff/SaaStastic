'use client';

import { useCurrentCompany } from '@/core/shared';
import { TeamManagementPage } from '@/features/users/components/team-management-page';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Team Management Dashboard Page
 * 
 * Main page for team management with RBAC integration
 */
export default function TeamPage() {
  const { user } = useUser();
  const currentCompany = useCurrentCompany();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
    }
  }, [user, router]);

  // Show loading while getting company context
  if (!currentCompany || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div>
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mt-1" />
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="border-t border-gray-200">
              <div className="flex space-x-8 py-4">
                <a href="/dashboard" className="text-gray-500 hover:text-gray-700 pb-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="/dashboard/customers" className="text-gray-500 hover:text-gray-700 pb-2 text-sm font-medium">
                  Customers
                </a>
                <a href="/dashboard/companies" className="text-gray-500 hover:text-gray-700 pb-2 text-sm font-medium">
                  Companies
                </a>
                <span className="text-blue-600 border-b-2 border-blue-600 pb-2 text-sm font-medium">
                  Team
                </span>
              </div>
            </nav>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded mb-8" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 text-blue-600">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentCompany.name}</h1>
                <p className="text-sm text-gray-500">@{currentCompany.slug}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="border-t border-gray-200">
            <div className="flex space-x-8 py-4">
              <a href="/dashboard" className="text-gray-500 hover:text-gray-700 pb-2 text-sm font-medium">
                Dashboard
              </a>
              <a href="/dashboard/customers" className="text-gray-500 hover:text-gray-700 pb-2 text-sm font-medium">
                Customers
              </a>
              <a href="/dashboard/companies" className="text-gray-500 hover:text-gray-700 pb-2 text-sm font-medium">
                Companies
              </a>
              <span className="text-blue-600 border-b-2 border-blue-600 pb-2 text-sm font-medium">
                Team
              </span>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeamManagementPage
          currentUserId={user.id}
          currentUserRole={currentCompany.role}
          companyId={currentCompany.id}
        />
      </div>
    </div>
  );
}
