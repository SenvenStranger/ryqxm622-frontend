import request from '@/utils/request'

// ===================== 设备管理 API =====================

// 获取设备列表
export function listDevice(query: any) {
  return request({
    url: '/teach/fall/device/list',
    method: 'get',
    params: query
  })
}

// 查询设备详细
export function getDevice(deviceId: number) {
  return request({
    url: '/teach/fall/device/' + deviceId,
    method: 'get'
  })
}

// 新增设备
export function addDevice(data: any) {
  return request({
    url: '/teach/fall/device',
    method: 'post',
    data: data
  })
}

// 修改设备
export function updateDevice(data: any) {
  return request({
    url: '/teach/fall/device',
    method: 'put',
    data: data
  })
}

// 删除设备
export function delDevice(deviceId: number) {
  return request({
    url: '/teach/fall/device/' + deviceId,
    method: 'delete'
  })
}

// 导出设备
export function exportDevice(query: any) {
  return request({
    url: '/teach/fall/device/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}

// 设备心跳
export function deviceHeartbeat(deviceCode: string) {
  return request({
    url: '/teach/fall/device/heartbeat/' + deviceCode,
    method: 'post'
  })
}

// 获取所有设备
export function getAllDevices() {
  return request({
    url: '/teach/fall/device/all',
    method: 'get'
  })
}

// ===================== 报警记录 API =====================

// 获取报警列表
export function listAlarm(query: any) {
  return request({
    url: '/teach/fall/alarm/list',
    method: 'get',
    params: query
  })
}

// 查询报警详细
export function getAlarm(alarmId: number) {
  return request({
    url: '/teach/fall/alarm/' + alarmId,
    method: 'get'
  })
}

// 新增报警
export function addAlarm(data: any) {
  return request({
    url: '/teach/fall/alarm',
    method: 'post',
    data: data
  })
}

// 处理报警
export function handleAlarm(data: any) {
  return request({
    url: '/teach/fall/alarm/handle',
    method: 'put',
    data: data
  })
}

// 删除报警
export function delAlarm(alarmId: number) {
  return request({
    url: '/teach/fall/alarm/' + alarmId,
    method: 'delete'
  })
}

// 导出报警
export function exportAlarm(query: any) {
  return request({
    url: '/teach/fall/alarm/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}

// 获取报警统计
export function getAlarmStatistics() {
  return request({
    url: '/teach/fall/alarm/statistics',
    method: 'get'
  })
}

// 获取今日报警
export function getTodayAlarms() {
  return request({
    url: '/teach/fall/alarm/today',
    method: 'get'
  })
}

// 设备上报报警
export function reportAlarm(data: any) {
  return request({
    url: '/teach/fall/alarm/report',
    method: 'post',
    data: data
  })
}
