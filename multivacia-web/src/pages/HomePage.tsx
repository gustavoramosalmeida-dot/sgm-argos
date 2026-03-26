import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/sections/HeroSection'
import { EcosystemSection } from '@/sections/EcosystemSection'
import { ProofSection } from '@/sections/ProofSection'
import { MethodSection } from '@/sections/MethodSection'
import { ContactSection } from '@/sections/ContactSection'

export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <EcosystemSection />
        <ProofSection />
        <MethodSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
