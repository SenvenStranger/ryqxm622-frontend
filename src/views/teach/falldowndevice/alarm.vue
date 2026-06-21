<template>
  <div class="app-container">
    <!-- 报警统计 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" :class="{ 'alarm-highlight': stats.pending > 0 }">
          <div class="stat-icon" style="background: #F56C6C;">
            <i class="el-icon-bell"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">今日报警总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card alarm-highlight">
          <div class="stat-icon" style="background: #E6A23C;">
            <i class="el-icon-warning"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #67C23A;">
            <i class="el-icon-circle-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.handled }}</div>
            <div class="stat-label">已处理</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #909399;">
            <i class="el-icon-close"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.falseAlarm }}</div>
            <div class="stat-label">误报</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 报警列表 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>报警记录</span>
          <el-button type="primary" @click="handleExport" v-hasPermi="['teach:alarm:export']">
            <i class="el-icon-download"></i> 导出
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="queryParams" ref="queryFormRef" :inline="true">
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="queryParams.deviceName" placeholder="请输入" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="用户姓名" prop="userName">
          <el-input v-model="queryParams.userName" placeholder="请输入" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="报警类型" prop="alarmType">
          <el-select v-model="queryParams.alarmType" placeholder="请选择" clearable>
            <el-option label="跌倒报警" value="fall" />
            <el-option label="紧急求助" value="sos" />
            <el-option label="低电量" value="low_battery" />
            <el-option label="设备离线" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item label="报警级别" prop="alarmLevel">
          <el-select v-model="queryParams.alarmLevel" placeholder="请选择" clearable>
            <el-option label="低" value="1" />
            <el-option label="中" value="2" />
            <el-option label="高" value="3" />
            <el-option label="紧急" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态" prop="alarmStatus">
          <el-select v-model="queryParams.alarmStatus" placeholder="请选择" clearable>
            <el-option label="待处理" value="0" />
            <el-option label="已确认" value="1" />
            <el-option label="误报" value="2" />
            <el-option label="已处理" value="3" />
            <el-option label="已升级" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="报警时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"><i class="el-icon-search"></i> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh"></i> 重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="alarmList" @selection-change="handleSelectionChange" :row-class-name="tableRowClassName">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="报警ID" align="center" prop="alarmId" width="80" />
        <el-table-column label="报警时间" align="center" prop="alarmTime" width="160">
          <template #default="{ row }">
            {{ parseTime(row.alarmTime) }}
          </template>
        </el-table-column>
        <el-table-column label="设备名称" align="center" prop="deviceName" :show-overflow-tooltip="true" />
        <el-table-column label="用户" align="center" prop="userName" width="80" />
        <el-table-column label="报警类型" align="center" prop="alarmType" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.alarmType === 'fall'" type="danger">跌倒报警</el-tag>
            <el-tag v-else-if="row.alarmType === 'sos'" type="warning">紧急求助</el-tag>
            <el-tag v-else-if="row.alarmType === 'low_battery'" type="info">低电量</el-tag>
            <el-tag v-else type="info">设备离线</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="级别" align="center" prop="alarmLevel" width="70">
          <template #default="{ row }">
            <el-tag v-if="row.alarmLevel === '4'" type="danger" effect="dark">紧急</el-tag>
            <el-tag v-else-if="row.alarmLevel === '3'" type="warning">高</el-tag>
            <el-tag v-else-if="row.alarmLevel === '2'" type="info">中</el-tag>
            <el-tag v-else type="success">低</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="跌倒概率" align="center" prop="fallProbability" width="90">
          <template #default="{ row }">
            <span :class="getProbabilityClass(row.fallProbability)">
              {{ row.fallProbability }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="跌倒类型" align="center" prop="fallType" width="80">
          <template #default="{ row }">
            {{ getFallTypeText(row.fallType) }}
          </template>
        </el-table-column>
        <el-table-column label="心率" align="center" prop="heartRate" width="70">
          <template #default="{ row }">
            {{ row.heartRate || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="处理状态" align="center" prop="alarmStatus" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.alarmStatus === '0'" type="danger">待处理</el-tag>
            <el-tag v-else-if="row.alarmStatus === '1'" type="warning">已确认</el-tag>
            <el-tag v-else-if="row.alarmStatus === '2'" type="info">误报</el-tag>
            <el-tag v-else-if="row.alarmStatus === '3'" type="success">已处理</el-tag>
            <el-tag v-else type="warning">已升级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)" v-hasPermi="['teach:alarm:query']">
              详情
            </el-button>
            <el-button link type="success" @click="handleProcess(row)" v-hasPermi="['teach:alarm:handle']"
              :disabled="row.alarmStatus !== '0'">
              处理
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-hasPermi="['teach:alarm:remove']">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 报警详情对话框 -->
    <el-dialog v-model="detailVisible" title="报警详情" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="报警ID">{{ detailData.alarmId }}</el-descriptions-item>
        <el-descriptions-item label="报警时间">{{ parseTime(detailData.alarmTime) }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ detailData.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="设备编码">{{ detailData.deviceCode }}</el-descriptions-item>
        <el-descriptions-item label="用户姓名">{{ detailData.userName }}</el-descriptions-item>
        <el-descriptions-item label="报警类型">
          <el-tag v-if="detailData.alarmType === 'fall'" type="danger">跌倒报警</el-tag>
          <el-tag v-else-if="detailData.alarmType === 'sos'" type="warning">紧急求助</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="报警级别">{{ getLevelText(detailData.alarmLevel) }}</el-descriptions-item>
        <el-descriptions-item label="跌倒概率">{{ detailData.fallProbability }}%</el-descriptions-item>
        <el-descriptions-item label="跌倒类型">{{ getFallTypeText(detailData.fallType) }}</el-descriptions-item>
        <el-descriptions-item label="活动状态">{{ detailData.activityState }}</el-descriptions-item>
        <el-descriptions-item label="心率">{{ detailData.heartRate }} bpm</el-descriptions-item>
        <el-descriptions-item label="报警位置" :span="2">{{ detailData.location }}</el-descriptions-item>
        <el-descriptions-item label="处理状态">
          <el-tag v-if="detailData.alarmStatus === '0'" type="danger">待处理</el-tag>
          <el-tag v-else-if="detailData.alarmStatus === '1'" type="warning">已确认</el-tag>
          <el-tag v-else-if="detailData.alarmStatus === '2'" type="info">误报</el-tag>
          <el-tag v-else type="success">已处理</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理人">{{ detailData.handleBy }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ parseTime(detailData.handleTime) }}</el-descriptions-item>
        <el-descriptions-item label="处理结果" :span="2">{{ detailData.handleResult }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark }}</el-descriptions-item>
      </el-descriptions>

      <!-- 图片/视频预览 -->
      <div v-if="detailData.imageUrl || detailData.videoUrl" class="media-preview">
        <el-divider content-position="left">现场图片/视频</el-divider>
        <div class="media-container">
          <el-image v-if="detailData.imageUrl" :src="detailData.imageUrl" :preview-src-list="[detailData.imageUrl]" fit="contain" style="max-width: 300px; max-height: 200px;" />
          <video v-if="detailData.videoUrl" :src="detailData.videoUrl" controls style="max-width: 300px; max-height: 200px;" />
        </div>
      </div>
    </el-dialog>

    <!-- 处理报警对话框 -->
    <el-dialog v-model="processVisible" title="处理报警" width="500px" append-to-body>
      <el-form ref="processFormRef" :model="processForm" :rules="processRules" label-width="100px">
        <el-form-item label="处理状态" prop="alarmStatus">
          <el-select v-model="processForm.alarmStatus" placeholder="请选择">
            <el-option label="已确认" value="1" />
            <el-option label="误报" value="2" />
            <el-option label="已处理" value="3" />
            <el-option label="已升级" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理结果" prop="handleResult">
          <el-input v-model="processForm.handleResult" type="textarea" :rows="4" placeholder="请输入处理结果" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitProcess">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { listAlarm, getAlarm, handleAlarm, delAlarm, getAlarmStatistics } from '@/api/teach/fallDevice'

// 响应式数据
const loading = ref(false)
const total = ref(0)
const alarmList = ref<any[]>([])
const detailVisible = ref(false)
const processVisible = ref(false)
const detailData = ref<any>({})
const dateRange = ref<any[]>([])
const processFormRef = ref<FormInstance>()
const queryFormRef = ref<FormInstance>()

// 统计数据
const stats = ref({
  total: 0,
  pending: 0,
  handled: 0,
  falseAlarm: 0
})

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  deviceName: '',
  userName: '',
  alarmType: '',
  alarmLevel: '',
  alarmStatus: '',
  beginAlarmTime: '',
  endAlarmTime: ''
})

