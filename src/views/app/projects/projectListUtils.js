export const DEFAULT_PROJECT_PAGE_SIZE = 9
export const PROJECT_PAGE_SIZES = [6, 9, 12, 24]

const positiveInteger = (value, fallback) => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : fallback
}

export const normalizeProjectListResponse = (
  response,
  fallback = { page: 1, limit: DEFAULT_PROJECT_PAGE_SIZE },
) => {
  const nestedData = response?.data && !Array.isArray(response.data) ? response.data : null
  const items = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(nestedData?.items)
      ? nestedData.items
      : []
  const responseMeta = response?.meta || nestedData?.meta || {}
  const page = positiveInteger(responseMeta.page, fallback.page)
  const limit = positiveInteger(responseMeta.limit, fallback.limit)
  const total = Math.max(0, Number(responseMeta.total) || items.length)
  const totalPages = positiveInteger(responseMeta.totalPages, Math.max(1, Math.ceil(total / limit)))

  return {
    items,
    meta: { page, limit, total, totalPages },
  }
}

export const getProjectPaginationItems = (currentPage, totalPages) => {
  const lastPage = Math.max(1, positiveInteger(totalPages, 1))
  const activePage = Math.min(lastPage, positiveInteger(currentPage, 1))

  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1)
  }

  const visiblePages = [...new Set([1, activePage - 1, activePage, activePage + 1, lastPage])]
    .filter((page) => page >= 1 && page <= lastPage)
    .sort((left, right) => left - right)

  return visiblePages.flatMap((page, index) => {
    const previousPage = visiblePages[index - 1]
    if (previousPage && page - previousPage > 1) {
      return [`ellipsis-${previousPage}-${page}`, page]
    }
    return [page]
  })
}
