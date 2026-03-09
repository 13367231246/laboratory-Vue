import request from '@/utils/request'

/**
 * 根据实验室ID查询该实验室的启用中的时间段（status=1），用于选择可申请的时间段
 */
export const listByLaboratoryId = (laboratoryId) => {
  return request.get(`/labSchedule/laboratory/${laboratoryId}`)
}
