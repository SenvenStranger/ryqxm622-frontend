<template>
  <div class="app-container">
    <!-- 筛选卡片 -->
    <el-card class="mb-20">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true">
        <el-form-item label="项目名称" prop="projectId">
          <el-select v-model="queryParams.projectId" placeholder="请选择项目" clearable filterable>
            <el-option v-for="p in projectList" :key="p.projectId" :label="p.projectName" :value="p.projectId" />
          </el-select>
        </el-form-item>
        <el-form-item label="里程碑类型" prop="milestoneType">
          <el-select v-model="queryParams.milestoneType" placeholder="请选择" clearable>
            <el-option label="开题" value="开题" />
            <el-option label="中期" value="中期" />
            <el-option label="结题" value="结题" />
            <el-option label="阶段" value="阶段" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="milestoneStatus">
          <el-select v-model="queryParams.milestoneStatus" placeholder="请选择" clearable>
            <el-option label="待完成" value="0" />
            <el-option label="已完成" value="1" />
            <el-option label="延期" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"><i class="el-icon-search"></i> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh"></i> 重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 里程碑列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>里程碑管理</span>
          <el-button type="primary" @click="handleAdd" v-hasPermi="['teach:milestone:add']">
            <i class="el-icon-plus"></i> 新增里程碑
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="milestoneList">
        <el-table-column label="项目名称" align="center" prop="projectName" :show-overflow-tooltip="true" min-width="180" />
        <el-table-column label="里程碑名称" align="center" prop="milestoneName" min-width="150" />
        <el-table-column label="类型" align="center" prop="milestoneType" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.milestoneType === '开题'" type="primary">开题</el-tag>
            <el-tag v-else-if="row.milestoneType === '中期'" type="warning">中期</el-tag>
            <el-tag v-else-if="row.milestoneType === '结题'" type="success">结题</el-tag>
            <el-tag v-else type="info">阶段</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="计划日期" align="center" prop="planDate" width="100" />
        <el-table-column label="实际完成日期" align="center" prop="actualDate" width="120" />
        <el-table-column label="状态" align="center" prop="milestoneStatus" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.milestoneStatus === '0'" type="warning">待完成</el-tag>
            <el-tag v-else-if="row.milestoneStatus === '1'" type="success">已完成</el-tag>
            <el-tag v-else type="danger">延期</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="完成进度" align="center" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progressPercent || 0" :color="getProgressColor(row.progressPercent)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
            <el-button link type="primary" @click="handleUpdate(row)" v-hasPermi="['teach:milestone:edit']">修改</el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-hasPermi="['teach:milestone:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 添加/修改对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="form.projectId" placeholder="请选择项目" filterable style="width: 100%">
            <el-option v-for="p in projectList" :key="p.projectId" :label="p.projectName" :value="p.projectId" />
          </el-select>
        </el-form-item>
        <el-form-item label="里程碑名称" prop="milestoneName">
          <el-input v-model="form.milestoneName" placeholder="请输入里程碑名称" />
        </el-form-item>
        <el-form-item label="类型" prop="milestoneType">
          <el-select v-model="form.milestoneType" placeholder="请选择">
            <el-option label="开题" value="开题" />
            <el-option label="中期" value="中期" />
            <el-option label="结题" value="结题" />
            <el-option label="阶段" value="阶段" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划日期" prop="planDate">
              <el-date-picker v-model="form.planDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际完成日期" prop="actualDate">
              <el-date-picker v-model="form.actualDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="milestoneStatus">
              <el-select v-model="form.milestoneStatus" placeholder="请选择">
                <el-option label="待完成" value="0" />
                <el-option label="已完成" value="1" />
                <el-option label="延期" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="完成进度" prop="progressPercent">
              <el-slider v-model="form.progressPercent" :min="0" :max="100" show-input />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="里程碑描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入里程碑描述" />
        </el-form-item>
        <el-form-item label="完成成果" prop="achievements">
          <el-input v-model="form.achievements" type="textarea" :rows="2" placeholder="请输入完成成果" />
        </el-form-item>
        <el-form-item label="存在问题" prop="problems">
          <el-input v-model="form.problems" type="textarea" :rows="2" placeholder="请输入存在问题" />
        </el-form-item>
        <el-form-item label="下一步计划" prop="nextPlan">
          <el-input v-model="form.nextPlan" type="textarea" :rows="2" placeholder="请输入下一步计划" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="里程碑详情" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="项目名称">{{ detailData.projectName }}</el-descriptions-item>
        <el-descriptions-item label="里程碑名称">{{ detailData.milestoneName }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.milestoneType }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="detailData.milestoneStatus === '1'" type="success">已完成</el-tag>
          <el-tag v-else-if="detailData.milestoneStatus === '2'" type="danger">延期</el-tag>
          <el-tag v-else type="warning">待完成</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="计划日期">{{ detailData.planDate }}</el-descriptions-item>
        <el-descriptions-item label="实际完成日期">{{ detailData.actualDate }}</el-descriptions-item>
        <el-descriptions-item label="完成进度" :span="2">
          <el-progress :percentage="detailData.progressPercent || 0" style="width: 200px" />
        </el-descriptions-item>
        <el-descriptions-item label="里程碑描述" :span="2">{{ detailData.description }}</el-descriptions-item>
        <el-descriptions-item label="完成成果" :span="2">{{ detailData.achievements }}</el-descriptions-item>
        <el-descriptions-item label="存在问题" :span="2">{{ detailData.problems }}</el-descriptions-item>
        <el-descriptions-item label="下一步计划" :span="2">{{ detailData.nextPlan }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { listMilestone, getMilestone, addMilestone, updateMilestone, delMilestone } from '@/api/teach/scientific'
import { getAllProjects } from '@/api/teach/scientific'

const loading = ref(false)
const total = ref(0)
const milestoneList = ref<any[]>([])
const projectList = ref<any[]>([])
const dialogVisible = ref(false)
const detailVisible = ref(false)
const dialogTitle = ref('')
const detailData = ref<any>({})
const queryFormRef = ref<FormInstance>()
const formRef = ref<FormInstance>()

const queryParams = reactive({
  pageNum: 1, pageSize: 10,
  projectId: null, milestoneType: '', milestoneStatus: ''
})

const form = ref<any>({
  milestoneId: undefined, projectId: null, milestoneName: '', milestoneType: '',
  planDate: '', actualDate: '', milestoneStatus: '0', progressPercent: 0,
  description: '', achievements: '', problems: '', nextPlan: '', remark: ''
})

const rules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  milestoneName: [{ required: true, message: '请输入里程碑名称', trigger: 'blur' }],
  milestoneType: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const getProgressColor = (percent: number) => {
  if (percent >= 80) return '#67C23A'
  if (percent >= 50) return '#E6A23C'
  return '#909399'
}

const getList = async () => {
  loading.value = true
  try {
    const res: any = await listMilestone(queryParams)
    milestoneList.value = res.rows
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const getProjectList = async () => {
  const res: any = await getAllProjects()
  projectList.value = res.data || []
}

const handleQuery = () => { queryParams.pageNum = 1; getList() }
const resetQuery = () => { queryFormRef.value?.resetFields(); handleQuery() }

const handleAdd = () => {
  form.value = { milestoneId: undefined, projectId: null, milestoneName: '', milestoneType: '',
    planDate: '', actualDate: '', milestoneStatus: '0', progressPercent: 0,
    description: '', achievements: '', problems: '', nextPlan: '', remark: '' }
  dialogTitle.value = '新增里程碑'
  dialogVisible.value = true
}

const handleUpdate = async (row: any) => {
  const res: any = await getMilestone(row.milestoneId)
  form.value = res.data
  dialogTitle.value = '修改里程碑'
  dialogVisible.value = true
}

const handleView = async (row: any) => {
  const res: any = await getMilestone(row.milestoneId)
  detailData.value = res.data
  detailVisible.value = true
}

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    if (form.value.milestoneId) {
      await updateMilestone(form.value)
      ElMessage.success('修改成功')
    } else {
      await addMilestone(form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } catch (error) { console.error('操作失败', error) }
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('是否确认删除该里程碑?', '警告', { type: 'warning' })
  try {
    await delMilestone(row.milestoneId)
    ElMessage.success('删除成功')
    getList()
  } catch (error) { console.error('删除失败', error) }
}

onMounted(() => { getList(); getProjectList() })
</script>

<style scoped>
.mb-20 { margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
