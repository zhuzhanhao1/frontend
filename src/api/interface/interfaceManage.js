import axios from 'axios'
import { ip } from '@/api/api'
import request from '@/utils/request'

export function getModuleTreeData(params) {
  return request({
    url: '/moduleTree',
    method: 'get',
    params
  })
}

export function addModule(data) {
  return request({
    url: '/moduleTree',
    method: 'post',
    data
  })
}

export function updatModule(data) {
  return request({
    url: '/moduleTree',
    method: 'put',
    data
  })
}

export function delModule(params) {
  return request({
    url: '/moduleTree',
    method: 'delete',
    params
  })
}

export function getInterfaceInfo(params) {
  return request({
    url: '/interfaceManage',
    method: 'get',
    params
  })
}

export function addInterface(data) {
  return request({
    url: '/interfaceManage',
    method: 'post',
    data
  })
}

export function updateInterface(data) {
  return request({
    url: '/interfaceManage',
    method: 'put',
    data
  })
}

export function delInterface(params) {
  return request({
    url: '/interfaceManage',
    method: 'delete',
    params
  })
}


export function debugInterface(data) {
  return request({
    url: '/interfaceDebug',
    method: 'post',
    data
  })
}

export function updateTreeNode(data) {
  return request({
    url: '/interfaceManage',
    method: 'put',
    data
  })
}
