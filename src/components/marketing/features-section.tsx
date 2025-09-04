import { siteConfig } from '@/lib/site-config'

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to build a SaaS
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Our boilerplate includes all the essential features and infrastructure you need to launch your multi-tenant SaaS application.
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {siteConfig.features.map((feature, index) => (
            <div key={index} className="relative p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
