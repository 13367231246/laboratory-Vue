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
