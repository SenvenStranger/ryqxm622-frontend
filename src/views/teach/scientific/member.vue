<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>团队成员管理</span>
          <el-button type="primary" @click="handleAdd" v-hasPermi="['teach:member:add']">
            <i class="el-icon-plus"></i> 新增成员
          </el-button>
        </div>
      </template>

      <el-form :model="queryParams" ref="queryFormRef" :inline="true">
        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="queryParams.projectId" placeholder="请选择" clearable filterable>
            <el-option v-for="p in projectList" :key="p.projectId" :label="p.projectName" :value="p.projectId" />
          </el-select>
        </el-form-item>
        <el-form-item label="成员姓名" prop="memberName">
          <el-input v-model="queryParams.memberName" placeholder="请输入" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="成员角色" prop="memberRole">
          <el-select v-model="queryParams.memberRole" placeholder="请选择" clearable>
            <el-option label="负责人" value="负责人" />
            <el-option label="骨干" value="骨干" />
            <el-option label="参与" value="参与" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否在研" prop="isActive">
          <el-select v-model="queryParams.isActive" placeholder="请选择" clearable>
            <el-option label="是" value="1" />
            <el-option label="否" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"><i class="el-icon-search"></i> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh"></i> 重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="memberList">
        <el-table-column label="所属项目" align="center" prop="projectName" :show-overflow-tooltip="true" min-width="180" />
        <el-table-column label="成员姓名" align="center" prop="memberName" width="90" />
        <el-table-column label="角色" align="center" prop="memberRole" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.memberRole === '负责人'" type="danger">负责人</el-tag>
            <el-tag v-else-if="row.memberRole === '骨干'" type="warning">骨干</el-tag>
            <el-tag v-else type="info">参与</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="职称" align="center" prop="title" width="90" />
        <el-table-column label="学历" align="center" prop="degree" width="70" />
        <el-table-column label="专业" align="center" prop="specialty" :show-overflow-tooltip="true" />
        <el-table-column label="工作量(小时)" align="center" prop="workloadHours" width="100" />
        <el-table-column label="联系电话" align="center" prop="phone" width="110" />
        <el-table-column label="是否在研" align="center" prop="isActive" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isActive === '1'" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleUpdate(row)" v-hasPermi="['teach:member:edit']">修改</el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-hasPermi="['teach:member:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 添加/修改对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="form.projectId" placeholder="请选择项目" filterable style="width: 100%">
            <el-option v-for="p in projectList" :key="p.projectId" :label="p.projectName" :value="p.projectId" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="成员姓名" prop="memberName">
              <el-input v-model="form.memberName" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成员角色" prop="memberRole">
              <el-select v-model="form.memberRole" placeholder="请选择">
                <el-option label="负责人" value="负责人" />
                <el-option label="骨干" value="骨干" />
                <el-option label="参与" value="参与" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职称" prop="title">
              <el-input v-model="form.title" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学历" prop="degree">
              <el-select v-model="form.degree" placeholder="请选择">
                <el-option label="博士" value="博士" />
                <el-option label="硕士" value="硕士" />
                <el-option label="本科" value="本科" />
                <el-option label="专科" value="专科" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="专业" prop="specialty">
          <el-input v-model="form.specialty" placeholder="请输入专业" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="加入日期" prop="joinDate">
              <el-date-picker v-model="form.joinDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作量(小时)" prop="workloadHours">
              <el-input-number v-model="form.workloadHours" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="主要贡献" prop="contribution">
          <el-input v-model="form.contribution" type="textarea" :rows="2" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { listMember, getMember, addMember, updateMember, delMember } from '@/api/teach/scientific'
import { getAllProjects } from '@/api/teach/scientific'

const loading = ref(false)
const total = ref(0)
const memberList = ref<any[]>([])
const projectList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const queryFormRef = ref<FormInstance>()
const formRef = ref<FormInstance>()

const queryParams = reactive({
  pageNum: 1, pageSize: 10,
  projectId: null, memberName: '', memberRole: '', isActive: ''
})

const form = ref<any>({
  memberId: undefined, projectId: null, memberName: '', memberRole: '', title: '',
  degree: '', specialty: '', workloadHours: 0, contribution: '', phone: '',
  email: '', joinDate: '', remark: ''
})

const rules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  memberName: [{ required: true, message: '请输入成员姓名', trigger: 'blur' }],
  memberRole: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const getList = async () => {
  loading.value = true
  try {
    const res: any = await listMember(queryParams)
    memberList.value = res.rows
    total.value = res.total
  } finally { loading.value = false }
}

const getProjectList = async () => {
  const res: any = await getAllProjects()
  projectList.value = res.data || []
}

const handleQuery = () => { queryParams.pageNum = 1; getList() }
const resetQuery = () => { queryFormRef.value?.resetFields(); handleQuery() }

const handleAdd = () => {
  form.value = { memberId: undefined, projectId: null, memberName: '', memberRole: '', title: '',
    degree: '', specialty: '', workloadHours: 0, contribution: '', phone: '', email: '', joinDate: '', remark: '' }
  dialogTitle.value = '新增成员'
  dialogVisible.value = true
}

const handleUpdate = async (row: any) => {
  const res: any = await getMember(row.memberId)
  form.value = res.data
  dialogTitle.value = '修改成员'
  dialogVisible.value = true
}

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    if (form.value.memberId) {
      await updateMember(form.value)
      ElMessage.success('修改成功')
    } else {
      await addMember(form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } catch (error) { console.error('操作失败', error) }
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('是否确认删除该成员?', '警告', { type: 'warning' })
  try {
    await delMember(row.memberId)
    ElMessage.success('删除成功')
    getList()
  } catch (error) { console.error('删除失败', error) }
}

onMounted(() => { getList(); getProjectList() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
