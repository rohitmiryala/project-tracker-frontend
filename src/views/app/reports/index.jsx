import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { Button, Card, CardBody, Col, Row } from 'react-bootstrap'

const reports = [
  { title: 'Project profitability', desc: 'Profit vs loss by project for the selected period.', icon: 'chart-column' },
  { title: 'Time vs cost', desc: 'Hours logged against estimated cost.', icon: 'clock-3' },
  { title: 'Team utilization', desc: 'How seats and hours are used across the company.', icon: 'users' },
  { title: 'Overdue work', desc: 'Tasks and projects past due date.', icon: 'calendar-x' },
]

const Page = () => {
  return (
    <>
      <PageBreadcrumb title="Reports" subtitle="Velorak" />
      <Row className="g-3">
        {reports.map((report) => (
          <Col xl={6} key={report.title}>
            <Card className="h-100">
              <CardBody className="d-flex gap-3">
                <span className="avatar-title bg-primary-subtle text-primary rounded avatar avatar-md flex-shrink-0">
                  <Icon icon={report.icon} />
                </span>
                <div className="flex-grow-1">
                  <h5 className="mb-1">{report.title}</h5>
                  <p className="text-muted mb-3">{report.desc}</p>
                  <Button className="btn-soft-primary" size="sm">
                    Open report
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}

export default Page
