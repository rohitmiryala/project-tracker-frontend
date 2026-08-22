import PageBreadcrumb from '@/components/PageBreadcrumb'
import { useAuth } from '@/hooks/useAuth'
import { Button, Card, CardBody, Col, FormCheck, FormControl, FormLabel, Row } from 'react-bootstrap'

const Page = () => {
  const { user } = useAuth()

  return (
    <>
      <PageBreadcrumb title="Settings" subtitle="Velorak" />
      <Row className="g-3">
        <Col xl={6}>
          <Card>
            <CardBody>
              <h5 className="mb-3">Company</h5>
              <div className="mb-3">
                <FormLabel>Company name</FormLabel>
                <FormControl defaultValue={user?.companyName || ''} />
              </div>
              <div className="mb-3">
                <FormLabel>Default timezone</FormLabel>
                <FormControl defaultValue="Asia/Kolkata" />
              </div>
              <Button variant="primary">Save company settings</Button>
            </CardBody>
          </Card>
        </Col>
        <Col xl={6}>
          <Card>
            <CardBody>
              <h5 className="mb-3">Preferences</h5>
              <FormCheck type="switch" id="email-alerts" label="Email alerts for overdue tasks" className="mb-3" defaultChecked />
              <FormCheck type="switch" id="cost-alerts" label="Notify when a project goes over budget" className="mb-3" defaultChecked />
              <FormCheck type="switch" id="weekly-digest" label="Weekly summary digest" className="mb-3" />
              <Button variant="primary">Save preferences</Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Page
