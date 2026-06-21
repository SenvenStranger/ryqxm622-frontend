import request from '/@/utils/request';

// 查询项目列表
export function listProjectInfo(query: any) {
	return request({
		url: '/ProjectInfo/list',
		method: 'get',
		params: query
	})
}

// 查询项目详情
export function getProjectInfo(Id: number) {
	return request({
		url: '/ProjectInfo/detail?Id=' + Id,
		method: 'get'
	})
}

// 新增项目
export function addProjectInfo(data: any) {
	return request({
		url: '/ProjectInfo/add',
		method: 'post',
		data: data
	})
}

// 修改项目
export function updateProjectInfo(data: any) {
	return request({
		url: '/ProjectInfo/update',
		method: 'post',
		data: data
	})
}

// 删除项目
export function delProjectInfo(Id: any) {
	return request({
		url: '/ProjectInfo/delete',
		method: 'post',
		data: Id
	})
}
