import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { clientService } from '@/services/clientService'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormControl,
  FormSelect,
  Modal,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap'
import ClientModal from './components/ClientModal'

const PAGE_SIZE_OPTIONS = [5, 10, 15, 25]

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

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

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

  // Filter clients by search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return clients
    return clients.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.contactPersonName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    )
  }, [clients, query])

  // Reset to first page when search or data changes
  useEffect(() => {
    setPageIndex(0)
  }, [query, clients])

  // Pagination derived values
  const totalItems = filtered.length
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePageIndex = Math.min(pageIndex, pageCount - 1)
  const start = totalItems === 0 ? 0 : safePageIndex * pageSize + 1
  const end = Math.min(start + pageSize - 1, totalItems)
  const paginatedClients = filtered.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize)

  const canPreviousPage = safePageIndex > 0
  const canNextPage = safePageIndex < pageCount - 1

  const goToPage = (idx) => setPageIndex(Math.max(0, Math.min(idx, pageCount - 1)))
  const previousPage = () => goToPage(safePageIndex - 1)
  const nextPage = () => goToPage(safePageIndex + 1)

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    setPageIndex(0)
  }

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

  // Build visible page numbers with ellipsis for large page counts
  const getVisiblePages = () => {
    const pages = []
    const maxVisible = 5

    if (pageCount <= maxVisible + 2) {
      for (let i = 0; i < pageCount; i++) pages.push(i)
      return pages
    }

    // Always show first page
    pages.push(0)

    let rangeStart = Math.max(1, safePageIndex - 1)
    let rangeEnd = Math.min(pageCount - 2, safePageIndex + 1)

    // Adjust range to always show at least 3 middle pages
    if (rangeEnd - rangeStart < 2) {
      if (rangeStart <= 1) {
        rangeEnd = Math.min(pageCount - 2, rangeStart + 2)
      } else {
        rangeStart = Math.max(1, rangeEnd - 2)
      }
    }

    if (rangeStart > 1) pages.push('ellipsis-start')
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i)
    if (rangeEnd < pageCount - 2) pages.push('ellipsis-end')

    // Always show last page
    pages.push(pageCount - 1)

    return pages
  }

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
                {paginatedClients.map((client) => (
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

          <CardFooter className="border-top">
            <Row className="align-items-center text-center text-sm-start">
              <Col sm className="mb-2 mb-sm-0">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted">
                    Showing <span className="fw-semibold">{start}</span> to{' '}
                    <span className="fw-semibold">{end}</span> of{' '}
                    <span className="fw-semibold">{totalItems}</span> clients
                  </span>
                  <FormSelect
                    size="sm"
                    style={{ width: 'auto' }}
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size} / page
                      </option>
                    ))}
                  </FormSelect>
                </div>
              </Col>
              {pageCount > 1 && (
                <Col sm="auto">
                  <ul className="pagination pagination-sm pagination-boxed mb-0 justify-content-center">
                    <li className="page-item">
                      <button className="page-link" onClick={previousPage} disabled={!canPreviousPage}>
                        <Icon icon="chevron-left" />
                      </button>
                    </li>
                    {getVisiblePages().map((page, idx) =>
                      typeof page === 'string' ? (
                        <li key={page} className="page-item disabled">
                          <span className="page-link">…</span>
                        </li>
                      ) : (
                        <li key={idx} className={`page-item ${safePageIndex === page ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => goToPage(page)}>
                            {page + 1}
                          </button>
                        </li>
                      )
                    )}
                    <li className="page-item">
                      <button className="page-link" onClick={nextPage} disabled={!canNextPage}>
                        <Icon icon="chevron-right" />
                      </button>
                    </li>
                  </ul>
                </Col>
              )}
            </Row>
          </CardFooter>
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
