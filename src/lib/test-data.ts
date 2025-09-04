// Test data for local development
export interface TestCompany {
  id: string
  name: string
  slug: string
  description: string
  industry: string
  size: string
  logo?: string
  createdAt: Date
  updatedAt: Date
}

export const TEST_COMPANIES: TestCompany[] = [
  {
    id: 'company-1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    description: 'Leading provider of innovative business solutions',
    industry: 'Technology',
    size: '50-200',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'company-2',
    name: 'TechFlow Solutions',
    slug: 'techflow-solutions',
    description: 'Digital transformation consultancy specializing in workflow automation',
    industry: 'Consulting',
    size: '10-50',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'company-3',
    name: 'Global Dynamics',
    slug: 'global-dynamics',
    description: 'International enterprise software and services company',
    industry: 'Enterprise Software',
    size: '200+',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
]

export const TEST_CUSTOMERS = [
  // Customers for Acme Corp
  {
    id: 'customer-1',
    companyId: 'company-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'customer-2',
    companyId: 'company-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  // Customers for TechFlow Solutions
  {
    id: 'customer-3',
    companyId: 'company-2',
    name: 'Michael Brown',
    email: 'michael.brown@techcorp.com',
    phone: '+1 (555) 345-6789',
    status: 'active',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: 'customer-4',
    companyId: 'company-2',
    name: 'Emily Davis',
    email: 'emily.davis@startup.io',
    phone: '+1 (555) 456-7890',
    status: 'inactive',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
  // Customers for Global Dynamics
  {
    id: 'customer-5',
    companyId: 'company-3',
    name: 'David Wilson',
    email: 'david.wilson@enterprise.com',
    phone: '+1 (555) 567-8901',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'customer-6',
    companyId: 'company-3',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@bigcorp.com',
    phone: '+1 (555) 678-9012',
    status: 'active',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
]

// Helper function to get company by ID
export function getTestCompanyById(id: string): TestCompany | undefined {
  return TEST_COMPANIES.find(company => company.id === id)
}

// Helper function to get customers for a company
export function getTestCustomersForCompany(companyId: string) {
  return TEST_CUSTOMERS.filter(customer => customer.companyId === companyId)
}

// Helper function to simulate API delay
export function simulateApiDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
