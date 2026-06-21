import request from '/@/utils/request';

// 查询科研项目列表
export function listProjectInfo(query: any) {
	return request({
		url: '/ProjectInfo/list',
		method: 'get',
		params: query
	})
}

// 查询科研项目详细
export function getProjectInfo(Id: number) {
	return request({
		url: '/ProjectInfo/detail?Id=' + Id,
		method: 'get'
	})
}

// 新增科研项目
export function addProjectInfo(data: any) {
	return request({
		url: '/ProjectInfo/add',
		method: 'post',
		data: data
	})
}

// 修改科研项目
export function updateProjectInfo(data: any) {
	return request({
		url: '/ProjectInfo/update',
		method: 'post',
		data: data
	})
}

// 删除科研项目
export function delProjectInfo(ids: any) {
	return request({
		url: '/ProjectInfo/delete',
		method: 'post',
		data: ids
	})
}
