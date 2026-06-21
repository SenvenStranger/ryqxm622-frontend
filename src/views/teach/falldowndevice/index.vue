<template>
  <div class="app-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #409EFF;">
            <i class="el-icon-connection"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">设备总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #67C23A;">
            <i class="el-icon-circle-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.online }}</div>
            <div class="stat-label">在线设备</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #E6A23C;">
            <i class="el-icon-warning"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.todayAlarms }}</div>
            <div class="stat-label">今日报警</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #F56C6C;">
            <i class="el-icon-bell"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.pendingAlarms }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 设备列表 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>设备管理</span>
          <el-button type="primary" @click="handleAdd" v-hasPermi="['teach:device:add']">
            <i class="el-icon-plus"></i> 新增设备
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="queryParams" ref="queryFormRef" :inline="true">
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="queryParams.deviceName" placeholder="请输入设备名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="queryParams.deviceType" placeholder="请选择" clearable>
            <el-option label="穿戴式" value="wearable" />
            <el-option label="摄像头" value="camera" />
            <el-option label="环境传感器" value="ambient" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable>
            <el-option label="正常" value="0" />
            <el-option label="离线" value="1" />
            <el-option label="故障" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"><i class="el-icon-search"></i> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh"></i> 重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="deviceList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="设备ID" align="center" prop="deviceId" width="80" />
        <el-table-column label="设备名称" align="center" prop="deviceName" :show-overflow-tooltip="true" />
        <el-table-column label="设备编码" align="center" prop="deviceCode" width="130" />
        <el-table-column label="设备类型" align="center" prop="deviceType" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.deviceType === 'wearable'" type="success">穿戴式</el-tag>
            <el-tag v-else-if="row.deviceType === 'camera'" type="warning">摄像头</el-tag>
            <el-tag v-else type="info">环境传感器</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="安装位置" align="center" prop="location" :show-overflow-tooltip="true" />
        <el-table-column label="绑定用户" align="center" prop="userName" width="100" />
        <el-table-column label="电量" align="center" prop="batteryLevel" width="80">
          <template #default="{ row }">
            <el-progress :percentage="row.batteryLevel || 0" :color="getBatteryColor(row.batteryLevel)" />
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === '0'" type="success">正常</el-tag>
            <el-tag v-else-if="row.status === '1'" type="info">离线</el-tag>
            <el-tag v-else type="danger">故障</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后心跳" align="center" prop="lastHeartbeat" width="160">
          <template #default="{ row }">
            {{ parseTime(row.lastHeartbeat) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)" v-hasPermi="['teach:device:query']">
              详情
            </el-button>
            <el-button link type="primary" @click="handleUpdate(row)" v-hasPermi="['teach:device:edit']">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-hasPermi="['teach:device:remove']">
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

    <!-- 添加/编辑设备对话框 -->
    <el-dialog v-model="dialogVisible" :title="title" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="设备名称" prop="deviceName">
              <el-input v-model="form.deviceName" placeholder="请输入设备名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编码" prop="deviceCode">
              <el-input v-model="form.deviceCode" placeholder="请输入设备编码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="设备类型" prop="deviceType">
              <el-select v-model="form.deviceType" placeholder="请选择">
                <el-option label="穿戴式" value="wearable" />
                <el-option label="摄像头" value="camera" />
                <el-option label="环境传感器" value="ambient" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备型号" prop="deviceModel">
              <el-input v-model="form.deviceModel" placeholder="请输入设备型号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="生产厂家" prop="manufacturer">
          <el-input v-model="form.manufacturer" placeholder="请输入生产厂家" />
        </el-form-item>
        <el-form-item label="MAC地址" prop="macAddress">
          <el-input v-model="form.macAddress" placeholder="请输入MAC地址" />
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入安装位置" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="绑定用户" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急电话" prop="userPhone">
              <el-input v-model="form.userPhone" placeholder="请输入紧急联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input-number v-model="form.longitude" :precision="6" placeholder="经度" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input-number v-model="form.latitude" :precision="6" placeholder="纬度" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 设备详情对话框 -->
    <el-dialog v-model="detailVisible" title="设备详情" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="设备名称">{{ detailData.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="设备编码">{{ detailData.deviceCode }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ getDeviceTypeText(detailData.deviceType) }}</el-descriptions-item>
        <el-descriptions-item label="设备型号">{{ detailData.deviceModel }}</el-descriptions-item>
        <el-descriptions-item label="生产厂家">{{ detailData.manufacturer }}</el-descriptions-item>
        <el-descriptions-item label="MAC地址">{{ detailData.macAddress }}</el-descriptions-item>
        <el-descriptions-item label="安装位置">{{ detailData.location }}</el-descriptions-item>
        <el-descriptions-item label="绑定用户">{{ detailData.userName }}</el-descriptions-item>
        <el-descriptions-item label="紧急电话">{{ detailData.userPhone }}</el-descriptions-item>
        <el-descriptions-item label="电池电量">{{ detailData.batteryLevel }}%</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="detailData.status === '0'" type="success">正常</el-tag>
          <el-tag v-else-if="detailData.status === '1'" type="info">离线</el-tag>
          <el-tag v-else type="danger">故障</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后心跳">{{ parseTime(detailData.lastHeartbeat) }}</el-descriptions-item>
        <el-descriptions-item label="经度" :span="2">{{ detailData.longitude }}</el-descriptions-item>
        <el-descriptions-item label="纬度" :span="2">{{ detailData.latitude }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { listDevice, getDevice, addDevice, updateDevice, delDevice, getAlarmStatistics } from '@/api/teach/fallDevice'

// 响应式数据
const loading = ref(false)
const total = ref(0)
const deviceList = ref<any[]>([])
const title = ref('')
const dialogVisible = ref(false)
const detailVisible = ref(false)
const detailData = ref<any>({})
const formRef = ref<FormInstance>()
const queryFormRef = ref<FormInstance>()

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  deviceName: '',
  deviceCode: '',
  deviceType: '',
  status: ''
})

// 表单数据
const form = ref<any>({
  deviceId: undefined,
  deviceName: '',
  deviceCode: '',
  deviceType: '',
  deviceModel: '',
  manufacturer: '',
  macAddress: '',
  location: '',
  userName: '',
  userPhone: '',
  longitude: null,
  latitude: null,
  remark: ''
})

// 统计数据
const statistics = ref({
  total: 0,
  online: 0,
  todayAlarms: 0,
  pendingAlarms: 0
})

// 表单验证规则
const rules = reactive<FormRules>({
  deviceName: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
  deviceCode: [{ required: true, message: '设备编码不能为空', trigger: 'blur' }],
  deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }]
})

