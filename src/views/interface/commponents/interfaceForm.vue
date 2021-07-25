<template>
  <div class="single-interface-form">
    <el-dialog title="编辑接口用例" :visible.sync="dialogUpdateInterface" class="update_dialog">
      <el-form :rules="rules" :inline="true" ref="interfaceForm" :model="interfaceForm" class="demo-form-inline"
               size="medium">
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
          <el-tab-pane label="参数提取" name="fifth" class="tab-height" v-if="this.$route.name==='sceneInterface'">
            <span slot="label">参数提取<el-badge :is-dot="badges.jsonExtract"/></span>
            <el-button type="success" icon="el-icon-plus" circle @click="addExtract"
                       v-show="interfaceForm.jsonExtract.length === 0 || JSON.stringify(interfaceForm.jsonExtract) == '{}'"></el-button>
            <el-form-item
              v-for="(extract, index) in interfaceForm.jsonExtract"
              :key="index+extract"
              prop="jsonExtract"
              class="my-form-item"
            >
              <el-divider>提取{{ index + 1 }}</el-divider>
              <el-select v-model="extract.type" placeholder="提取方式" @focus="extractChange"
                         style="width: 150px;">
                <el-option
                  v-for="item in extractOptions"
                  :key="item"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
              <el-input v-model="extract.expression" style="width: 520px;margin-right: 5px;margin-left: 5px"
                        placeholder="提取表达式"></el-input>
              <el-input v-model="extract.variableName" style="width: 170px;margin-right: 5px;"
                        placeholder="变量名称"></el-input>

              <el-button type="danger" icon="el-icon-delete" circle
                         @click.prevent="removeExtract(extract)"></el-button>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="前置映射" name="sixth" class="tab-height" v-if="this.$route.name==='sceneInterface'">
            <span slot="label">前置映射<el-badge :is-dot="badges.frontMap"/></span>
            <el-button type="success" icon="el-icon-plus" circle @click="addFrontMap"
                       v-show="interfaceForm.frontMap.length === 0 || JSON.stringify(interfaceForm.frontMap) == '{}'"></el-button>
            <el-form-item
              v-for="(item, index) in interfaceForm.frontMap"
              :key="index+item"
              prop="frontMap"
              class="my-form-item"
            >
              <el-divider>映射{{ index + 1 }}</el-divider>
              <el-input v-model="item.key" class="paramsInput" placeholder="body参数中value的变量值${xxx}"
                        @blur="frontMapKeyChange(item.key)"></el-input>
              <el-input v-model="item.value" placeholder="body参数中key的取值,如dict['key']和list[index]"
                        class="paramsInput"></el-input>
              <el-button type="danger" icon="el-icon-delete" circle @click.prevent="removeFrontMap(item)"></el-button>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
        <el-row class="formBtn">
          <el-form-item size="large">
            <el-button @click="dialogUpdateInterface = false" size="medium">关闭</el-button>
            <el-button type="primary" @click="interfaceSave" size="medium">保存</el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {getInterfaceDetails, updateInterfaceCase} from '@/api/interface/singleInterface'
import vueJsonEditor from 'vue-json-editor'
import {
  getSceneInterfaceDetails,
  updateSceneInterface
} from "@/api/interface/sceneInterface";

