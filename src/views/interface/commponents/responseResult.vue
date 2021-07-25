<template>
  <div>
    <el-drawer
      title="调试结果"
      size="50%"
      :visible.sync="drawer"
      :direction="direction">
      <el-tabs tab-position="left" v-model="initTab">
        <el-tab-pane label="请求信息" name="first">
          <el-tag>{{ result.request.method }}</el-tag>
          <p style="width: 95%;margin-left: 5px;"><span>{{ result.request.url }}</span></p>
          <el-collapse v-model="activeNames">
            <el-collapse-item title="Request Headers" name="1">
              <el-input type="textarea" readonly v-model="result.request.headers" class="my_textarea_width"
                        :autosize="{ minRows: 10, maxRows: 10 }"></el-input>
            </el-collapse-item>
            <el-collapse-item title="Request Payload" name="2">
              <el-input type="textarea" readonly v-model="result.request.body" class="my_textarea_width"
                        :autosize="{ minRows: 10, maxRows: 20 }"></el-input>
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>
        <el-tab-pane label="响应信息" name="second">
          <el-tag style="margin-bottom: 5px;">{{ result.status_code }}</el-tag>
          <span style="margin-left: 10px;color: #85ce61;">{{ '响应时间:' + result.duration + 'ms' }}</span>
          <el-collapse v-model="activeNames">
            <el-collapse-item title="Response Headers" name="1">
              <el-input type="textarea" readonly v-model="result.response.headers" class="my_textarea_width"
                        :autosize="{ minRows: 10, maxRows: 10 }"></el-input>
            </el-collapse-item>
            <el-collapse-item title="Response Body" name="2">
              <el-input type="textarea" readonly v-model="result.response.body" class="my_textarea_width"
                        :autosize="{ minRows: 10, maxRows: 20 }"></el-input>
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>
        <el-tab-pane label="断言结果" name="third">
          <p>总计
            <el-tag>{{ result.assert.length }}</el-tag>
            处断言
          </p>
          <el-carousel indicator-position="outside" style="margin-right: 10px;overflow: auto;" height="550px"
                       v-show="result.assert.length > 0">
            <el-carousel-item v-for="(item,index) in result.assert" :key="item+index">
              <div>
                <p><label>{{ item.extractType }}</label>-断言结果：
                  <el-tag :type="item.assertRes === '失败' ? 'danger' : 'success'">{{ item.assertRes }}</el-tag>
                </p>
                <el-collapse v-model="activeNames">
                  <el-collapse-item title="提取表达式" name="1">
                    <el-input type="textarea" readonly v-model="item.extractExpress" class="my_textarea_width"
                              :autosize="{ minRows: 3, maxRows: 10 }"></el-input>
                  </el-collapse-item>
                  <el-collapse-item title="提取的值 <=> 期望的值" name="2">
                    <div style="display: flex">
                      <el-input type="textarea" readonly
                                v-model="typeof (item.extractValue) !== 'string' && typeof (item.extractValue) !== 'number' ? JSON.stringify(item.extractValue) : item.extractValue "
                                class="compare-input"
                                :autosize="{ minRows: 10, maxRows: 15 }"></el-input>
                      <el-tag class="compare-tag">{{ item.expectRelation }}</el-tag>
                      <el-input type="textarea" readonly v-model="item.expectValue" class="compare-input"
                                :autosize="{ minRows: 10, maxRows: 15 }"></el-input>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </el-carousel-item>
          </el-carousel>
        </el-tab-pane>
        <el-tab-pane label="提取结果" name="fourth" v-if="this.$route.name==='sceneInterface'||this.$route.name==='interfaceTestReport'">
          <p>总计
            <el-tag>{{ result.extract.length }}</el-tag>
            处提取内容
          </p>
          <el-carousel indicator-position="outside" style="margin-right: 10px;overflow: auto;" height="550px"
                       v-show="result.extract.length > 0">
            <el-carousel-item v-for="(item,index) in result.extract" :key="item+index">
              <div>
                <div><label>{{ item.type }}</label>提取结果：
                  <el-tag :type="item.extractResult === '失败' ? 'danger' : 'success'">{{ item.extractResult }}</el-tag>
                </div>
                <p>提取值类型：
                  <el-tag>{{ item.extractValueType }}</el-tag>
                </p>
                <p>提取表达式：
                  <el-input type="textarea" readonly v-model="item.expression" style="width: 80%"
                            :autosize="{ minRows: 3, maxRows: 10 }"></el-input>
                </p>
                <p>提取的结果：
                  <el-input type="textarea" readonly
                            v-model="typeof (item.extractValue) !== 'string' && typeof (item.extractValue) !== 'number' ? JSON.stringify(item.extractValue) : item.extractValue "
                            style="width: 80%" :autosize="{ minRows: 10, maxRows: 20 }"></el-input>
                </p>
              </div>
            </el-carousel-item>
          </el-carousel>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'responseResult',
  data() {
    return {
      activeNames: ['1', '2', '3'], //默认展开折叠
      initTab: 'first',  //默认选中tab的第一栏
      drawer: false,     //抽屉默认不显示
      direction: 'rtl', //抽屉默认显示右侧
      result: {
        'request': {
          'method': '',
          'url': '',
          'headers': '',
          'body': ''
        },
        'response': {
          'headers': '',
          'body': ''
        },
        'assert': [],
        'conclusion': '',
        'duration': 0,
        'status_code': 200,
        'extract': []
      }
    }
  },
  methods: {
    openResultDetail(resp) {
      this.result = resp.data
      this.initTab = 'first'
      this.drawer = true
      //对象转换格式化JSON
      this.result.request.body = this.objToStr(this.result.request.body)
      this.result.request.headers = this.objToStr(this.result.request.headers)
      this.result.response.body = this.objToStr(this.result.response.body)
      this.result.response.headers = this.objToStr(this.result.response.headers)
    },
    objToStr(value) {
      if (typeof (value) !== 'string') {
        return JSON.stringify(value, null, 2)
      } else {
        return value
      }
    }
  }
}
</script>

<style lang="scss">
//抽屉自动换行
.el-drawer.rtl {
  overflow: auto;

  .my_textarea_width {
    width: 90%;
  }

  .compare-tag {
    width: 8%;
    align-self:center;
    text-align: center;
    margin-left: 1%;
    margin-right: 1%
  }
  .compare-input{
    width: 40%;
  }
}
</style>
