import Icon from '@/components/wrappers/Icon'
import { Alert, Button, Spinner } from 'react-bootstrap'

export const DrawerLoading = ({ label = 'Loading details…' }) => (
  <div className="text-center py-5" role="status">
    <Spinner animation="border" />
    <div className="text-muted mt-2">{label}</div>
  </div>
)

export const DrawerError = ({ message, onRetry }) => (
  <Alert variant="danger" className="text-center">
    <Icon icon="triangle-alert" className="fs-3 mb-2" />
    <p>{message}</p>
    {onRetry && <Button size="sm" variant="outline-danger" onClick={onRetry}>Try again</Button>}
  </Alert>
)

export const ConflictAlert = ({ onReload }) => (
  <Alert variant="warning" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
    <span>This item changed elsewhere. Reload the latest version before saving again.</span>
    <Button size="sm" variant="outline-warning" onClick={onReload}>Reload latest</Button>
  </Alert>
)
