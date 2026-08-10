import Icon from '@/components/wrappers/Icon'
import { motion, useReducedMotion } from 'framer-motion'
import { Card, CardBody, CardFooter, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import { pricingData } from './data'
import MotionSection, { MotionItem, staggerContainer } from './MotionSection'

const formatPrice = (priceInr) => {
  if (priceInr === 0) return '₹0'
  return `₹${priceInr.toLocaleString('en-IN')}`
}

const PricingCard = ({ plan }) => {
  const seatsLabel = plan.seats == null ? 'Unlimited seats' : `${plan.seats} seats`
  return (
    <Card className={`h-100 velorak-price-card ${plan.isPopular ? 'velorak-price-card--popular' : ''}`}>
      <CardBody className="p-4">
        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
          <h3 className="h4 fw-bold mb-0">{plan.name}</h3>
          {plan.isPopular && <span className="badge velorak-badge-accent">Most chosen</span>}
        </div>
        <p className="velorak-price-card__desc mb-3">{plan.description}</p>
        <div className="mb-3">
          <div className="display-6 fw-bold mb-0">{formatPrice(plan.priceInr)}</div>
          <small className="velorak-price-card__meta">per month · {seatsLabel}</small>
        </div>
        <ul className="list-unstyled mb-0">
          {plan.features.map((feature) => (
            <li key={feature.title} className="d-flex align-items-start gap-2 mb-2">
              {feature.included ? (
                <Icon icon="check" className="text-success flex-shrink-0 mt-1" />
              ) : (
                <Icon icon="x" className="text-muted flex-shrink-0 mt-1" />
              )}
              <span className={feature.included ? '' : 'text-muted'}>{feature.title}</span>
            </li>
          ))}
        </ul>
      </CardBody>
      <CardFooter className="bg-transparent border-0 px-4 pb-4">
        <Link
          to={`/auth/sign-up?plan=${plan.id}`}
          className={`btn w-100 fw-semibold ${plan.isPopular ? 'velorak-btn-primary' : 'velorak-btn-secondary'}`}
        >
          {plan.priceInr === 0 ? 'Start free' : `Subscribe to ${plan.name}`}
        </Link>
      </CardFooter>
    </Card>
  )
}

const PricingPlans = () => {
  const reduce = useReducedMotion()

  return (
    <MotionSection className="section-custom velorak-section velorak-section--pricing" id="plans">
      <Container>
        <Row className="mb-4 mb-lg-5 text-center justify-content-center">
          <Col lg={8}>
            <h2 className="velorak-section__title mb-3">Choose a plan. Invite your team. Track cost.</h2>
            <p className="velorak-section__lead mx-auto mb-0">
              Start on Free, then unlock more seats with Basic, Plus, or Pro when the company grows.
            </p>
          </Col>
        </Row>

        <motion.div
          className="row g-4 align-items-stretch"
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={reduce ? undefined : staggerContainer}
        >
          {pricingData.map((plan) => (
            <div className="col-lg-3 col-md-6" key={plan.id}>
              <MotionItem>
                <PricingCard plan={plan} />
              </MotionItem>
            </div>
          ))}
        </motion.div>
      </Container>
    </MotionSection>
  )
}

export default PricingPlans
