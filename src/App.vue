<template>
  <div id="app" @click="isAction()">
    <router-view/>
  </div>
</template>

<script>
import {removeToken} from '@/utils/auth'
import store from "@/store";
import {resetRouter} from "@/router";

export default {
  name: 'App',
  data() {
    return {
      lastTime: null, //最后一次点击的时间
      currentTime: null, //当前点击的时间
      timeOut: 30 * 60 * 1000 //设置超时时间： 30分钟
    };
  },
  methods: {
    isAction() {
      this.currentTime = new Date().getTime(); //记录这次点击的时间
      if (this.currentTime - this.lastTime > this.timeOut) {  //判断上次最后一次点击的时间和这次点击的时间间隔是否大于10分钟
        // 这里写状态已过期后执行的操作
        removeToken()
        resetRouter()
        this.$confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
          confirmButtonText: '重新登陆',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload() // 为了重新实例化vue-router对象 避免bug
          })
        })
      } else {
        this.lastTime = new Date().getTime(); //如果在30分钟内点击，则把这次点击的时间记录覆盖掉之前存的最后一次点击的时间
        // console.log("点击后更新的时间" + this.lastTime)
      }
    }
  },
  created() {
    this.lastTime = new Date().getTime();   //网页第一次打开时，记录当前时间
    // console.log("初始时间" + this.lastTime)
  }
}
</script>
