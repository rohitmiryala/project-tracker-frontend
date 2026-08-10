import logoBlack from '@/assets/images/logo-black.png'
import logoSm from '@/assets/images/logo-sm.png'
import logo from '@/assets/images/logo.png'
import useScrollEvent from '@/hooks/useScrollEvent'
import clsx from 'clsx'
import { Container } from 'react-bootstrap'
import { Link } from 'react-router'
import FullscreenToggler from './components/FullscreenToggler'
import MenuToggler from './components/MenuToggler'
import NotificationDropdownPeople from './components/NotificationDropdownPeople'
import SimpleUserDropdown from './components/SimpleUserDropdown'
const TopBar = () => {
  const { scrollY } = useScrollEvent()
  return (
    <header
      className={clsx('app-topbar', {
        'topbar-active': scrollY > 50,
      })}
    >
      <Container fluid className="topbar-menu">
        <div className="d-flex align-items-center gap-2">
          <div className="logo-topbar">
            <Link to="/" className="logo-light">
              <span className="logo-lg">
                <img src={logo} alt="logo" />
              </span>
              <span className="logo-sm">
                <img src={logoSm} alt="small logo" />
              </span>
            </Link>
            <Link to="/" className="logo-dark">
              <span className="logo-lg">
                <img src={logoBlack} alt="dark logo" />
              </span>
              <span className="logo-sm">
                <img src={logoSm} alt="small logo" />
              </span>
            </Link>
          </div>

          <MenuToggler />
        </div>
        <div className="d-flex align-items-center gap-2">
          <NotificationDropdownPeople />

          <FullscreenToggler />

          <SimpleUserDropdown />
        </div>
      </Container>
    </header>
  )
}
export default TopBar
