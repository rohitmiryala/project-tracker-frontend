import Sidenav from '@/layouts/components/Sidenav'
import TopBar from '@/layouts/components/TopBar'
import { Container } from 'react-bootstrap'
const VerticalLayout = ({ children }) => {
  return (
    <div className="wrapper">
      <Sidenav />
      <TopBar />
      <div className="content-page">
        <Container fluid className="pb-4">{children}</Container>
      </div>
    </div>
  )
}
export default VerticalLayout
