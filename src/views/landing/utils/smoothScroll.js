import { animate } from 'framer-motion'

const NAV_OFFSET = 72

/** @type {import('lenis').default | null} */
let lenisInstance = null

export const setLenisInstance = (instance) => {
  lenisInstance = instance
}

export const getLenisInstance = () => lenisInstance

export const getAnchorId = (href) => {
  if (!href || !href.startsWith('#')) return null
  return href.slice(1)
}

export const smoothScrollTo = (target, { offset = NAV_OFFSET } = {}) => {
  const el = typeof target === 'string' ? document.getElementById(target) : target
  if (!el) return

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) {
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo(0, top)
    return
  }

  if (lenisInstance) {
    lenisInstance.scrollTo(el, {
      offset: -offset,
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    return
  }

  const top = el.getBoundingClientRect().top + window.scrollY - offset
  animate(window.scrollY, top, {
    duration: 0.85,
    ease: [0.16, 1, 0.3, 1],
    onUpdate: (value) => window.scrollTo(0, value),
  })
}

export const handleAnchorClick = (event, href) => {
  const id = getAnchorId(href)
  if (!id) return false
  const el = document.getElementById(id)
  if (!el) return false
  event.preventDefault()
  smoothScrollTo(el)
  history.replaceState(null, '', `#${id}`)
  return true
}
