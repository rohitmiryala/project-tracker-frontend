import Icon from '@/components/wrappers/Icon'
import useScrollEvent from '@/hooks/useScrollEvent'
import { useState } from 'react'
import { Container, Nav, Navbar, NavbarCollapse, NavbarToggle, NavLink } from 'react-bootstrap'
import { Link } from 'react-router'
import { handleAnchorClick } from '../utils/smoothScroll'
import { navItems } from './data'

export default function Header() {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const { scrollY } = useScrollEvent()
  const scrolled = scrollY > 24

  const onNavClick = (event, href) => {
    setIsCollapsed(true)
    handleAnchorClick(event, href)
  }

  return (
    <header>
      <Navbar
        expand="lg"
        className={`py-2 sticky-top ${scrolled ? 'top-scroll-up top-fixed is-scrolled' : ''}`}
        id="landing-navbar"
      >
        <Container>
          <Link to="/landing" className="navbar-brand velorak-brand mb-0">
            Velorak
          </Link>

          <NavbarToggle aria-controls="navbarSupportedContent" onClick={() => setIsCollapsed(!isCollapsed)} />
          <NavbarCollapse in={!isCollapsed} id="navbarSupportedContent">
            <Nav className="fw-semibold gap-1 gap-lg-2 fs-sm mx-auto mt-3 mt-lg-0">
              {navItems.map((item) => (
                <li className="nav-item" key={item.href}>
                  <NavLink className="nav-link" href={item.href} onClick={(event) => onNavClick(event, item.href)}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </Nav>
            <div className="d-flex flex-wrap align-items-center gap-2 mt-3 mt-lg-0">
              <Link to="/auth/sign-in" className="btn btn-sm btn-link velorak-nav-link fw-semibold px-2 text-decoration-none">
                Sign in
              </Link>
              <Link to="/auth/sign-up" className="btn btn-sm fw-semibold velorak-btn-primary">
                Start free
                <Icon icon="arrow-right" className="ms-1" />
              </Link>
            </div>
          </NavbarCollapse>
        </Container>
      </Navbar>
    </header>
  )
}
