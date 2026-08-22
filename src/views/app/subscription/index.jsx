import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { formatInr, planLimitLabel, planSeatLabel } from '@/config/plans'
import { plansService } from '@/services/plansService'
import { useEffect, useState } from 'react'
import { Alert, Card, CardBody, CardFooter, Col, Row, Spinner } from 'react-bootstrap'

const Page = () => {
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
    <>
      <PageBreadcrumb title="Subscription" subtitle="Velorak" />
      {loading && (
        <div className="py-5 text-center">
          <Spinner animation="border" />
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      <Row className="g-3">
        {plans.map((plan) => {
          const isFree = plan.id === 'free' || !plan.pricePerUserInr
          return (
            <Col xl={3} md={6} key={plan.id}>
              <Card className={`h-100 ${plan.isPopular ? 'border-primary' : ''}`}>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h4 className="mb-0">{plan.name}</h4>
                    {plan.isPopular && <span className="badge bg-warning text-dark">Popular</span>}
                  </div>
                  <p className="text-muted">{plan.description}</p>
                  <h2 className="fw-bold mb-1">{isFree ? '₹0' : `${formatInr(plan.pricePerUserInr)}/user`}</h2>
                  <p className="text-muted">{isFree ? planSeatLabel(plan) : `from ${formatInr(plan.minBillInr)}/mo`}</p>
                  <ul className="list-unstyled mb-0">
                    {(plan.features || []).map((feature) => (
                      <li key={feature} className="mb-2">
                        <Icon icon="check" className="text-success me-2" />
                        {feature}
                      </li>
                    ))}
                    <li className="mb-2">
                      <Icon icon="check" className="text-success me-2" />
                      {planLimitLabel(plan.maxActiveProjects, 'active projects')}
                    </li>
                    <li>
                      <Icon icon="check" className="text-success me-2" />
                      {planLimitLabel(plan.maxClients, 'clients')}
                    </li>
                  </ul>
                </CardBody>
                <CardFooter className="bg-transparent">
                  <button type="button" className={`btn w-100 ${plan.isPopular ? 'btn-primary' : 'btn-outline-primary'}`}>
                    {isFree ? 'Current plan' : `Choose ${plan.name}`}
                  </button>
                </CardFooter>
              </Card>
            </Col>
          )
        })}
      </Row>
    </>
  )
}

export default Page
