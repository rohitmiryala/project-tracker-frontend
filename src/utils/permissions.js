export const hasPermission = (user, module, action) =>
  user?.membershipType === 'admin' || user?.permissions?.[module]?.[action] === true

export const hasAnyPermission = (user, entries = []) =>
  user?.membershipType === 'admin' || entries.some(([module, action]) => hasPermission(user, module, action))

export const isMenuItemVisible = (user, item) =>
  !item.permissions?.length || hasAnyPermission(user, item.permissions)

export const filterMenuItems = (items, user) =>
  items
    .map((item) => {
      const children = item.children ? filterMenuItems(item.children, user) : undefined
      return { ...item, ...(children ? { children } : {}) }
    })
    .filter((item) => isMenuItemVisible(user, item) && (!item.children || item.children.length > 0))
