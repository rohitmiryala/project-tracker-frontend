import { FormCheck } from 'react-bootstrap'

const PermissionMatrix = ({ catalog, value, onChange, disabled = false }) => {
  const changeAction = (moduleKey, actionKey, checked) => {
    onChange({
      ...value,
      [moduleKey]: { ...(value?.[moduleKey] || {}), [actionKey]: checked },
    })
  }

  const changeModule = (module, checked) => {
    onChange({
      ...value,
      [module.key]: Object.fromEntries(module.actions.map((action) => [action.key, checked])),
    })
  }

  return (
    <div className="vstack gap-3">
      {catalog.map((module) => {
        const selected = module.actions.filter((action) => value?.[module.key]?.[action.key]).length
        return (
          <div key={module.key} className="border rounded p-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
              <div>
                <div className="fw-semibold">{module.label}</div>
                <span className="text-muted fs-xs">{selected} of {module.actions.length} enabled</span>
              </div>
              <FormCheck
                type="checkbox"
                label="Select all"
                checked={selected === module.actions.length}
                onChange={(event) => changeModule(module, event.target.checked)}
                disabled={disabled}
              />
            </div>
            <div className="d-flex flex-wrap gap-3">
              {module.actions.map((action) => (
                <FormCheck
                  key={action.key}
                  type="checkbox"
                  label={action.label}
                  checked={Boolean(value?.[module.key]?.[action.key])}
                  onChange={(event) => changeAction(module.key, action.key, event.target.checked)}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PermissionMatrix
