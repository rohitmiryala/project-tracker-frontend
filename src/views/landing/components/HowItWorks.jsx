import Icon from '@/components/wrappers/Icon'
import { motion, useReducedMotion } from 'framer-motion'
import { Col, Container, Row } from 'react-bootstrap'
import { howItWorks } from './data'
import MotionSection, { LazyReveal, MotionItem, staggerContainer } from './MotionSection'

const HowItWorks = () => {
  const reduce = useReducedMotion()

  return (
    <MotionSection className="section-custom velorak-section velorak-section--soft" id="how">
      <Container>
        <LazyReveal>
          <Row className="mb-4 mb-lg-5 text-center justify-content-center">
            <Col lg={8}>
              <h2 className="velorak-section__title mb-3">From company setup to live cost</h2>
              <p className="velorak-section__lead mx-auto mb-0">Three steps to get your team shipping and your budget visible.</p>
            </Col>
          </Row>
        </LazyReveal>

        <motion.div
          className="row g-4"
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={reduce ? undefined : staggerContainer}
        >
          {howItWorks.map((item, index) => (
            <div className="col-md-4" key={item.step}>
              <MotionItem>
                <div className="velorak-step">
                  <div className="velorak-step__rail">
                    <span className="velorak-step__index">{item.step}</span>
                    {index < howItWorks.length - 1 && (
                      <Icon icon="arrow-right" className="velorak-step__arrow d-none d-md-inline" aria-hidden="true" />
                    )}
                  </div>
                  <h3 className="h5 mb-2">{item.title}</h3>
                  <p className="mb-0 velorak-step__text">{item.description}</p>
                </div>
              </MotionItem>
            </div>
          ))}
        </motion.div>
      </Container>
    </MotionSection>
  )
}

export default HowItWorks
