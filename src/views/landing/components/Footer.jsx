import { currentYear } from '@/config/constants'
import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import { handleAnchorClick } from '../utils/smoothScroll'
import { footerLinks } from './data'

const Footer = () => {
  return (
    <footer className="section-footer velorak-footer py-5">
      <Container>
        <Row className="g-4 justify-content-between">
          <Col lg={4}>
            <Link to="/landing" className="velorak-brand d-inline-block mb-3">
              Velorak
            </Link>
            <p className="mb-0 fs-sm">
              Company project delivery and cost tracking — projects, features, tasks, time logs, and budgets in one place.
            </p>
          </Col>
          <Col lg={7}>
            <Row className="g-4">
              {footerLinks.map((section) => (
                <Col key={section.title} xs={6} md={4}>
                  <h5 className="text-white mb-3">{section.title}</h5>
                  <ul className="nav flex-column">
                    {section.links.map((link) => (
                      <li className="nav-item" key={link.name}>
                        {link.url.startsWith('mailto:') ? (
                          <a href={link.url} className="nav-link px-0">
                            {link.name}
                          </a>
                        ) : link.url.startsWith('#') ? (
                          <a
                            href={link.url}
                            className="nav-link px-0"
                            onClick={(event) => handleAnchorClick(event, link.url)}
                          >
                            {link.name}
                          </a>
                        ) : (
                          <Link to={link.url} className="nav-link px-0">
                            {link.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
        <Row className="mt-5">
          <Col xs={12} className="text-center">
            <p className="mb-0">© {currentYear} Velorak</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
