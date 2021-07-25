import request from '@/utils/request'

export function getMailConfigList(params) {
  return request({
    url: '/mailConfig',
    method: 'get',
    params
  })
}

export function addMailConfig(data) {
  return request({
    url: '/mailConfig',
    method: 'post',
    data
  })
}

export function updateMailConfig(data) {
  return request({
    url: '/mailConfig',
    method: 'put',
    data
  })
}

export function delMailConfig(params) {
  return request({
    url: '/mailConfig',
    method: 'delete',
    params
  })
}

export function mailTestSend(data) {
  return request({
    url: '/mailTestSend',
    method: 'post',
    data
  })
}
