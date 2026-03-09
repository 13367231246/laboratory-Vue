import request from '@/utils/request'

/**
 * 获取所有状态正常的可申请实验室（status=1，不分页）
 */
export const listAvailable = () => {
  return request.get('/laboratory/user/available')
}

/**
 * 根据实验室ID查询该实验室内设备列表
 */
export const getEquipmentByLaboratoryId = (id) => {
  return request.get(`/laboratory/${id}/equipment`)
}

/**
 * 获取实验室汇总统计
 */
export const getLaboratorySummary = () => {
  return request.get('/laboratory/summary')
}
