import request from '@/utils/request'

// ===================== 项目管理 API =====================

// 获取项目列表
export function listProject(query: any) {
  return request({
    url: '/teach/scientific/project/list',
    method: 'get',
    params: query
  })
}

// 查询项目详细
export function getProject(projectId: number) {
  return request({
    url: '/teach/scientific/project/' + projectId,
    method: 'get'
  })
}

// 新增项目
export function addProject(data: any) {
  return request({
    url: '/teach/scientific/project',
    method: 'post',
    data: data
  })
}

// 修改项目
export function updateProject(data: any) {
  return request({
    url: '/teach/scientific/project',
    method: 'put',
    data: data
  })
}

// 删除项目
export function delProject(projectId: number) {
  return request({
    url: '/teach/scientific/project/' + projectId,
    method: 'delete'
  })
}

// 导出项目
export function exportProject(query: any) {
  return request({
    url: '/teach/scientific/project/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}

// 获取所有项目
export function getAllProjects() {
  return request({
    url: '/teach/scientific/project/all',
    method: 'get'
  })
}

// 获取项目统计
export function getProjectStatistics() {
  return request({
    url: '/teach/scientific/project/statistics',
    method: 'get'
  })
}

// ===================== 里程碑管理 API =====================

// 获取里程碑列表
export function listMilestone(query: any) {
  return request({
    url: '/teach/project/milestone/list',
    method: 'get',
    params: query
  })
}

// 查询里程碑详细
export function getMilestone(milestoneId: number) {
  return request({
    url: '/teach/project/milestone/' + milestoneId,
    method: 'get'
  })
}

// 新增里程碑
export function addMilestone(data: any) {
  return request({
    url: '/teach/project/milestone',
    method: 'post',
    data: data
  })
}

// 修改里程碑
export function updateMilestone(data: any) {
  return request({
    url: '/teach/project/milestone',
    method: 'put',
    data: data
  })
}

// 删除里程碑
export function delMilestone(milestoneId: number) {
  return request({
    url: '/teach/project/milestone/' + milestoneId,
    method: 'delete'
  })
}

// 导出里程碑
export function exportMilestone(query: any) {
  return request({
    url: '/teach/project/milestone/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}

// 获取项目的里程碑
export function getMilestonesByProject(projectId: number) {
  return request({
    url: '/teach/project/milestone/project/' + projectId,
    method: 'get'
  })
}

// ===================== 团队成员 API =====================

// 获取成员列表
export function listMember(query: any) {
  return request({
    url: '/teach/project/member/list',
    method: 'get',
    params: query
  })
}

// 查询成员详细
export function getMember(memberId: number) {
  return request({
    url: '/teach/project/member/' + memberId,
    method: 'get'
  })
}

// 新增成员
export function addMember(data: any) {
  return request({
    url: '/teach/project/member',
    method: 'post',
    data: data
  })
}

// 修改成员
export function updateMember(data: any) {
  return request({
    url: '/teach/project/member',
    method: 'put',
    data: data
  })
}

// 删除成员
export function delMember(memberId: number) {
  return request({
    url: '/teach/project/member/' + memberId,
    method: 'delete'
  })
}

// ===================== 项目文档 API =====================

// 获取文档列表
export function listDocument(query: any) {
  return request({
    url: '/teach/project/document/list',
    method: 'get',
    params: query
  })
}

// 查询文档详细
export function getDocument(docId: number) {
  return request({
    url: '/teach/project/document/' + docId,
    method: 'get'
  })
}

// 上传文档
export function uploadDocument(formData: any) {
  return request({
    url: '/teach/project/document/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 删除文档
export function delDocument(docId: number) {
  return request({
    url: '/teach/project/document/' + docId,
    method: 'delete'
  })
}

// 下载文档
export function downloadDocument(docId: number) {
  return request({
    url: '/teach/project/document/download/' + docId,
    method: 'get',
    responseType: 'blob'
  })
}
