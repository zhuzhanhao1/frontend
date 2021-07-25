import request from '@/utils/request'

export function dataStructureList(params) {
  return request({
    url: '/dataStructureManage',
    method: 'get',
    params
  })
}

export function addDataStructure(data) {
  return request({
    url: '/dataStructureManage',
    method: 'post',
    data
  })
}

export function updateDataStructure(data) {
  return request({
    url: '/dataStructureManage',
    method: 'put',
    data
  })
}

export function delDataStructure(params) {
  return request({
    url: '/dataStructureManage',
    method: 'delete',
    params
  })
}

export function dataStructureDownload(data) {
  return request({
    url: '/sqlCaseManage/download',
    method: 'post',
    responseType: 'blob',
    data
  })
}
