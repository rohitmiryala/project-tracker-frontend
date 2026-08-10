import { motion, useReducedMotion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 56, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const fadeUpSafe = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
}

const MotionSection = ({ children, className, id, delay = 0, amount = 0.16, once = true, as = 'section', ...props }) => {
  const reduce = useReducedMotion()
  const Component = motion[as] || motion.section
  const variants = reduce ? fadeUpSafe : fadeUp

  if (reduce) {
    const Tag = as
    return (
      <Tag className={className} id={id} {...props}>
        {children}
      </Tag>
    )
  }

  return (
    <Component
      className={className}
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount, margin: '0px 0px -8% 0px' }}
      variants={{
        hidden: variants.hidden,
        show: {
          ...variants.show,
          transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1], delay },
        },
      }}
      {...props}
    >
      {children}
    </Component>
  )
}

export const MotionItem = ({ children, className, delay = 0, ...props }) => {
  const reduce = useReducedMotion()
  if (reduce) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }
  return (
    <motion.div
      className={className}
      variants={{
        hidden: fadeUp.hidden,
        show: {
          ...fadeUp.show,
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Shiprocket-style portfolio row: each block reveals as it enters view */
export const LazyReveal = ({ children, className, delay = 0, amount = 0.2 }) => {
  const reduce = useReducedMotion()
  if (reduce) {
    return <div className={className}>{children}</div>
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 64, filter: 'blur(12px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
}

export default MotionSection
