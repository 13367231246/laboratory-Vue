import request from '@/utils/request'

/**
 * 用户：提交设备申请
 */
export const apply = (data) => {
  return request.post('/equipment-application', data)
}

/**
 * 用户：撤销自己的申请（仅待审核、已批准可撤销）
 */
export const cancel = (id) => {
  return request.patch(`/equipment-application/${id}/cancel`)
}

/**
 * 用户：完成使用（仅已批准或使用中的申请可完成）
 */
export const finish = (id) => {
  return request.patch(`/equipment-application/${id}/finish`)
}

/**
 * 用户：删除申请记录（仅已完成或已取消的申请可删除）
 */
export const remove = (id) => {
  return request.delete(`/equipment-application/${id}`)
}

/**
 * 用户：分页查询我的申请记录
 */
export const listMyApplications = (pageNo, pageSize) => {
  return request.get('/equipment-application/my', {
    params: { pageNo, pageSize }
  })
}

/**
 * 用户：查看申请详情
 */
export const getDetail = (id) => {
  return request.get(`/equipment-application/${id}`)
}
