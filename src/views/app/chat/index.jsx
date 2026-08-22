import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { Card, CardBody } from 'react-bootstrap'

const Page = () => {
  return (
    <>
      <PageBreadcrumb title="Chat" subtitle="Velorak" />
      <Card>
        <CardBody className="text-center py-5">
          <span className="avatar-title bg-warning-subtle text-warning rounded-circle avatar avatar-xl mx-auto mb-3">
            <Icon icon="message-circle" className="fs-32" />
          </span>
          <h4 className="mb-2">Chat is coming soon</h4>
          <p className="text-muted mb-0 mx-auto" style={{ maxWidth: 420 }}>
            Team chat will land here as an upcoming feature. Use projects and tasks for now to keep delivery moving.
          </p>
        </CardBody>
      </Card>
    </>
  )
}

export default Page
