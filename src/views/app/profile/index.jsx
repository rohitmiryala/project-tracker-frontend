import PageBreadcrumb from '@/components/PageBreadcrumb'
import { useAuth } from '@/hooks/useAuth'
import { Button, Card, CardBody, Col, FormControl, FormLabel, Row } from 'react-bootstrap'

const Page = () => {
  const { user } = useAuth()

  return (
    <>
      <PageBreadcrumb title="Profile" subtitle="Velorak" />
      <Row>
        <Col xl={6}>
          <Card>
            <CardBody>
              <h5 className="mb-3">Your details</h5>
              <div className="mb-3">
                <FormLabel>Full name</FormLabel>
                <FormControl defaultValue={user?.fullName || ''} readOnly />
              </div>
              <div className="mb-3">
                <FormLabel>Email</FormLabel>
                <FormControl type="email" defaultValue={user?.email || ''} readOnly />
              </div>
              <div className="mb-3">
                <FormLabel>Membership</FormLabel>
                <FormControl defaultValue={user?.membershipType || 'member'} readOnly className="text-capitalize" />
              </div>
              <div className="mb-3">
                <FormLabel>Company</FormLabel>
                <FormControl defaultValue={user?.companyName || ''} readOnly />
              </div>
              <Button variant="primary" disabled>
                Save changes
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Page