// 处理表单
const processForm = ref<any>({
  alarmId: undefined,
  alarmStatus: '',
  handleResult: ''
})

// 处理表单验证规则
const processRules: FormRules = {
  alarmStatus: [{ required: true, message: '请选择处理状态', trigger: 'change' }],
  handleResult: [{ required: true, message: '请输入处理结果', trigger: 'blur' }]
}

// 工具函数
const parseTime = (time: string) => {
  if (!time) return '-'
  return time.replace('T', ' ').substring(0, 19)
}

const getLevelText = (level: string) => {
  const map: any = { '1': '低', '2': '中', '3': '高', '4': '紧急' }
  return map[level] || level
}

const getFallTypeText = (type: string) => {
  const map: any = { forward: '前倾', backward: '后仰', sideways: '侧倾', collapse: '猝倒' }
  return map[type] || type || '-'
}

const getProbabilityClass = (prob: number) => {
  if (prob >= 80) return 'text-danger'
  if (prob >= 60) return 'text-warning'
  return 'text-success'
}

const tableRowClassName = ({ row }: any) => {
  if (row.alarmStatus === '0' && row.alarmLevel === '4') {
    return 'danger-row'
  }
  if (row.alarmStatus === '0') {
    return 'warning-row'
  }
  return ''
}

