import { Col } from 'react-bootstrap'
import HorizontalScroll from './HorizontalScroll'
import VerticalScroll from './VerticalScroll'
const Table = () => {
  return (
    <>
      <Col xs={12}>
        <VerticalScroll />
        <HorizontalScroll />
      </Col>
    </>
  )
}
export default Table
