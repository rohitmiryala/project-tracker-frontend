import { describe, expect, it } from 'vitest'
import { getProjectPaginationItems, normalizeProjectListResponse } from './projectListUtils'

describe('project list response contract', () => {
  it('reads the backend top-level pagination envelope', () => {
    const response = {
      data: [{ id: 'project-1' }, { id: 'project-2' }],
      meta: { page: 2, limit: 2, total: 5, totalPages: 3 },
    }

    expect(normalizeProjectListResponse(response)).toEqual({
      items: response.data,
      meta: response.meta,
    })
  })

  it('remains compatible with nested paginated responses', () => {
    const response = {
      data: {
        items: [{ id: 'project-1' }],
        meta: { page: 1, limit: 9, total: 1, totalPages: 1 },
      },
    }

    expect(normalizeProjectListResponse(response)).toEqual(response.data)
  })

  it('creates compact numbered pagination for long result sets', () => {
    expect(getProjectPaginationItems(5, 10)).toEqual([
      1,
      'ellipsis-1-4',
      4,
      5,
      6,
      'ellipsis-6-10',
      10,
    ])
  })
})
