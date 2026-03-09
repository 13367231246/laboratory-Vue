import request from '@/utils/request'

/**
 * 普通用户：分页查询我的申请记录
 */
export const listMyApplications = (pageNo, pageSize) => {
  return request.get('/lab-application/my', {
    params: { pageNo, pageSize }
  })
}

/**
 * 普通用户：撤销自己的申请（仅待审核、已批准可撤销）
 */
export const cancelApplication = (id) => {
  return request.patch(`/lab-application/${id}/cancel`)
}

/**
 * 普通用户：完成申请（仅已批准或使用中的申请可完成）
 */
export const finishApplication = (id) => {
  return request.patch(`/lab-application/${id}/finish`)
}

/**
 * 普通用户：删除申请（仅已完成的申请可删除）
 */
export const deleteApplication = (id) => {
  return request.delete(`/lab-application/${id}`)
}

/**
 * 普通用户：获取申请详情（含时间等记录）
 */
export const getApplicationDetail = (id) => {
  return request.get(`/lab-application/${id}`)
}
