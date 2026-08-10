import PageMetaData from '@/components/PageMetaData'
import { useEffect } from 'react'
import CTA from './components/CTA'
import FAQ from './components/FAQ'
import Features from './components/Features'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import PricingPlans from './components/PricingPlans'
import Roles from './components/Roles'
import ScreenshotGallery from './components/ScreenshotGallery'
import SmoothScrollRoot from './components/SmoothScrollRoot'
import VideoSlot from './components/VideoSlot'
import WhyChoose from './components/WhyChoose'
import { smoothScrollTo } from './utils/smoothScroll'

const Landing = () => {
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return undefined
    const frame = window.requestAnimationFrame(() => {
      // Wait a tick so Lenis can attach
      window.setTimeout(() => smoothScrollTo(hash), 80)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  return (
    <SmoothScrollRoot>
      <div className="velorak-landing">
        {/*
          THESIS: Velorak sells company delivery + cost in one subscription — visitor should choose a plan.
          OWN-WORLD: Soft mist gradients (not flat white cards), teal + coral; demos tour as contrast band.
          STORY: Product parallax → features → why Velorak → screens tour → plans.
          FORM: Shiprocket-inspired lazy reveals + Lenis inertia scroll.
        */}
        <PageMetaData title="Home" />
        <Header />
        <Hero />
        <Features />
        <WhyChoose />
        <HowItWorks />
        <Roles />
        <VideoSlot />
        <ScreenshotGallery />
        <PricingPlans />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </SmoothScrollRoot>
  )
}

export default Landing
