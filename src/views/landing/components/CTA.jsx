import Icon from '@/components/wrappers/Icon'
import { Container } from 'react-bootstrap'
import { Link } from 'react-router'
import { handleAnchorClick } from '../utils/smoothScroll'
import MotionSection from './MotionSection'

const CTA = () => {
  return (
    <MotionSection className="velorak-cta" id="cta">
      <Container className="text-center py-5 position-relative">
        <h2 className="fw-bold mb-3 velorak-cta__title">Ready to subscribe and run the company from one place?</h2>
        <p className="mb-4 mx-auto velorak-cta__lead">
          Start free today — upgrade to Basic, Plus, or Pro when you need more seats and fuller cost tracking.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <Link to="/auth/sign-up" className="btn btn-lg fw-semibold px-4 velorak-btn-primary">
            Start free
            <Icon icon="arrow-right" className="ms-1" />
          </Link>
          <a href="#plans" className="btn btn-lg fw-semibold px-4 velorak-btn-ghost" onClick={(event) => handleAnchorClick(event, '#plans')}>
            Compare plans
          </a>
        </div>
      </Container>
    </MotionSection>
  )
}

export default CTA
