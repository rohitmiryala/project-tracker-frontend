import Icon from '@/components/wrappers/Icon'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import { handleAnchorClick } from '../utils/smoothScroll'
import { mechanismSteps } from './data'

const pipeline = ['Projects', 'Features', 'Tasks', 'Time', 'Cost']

const demoRows = [
  { name: 'Acme Redesign', progress: 72, cost: '₹1.8L', status: 'On track' },
  { name: 'Mobile Checkout', progress: 41, cost: '₹96K', status: 'Watch' },
  { name: 'API Migration', progress: 88, cost: '₹2.1L', status: 'On track' },
]

const chartBars = [42, 58, 51, 67, 74, 69, 82, 76, 91, 85, 78, 94]

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1], delay },
})

const Hero = () => {
  const reduce = useReducedMotion()
  const motionProps = (delay) => (reduce ? {} : fade(delay))
  const parallaxRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ['start start', 'end start'],
  })
  const stageY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 140])
  const stageScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.9])
  const stageOpacity = useTransform(scrollYProgress, [0, 0.75], reduce ? [1, 1] : [1, 0.35])
  const orbA = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 80])
  const orbB = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -60])

  return (
    <section className="velorak-hero" id="home" ref={parallaxRef}>
      <motion.div className="velorak-hero__orb velorak-hero__orb--a" style={{ y: orbA }} aria-hidden="true" />
      <motion.div className="velorak-hero__orb velorak-hero__orb--b" style={{ y: orbB }} aria-hidden="true" />

      <Container className="velorak-hero__copy position-relative pt-4 pt-lg-5">
        <Row className="align-items-center g-4 g-xl-5">
          <Col lg={6}>
            <motion.p className="velorak-hero__brand mb-3" {...motionProps(0)}>
              Velorak
              <span className="velorak-hero__brand-mark" aria-hidden="true" />
            </motion.p>
            <motion.h1 className="velorak-hero__title mb-3" {...motionProps(0.08)}>
              Project delivery and cost — finally in one subscription
            </motion.h1>
            <motion.p className="velorak-hero__lead mb-4" {...motionProps(0.14)}>
              Create your company, invite seats, and track projects, features, tasks, time, and budgets without leaving Velorak.
            </motion.p>
            <motion.div className="d-flex flex-wrap gap-2 mb-3" {...motionProps(0.2)}>
              <Link to="/auth/sign-up" className="btn btn-lg fw-semibold px-4 velorak-btn-primary">
                Start free
                <Icon icon="arrow-right" className="ms-1" />
              </Link>
              <a
                href="#plans"
                className="btn btn-lg fw-semibold px-4 velorak-btn-secondary"
                onClick={(event) => handleAnchorClick(event, '#plans')}
              >
                See plans
              </a>
            </motion.div>
            <motion.p className="velorak-hero__trust mb-4" {...motionProps(0.24)}>
              Free to start · Upgrade anytime · Seats scale with Basic, Plus, Pro
            </motion.p>
            <motion.ul className="velorak-pipeline list-unstyled mb-0" aria-label="Product flow" {...motionProps(0.28)}>
              {pipeline.map((item, index) => (
                <li key={item} className="velorak-pipeline__item">
                  <span>{item}</span>
                  {index < pipeline.length - 1 && <Icon icon="chevron-right" className="velorak-pipeline__sep" aria-hidden="true" />}
                </li>
              ))}
            </motion.ul>
          </Col>

          <Col lg={6}>
            <motion.div
              className="velorak-hero__parallax"
              style={{ y: stageY, scale: stageScale, opacity: stageOpacity }}
            >
              <motion.div className="velorak-hero__stage" aria-label="Product preview" id="product" {...motionProps(0.18)}>
              <div className="velorak-app-shell">
                <aside className="velorak-app-shell__sidenav" aria-hidden="true">
                  <div className="velorak-app-shell__logo">Velorak</div>
                  {['Dashboard', 'Projects', 'Tasks', 'Cost', 'Reports'].map((label, i) => (
                    <div className={`velorak-app-shell__nav-row ${i === 0 ? 'is-active' : ''}`} key={label}>
                      <span className="velorak-app-shell__nav-dot" />
                      <span className="velorak-app-shell__nav-label">{label}</span>
                    </div>
                  ))}
                </aside>
                <div className="velorak-app-shell__main">
                  <div className="velorak-app-shell__topbar" aria-hidden="true">
                    <span className="velorak-app-shell__topbar-label">Company dashboard</span>
                    <span className="velorak-demo-badge">Demo UI</span>
                  </div>
                  <div className="velorak-app-shell__body">
                    <div className="velorak-mechanism">
                      {mechanismSteps.map((item) => (
                        <div className={`velorak-mechanism__tile tone-${item.tone}`} key={item.label}>
                          <span className="velorak-mechanism__label">{item.label}</span>
                          <strong className="velorak-mechanism__value">{item.value}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="velorak-demo-grid">
                      <div className="velorak-demo-panel">
                        <div className="velorak-demo-panel__head">
                          <span>Profit / loss</span>
                          <span className="text-success fw-semibold">+12.4%</span>
                        </div>
                        <div className="velorak-chart" aria-hidden="true">
                          {chartBars.map((h, i) => (
                            <span key={i} className="velorak-chart__bar" style={{ '--bar-h': `${h}%` }} />
                          ))}
                        </div>
                      </div>
                      <div className="velorak-demo-panel">
                        <div className="velorak-demo-panel__head">
                          <span>Active projects</span>
                          <span className="small text-muted">Demo</span>
                        </div>
                        <ul className="velorak-demo-rows list-unstyled mb-0">
                          {demoRows.map((row) => (
                            <li key={row.name} className="velorak-demo-row">
                              <div>
                                <strong>{row.name}</strong>
                                <div className="velorak-demo-progress">
                                  <span style={{ width: `${row.progress}%` }} />
                                </div>
                              </div>
                              <div className="velorak-demo-row__meta">
                                <span>{row.cost}</span>
                                <span className={`velorak-status velorak-status--${row.status === 'Watch' ? 'warn' : 'ok'}`}>{row.status}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </motion.div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default Hero
