import PageBreadcrumb from '@/components/PageBreadcrumb'
import { Card, CardBody, Table } from 'react-bootstrap'

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const events = {
  12: 'Sprint review',
  15: 'Invoice due',
  18: 'Client kickoff',
}

const buildMonthCells = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: firstDay }, () => null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day)
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

const Page = () => {
  const today = new Date()
  const weeks = buildMonthCells(today)
  const title = today.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <>
      <PageBreadcrumb title="Calendar" subtitle="Velorak" />
      <Card>
        <CardBody>
          <h5 className="mb-3">{title}</h5>
          <Table bordered className="mb-0 text-center align-middle">
            <thead>
              <tr>
                {weekdayLabels.map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, idx) => (
                <tr key={idx}>
                  {week.map((day, cellIdx) => (
                    <td key={cellIdx} style={{ height: 88, width: '14%' }}>
                      {day && (
                        <>
                          <div className="fw-semibold">{day}</div>
                          {events[day] && <div className="badge bg-primary-subtle text-primary mt-1">{events[day]}</div>}
                        </>
                      )}
                    </td>
                  ))}
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
