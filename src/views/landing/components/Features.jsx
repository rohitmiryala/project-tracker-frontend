import Icon from '@/components/wrappers/Icon'
import { motion, useReducedMotion } from 'framer-motion'
import { Col, Container, Row } from 'react-bootstrap'
import { featureData } from './data'
import MotionSection, { MotionItem, staggerContainer } from './MotionSection'

const Features = () => {
  const reduce = useReducedMotion()

  return (
    <MotionSection className="section-custom velorak-section velorak-section--features" id="features">
      <Container>
        <Row className="mb-4 mb-lg-5 align-items-end">
          <Col lg={8}>
            <h2 className="velorak-section__title mb-3">Everything from delivery to cost</h2>
            <p className="velorak-section__lead mb-0">
              Velorak connects the work your team ships with the money it costs — so a subscription pays for clarity, not another spreadsheet.
            </p>
          </Col>
        </Row>

        <motion.div
          className="velorak-bento"
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          variants={reduce ? undefined : staggerContainer}
        >
          {featureData.map((feature, index) => (
            <MotionItem key={feature.title} className={index === 0 ? 'velorak-feature--hero-wrap' : undefined}>
              <article className={`velorak-feature ${index === 0 ? 'velorak-feature--hero' : ''}`}>
                <div className="velorak-feature__icon" aria-hidden="true">
                  <Icon icon={feature.icon} className="fs-3" />
                </div>
                <h3 className="velorak-feature__title h5 mb-2">{feature.title}</h3>
                <p className="velorak-feature__text mb-0">{feature.description}</p>
              </article>
            </MotionItem>
          ))}
        </motion.div>
      </Container>
    </MotionSection>
  )
}

export default Features
