import Icon from '@/components/wrappers/Icon'
import { formatInr, planLimitLabel, planSeatLabel } from '@/config/plans'
import { plansService } from '@/services/plansService'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Alert, Card, CardBody, CardFooter, Col, Container, Row, Spinner } from 'react-bootstrap'
import { Link } from 'react-router'
import MotionSection, { MotionItem, staggerContainer } from './MotionSection'

const PricingCard = ({ plan }) => {
  const isFree = plan.id === 'free' || !plan.pricePerUserInr
  return (
    <Card className={`h-100 velorak-price-card ${plan.isPopular ? 'velorak-price-card--popular' : ''}`}>
      <CardBody className="p-4">
        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
          <h3 className="h4 fw-bold mb-0">{plan.name}</h3>
          {plan.isPopular && <span className="badge velorak-badge-accent">Most chosen</span>}
        </div>
        <p className="velorak-price-card__desc mb-3">{plan.description}</p>
        <div className="mb-3">
          <div className="display-6 fw-bold mb-0">
            {isFree ? '₹0' : formatInr(plan.pricePerUserInr)}
            {!isFree && <span className="fs-6 fw-semibold">/user</span>}
          </div>
          <small className="velorak-price-card__meta d-block">
            {isFree
              ? planSeatLabel(plan)
              : `${planSeatLabel(plan)} · from ${formatInr(plan.minBillInr)}/mo`}
          </small>
        </div>
        <ul className="list-unstyled mb-0">
          {(plan.features || []).map((feature) => (
            <li key={feature} className="d-flex align-items-start gap-2 mb-2">
              <Icon icon="check" className="text-success flex-shrink-0 mt-1" />
              <span>{feature}</span>
            </li>
          ))}
          <li className="d-flex align-items-start gap-2 mb-2">
            <Icon icon="check" className="text-success flex-shrink-0 mt-1" />
            <span>{planLimitLabel(plan.maxActiveProjects, 'active projects')}</span>
          </li>
          <li className="d-flex align-items-start gap-2 mb-2">
            <Icon icon="check" className="text-success flex-shrink-0 mt-1" />
            <span>{planLimitLabel(plan.maxClients, 'clients')}</span>
          </li>
        </ul>
      </CardBody>
      <CardFooter className="bg-transparent border-0 px-4 pb-4">
        <Link
          to={`/auth/sign-up?plan=${plan.id}`}
          className={`btn w-100 fw-semibold ${plan.isPopular ? 'velorak-btn-primary' : 'velorak-btn-secondary'}`}
        >
          {isFree ? 'Start free' : `Subscribe to ${plan.name}`}
        </Link>
      </CardFooter>
    </Card>
  )
}

const PricingPlans = () => {
  const reduce = useReducedMotion()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const json = await plansService.list()
        if (alive) setPlans(json?.data || [])
      } catch (err) {
        if (alive) setError(err.message || 'Could not load plans')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <MotionSection className="section-custom velorak-section velorak-section--pricing" id="plans">
      <Container>
        <Row className="mb-4 mb-lg-5 text-center justify-content-center">
          <Col lg={8}>
            <h2 className="velorak-section__title mb-3">Choose a plan. Invite your team. Track cost.</h2>
            <p className="velorak-section__lead mx-auto mb-0">
              Pay per active user in INR with a seat minimum on paid plans — start free, scale as the company grows.
            </p>
          </Col>
        </Row>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        )}
        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && (
          <motion.div
            className="row g-4 align-items-stretch"
            initial={reduce ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={reduce ? undefined : staggerContainer}
          >
            {plans.map((plan) => (
              <div className="col-lg-3 col-md-6" key={plan.id}>
                <MotionItem>
                  <PricingCard plan={plan} />
                </MotionItem>
              </div>
            ))}
          </motion.div>
        )}
      </Container>
    </MotionSection>
  )
}

export default PricingPlans
