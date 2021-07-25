<template>
  <div>
    <el-dialog
      title="导入接口用例"
      :visible.sync="dialogVisible"
      width="30%">
      <el-upload
        class="upload-demo"
        ref="upload"
        drag
        :action="uploadUrl()"
        :headers="upHeaders"
        :on-success="uploadSuccessCallback"
        :on-error="uploadErrorCallback"
        :on-remove="handleRemove"
        :auto-upload="false"
        multiple>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip"><el-tag type="warning">只支持从MeterSphere JMX Recorder录制后导出的json文件</el-tag></div>
      </el-upload>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="medium">取 消</el-button>
        <el-button type="primary" @click="submitUpload" size="medium">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {getToken} from "@/utils/auth";

export default {
  name: "caseImport",
  data(){
    return{
      dialogVisible:false,
      upHeaders: {'X-Token': getToken()},
      treeNodeId:'',
      uploadLoading:null

    }
  },
  methods:{
    uploadSuccessCallback(response, file, fileList) {
      this.uploadLoading.close()
      if(response.code===1000){
        this.$message({message: response.data, type: 'success'})
      }else{
        this.$message.error(response.data)
      }
      this.dialogVisible = false
      this.refreshList()
    },
    refreshList(){
      this.$emit('refreshList')
    },
    uploadErrorCallback(err, file, fileList) {
      console.log(err)
      this.$message.error('导入失败，请查看控制台！')
    },
    openDialog(treeNodeId){
      this.dialogVisible = true
      this.treeNodeId = treeNodeId
    },
    uploadUrl(){
      return process.env.VUE_APP_BASE_API + '/sceneInterface/upload/' + this.treeNodeId
    },
    submitUpload() {
      this.$refs.upload.submit()
      //勾选批量运行
      const loading = this.$loading({
        lock: true, // lock的修改符--默认是false
        text: 'Loading', // 显示在加载图标下方的加载文案
        spinner: 'el-icon-loading', // 自定义加载图标类名
        background: 'rgba(0, 0, 0, 0.7)', // 遮罩层颜色
        target: document.querySelector('#table')//loading覆盖的dom元素节点
      })
      this.uploadLoading = loading
    },
    //移除文件后的回调
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
  }
}
</script>

<style scoped>
.upload-demo{
  text-align: center;
}
</style>
