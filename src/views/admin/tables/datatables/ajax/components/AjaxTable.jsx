import Icon from '@/components/wrappers/Icon'
import { Alert, Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap'
import { Link } from 'react-router'
import Table from './Table'
const AjaxTable = () => {
  return (
    <>
      <Card>
        <CardHeader className="justify-content-between">
          <CardTitle as="h4"> Example </CardTitle>
          <Link to="https://datatables.net/examples/ajax/" target="_blank" className="icon-link icon-link-hover link-primary fw-semibold">
            View Docs
            <Icon icon="arrow-right" className="bi align-middle fs-lg"></Icon>
          </Link>
        </CardHeader>
        <CardBody>
          <Alert variant="warning" dismissible className="mb-4">
            <strong>Note:</strong> This is a jQuery-based plugin, so you need to include jQuery for it to work.
          </Alert>
          <Table />
        </CardBody>
      </Card>
    </>
  )
}
export default AjaxTable
