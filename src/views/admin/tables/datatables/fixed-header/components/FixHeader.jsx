import Icon from '@/components/wrappers/Icon'
import { Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap'
import { Link } from 'react-router'
import Table from './Table'
const FixHeader = () => {
  return (
    <>
      <Card>
        <CardHeader className="justify-content-between">
          <CardTitle as="h4"> Example </CardTitle>
          <Link to="https://datatables.net/extensions/fixedheader/examples/styling/bootstrap5.html" target="_blank" className="icon-link icon-link-hover link-primary fw-semibold">
            View Docs
            <Icon icon="arrow-right" className="bi align-middle fs-lg"></Icon>
          </Link>
        </CardHeader>
        <CardBody>
          <Table />
        </CardBody>
      </Card>
    </>
  )
}
export default FixHeader
