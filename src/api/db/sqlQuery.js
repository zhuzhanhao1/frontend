import request from '@/utils/request'

export function getAlltables(params) {
  return request({
    url: '/sqlQuery/allTables',
    method: 'get',
    params
  })
}

export function getTableColumns(params) {
  return request({
    url: '/sqlQuery/allColumns',
    method: 'get',
    params
  })
}

export function getTableDatas(params) {
  return request({
    url: '/sqlQuery/allDatas',
    method: 'get',
    params
  })
}



