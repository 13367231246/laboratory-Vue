import request from '@/utils/request'

/**
 * 提交实验室申请
 */
export const apply = (data) => {
  return request.post('/lab-application', data)
}

/**
 * 撤销申请（仅待审核、已批准可撤销）
 */
export const cancel = (id) => {
  return request.patch(`/lab-application/${id}/cancel`)
}

/**
 * 分页查询我的申请记录
 */
export const listMyApplications = (pageNo, pageSize) => {
  return request.get('/lab-application/my', {
    params: { pageNo, pageSize }
  })
}

/**
 * 获取申请详情（含时间等记录）
 */
export const getDetail = (id) => {
  return request.get(`/lab-application/${id}`)
}

/**
 * 获取今日维护申请（限制5条）
 */
export const listTodayApplications = () => {
  return request.get('/maintenance/today')
}
