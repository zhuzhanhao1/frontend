import request from "@/utils/request";


export function getExecutePlanList(params) {
  return request({
    url: '/executePlan',
    method: 'get',
    params
  })
}

export function addExecutePlan(data) {
  return request({
    url: '/executePlan',
    method: 'post',
    data
  })
}

export function updateExecutePlan(data) {
  return request({
    url: '/executePlan',
    method: 'put',
    data
  })
}

export function delExecutePlan(params) {
  return request({
    url: '/executePlan',
    method: 'delete',
    params
  })
}


export function runExecutePlan(data) {
  return request({
    url: '/executePlan/run',
    method: 'post',
    data
  })
}
