import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url // node环境的不同，对应不同的baseURL
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000 // request timeout 5分钟
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    //下载接口没有返回code，返回的只有流，所以加了没有状态码的判断
    if(!res.code){
      return res
    }
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 1000) {
      console.log("后台状态码返回不等于1000",res)
      Message({
        message: res.data || 'Error',
        type: 'error',
        duration: 3 * 1000
      })
      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出',{
          confirmButtonText: '重新登陆',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload() // 为了重新实例化vue-router对象 避免bug
          })
        })
      }
      //抛出错误，阻止程序运行
      return Promise.reject(new Error(res.data || 'Error'))
    } else {
      return res
    }
  },
  //因为所有请求返回的是promise，所以你也可以对每一个请求通过catch 错误，从而进行单独的处理。
  // getInfo()
  // .then(res => {})
  // .catch(err => {
  //   xxxx
  // })
  error => {
    console.log("拦截器获取响应结果异常" + error)
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