export default {
  name: 'interfaceFrom',
  props: ['host'],
  components: {vueJsonEditor},
  data() {
    return {
      dialogUpdateInterface: false,
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
        jsonExtract: [{
          type: '',
          expression: '',
          variableName: ''
        }],
        frontMap: [{
          key: '',
          value: ''
        }],
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
        assert: false,
        jsonExtract: false,
        frontMap: false
      },
      rules: {
        interfaceName: [{required: true, message: 'interfaceName is required', trigger: 'blur'}],
        url: [{required: true, message: 'url is required', trigger: 'blur'}]
      },
      activeName: 'first', //tab默认显示第一栏
      initTab: 'first',
      extractTypeOptions: ['JSONPATH', '正则', '响应码'],
      expectRelationOptions: ['大于', '大于等于', '小于', '小于等于', '等于', '不等于', '包含', '不包含'],
      expectTypeOptions: ['字符串', '数值', '布尔值', '对象'],
      extractOptions: ['JSONPATH', '正则'],
    }
  },
  methods: {
    //前置映射
    frontMapKeyChange() {
      if (this.interfaceForm.frontMap[this.interfaceForm.frontMap.length - 1].key !== '') {
        //追加一行
        this.addFrontMap()
      }
    },
    addFrontMap() {
      //追加一行
      this.interfaceForm.frontMap.push({value: '', key: ''})
    },
    removeFrontMap(item) {
      var index = this.interfaceForm.frontMap.indexOf(item)
      this.interfaceForm.frontMap.splice(index, 1)
    },
    //参数提取
    addExtract() {
      this.interfaceForm.jsonExtract.push({
        type: '',
        expression: '',
        variableName: ''
      })
    },
    extractChange() {
      if (this.interfaceForm.jsonExtract[this.interfaceForm.jsonExtract.length - 1].type !== '') {
        //追加一行
        this.addExtract()
      }
    },
    removeExtract(item) {
      let index = this.interfaceForm.jsonExtract.indexOf(item)
      this.interfaceForm.jsonExtract.splice(index, 1)
    },
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
    //获取单一接口详情，渲染编辑表单
    getInterfaceDetail(rowId) {
      this.dialogUpdateInterface = true
      this.activeName = 'first'
      //通过id获取该接口的详细信息，渲染在表单上
      getInterfaceDetails({'caseId': rowId}).then(resp => {
        this.interfaceForm = resp.data
        this.isShowBadge(resp.data)
      })
    },
    //获取流程接口详情，渲染编辑表单
    getSceneInterfaceDetail(rowId) {
      this.activeName = 'first'
      this.dialogUpdateInterface = true
      //通过id获取该接口的详细信息，渲染在表单上
      getSceneInterfaceDetails({'caseId': rowId}).then(resp => {
        this.interfaceForm = resp.data
        this.isShowBadge(resp.data)
      })
    },
    //红点标记显示
    isShowBadge(resp) {
      //判断返回结果是否存在，存在显示tab右上角的红点
      this.badges.params = resp.params.length > 0 ? true : false
      this.badges.headers = resp.headers.length > 0 ? true : false
      this.badges.body = Object.keys(resp.bodyJson).length > 0 ? true : false
      this.badges.assert = resp.resultAsserts.length > 0 ? true : false
      this.badges.jsonExtract = resp.jsonExtract.length > 0 ? true : false
      this.badges.frontMap = resp.frontMap.length > 0 ? true : false

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
          if (this.$route.name === 'sceneInterface') {
            updateSceneInterface(this.interfaceForm).then(resp => {
              this.$message({message: resp.data, type: 'success'})
              this.dialogUpdateInterface = false
              this.refreshList()
            })
          } else {
            updateInterfaceCase(this.interfaceForm).then(resp => {
              this.$message({message: resp.data, type: 'success'})
              //更新列表
              this.dialogUpdateInterface = false
              this.refreshList()
            })
          }

        }
      })
    },
    //刷新树组件
    refreshList() {
      this.$emit('refreshList')
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
      //场景接口需要在过滤提取与映射
      if (this.$route.name === 'sceneInterface') {
        this.interfaceForm.jsonExtract = this.interfaceForm.jsonExtract.filter(function (item) {
          return item.type.match(/\S+/)
        })
        this.interfaceForm.frontMap = this.interfaceForm.frontMap.filter(function (item) {
          return item.key.match(/\S+/)
        })
      }
    }
  }
}
</script>

<style lang="scss">
//编辑接口弹出层,让弹出层上下左右都居中
.update_dialog {
  .el-dialog {
    display: flex;
    flex-direction: column;
    margin: 0 !important;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: calc(100% - 30px);
    max-width: calc(100% - 30px);
    text-align: center;
    width: 1000px;
    border-radius: 5%;

    .el-dialog__body {
      flex: 1;
      overflow: auto;
      margin-bottom: -20px;
      padding-bottom: 0;
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
      width: 888px;
      text-align: left;
    }

    .my-tab {
      margin: 0 2%;
    }

    .my-editor {
      margin: 0 1%;
    }
  }

  .formBtn {
    text-align: center;
    margin-bottom: 10px;
  }
}

.jsoneditor-vue {
  height: 100%;
}


</style>
