import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { Card, CardBody, Col, Row, Table } from 'react-bootstrap'

const summary = [
  { title: 'Budget', value: '₹8.5L', icon: 'wallet', variant: 'primary' },
  { title: 'Spent', value: '₹5.1L', icon: 'banknote', variant: 'warning' },
  { title: 'Remaining', value: '₹3.4L', icon: 'piggy-bank', variant: 'success' },
  { title: 'Over budget items', value: '2', icon: 'triangle-alert', variant: 'danger' },
]

const rows = [
  { project: 'Acme Website', estimated: '₹2.0L', actual: '₹1.4L', status: 'On track' },
  { project: 'Internal CRM', estimated: '₹1.2L', actual: '₹1.5L', status: 'Over' },
  { project: 'Mobile App', estimated: '₹3.1L', actual: '₹1.8L', status: 'On track' },
]

const Page = () => {
  return (
    <>
      <PageBreadcrumb title="Cost Tracking" subtitle="Velorak" />
      <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1 g-3 mb-3">
        {summary.map((item) => (
          <Col key={item.title}>
            <Card>
              <CardBody className="d-flex align-items-center gap-3">
                <span className={`avatar-title bg-${item.variant}-subtle text-${item.variant} rounded avatar avatar-md`}>
                  <Icon icon={item.icon} />
                </span>
                <div>
                  <p className="text-muted mb-0">{item.title}</p>
                  <h4 className="mb-0">{item.value}</h4>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
      <Card>
        <CardBody className="p-0">
          <Table responsive className="mb-0 align-middle">
            <thead className="bg-light bg-opacity-50">
              <tr>
                <th>Project</th>
                <th>Estimated</th>
                <th>Actual</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.project}>
                  <td className="fw-semibold">{row.project}</td>
                  <td>{row.estimated}</td>
                  <td>{row.actual}</td>
                  <td>
                    <span className={`badge ${row.status === 'Over' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </>
  )
}

export default Page
