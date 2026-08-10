import Icon from '@/components/wrappers/Icon'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { whyChooseData } from './data'
import MotionSection, { LazyReveal } from './MotionSection'

const WhyChoose = () => {
  const [activeId, setActiveId] = useState(whyChooseData[0].id)
  const active = whyChooseData.find((item) => item.id === activeId) ?? whyChooseData[0]
  const trackRef = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: 0, behavior: reduce ? 'auto' : 'smooth' })
  }, [activeId, reduce])

  return (
    <MotionSection className="section-custom velorak-section velorak-why" id="why">
      <Container>
        <Row className="mb-4 mb-lg-5">
          <Col lg={9}>
            <h2 className="velorak-section__title mb-3">Why choose Velorak?</h2>
            <p className="velorak-section__lead mb-0">
              Built for companies that need delivery and cost in one place — not another task board bolted onto a spreadsheet.
            </p>
          </Col>
        </Row>

        <div className="velorak-why__tabs" role="tablist" aria-label="Why choose Velorak">
          {whyChooseData.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === activeId}
              className={`velorak-why__tab ${item.id === activeId ? 'is-active' : ''}`}
              onClick={() => setActiveId(item.id)}
            >
              <Icon icon={item.icon} className="me-2" aria-hidden="true" />
              {item.tab}
            </button>
          ))}
        </div>

        <LazyReveal className="velorak-why__panel" amount={0.15}>
          <Row className="g-4 g-xl-5 align-items-start">
            <Col lg={5}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={reduce ? false : { opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: 12 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h3 className="velorak-why__heading mb-3">{active.title}</h3>
                  <p className="velorak-why__copy mb-4">{active.description}</p>
                  <ul className="velorak-why__points list-unstyled mb-0">
                    {active.points.map((point) => (
                      <li key={point}>
                        <Icon icon="check" className="me-2 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </Col>

            <Col lg={7}>
              <div className="velorak-why__rail-wrap">
                <div className="velorak-why__rail" ref={trackRef} tabIndex={0} data-lenis-prevent aria-label={`${active.tab} screenshots`}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active.id}
                      className="velorak-why__track"
                      initial={reduce ? false : { opacity: 0, x: 48 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduce ? undefined : { opacity: 0, x: -36 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {active.screens.map((screen, index) => (
                        <article className="velorak-why__shot" key={`${active.id}-${screen.title}`}>
                          <div className="velorak-why__shot-chrome" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                            <em>{screen.title}</em>
                          </div>
                          <div
                            className={`velorak-why__shot-canvas tone-${(index % 4) + 1}`}
                            role="img"
                            aria-label={screen.hint}
                          >
                            <div className="velorak-why__shot-placeholder">
                              <Icon icon="image" className="fs-2 mb-2" />
                              <p className="fw-semibold mb-1">{screen.hint}</p>
                              <p className="small mb-0 opacity-75">{screen.pathHint}</p>
                            </div>
                            <div className="velorak-why__shot-fake" aria-hidden="true">
                              <span className="velorak-why__shot-bar" />
                              <div className="velorak-why__shot-grid">
                                <span />
                                <span />
                                <span />
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <p className="velorak-why__hint mb-0">Scroll sideways to browse screens · swap tabs for another reason</p>
              </div>
            </Col>
          </Row>
        </LazyReveal>
      </Container>
    </MotionSection>
  )
}

export default WhyChoose
