<template>
  <div><el-dialog title="公共参数" :visible.sync="dialogPublicParams" width="35%">
    <el-form
      ref="publicParamsForm"
      :rules="rules"
      :model="publicParamsForm"
      label-position="left"
      label-width="120px"
      size="small"
    >
      <el-form-item label="变量名称" prop="variableName">
        <el-input v-model="publicParamsForm.variableName"/>
      </el-form-item>
      <el-form-item label="参数值" prop="paramsValue">
        <el-input type="textarea" v-model="publicParamsForm.paramsValue"/>
      </el-form-item>
      <el-form-item label="保存时长(秒)" prop="outTime">
        <el-input v-model="publicParamsForm.outTime"/>
      </el-form-item>
      <el-form-item label="剩余时间(秒)">
        <el-input v-model="publicParamsForm.ttl" disabled/>
      </el-form-item>
      <el-form-item label="更新时间">
        <el-input v-model="publicParamsForm.updateTime" disabled/>
      </el-form-item>
      <el-form-item>
        <el-tag type="warning">注意：只能对headers的value做公共参数,使用规则为${变量名称}</el-tag>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogPublicParams = false">
        关闭
      </el-button>
      <el-button type="primary" @click="savePublicParams">
        确定
      </el-button>
    </div>
  </el-dialog></div>
</template>

<script>
import { getPublicParams, savePublicParams } from '@/api/interface/singleInterface'

export default {
  name: 'publicParams',
  props: {
    projectId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      dialogPublicParams: false,
      publicParamsForm: {
        variableName: '',
        paramsValue: '',
        outTime: 3600,
        updateTime: '',
        ttl:''
      },
      rules: {
        variableName: [{required: true, message: 'variableName is required', trigger: 'blur'}],
        paramsValue: [{required: true, message: 'paramsValue is required', trigger: 'blur'}],
        outTime: [{required: true, message: 'outTime is required', trigger: 'blur'}],
      },
    }
  },
  methods: {
    savePublicParams() {
      this.$refs['publicParamsForm'].validate((valid) => {
        if (valid) {
          this.publicParamsForm['projectId'] = this.projectId
          savePublicParams(this.publicParamsForm).then(resp => {
            this.$message({message: resp.data, type: 'success'})
            this.dialogPublicParams = false
          })
        }
      })
    },
    openDialog() {
      this.dialogPublicParams = true
      getPublicParams({projectId: this.projectId}).then(resp => {
        this.$message({message: '公共参数有效，剩余存活时间'+resp.data.ttl+'秒', type: 'success'})
        this.publicParamsForm = resp.data
      }).catch(error => {
        console.log(error)
        //到期后则重置表单的值
        this.$refs['publicParamsForm'].resetFields()
        this.publicParamsForm.ttl = ''
        this.publicParamsForm.updateTime = ''
      })
    },

  }
}
</script>

<style scoped>

</style>
