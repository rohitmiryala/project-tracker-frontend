import CreatableSelect from 'react-select/creatable'
import { isValidEmploymentValue, mergeEmploymentOptions, normalizeEmploymentValue } from '../userFormUtils'

const EmploymentCreatableSelect = ({
  inputId,
  value,
  options,
  onChange,
  onBlur,
  onCreateValue,
  name,
  disabled = false,
  isInvalid = false,
  placeholder,
  ariaDescribedBy,
}) => {
  const normalizedValue = normalizeEmploymentValue(value)
  const availableOptions = mergeEmploymentOptions(options, normalizedValue ? [normalizedValue] : [])
    .map((option) => ({ value: option, label: option }))
  const selectedOption = normalizedValue ? { value: normalizedValue, label: normalizedValue } : null

  const createOption = (inputValue) => {
    const nextValue = normalizeEmploymentValue(inputValue)
    if (!isValidEmploymentValue(nextValue)) return
    onCreateValue?.(nextValue)
    onChange(nextValue)
  }

  return (
    <CreatableSelect
      inputId={inputId}
      className={`react-select${isInvalid ? ' is-invalid' : ''}`}
      classNamePrefix="react-select"
      value={selectedOption}
      name={name}
      options={availableOptions}
      onChange={(option) => onChange(option?.value || '')}
      onBlur={onBlur}
      onCreateOption={createOption}
      isValidNewOption={(inputValue) => {
        const nextValue = normalizeEmploymentValue(inputValue)
        return isValidEmploymentValue(nextValue) && !availableOptions.some((option) => option.value.toLocaleLowerCase() === nextValue.toLocaleLowerCase())
      }}
      formatCreateLabel={(inputValue) => `Create “${normalizeEmploymentValue(inputValue)}”`}
      noOptionsMessage={({ inputValue }) => inputValue ? 'No matching option' : 'Start typing to search or create'}
      placeholder={placeholder}
      isClearable
      isDisabled={disabled}
      menuPosition="fixed"
      menuPortalTarget={typeof document === 'undefined' ? undefined : document.body}
      aria-invalid={isInvalid || undefined}
      aria-describedby={ariaDescribedBy}
    />
  )
}

export default EmploymentCreatableSelect
