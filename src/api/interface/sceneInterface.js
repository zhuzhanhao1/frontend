import request from "@/utils/request";

//场景用例树CRUD
export function getSceneInterfaceTree(params) {
  return request({
    url: '/sceneCaseTree',
    method: 'get',
    params
  })
}

export function addSceneCase(data) {
  return request({
    url: '/sceneCaseTree',
    method: 'post',
    data
  })
}

export function updateSceneCase(data) {
  return request({
    url: '/sceneCaseTree',
    method: 'put',
    data
  })
}

export function delSceneCase(params) {
  return request({
    url: '/sceneCaseTree',
    method: 'delete',
    params
  })
}

//场景用例接口CRUD
export function getSceneInterfaceList(params) {
  return request({
    url: '/sceneInterface',
    method: 'get',
    params
  })
}

export function addSceneInterface(data) {
  return request({
    url: '/sceneInterface',
    method: 'post',
    data
  })
}

export function updateSceneInterface(data) {
  return request({
    url: '/sceneInterface',
    method: 'put',
    data
  })
}

export function delSceneInterface(params) {
  return request({
    url: '/sceneInterface',
    method: 'delete',
    params
  })
}

export function getSceneInterfaceDetails(params) {
  return request({
    url: '/sceneInterface',
    method: 'get',
    params
  })
}

export function runSceneInterface(data) {
  return request({
    url: '/sceneInterface/run',
    method: 'post',
    data
  })
}

export function tableSort(data) {
  return request({
    url: '/sceneInterface/sort',
    method: 'post',
    data
  })
}

export function getLocalParams(params) {
  return request({
    url: '/localParams',
    method: 'get',
    params
  })
}

export function getInterfaceSearch(params) {
  return request({
    url: '/interfaceSearch',
    method: 'get',
    params
  })
}
