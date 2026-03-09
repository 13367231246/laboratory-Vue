import request from '@/utils/request'
// 用户分页获取协议文档
export const listDocumentByPublished = (pageNo, pageSize) => {
  return request.get('/document/user/published', {
    params: {
      pageNo,
      pageSize
    }
  })
}

// 获取协议文档详情
export const getDocumentById = (id) => {
  return request.get(`/document/${id}`)
}

// 用户分页获取公告
export const listByPublished = (pageNo, pageSize) => {
  return request.get('/notice/user/published', {
    params: {
      pageNo,
      pageSize
    }
  })
}

// 获取公告详情
export const getNoticeById = (id) => {
  return request.get(`/notice/${id}`)
}
