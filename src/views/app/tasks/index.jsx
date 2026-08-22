import PageBreadcrumb from '@/components/PageBreadcrumb'
import { Badge, Card, CardBody, Col, Row } from 'react-bootstrap'

const columns = [
  {
    title: 'To do',
    variant: 'secondary',
    cards: [
      { title: 'Draft Q3 budget notes', project: 'Q3 Cost Review', assignee: 'Neha' },
      { title: 'Collect timesheets', project: 'Internal CRM', assignee: 'Arjun' },
    ],
  },
  {
    title: 'In progress',
    variant: 'primary',
    cards: [
      { title: 'Build invoice export', project: 'Acme Website', assignee: 'Priya' },
      { title: 'Map feature costs', project: 'Mobile App', assignee: 'Admin' },
    ],
  },
  {
    title: 'Review',
    variant: 'warning',
    cards: [{ title: 'QA landing copy', project: 'Acme Website', assignee: 'Priya' }],
  },
  {
    title: 'Done',
    variant: 'success',
    cards: [{ title: 'Invite workspace members', project: 'Internal CRM', assignee: 'Admin' }],
  },
]

const Page = () => {
  return (
    <>
      <PageBreadcrumb title="Tasks" subtitle="Kanban" />
      <Row className="g-3 flex-nowrap overflow-auto pb-2">
        {columns.map((column) => (
          <Col key={column.title} style={{ minWidth: 280 }}>
            <div className={`rounded p-2 bg-${column.variant} bg-opacity-10 h-100`}>
              <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                <h5 className="mb-0">{column.title}</h5>
                <Badge bg={column.variant}>{column.cards.length}</Badge>
              </div>
              {column.cards.map((card) => (
                <Card key={card.title} className="mb-2">
                  <CardBody className="p-3">
                    <h6 className="mb-1">{card.title}</h6>
                    <p className="text-muted fs-xs mb-2">{card.project}</p>
                    <span className="badge bg-light text-dark">{card.assignee}</span>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Col>
        ))}
      </Row>
    </>
  )
}

export default Page
