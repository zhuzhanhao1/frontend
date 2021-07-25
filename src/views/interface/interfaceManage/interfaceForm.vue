<template>
  <div>
    <div class="interface-from" v-if="showFrom">
      <el-form :rules="rules" :inline="true" ref="interfaceForm" :model="interfaceForm" class="demo-form-inline"
               size="medium">
        <div>
          <el-tag class="tag" style="">{{ requestStatus }}</el-tag>
        </div>
        <el-form-item label="用例名称" prop="interfaceName">
          <el-input v-model="interfaceForm.interfaceName" placeholder="用例名称" class="caseInput"></el-input>
        </el-form-item>
        <el-form-item label="项目地址">
          <el-input v-model="host" placeholder="" disabled class="hostInput"></el-input>
        </el-form-item>
        <br>
        <el-form-item label="接口路径" prop="url">
          <el-input v-model="interfaceForm.url" v-on:input="urlChange(interfaceForm.url)" placeholder="请求地址"
                    class="urlInput">
            <el-select v-model="interfaceForm.method" placeholder="请求方式" slot="prepend" class="methodSelect">
              <el-option label="GET" value="GET"></el-option>
              <el-option label="POST" value="POST"></el-option>
              <el-option label="PUT" value="PUT"></el-option>
              <el-option label="DELETE" value="DELETE"></el-option>
              <el-option label="HEAD" value="HEAD"></el-option>
              <el-option label="OPTIONS" value="OPTIONS"></el-option>
              <el-option label="PATCH" value="PATCH"></el-option>
            </el-select>
          </el-input>
        </el-form-item>
        <el-tabs v-model="activeName" class="my-tab">
          <el-tab-pane name="first" class="tab-height">
            <span slot="label">Params<el-badge :is-dot="badges.params"/></span>
            <el-button type="success" icon="el-icon-plus" circle @click="addParams"
                       v-show="interfaceForm.params.length === 0"></el-button>
            <el-form-item
              v-for="(param, index) in interfaceForm.params"
              :key="index+param"
              prop="params"
              class="my-form-item"
            >
              <el-input v-model="param.key" v-on:input="paramsKeyChange(param.key,param.value)"
                        class="paramsInput" placeholder="KEY"></el-input>
              <el-input v-model="param.value" v-on:input="paramsKeyChange(param.key,param.value)"
                        class="paramsInput" placeholder="VALUE"></el-input>
              <el-button type="danger" icon="el-icon-delete" circle @click.prevent="removeParams(param)"></el-button>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="Headers" name="second" class="tab-height">
            <span slot="label">Headers<el-badge :is-dot="badges.headers"/></span>
            <el-button type="success" icon="el-icon-plus" circle @click="addHeaders"
                       v-show="interfaceForm.headers.length === 0"></el-button>
            <el-form-item
              v-for="(header, index) in interfaceForm.headers"
              :key="index+header"
              prop="headers"
              class="my-form-item"
            >
              <el-input v-model="header.key" class="paramsInput" placeholder="KEY"
                        @blur="headerKeyChange(header.key)"></el-input>
              <el-input v-model="header.value" class="paramsInput"
                        placeholder="VALUE"></el-input>
              <el-button type="danger" icon="el-icon-delete" circle
                         @click.prevent="removeHeaders(header)"></el-button>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="Body" name="third" class="tab-height">
            <span slot="label">Body<el-badge :is-dot="badges.body"/></span>
            <el-form-item label="" prop="resource">
              <el-radio-group v-model="interfaceForm.bodyType" @change="changebodyType">
                <el-radio disabled label="form-data"></el-radio>
                <el-radio disabled label="x-www-from-urlencoded"></el-radio>
                <el-radio disabled label="json"></el-radio>
                <el-radio disabled label="xml"></el-radio>
                <el-radio label="raw"></el-radio>
                <el-radio disabled label="binary"></el-radio>
              </el-radio-group>
            </el-form-item>
