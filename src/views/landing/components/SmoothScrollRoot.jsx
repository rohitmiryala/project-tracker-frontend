import Lenis from 'lenis'
import { useEffect } from 'react'
import { setLenisInstance } from '../utils/smoothScroll'
import 'lenis/dist/lenis.css'

/**
 * Inertia-style smooth scrolling for the landing page (mouse / trackpad keep coasting).
 * Respects prefers-reduced-motion.
 */
const SmoothScrollRoot = ({ children }) => {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return undefined

    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.05,
      autoRaf: true,
    })

    setLenisInstance(lenis)
    document.documentElement.classList.add('lenis', 'lenis-smooth')

    return () => {
      setLenisInstance(null)
      document.documentElement.classList.remove('lenis', 'lenis-smooth')
      lenis.destroy()
    }
  }, [])

  return children
}

export default SmoothScrollRoot
