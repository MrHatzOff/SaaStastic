import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { siteConfig } from '@/shared/lib/site-config'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { CheckoutButton } from '@/features/billing/components/checkout-button'

export function PricingSection() {
  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Perfect for teams that don&apos;t want to worry about scaling.ess. All plans include our core features and security.
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {siteConfig.pricing.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600">/{plan.period}</span>
                  )}
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.price === "Custom" ? (
                  <Link href="/contact" className="block">
                    <Button className="w-full" variant="outline">
                      Contact Sales
                    </Button>
                  </Link>
                ) : (
                  <CheckoutButton
                    planName={plan.name}
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white`}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