// 工具函数
const parseTime = (time: string) => {
  if (!time) return '-'
  return time.replace('T', ' ').substring(0, 19)
}

const getBatteryColor = (level: number) => {
  if (level >= 60) return '#67C23A'
  if (level >= 30) return '#E6A23C'
  return '#F56C6C'
}

const getDeviceTypeText = (type: string) => {
  const map: any = { wearable: '穿戴式', camera: '摄像头', ambient: '环境传感器' }
  return map[type] || type
}

// 获取设备列表
const getList = async () => {
  loading.value = true
  try {
    const res: any = await listDevice(queryParams)
    deviceList.value = res.rows
    total.value = res.total
  } catch (error) {
    console.error('获取设备列表失败', error)
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const getStatistics = async () => {
  try {
    const res: any = await getAlarmStatistics()
    statistics.value = {
      total: deviceList.value.length,
      online: deviceList.value.filter((d: any) => d.status === '0').length,
      todayAlarms: res.data.total || 0,
      pendingAlarms: res.data.pending || 0
    }
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

// 新增
const handleAdd = () => {
  form.value = {
    deviceId: undefined,
    deviceName: '',
    deviceCode: '',
    deviceType: '',
    deviceModel: '',
    manufacturer: '',
    macAddress: '',
    location: '',
    userName: '',
    userPhone: '',
    longitude: null,
    latitude: null,
    remark: ''
  }
  title.value = '添加设备'
  dialogVisible.value = true
}

// 修改
const handleUpdate = async (row: any) => {
  const res: any = await getDevice(row.deviceId)
  form.value = res.data
  title.value = '修改设备'
  dialogVisible.value = true
}

// 查看详情
const handleView = async (row: any) => {
  const res: any = await getDevice(row.deviceId)
  detailData.value = res.data
  detailVisible.value = true
}

// 提交表单
const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    if (form.value.deviceId) {
      await updateDevice(form.value)
      ElMessage.success('修改成功')
    } else {
      await addDevice(form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
    getStatistics()
  } catch (error: any) {
    ElMessage.error(error.msg || '操作失败')
  }
}

// 删除
const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('是否确认删除设备编号为"' + row.deviceCode + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await delDevice(row.deviceId)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error('删除失败', error)
  }
}

// 多选
const handleSelectionChange = (selection: any[]) => {
  // 处理多选逻辑
}

// 初始化
onMounted(() => {
  getList()
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
</style>
