import request from '@/utils/request'

export function dataSourceList(params) {
  return request({
    url: '/dataSourceConfig',
    method: 'get',
    params
  })
}

export function addDataSource(data) {
  return request({
    url: '/dataSourceConfig',
    method: 'post',
    data
  })
}

export function updateDataSource(data) {
  return request({
    url: '/dataSourceConfig',
    method: 'put',
    data
  })
}

export function delDataSource(params) {
  return request({
    url: '/dataSourceConfig',
    method: 'delete',
    params
  })
}

export function testDataSourceConnect(data) {
  return request({
    url: '/dataSourceConfig/testConnect',
    method: 'post',
    data
  })
}

export function dataSourceDownload() {
  return request({
    url: '/dataSourceConfig/download',
    method: 'post',
    responseType: 'blob'
  })
}

export function dataSourceHosts() {
  return request({
    url: '/dataSourceConfig/getHosts',
    method: 'get',
  })
}
