import request from '@/utils/request'


export function getOperationLog(params) {
  return request({
    url: '/operationLog',
    method: 'get',
    params
  })
}
