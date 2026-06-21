<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目文档管理</span>
          <el-button type="primary" @click="handleUpload" v-hasPermi="['teach:document:add']">
            <i class="el-icon-upload2"></i> 上传文档
          </el-button>
        </div>
      </template>

      <el-form :model="queryParams" ref="queryFormRef" :inline="true">
        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="queryParams.projectId" placeholder="请选择" clearable filterable>
            <el-option v-for="p in projectList" :key="p.projectId" :label="p.projectName" :value="p.projectId" />
          </el-select>
        </el-form-item>
        <el-form-item label="文档类型" prop="docType">
          <el-select v-model="queryParams.docType" placeholder="请选择" clearable>
            <el-option label="申报书" value="申报书" />
            <el-option label="合同" value="合同" />
            <el-option label="中期报告" value="中期报告" />
            <el-option label="结题报告" value="结题报告" />
            <el-option label="论文" value="论文" />
            <el-option label="专利" value="专利" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="文档名称" prop="docName">
          <el-input v-model="queryParams.docName" placeholder="请输入" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"><i class="el-icon-search"></i> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh"></i> 重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="documentList">
        <el-table-column label="所属项目" align="center" prop="projectName" :show-overflow-tooltip="true" min-width="180" />
        <el-table-column label="文档名称" align="center" prop="docName" min-width="200" :show-overflow-tooltip="true" />
        <el-table-column label="文档类型" align="center" prop="docType" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.docType === '申报书'" type="primary">申报书</el-tag>
            <el-tag v-else-if="row.docType === '合同'" type="success">合同</el-tag>
            <el-tag v-else-if="row.docType === '中期报告'" type="warning">中期报告</el-tag>
            <el-tag v-else-if="row.docType === '结题报告'" type="danger">结题报告</el-tag>
            <el-tag v-else-if="row.docType === '论文'">论文</el-tag>
            <el-tag v-else-if="row.docType === '专利'">专利</el-tag>
            <el-tag v-else type="info">其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="文件类型" align="center" prop="fileType" width="80" />
        <el-table-column label="文件大小" align="center" prop="docSize" width="90">
          <template #default="{ row }">
            {{ formatFileSize(row.docSize) }}
          </template>
        </el-table-column>
        <el-table-column label="版本" align="center" prop="version" width="60" />
        <el-table-column label="上传人" align="center" prop="userName" width="80" />
        <el-table-column label="上传时间" align="center" prop="uploadTime" width="160">
          <template #default="{ row }">
            {{ parseTime(row.uploadTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDownload(row)">
              <i class="el-icon-download"></i> 下载
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-hasPermi="['teach:document:remove']">
              <i class="el-icon-delete"></i> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 上传对话框 -->
    <el-dialog v-model="uploadVisible" title="上传文档" width="500px" append-to-body>
      <el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadRules" label-width="100px">
        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="uploadForm.projectId" placeholder="请选择项目" filterable style="width: 100%">
            <el-option v-for="p in projectList" :key="p.projectId" :label="p.projectName" :value="p.projectId" />
          </el-select>
        </el-form-item>
        <el-form-item label="文档类型" prop="docType">
          <el-select v-model="uploadForm.docType" placeholder="请选择">
            <el-option label="申报书" value="申报书" />
            <el-option label="合同" value="合同" />
            <el-option label="中期报告" value="中期报告" />
            <el-option label="结题报告" value="结题报告" />
            <el-option label="论文" value="论文" />
            <el-option label="专利" value="专利" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="文档名称" prop="docName">
          <el-input v-model="uploadForm.docName" placeholder="请输入文档名称" />
        </el-form-item>
        <el-form-item label="上传文件" prop="file">
          <el-upload
            ref="uploadRef"
            :limit="1"
            :auto-upload="false"
            :file-list="fileList"
            :before-upload="beforeUpload"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持pdf、word、excel、ppt格式，单个文件不超过50MB</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="文档描述" prop="description">
          <el-input v-model="uploadForm.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitUpload" :loading="uploading">上 传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, UploadFile } from 'element-plus'
import { listDocument, delDocument, downloadDocument } from '@/api/teach/scientific'
import { getAllProjects } from '@/api/teach/scientific'
import { uploadDocument } from '@/api/teach/scientific'

const loading = ref(false)
const uploading = ref(false)
const total = ref(0)
const documentList = ref<any[]>([])
const projectList = ref<any[]>([])
const uploadVisible = ref(false)
const fileList = ref<any[]>([])
const currentFile = ref<File | null>(null)
const queryFormRef = ref<FormInstance>()
const uploadFormRef = ref<FormInstance>()

const queryParams = reactive({
  pageNum: 1, pageSize: 10,
  projectId: null, docType: '', docName: ''
})

const uploadForm = ref<any>({
  projectId: null, docType: '', docName: '', description: ''
})

const uploadRules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  docType: [{ required: true, message: '请选择文档类型', trigger: 'change' }],
  docName: [{ required: true, message: '请输入文档名称', trigger: 'blur' }]
}

const parseTime = (time: string) => {
  if (!time) return '-'
  return time.replace('T', ' ').substring(0, 19)
}

const formatFileSize = (size: number) => {
  if (!size) return '-'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / 1024 / 1024).toFixed(1) + ' MB'
}

const getList = async () => {
  loading.value = true
  try {
    const res: any = await listDocument(queryParams)
    documentList.value = res.rows
    total.value = res.total
  } finally { loading.value = false }
}

const getProjectList = async () => {
  const res: any = await getAllProjects()
  projectList.value = res.data || []
}

const handleQuery = () => { queryParams.pageNum = 1; getList() }
const resetQuery = () => { queryFormRef.value?.resetFields(); handleQuery() }

const handleUpload = () => {
  uploadForm.value = { projectId: null, docType: '', docName: '', description: '' }
  fileList.value = []
  currentFile.value = null
  uploadVisible.value = true
}

const beforeUpload = (file: File) => {
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    ElMessage.error('文件大小不能超过 50MB')
    return false
  }
  currentFile.value = file
  return false
}

const handleFileChange = (file: UploadFile) => {
  currentFile.value = file.raw as File
  if (!uploadForm.value.docName && file.name) {
    uploadForm.value.docName = file.name.substring(0, file.name.lastIndexOf('.'))
  }
}

const handleFileRemove = () => {
  currentFile.value = null
}

const submitUpload = async () => {
  const valid = await uploadFormRef.value?.validate().catch(() => false)
  if (!valid) return

  if (!currentFile.value) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', currentFile.value)
    formData.append('projectId', uploadForm.value.projectId)
    formData.append('docType', uploadForm.value.docType)
    formData.append('docName', uploadForm.value.docName)
    formData.append('description', uploadForm.value.description || '')

    await uploadDocument(formData)
    ElMessage.success('上传成功')
    uploadVisible.value = false
    getList()
  } catch (error) {
    console.error('上传失败', error)
  } finally {
    uploading.value = false
  }
}

const handleDownload = async (row: any) => {
  try {
    const res: any = await downloadDocument(row.docId)
    const url = window.URL.createObjectURL(new Blob([res]))
    const link = document.createElement('a')
    link.href = url
    link.download = row.docName + '.' + row.fileType
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('下载成功')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('是否确认删除该文档?', '警告', { type: 'warning' })
  try {
    await delDocument(row.docId)
    ElMessage.success('删除成功')
    getList()
  } catch (error) { console.error('删除失败', error) }
}

onMounted(() => { getList(); getProjectList() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
