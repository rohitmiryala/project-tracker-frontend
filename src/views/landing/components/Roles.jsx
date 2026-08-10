import Icon from '@/components/wrappers/Icon'
import { Col, Container, Row } from 'react-bootstrap'
import { rolesData } from './data'
import MotionSection, { MotionItem, staggerContainer } from './MotionSection'
import { motion, useReducedMotion } from 'framer-motion'

const Roles = () => {
  const reduce = useReducedMotion()

  return (
    <MotionSection className="section-custom velorak-section" id="roles">
      <Container>
        <Row className="mb-4 mb-lg-5">
          <Col lg={8}>
            <h2 className="velorak-section__title mb-3">Built for how companies actually work</h2>
            <p className="velorak-section__lead mb-0">Clear roles keep cost visibility with leadership and delivery work with the team.</p>
          </Col>
        </Row>

        <motion.div
          className="row g-4"
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={reduce ? undefined : staggerContainer}
        >
          {rolesData.map((role) => (
            <div className="col-md-4" key={role.title}>
              <MotionItem>
                <div className="velorak-role">
                  <div className="velorak-role__icon" aria-hidden="true">
                    <Icon icon={role.icon} className="fs-2" />
                  </div>
                  <h3 className="h5 mb-2">{role.title}</h3>
                  <p className="mb-0 velorak-feature__text">{role.description}</p>
                </div>
              </MotionItem>
            </div>
          ))}
        </motion.div>
      </Container>
    </MotionSection>
  )
}

export default Roles
