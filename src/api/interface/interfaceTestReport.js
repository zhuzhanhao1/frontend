import request from "@/utils/request";


export function getReportInfo(params) {
  return request({
    url: '/testReprot',
    method: 'get',
    params
  })
}

export function getCharts(params) {
  return request({
    url: '/testCharts',
    method: 'get',
    params
  })
}

export function getReportList(data) {
  return request({
    url: '/testReprot',
    method: 'post',
    data
  })
}
