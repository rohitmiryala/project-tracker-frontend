import cardbg from '@/assets/images/auth-card-bg.svg'
import AuthLogo from '@/components/AuthLogo'
import { currentYear, META_DATA } from '@/config/constants'
import { Card, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import Forms from './components/Forms'

const Page = () => {
  return (
    <>
      <div className="auth-box overflow-hidden align-items-center d-flex py-4">
        <Container>
          <Row className="justify-content-center">
            <Col xxl={7} xl={8} lg={9} md={10}>
              <Card className="p-4 p-md-4">
                <div className="position-absolute top-0 end-0" style={{ width: '180px' }}>
                  <img src={cardbg} className="auth-card-bg-img" alt="" />
                </div>
                <div className="auth-brand text-center mb-3">
                  <AuthLogo />
                  <p className="text-muted mx-auto mt-3 mb-0" style={{ maxWidth: '36rem' }}>
                    Create your company account in two steps — basics first, then pick a plan.
                  </p>
                </div>
                <Forms />
                <p className="text-muted text-center mt-4 mb-0">
                  Already have an account?
                  <Link to="/auth/sign-in" className="text-decoration-underline link-offset-3 fw-semibold ms-1">
                    Login
                  </Link>
                </p>
              </Card>
              <p className="text-center text-muted mt-4 mb-0">
                © {currentYear} {META_DATA.name} — by <span className="fw-semibold">{META_DATA.author}</span>
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  )
}

export default Page
