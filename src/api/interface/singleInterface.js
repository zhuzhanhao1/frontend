import request from "@/utils/request";


export function getSingleInterfaceList(params) {
  return request({
    url: '/singleInterfaceCase',
    method: 'get',
    params
  })
}

export function addInterfaceCase(data) {
  return request({
    url: '/singleInterfaceCase',
    method: 'post',
    data
  })
}

export function updateInterfaceCase(data) {
  return request({
    url: '/singleInterfaceCase',
    method: 'put',
    data
  })
}

export function delInterfaceCase(params) {
  return request({
    url: '/singleInterfaceCase',
    method: 'delete',
    params
  })
}

export function getInterfaceDetails(params) {
  return request({
    url: '/singleInterfaceCase',
    method: 'get',
    params
  })
}


export function runInterfaceCase(data) {
  return request({
    url: '/singleInterfaceCase/run',
    method: 'post',
    data
  })
}

export function getPublicParams(params) {
  return request({
    url: '/publicParams',
    method: 'get',
    params
  })
}

export function savePublicParams(data) {
  return request({
    url: '/publicParams',
    method: 'post',
    data
  })
}
