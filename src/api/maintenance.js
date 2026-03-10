import request from '@/utils/request'

/**
 * 用户：提交维修申请（实验室/设备二选一）
 */
export const applyMaintenance = (data) => {
  return request.post('/maintenance/apply', data)
}

/**
 * 老师：分页查询待处理（指派给我，状态0/1）的维修记录
 */
export const listTodoAsTeacher = (pageNo, pageSize) => {
  return request.get('/maintenance/teacher/todo', {
    params: {
      pageNo,
      pageSize
    }
  })
}

/**
 * 教师：开始维修
 */
export const startRepairAsTeacher = (id) => {
  return request.patch(`/maintenance/teacher/${id}/start`)
}

/**
 * 教师：完成维修
 */
export const completeRepairAsTeacher = (id, data) => {
  return request.patch(`/maintenance/teacher/${id}/complete`, data)
}

/**
 * 老师：我的汇总（仅统计指派给我的记录）
 */
export const summaryForTeacher = () => {
  return request.get('/maintenance/teacher/summary')
}

/**
 * 老师：标记不需要维护
 */
export const markNoNeedAsTeacher = (id) => {
  return request.patch(`/maintenance/teacher/${id}/no-need`)
}

/**
 * 获取今日维护申请（限制5条）
 */
export const listTodayApplications = () => {
  return request.get('/maintenance/today')
}

/**
 * 用户：获取我的报修任务详情
 */
export const getMyMaintenanceDetail = (id) => {
  return request.get(`/maintenance/my/${id}`)
}

/**
 * 用户：删除我的报修任务（仅待审核状态可删除）
 */
export const deleteMyMaintenance = (id) => {
  return request.delete(`/maintenance/my/${id}`)
}

/**
 * 用户：获取我的报修进度统计
 */
export const getMyMaintenanceProgress = () => {
  return request.get('/maintenance/my/progress')
}

/**
 * 用户：获取我的报修列表
 */
export const getMyRepairList = (pageNo, pageSize) => {
  return request.get('/maintenance/my', {
    params: { pageNo, pageSize }
  })
}
