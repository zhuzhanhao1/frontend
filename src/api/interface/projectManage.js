import request from '@/utils/request'

export function projectList(params) {
  return request({
    url: '/projectManage',
    method: 'get',
    params
  })
}

export function addProject(data) {
  return request({
    url: '/projectManage',
    method: 'post',
    data
  })
}

export function updateProject(data) {
  return request({
    url: '/projectManage',
    method: 'put',
    data
  })
}

export function delProject(params) {
  return request({
    url: '/projectManage',
    method: 'delete',
    params
  })
}



