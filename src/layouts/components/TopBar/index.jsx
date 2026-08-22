import logoBlack from '@/assets/images/logo-black.png'
import logoSm from '@/assets/images/logo-sm.png'
import logo from '@/assets/images/logo.png'
import { META_DATA } from '@/config/constants'
import { useAuth } from '@/hooks/useAuth'
import useScrollEvent from '@/hooks/useScrollEvent'
import clsx from 'clsx'
import { Container } from 'react-bootstrap'
import { Link } from 'react-router'
import FullscreenToggler from './components/FullscreenToggler'
import MenuToggler from './components/MenuToggler'
import NotificationDropdownPeople from './components/NotificationDropdownPeople'
import SimpleUserDropdown from './components/SimpleUserDropdown'

const getUserDisplayName = (user) => {
  const name = user?.name || user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  return name || user?.email || META_DATA.username
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const TopBar = () => {
  const { scrollY } = useScrollEvent()
  const { user } = useAuth()
  const userDisplayName = getUserDisplayName(user)

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
          <span className="fw-bold text-white fs-4 text-nowrap d-none d-sm-inline-block">{getGreeting()}, {userDisplayName}!</span>
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
