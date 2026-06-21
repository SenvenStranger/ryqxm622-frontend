<!--科研项目管理 he-->
<template>
  <div class="app-container">
    <el-card shadow="always">
    <!-- 查询 -->
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      label-width="80px"
    >
      <el-form-item label="项目名称" prop="projectName">
        <el-input
          placeholder="请输入项目名称模糊查询"
          clearable
          size="small"
          @keyup.enter="handleQuery"
          style="width: 240px"
          v-model="queryParams.projectName"
        />
      </el-form-item>
      <el-form-item label="项目类型" prop="projectType">
        <el-select
          v-model="queryParams.projectType"
          placeholder="项目类型"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option label="国家级" value="国家级" />
          <el-option label="省部级" value="省部级" />
          <el-option label="厅局级" value="厅局级" />
          <el-option label="校级" value="校级" />
        </el-select>
      </el-form-item>
      <el-form-item label="项目状态" prop="projectStatus">
        <el-select
          v-model="queryParams.projectStatus"
          placeholder="项目状态"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option label="筹备" value="0" />
          <el-option label="进行中" value="1" />
          <el-option label="已完成" value="2" />
          <el-option label="已终止" value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="负责人" prop="principalName">
        <el-input
          placeholder="请输入负责人模糊查询"
          clearable
          size="small"
          @keyup.enter="handleQuery"
          style="width: 240px"
          v-model="queryParams.principalName"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="onOpenAddModule"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="onTabelRowDel"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          >导出</el-button
        >
      </el-col>
    </el-row>

    <!--数据表格-->
    <el-table
      v-loading="loading"
      :data="tableData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="项目编号" align="center" prop="projectCode" width="120" />
      <el-table-column label="项目名称" align="center" prop="projectName" :show-overflow-tooltip="true" min-width="180" />
      <el-table-column label="项目类型" align="center" prop="projectType" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.projectType === '国家级'" type="danger">国家级</el-tag>
          <el-tag v-else-if="scope.row.projectType === '省部级'" type="warning">省部级</el-tag>
          <el-tag v-else-if="scope.row.projectType === '厅局级'" type="success">厅局级</el-tag>
          <el-tag v-else type="info">校级</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="项目级别" align="center" prop="projectLevel" width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.projectLevel === '重点'" type="danger">重点</el-tag>
          <el-tag v-else type="info">一般</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="资助金额(万)" align="center" prop="fundingAmount" width="100" />
      <el-table-column label="负责人" align="center" prop="principalName" width="90" />
      <el-table-column label="状态" align="center" prop="projectStatus" width="85">
        <template #default="scope">
          <el-tag
            :type="scope.row.projectStatus === '1' ? 'success' : scope.row.projectStatus === '2' ? '' : scope.row.projectStatus === '3' ? 'danger' : 'info'"
            disable-transitions
          >{{ statusFormat(scope.row) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="开始日期" align="center" prop="startDate" width="105" />
      <el-table-column label="结束日期" align="center" prop="endDate" width="105" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="150"
      >
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="onOpenEditModule(scope.row)"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="onTabelRowDel(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页设置-->
    <div v-show="total > 0">
      <el-divider></el-divider>
      <el-pagination
              background
              :total="total"
              :current-page="queryParams.pageNum"
              :page-size="queryParams.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
      />
    </div>
    </el-card>
    <!-- 添加或修改对话框 -->
    <EditModule ref="editModuleRef" :title="title" @refresh="handleQuery" />
  </div>
</template>

<script lang="ts">
import {
  ref,
  toRefs,
  reactive,
  onMounted,
  getCurrentInstance,
  onUnmounted,
} from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { listProject, delProject, exportProject } from "/@/api/teach/scientific";
import EditModule from "./component/editModule.vue";

// 导出参数，去掉分页相关字段
function buildExportParams(queryParams: any) {
  const { projectName, projectType, projectStatus, principalName } = queryParams;
  return { projectName, projectType, projectStatus, principalName };
}

// 触发浏览器下载 blob 文件
function downloadBlob(blob: any, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export default {
  name: "scientificProject",
  components: { EditModule },
  setup() {
    const { proxy } = getCurrentInstance() as any;
    const editModuleRef = ref();
    const state = reactive({
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [] as number[],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 弹出层标题
      title: "",
      // 表格数据
      tableData: [],
      // 总条数
      total: 0,
      // 项目状态选项（字典）
      projectStatusOptions: [
        { dictValue: "0", dictLabel: "筹备" },
        { dictValue: "1", dictLabel: "进行中" },
        { dictValue: "2", dictLabel: "已完成" },
        { dictValue: "3", dictLabel: "已终止" },
      ],
      // 查询参数
      queryParams: {
        // 页码
        pageNum: 1,
        // 每页大小
        pageSize: 10,
        projectName: undefined,
        projectType: undefined,
        projectStatus: undefined,
        principalName: undefined,
      },
    });

    /** 查询项目列表 */
    const handleQuery = () => {
      console.log('[project.vue] handleQuery 被调用');
      state.loading = true;
      listProject(state.queryParams).then((response: any) => {
        console.log('[project.vue] 接口返回:', response);
        state.tableData = response.data || response.rows || [];
        state.total = response.total || 0;
        state.loading = false;
      });
    };

    /** 重置按钮操作 */
    const resetQuery = () => {
      state.queryParams.projectName = undefined;
      state.queryParams.projectType = undefined;
      state.queryParams.projectStatus = undefined;
      state.queryParams.principalName = undefined;
      handleQuery();
    };

    const handleCurrentChange = (val: number) => {
      state.queryParams.pageNum = val;
      handleQuery();
    };
    const handleSizeChange = (val: number) => {
      state.queryParams.pageSize = val;
      handleQuery();
    };

    // 状态格式化
    const statusFormat = (row: any) => {
      var item = state.projectStatusOptions.find((opt: any) => opt.dictValue === row.projectStatus);
      return item ? item.dictLabel : row.projectStatus;
    };

    // 打开新增项目弹窗
    const onOpenAddModule = (row?: object) => {
      row = {} as any;
      state.title = "添加科研项目";
      editModuleRef.value.openDialog(row);
    };

    // 打开编辑项目弹窗
    const onOpenEditModule = (row: object) => {
      state.title = "修改科研项目";
      editModuleRef.value.openDialog(row);
    };

    /** 删除按钮操作 */
    const onTabelRowDel = (row: any) => {
      var Ids = row.projectId || state.ids;
      var msg = "";

      if (state.ids.length == 0) {
        // 单个删除
        Ids = [row.projectId];
        msg = '是否确认删除项目"' + row.projectName + '"?';
      } else {
        msg = "是否确认删除" + Ids.length + "个项目?";
      }

      ElMessageBox({
        message: msg,
        title: "警告",
        showCancelButton: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(function () {
        return delProject(Ids.toString()).then(() => {
          handleQuery();
          ElMessage.success("删除成功");
        });
      });
    };

    /** 导出按钮操作 */
    const handleExport = () => {
      ElMessageBox.confirm('是否确认导出所有科研项目数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        exportProject(buildExportParams(state.queryParams)).then((response: any) => {
          downloadBlob(response, `科研项目数据_${new Date().getTime()}.xlsx`);
          ElMessage.success('导出成功');
        }).catch((err: any) => {
          console.error('[handleExport] 导出失败:', err);
          ElMessage.error('导出失败，请检查网络或权限');
        });
      }).catch(() => {});
    };

    // 多选框选中数据
    const handleSelectionChange = (selection: any[]) => {
      state.ids = selection.map((item: any) => item.projectId);
      state.single = selection.length != 1;
      state.multiple = !selection.length;
    };

    // 页面加载时
    onMounted(() => {
      // 查询项目列表
      handleQuery();
    });

    return {
      editModuleRef,
      handleSelectionChange,
      handleQuery,
      handleCurrentChange,
      handleSizeChange,
      resetQuery,
      handleExport,
      statusFormat,
      onOpenAddModule,
      onOpenEditModule,
      onTabelRowDel,
      ...toRefs(state),
    };
  },
};
</script>