<!--            <el-button type="success" icon="el-icon-plus" circle @click="addFormDatas"-->
<!--                       v-show="interfaceForm.formDatas.length === 0 && interfaceForm.bodyType ==='form-data'"></el-button>-->
<!--            <el-form-item-->
<!--              v-for="(formData, index) in interfaceForm.formDatas"-->
<!--              :label="'参数<' + index + '>:'"-->
<!--              :key="index+formData"-->
<!--              v-show="interfaceForm.bodyType ==='form-data'"-->
<!--              prop="bodyType"-->
<!--              class="my-form-item"-->
<!--            >-->
<!--              <el-input v-model="formData.key" class="paramsInput" placeholder="KEY"-->
<!--                        @blur="formDataKeyChange(formData.key)"></el-input>-->
<!--              <el-input v-model="formData.value" class="paramsInput"-->
<!--                        placeholder="VALUE"></el-input>-->
<!--              <el-button type="danger" icon="el-icon-delete" circle-->
<!--                         @click.prevent="removeFormData(formData)"></el-button>-->
<!--            </el-form-item>-->
            <div class="editor-container my-editor" v-show="interfaceForm.bodyType ==='raw'">
              <vue-json-editor
                v-model="interfaceForm.bodyJson"
                :mode="'code'"
                class="bodyJsonEditor"
                lang="zh">
              </vue-json-editor>
            </div>
          </el-tab-pane>
          <el-tab-pane label="结果断言" name="fourth" class="tab-height">
            <span slot="label">断言<el-badge :is-dot="badges.assert"/></span>
            <el-button type="success" icon="el-icon-plus" circle @click="addResultAsserts"
                       v-show="interfaceForm.resultAsserts.length === 0"></el-button>
            <el-form-item
              v-for="(resultAssert, index) in interfaceForm.resultAsserts"
              :key="index+resultAssert"
              prop="resultAsserts"
              class="my-form-item"
            >
              <el-divider>断言{{ index + 1 }}</el-divider>
              <el-select v-model="resultAssert.extractType" placeholder="断言方式" @focus="resultAssertChange"
                         style="width: 150px;">
                <el-option
                  v-for="item in extractTypeOptions"
                  :key="item"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
              <el-input v-model="resultAssert.extractExpress"
                        style="width: 500px;margin-right: 5px;margin-left: 5px"
                        placeholder="提取表达式"></el-input>
              <el-select v-model="resultAssert.expectType" @change="expectTypeChange(index,resultAssert.expectType)"
                         placeholder="期望类型" style="width: 110px;">
                <el-option
                  v-for="item in expectTypeOptions"
                  :key="item"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
              <el-select v-model="resultAssert.expectRelation" placeholder="期望关系"
                         style="width: 110px;margin:0 0 5px 5px;">
                <el-option
                  v-for="item in expectRelationOptions"
                  :key="item"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
              <el-input v-model="resultAssert.expectValue" :autosize="{ minRows: 2, maxRows: 5 }"
                        placeholder="期望结果" type="textarea" style="width: 845px;margin-right: 5px;"></el-input>
              <el-button type="danger" icon="el-icon-delete" circle
                         @click.prevent="removeResultAssert(resultAssert)"></el-button>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
        <el-row class="formBtn">
          <el-form-item size="large" class="save-btn">
            <el-button type="primary" @click="interfaceSave" size="medium">保存
            </el-button>
            <el-button type="success" @click="interfaceDebug" size="medium">调试
            </el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </div>
    <response-result ref="responseResult"></response-result>
  </div>
</template>

<script>
import {addInterface, debugInterface, getInterfaceInfo, updateInterface} from '@/api/interface/interfaceManage'
import vueJsonEditor from 'vue-json-editor'
import responseResult from '../commponents/responseResult'

