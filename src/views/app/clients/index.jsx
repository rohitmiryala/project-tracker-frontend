import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { clientService } from '@/services/clientService'
import { useCallback, useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormControl,
  Modal,
  Spinner,
  Table,
} from 'react-bootstrap'
import ClientModal from './components/ClientModal'

const Page = () => {
  const { showNotification } = useNotificationContext()
  const [query, setQuery] = useState('')
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toggleTarget, setToggleTarget] = useState(null)
  const [toggling, setToggling] = useState(false)

  const loadClients = useCallback(async () => {
    setLoading(true)
    try {
      const json = await clientService.list()
      setClients(json?.data || [])
    } catch (err) {
      showNotification({ title: 'Clients', message: err.message || 'Could not load clients', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const openCreate = () => {
    setEditId(null)
    setModalOpen(true)
  }

  const openEdit = (id) => {
    setEditId(id)
    setModalOpen(true)
  }

  const confirmDelete = (client) => setDeleteTarget(client)
  const cancelDelete = () => setDeleteTarget(null)

  const performDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await clientService.remove(deleteTarget.id)
      showNotification({ title: 'Clients', message: 'Client deleted', variant: 'success' })
      setDeleteTarget(null)
      loadClients()
    } catch (err) {
      showNotification({ title: 'Clients', message: err.message || 'Delete failed', variant: 'danger' })
    } finally {
      setDeleting(false)
    }
  }

  const filtered = query.trim()
    ? clients.filter(
        (c) =>
          c.name?.toLowerCase().includes(query.toLowerCase()) ||
          c.contactPersonName?.toLowerCase().includes(query.toLowerCase()) ||
          c.email?.toLowerCase().includes(query.toLowerCase())
      )
    : clients

  return (
    <>
      <PageBreadcrumb title="Clients" subtitle="Velorak" />

      <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
        <div className="app-search" style={{ width: 280 }}>
          <FormControl
            type="search"
            placeholder="Search clients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Icon icon="search" className="app-search-icon text-muted" />
        </div>
        <Button variant="primary" className="text-nowrap" onClick={openCreate}>
          <Icon icon="plus" className="me-1" /> Add Client
        </Button>
      </div>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card>
          <CardBody className="text-center py-5">
            <Icon icon="building-2" className="text-muted mb-2" style={{ width: 48, height: 48 }} />
            <p className="text-muted mb-0">
              {query.trim() ? 'No clients match your search.' : 'No clients yet. Add one to get started.'}
            </p>
          </CardBody>
        </Card>
      )}

      {!loading && filtered.length > 0 && (
        <Card>
          <CardBody className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="bg-light-subtle">
                <tr>
                  <th>Name</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>Currency</th>
                  <th className="text-center">Status</th>
                  <th className="text-end" style={{ width: 60 }}>
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id}>
                    <td className="fw-semibold">{client.name}</td>
                    <td className="text-muted">{client.contactPersonName || '—'}</td>
                    <td className="text-muted">{client.email || '—'}</td>
                    <td>{client.currency || '—'}</td>
                    <td className="text-center">
                      <Form.Check
                        type="switch"
                        id={`status-${client.id}`}
                        checked={client.isActive}
                        onChange={() => setToggleTarget(client)}
                        label={client.isActive ? 'Active' : 'Inactive'}
                        className="d-inline-block"
                      />
                    </td>
                    <td className="text-end">
                      <Dropdown align="end">
                        <DropdownToggle as="button" className="btn btn-sm btn-soft-secondary drop-arrow-none">
                          <Icon icon="ellipsis" />
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem onClick={() => openEdit(client.id)}>Edit client</DropdownItem>
                          <DropdownItem className="text-danger" onClick={() => confirmDelete(client)}>
                            Delete client
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      <ClientModal show={modalOpen} clientId={editId} onHide={() => setModalOpen(false)} onSaved={loadClients} />

      <Modal show={Boolean(deleteTarget)} onHide={cancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</p>
          <p className="text-muted mb-0">This client will be removed from the list. Projects linked to it will not be affected.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={cancelDelete} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={performDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={Boolean(toggleTarget)} onHide={() => setToggleTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{toggleTarget?.isActive ? 'Deactivate' : 'Activate'} Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">
            Are you sure you want to {toggleTarget?.isActive ? 'deactivate' : 'activate'}{' '}
            <strong>{toggleTarget?.name}</strong>?
          </p>
          <p className="text-muted mb-0">
            {toggleTarget?.isActive
              ? 'Inactive clients cannot be assigned to new projects.'
              : 'This client will become available for project assignments again.'}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setToggleTarget(null)} disabled={toggling}>
            Cancel
          </Button>
          <Button
            variant={toggleTarget?.isActive ? 'warning' : 'success'}
            disabled={toggling}
            onClick={async () => {
              if (!toggleTarget) return
              try {
                setToggling(true)
                await clientService.update(toggleTarget.id, { isActive: !toggleTarget.isActive })
                showNotification({
                  title: 'Clients',
                  message: `Client ${toggleTarget.isActive ? 'deactivated' : 'activated'}`,
                  variant: 'success',
                })
                setToggleTarget(null)
                loadClients()
              } catch (err) {
                showNotification({ title: 'Clients', message: err.message || 'Update failed', variant: 'danger' })
              } finally {
                setToggling(false)
              }
            }}
          >
            {toggling ? 'Updating…' : toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Page
