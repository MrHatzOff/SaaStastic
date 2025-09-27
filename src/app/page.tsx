import { Navigation } from '@/features/marketing/components/navigation'
import { HeroSection } from '@/features/marketing/components/hero-section'
import { FeaturesSection } from '@/features/marketing/components/features-section'
import { PricingSection } from '@/features/marketing/components/pricing-section'
import { Footer } from '@/features/marketing/components/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <div id="features">
        <FeaturesSection />
      </div>
      <div id="pricing">
        <PricingSection />
      </div>
      <Footer />
    </div>
  )
}
