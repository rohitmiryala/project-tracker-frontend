import CreatableSelect from 'react-select/creatable'

const normalizeTag = (value) => value.trim()

const ProjectTagsSelect = ({ value = [], onChange, onBlur, disabled, isInvalid, ariaDescribedBy }) => {
  const selected = value.map((tag) => ({ value: tag, label: tag }))

  const updateTags = (options = []) => {
    const seen = new Set()
    const tags = options
      .map((option) => normalizeTag(option.value))
      .filter((tag) => {
        const normalized = tag.toLocaleLowerCase()
        if (!tag || tag.length > 40 || seen.has(normalized)) return false
        seen.add(normalized)
        return true
      })
      .slice(0, 20)
    onChange(tags)
  }

  return (
    <CreatableSelect
      inputId="projectTags"
      className={`react-select${isInvalid ? ' is-invalid' : ''}`}
      classNamePrefix="react-select"
      value={selected}
      options={selected}
      onChange={updateTags}
      onBlur={onBlur}
      onCreateOption={(inputValue) => {
        const tag = normalizeTag(inputValue)
        if (!tag || tag.length > 40 || value.length >= 20) return
        if (value.some((item) => item.toLocaleLowerCase() === tag.toLocaleLowerCase())) return
        onChange([...value, tag])
      }}
      isValidNewOption={(inputValue) => {
        const tag = normalizeTag(inputValue)
        return Boolean(
          tag &&
          tag.length <= 40 &&
          value.length < 20 &&
          !value.some((item) => item.toLocaleLowerCase() === tag.toLocaleLowerCase())
        )
      }}
      formatCreateLabel={(inputValue) => `Add tag “${normalizeTag(inputValue)}”`}
      noOptionsMessage={() => value.length >= 20 ? 'Maximum of 20 tags reached' : 'Type to add a tag'}
      placeholder="Type and press Enter to add tags"
      isMulti
      isClearable
      isDisabled={disabled}
      menuPosition="fixed"
      menuPortalTarget={typeof document === 'undefined' ? undefined : document.body}
      aria-invalid={isInvalid || undefined}
      aria-describedby={ariaDescribedBy}
    />
  )
}

export default ProjectTagsSelect