// 获取报警列表
const getList = async () => {
  loading.value = true
  try {
    // 处理日期范围
    if (dateRange.value && dateRange.value.length === 2) {
      queryParams.beginAlarmTime = dateRange.value[0]
      queryParams.endAlarmTime = dateRange.value[1]
    } else {
      queryParams.beginAlarmTime = ''
      queryParams.endAlarmTime = ''
    }

    const res: any = await listAlarm(queryParams)
    alarmList.value = res.rows
    total.value = res.total
  } catch (error) {
    console.error('获取报警列表失败', error)
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const getStatistics = async () => {
  try {
    const res: any = await getAlarmStatistics()
    stats.value = {
      total: res.data.total || 0,
      pending: res.data.pending || 0,
      handled: res.data.handled || 0,
      falseAlarm: res.data.falseAlarm || 0
    }
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
  getStatistics()
}

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  dateRange.value = []
  handleQuery()
}

// 查看详情
const handleView = async (row: any) => {
  const res: any = await getAlarm(row.alarmId)
  detailData.value = res.data
  detailVisible.value = true
}

// 处理报警
const handleProcess = (row: any) => {
  processForm.value = {
    alarmId: row.alarmId,
    alarmStatus: '',
    handleResult: ''
  }
  processVisible.value = true
}

// 提交处理
const submitProcess = async () => {
  const valid = await processFormRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    await handleAlarm(processForm.value)
    ElMessage.success('处理成功')
    processVisible.value = false
    getList()
    getStatistics()
  } catch (error) {
    console.error('处理失败', error)
  }
}

// 删除
const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('是否确认删除该报警记录?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await delAlarm(row.alarmId)
    ElMessage.success('删除成功')
    getList()
    getStatistics()
  } catch (error) {
    console.error('删除失败', error)
  }
}

// 导出
const handleExport = () => {
  // 导出逻辑
  ElMessage.info('导出功能开发中')
}

// 多选
const handleSelectionChange = (selection: any[]) => {
  // 处理多选逻辑
}

// 初始化
onMounted(() => {
  getList()
  getStatistics()
})
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-card.alarm-highlight {
  border: 2px solid #F56C6C;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 28px;
  color: #fff;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-danger {
  color: #F56C6C;
  font-weight: bold;
}

.text-warning {
  color: #E6A23C;
}

.text-success {
  color: #67C23A;
}

.media-preview {
  margin-top: 20px;
}

.media-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

:deep(.danger-row) {
  --el-table-tr-bg-color: var(--el-color-danger-light-9);
}

:deep(.warning-row) {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
</style>
