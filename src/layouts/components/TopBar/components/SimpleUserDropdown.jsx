import User1 from '@/assets/images/users/user-1.jpg'
import Icon from '@/components/wrappers/Icon'
import { META_DATA } from '@/config/constants'
import { useAuth } from '@/hooks/useAuth'
import { Dropdown, DropdownDivider, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { Link } from 'react-router'
const UserDropdown = () => {
  const { logout } = useAuth()

  const handleLogout = (e) => {
    e.preventDefault()
    logout()
  }

  return (
    <div id="simple-user-dropdown" className="topbar-item nav-user">
      <Dropdown>
        <DropdownToggle className="topbar-link drop-arrow-none" type="button">
          <img src={User1} width={32} className="rounded-circle me-lg-2 d-flex" alt="user-image" />
          <div className="d-lg-flex align-items-center gap-1 d-none">
            <h5 className="my-0">{META_DATA.username}</h5>
            <Icon icon="chevron-down" className="align-middle" />
          </div>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownHeader className="noti-title">
            <h6 className="text-overflow m-0">Welcome back!</h6>
          </DropdownHeader>

          <DropdownItem as={Link} to="/app/profile">
            <Icon icon="circle-user-round" className="me-1 fs-lg align-middle" />
            <span className="align-middle">Profile</span>
          </DropdownItem>

          <DropdownItem as={Link} to="/app/settings">
            <Icon icon="bolt" className="me-1 fs-lg align-middle" />
            <span className="align-middle">Account Settings</span>
          </DropdownItem>

          <DropdownItem as={Link} to="/pages/faq">
            <Icon icon="headset" className="me-1 fs-lg align-middle" />
            <span className="align-middle">Support Center</span>
          </DropdownItem>

          <DropdownDivider />

          <DropdownItem href="#logout" className="text-danger fw-semibold" onClick={handleLogout}>
            <Icon icon="log-out" className="me-1 fs-lg align-middle" />
            <span className="align-middle">Logout</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}
export default UserDropdown
