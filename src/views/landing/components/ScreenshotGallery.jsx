import Icon from '@/components/wrappers/Icon'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import { screenshotSlots } from './data'
import MotionSection from './MotionSection'

const ScreenshotGallery = () => {
  const [activeId, setActiveId] = useState(screenshotSlots[0].id)
  const active = screenshotSlots.find((slot) => slot.id === activeId) ?? screenshotSlots[0]

  return (
    <MotionSection className="section-custom velorak-demos" id="screens">
      <div className="velorak-demos__glow" aria-hidden="true" />
      <Container className="position-relative">
        <Row className="mb-4 mb-lg-5 text-center text-lg-start justify-content-lg-between align-items-end">
          <Col lg={8}>
            <h2 className="velorak-section__title text-white mb-3">
              Experience Velorak screens
              <span className="velorak-demos__title-accent"> in one tour</span>
            </h2>
            <p className="velorak-demos__lead mb-0">
              Switch between Dashboard, Tasks, Cost, and Reports — drop your real screenshots into each preview when ready.
            </p>
          </Col>
        </Row>

        <div className="velorak-demos__tabs" role="tablist" aria-label="Product screens">
          {screenshotSlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              role="tab"
              aria-selected={slot.id === activeId}
              className={`velorak-demos__tab ${slot.id === activeId ? 'is-active' : ''}`}
              onClick={() => setActiveId(slot.id)}
            >
              {slot.title}
            </button>
          ))}
        </div>

        <div className="velorak-demos__stage" role="tabpanel">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Row className="g-4 g-xl-5 align-items-center">
                <Col lg={5}>
                  <h3 className="velorak-demos__heading mb-3">Built for {active.title.toLowerCase()} decisions</h3>
                  <p className="velorak-demos__copy mb-4">{active.description}</p>
                  <ul className="velorak-demos__points list-unstyled mb-4">
                    {active.points.map((point) => (
                      <li key={point}>
                        <Icon icon="check" className="me-2 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth/sign-up" className="btn fw-semibold velorak-btn-primary px-4">
                    Try this in Velorak
                    <Icon icon="arrow-right" className="ms-1" />
                  </Link>
                </Col>

                <Col lg={7}>
                  <div className="velorak-demos__preview">
                    <div className="velorak-demos__browser" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                      <em>{active.title}</em>
                    </div>
                    <div className="velorak-demos__canvas" role="img" aria-label={active.hint}>
                      <div className="velorak-demos__placeholder">
                        <Icon icon="image" className="fs-1 mb-2" />
                        <p className="fw-semibold mb-1">{active.hint}</p>
                        <p className="small mb-0 opacity-75">{active.pathHint}</p>
                      </div>
                      <div className="velorak-demos__fake-ui" aria-hidden="true">
                        <div className="velorak-demos__fake-bar" />
                        <div className="velorak-demos__fake-grid">
                          <span />
                          <span />
                          <span />
                          <span />
                        </div>
                        <div className="velorak-demos__fake-rows">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="velorak-demos__thumbs mt-4" aria-hidden="true">
          {screenshotSlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              className={`velorak-demos__thumb ${slot.id === activeId ? 'is-active' : ''}`}
              onClick={() => setActiveId(slot.id)}
            >
              <span className="velorak-demos__thumb-label">{slot.title}</span>
            </button>
          ))}
        </div>
      </Container>
    </MotionSection>
  )
}

export default ScreenshotGallery
