import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { Card, CardBody, CardHeader, Col, ProgressBar, Row, Table } from 'react-bootstrap'

const stats = [
  { title: 'Total projects', value: '12', icon: 'folder-kanban', variant: 'primary' },
  { title: 'Active projects', value: '7', icon: 'play', variant: 'success' },
  { title: 'Completed', value: '4', icon: 'circle-check', variant: 'info' },
  { title: 'Total profits', value: '₹2.4L', icon: 'trending-up', variant: 'warning' },
  { title: 'Total losses', value: '₹38K', icon: 'trending-down', variant: 'danger' },
]

const projects = [
  { name: 'Acme Website', members: 6, progress: 72 },
  { name: 'Internal CRM', members: 4, progress: 41 },
  { name: 'Mobile App', members: 8, progress: 18 },
]

const tasks = [
  { name: 'Fix billing invoice export', status: 'Overdue', start: '04 Aug', due: '10 Aug', assignee: 'Priya' },
  { name: 'Review cost thresholds', status: 'Pending', start: '12 Aug', due: '16 Aug', assignee: 'Arjun' },
  { name: 'Invite finance lead', status: 'Pending', start: '14 Aug', due: '18 Aug', assignee: 'Admin' },
]

const Page = () => {
  return (
    <>
      <PageBreadcrumb title="Dashboard" subtitle="Velorak" />

      <Row className="row-cols-xxl-5 row-cols-md-2 row-cols-1 g-3 mb-3">
        {stats.map((item) => (
          <Col key={item.title}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-start">
                  <div className="avatar avatar-lg flex-shrink-0">
                    <span className={`avatar-title bg-${item.variant}-subtle text-${item.variant} rounded fs-24`}>
                      <Icon icon={item.icon} />
                    </span>
                  </div>
                  <div className="text-end">
                    <h4 className="mb-0">{item.value}</h4>
                    <p className="mb-0 text-muted">{item.title}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        <Col xxl={7}>
          <Card>
            <CardHeader>
              <h5 className="mb-0">Projects</h5>
            </CardHeader>
            <CardBody className="p-0">
              <Table responsive className="mb-0 align-middle">
                <thead className="bg-light bg-opacity-50">
                  <tr>
                    <th>Name</th>
                    <th>Members</th>
                    <th style={{ minWidth: 160 }}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.name}>
                      <td className="fw-semibold">{project.name}</td>
                      <td>{project.members}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <ProgressBar now={project.progress} className="flex-grow-1" style={{ height: 6 }} />
                          <span className="text-muted fs-xs">{project.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
        <Col xxl={5}>
          <Card>
            <CardHeader>
              <h5 className="mb-0">Pending / overdue tasks</h5>
            </CardHeader>
            <CardBody className="p-0">
              <Table responsive className="mb-0 align-middle">
                <thead className="bg-light bg-opacity-50">
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Due</th>
                    <th>Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.name}>
                      <td>{task.name}</td>
                      <td>
                        <span className={`badge ${task.status === 'Overdue' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>{task.due}</td>
                      <td>{task.assignee}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Page