export default {
  name: 'interfaceFrom',
  props: ['projectId', 'host'],
  components: {vueJsonEditor, responseResult},
  data() {
    return {
      showFrom: false,  //是否显示表单
      requestStatus: '', //新建接口 or 编辑接口
      interfaceForm: {
        parent: '',
        interfaceName: '',
        method: '',
        url: '',
        headers: [{
          key: '',
          value: ''
        }],
        params: [{
          key: '',
          value: ''
        }],
        formDatas: [{
          key: '',
          value: ''
        }],
        bodyType: 'raw',
        bodyJson: {},
        resultAsserts: [{
          extractType: '',
          extractExpress: '',
          expectRelation: '',
          expectType: '',
          expectValue: ''
        }]
      },
      badges: {
        params: false,
        headers: false,
        body: false,
        assert: false
      },
      rules: {
        //模块名称
        name: [{required: true, message: 'name is required', trigger: 'change'}],
        //接口名称、请求方式、url
        interfaceName: [{required: true, message: 'interfaceName is required', trigger: 'change'}],
        method: [{required: true, message: 'method is required', trigger: 'change'}],
        url: [{required: true, message: 'url is required', trigger: 'change'}]
      },
      activeName: 'first', //tab默认显示第一栏
      initTab: 'first',
      extractTypeOptions: ['JSONPATH', '正则', '响应码'],
      expectRelationOptions: ['大于', '大于等于', '小于', '小于等于', '等于', '不等于', '包含', '不包含'],
      expectTypeOptions: ['字符串', '数值', '布尔值', '对象']
    }
  },
  watch: {
    projectId(val) {
      this.showFrom = false
    }
  },
  methods: {
    //headers
    headerKeyChange() {
      if (this.interfaceForm.headers[this.interfaceForm.headers.length - 1].key !== '') {
        //追加一行
        this.interfaceForm.headers.push({
          value: '',
          key: ''
        })
      }
    },
    addHeaders() {
      //追加一行
      this.interfaceForm.headers.push({
        value: '',
        key: ''
      })
    },
    removeHeaders(item) {
      var index = this.interfaceForm.headers.indexOf(item)
      this.interfaceForm.headers.splice(index, 1)
    },
    //parmas-url
    urlChange(url) {
      let splitUrl = url.split('?')
      if (splitUrl.length > 1) {
        let splitUrl1 = splitUrl[1].split('&')
        let params = []
        for (let item of splitUrl1) {
          let dic = {}
          dic['key'] = item.split('=')[0]
          dic['value'] = item.split('=')[1]
          params.push(dic)
        }
        this.interfaceForm.params = params
      } else {
        this.interfaceForm.params = [{key: '', value: ''}]
      }
    },
    paramsKeyChange() {
      let sameLen = this.interfaceForm.params.filter(function (item) {
        return item.key.match(/\S+/)
      })
      let list = []
      for (let item of sameLen) {
        list.push(item['key'] + '=' + item['value'])
      }
      if (list.length > 0) {
        this.interfaceForm.url = this.interfaceForm.url.split('?')[0] + '?' + list.join('&')
        //当最后一行的key输入框中不为空时，加入一空行
        if (this.interfaceForm.params[this.interfaceForm.params.length - 1].key !== '') {
          this.interfaceForm.params.push({value: '', key: ''})
        }
      } else {
        //当长度为空时，url后面的参数清空
        this.interfaceForm.url = this.interfaceForm.url.split('?')[0]
      }
    },
    addParams() {
      //追加一行
      this.interfaceForm.params.push({value: '', key: ''})
    },
    removeParams(item) {
      var index = this.interfaceForm.params.indexOf(item)
      this.interfaceForm.params.splice(index, 1)
      //删除行后，重新生成Url
      let list = []
      for (let item of this.interfaceForm.params) {
        list.push(item['key'] + '=' + item['value'])
      }
      if (list.length > 0) {
        this.interfaceForm.url = this.interfaceForm.url.split('?')[0] + '?' + list.join('&')
      } else {
        this.interfaceForm.url = this.interfaceForm.url.split('?')[0]
      }
    },
    //body
    changebodyType(value) {
      console.log('改变之后的值是:' + value)
    },
    formDataKeyChange() {
      if (this.interfaceForm.formDatas[this.interfaceForm.formDatas.length - 1].key !== '') {
        //追加一行
        this.interfaceForm.formDatas.push({
          value: '',
          key: ''
        })
      }
    },
    addFormDatas() {
      //追加一行
      this.interfaceForm.formDatas.push({
        value: '',
        key: ''
      })
    },
    removeFormData(item) {
      var index = this.interfaceForm.formDatas.indexOf(item)
      this.interfaceForm.formDatas.splice(index, 1)
    },
    //断言相关
    expectTypeChange(index, expectType) {
      console.log(index, expectType)
      if (expectType === '字符串') {
        this.expectRelationOptions = ['等于', '不等于', '包含', '不包含']
      } else if (expectType === '布尔值' || expectType === '对象') {
        this.expectRelationOptions = ['等于', '不等于']
      } else {
        this.expectRelationOptions = ['大于', '大于等于', '小于', '小于等于', '等于', '不等于', '包含', '不包含']
      }
    },
    resultAssertChange() {
      if (this.interfaceForm.resultAsserts[this.interfaceForm.resultAsserts.length - 1].extractType !== '') {
        //追加一行
        this.addResultAsserts()
      }
    },
    addResultAsserts() {
      this.interfaceForm.resultAsserts.push({
        extractType: '',
        extractExpress: '',
        expectRelation: '',
        expectType: '',
        expectValue: ''
      })
    },
    removeResultAssert(item) {
      let index = this.interfaceForm.resultAsserts.indexOf(item)
      this.interfaceForm.resultAsserts.splice(index, 1)
    },
    //获取接口详情，渲染编辑表单
    getInterfaceDetail(treeNodeId) {
      this.showFrom = true
      //通过id获取该接口的详细信息，渲染在表单上
      getInterfaceInfo({'id': treeNodeId}).then(resp => {
        this.interfaceForm = resp
        this.requestStatus = '更新接口'
        console.log(resp)
        this.isShowBadge(resp)
      })
    },
    //红点标记显示
    isShowBadge(resp) {
      //判断返回结果是否存在，存在显示tab右上角的红点
      this.badges.params = resp.params.length > 0 ? true : false
      this.badges.headers = resp.headers.length > 0 ? true : false
      this.badges.body = Object.keys(resp.bodyJson).length > 0 ? true : false
      this.badges.assert = resp.resultAsserts.length > 0 ? true : false
    },
    //通过父组件调用，打开新建表单
    handleCreate(moduleId) {
      //打开新建接口from表单
      this.showFrom = true
      //新建则初始化表单信息
      this.interfaceForm = {
        parent: moduleId,
        interfaceName: '',
        method: '',
        url: '',
        headers: [{
          key: '',
          value: ''
        }],
        params: [{
          key: '',
          value: ''
        }],
        formDatas: [{
          key: '',
          value: ''
        }],
        bodyType: 'raw',
        bodyJson: {},
        resultAsserts: [{
          extractType: '',
          extractExpress: '',
          expectRelation: '',
          expectType: '',
          expectValue: ''
        }]
      }
      this.requestStatus = '新建接口'
      this.badges = {
        params: false,
        headers: false,
        body: false,
        assert: false
      }
      this.$nextTick(() => {
        this.$refs['interfaceForm'].clearValidate()
      })
    },
    //新建编辑保存
    interfaceSave() {
      //过滤掉key为‘’的空行
      this.filterBlankLine()
      if (this.interfaceForm.url.startsWith('http')) {
        this.interfaceForm.url = this.interfaceForm.url - this.host
      }
      this.$refs['interfaceForm'].validate((valid) => {
        if (valid) {
          if (this.requestStatus === '更新接口') {
            updateInterface(this.interfaceForm).then(resp => {
              this.$message({message: resp.data, type: 'success'})
              //刷新树组件
              this.refreshTree()
            })
          } else {
            addInterface(this.interfaceForm).then(resp => {
              this.$message({message: resp.data, type: 'success'})
              this.refreshTree()
            })
          }
        }
      })
    },
    //刷新树组件
    refreshTree() {
      this.$emit('refreshTree', true)
    },
    //接口调试
    interfaceDebug() {
      //过滤掉key为‘’的空行
      this.filterBlankLine()
      this.interfaceForm['host'] = this.host
      this.$refs['interfaceForm'].validate((valid) => {
        if (valid) {
          const loading = this.$loading({
            lock: true, // lock的修改符--默认是false
            text: 'Loading', // 显示在加载图标下方的加载文案
            spinner: 'el-icon-loading', // 自定义加载图标类名
            background: 'rgba(0, 0, 0, 0.7)', // 遮罩层颜色
            target: document.querySelector('#table')// loading覆盖的dom元素节点
          })
          debugInterface(this.interfaceForm).then(resp => {
            console.log(resp)
            this.$refs.responseResult.openResultDetail(resp)
            //关闭loading
            loading.close()
          }).catch(error => {
            loading.close()
          })
        }
      })
    },
    //过滤掉key为‘’的空行
    filterBlankLine() {
      this.interfaceForm.headers = this.interfaceForm.headers.filter(function (item) {
        return item.key.match(/\S+/)
      })
      this.interfaceForm.params = this.interfaceForm.params.filter(function (item) {
        return item.key.match(/\S+/)
      })
      this.interfaceForm.formDatas = this.interfaceForm.formDatas.filter(function (item) {
        return item.key.match(/\S+/)
      })
      this.interfaceForm.resultAsserts = this.interfaceForm.resultAsserts.filter(function (item) {
        return item.extractType.match(/\S+/)
      })
    }
  }
}
</script>

<style lang="scss">
.interface-from {
  padding: 15px;
  width: 1000px;
  text-align: center;

  .tag {
    margin-bottom: 30px;
    font-size: 15px;
  }

  .my-form-item {
    margin-bottom: 10px;
  }

  .tab-height {
    height: 380px;
    overflow: auto;
  }

  .caseInput {
    width: 300px;
    margin-right: 30px;
  }

  .hostInput {
    width: 400px;
  }

  .methodSelect {
    width: 110px;
  }

  .urlInput {
    width: 808px;
  }

  .paramsInput {
    width: 420px;
    margin-right: 10px;
  }

  .bodyJsonEditor {
    height: 300px;
    width: 880px;
    text-align: left;
  }

  .my-tab {
    margin: 0 3%;
  }

  .my-editor {
    margin: 0 1%;
  }

  .save-btn {
    text-align: center;
  }
}

.jsoneditor-vue {
  height: 100%;
}
</style>
