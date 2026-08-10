import { Col } from 'react-bootstrap'
import CellSelection from './CellSelection'
import MultiItemSelection from './MultiItemSelection'
import SingleItemSelect from './SingleItemSelect'
const Table = () => {
  return (
    <>
      <Col xs={12}>
        <SingleItemSelect />
        <MultiItemSelection />
        <CellSelection />
      </Col>
    </>
  )
}
export default Table
