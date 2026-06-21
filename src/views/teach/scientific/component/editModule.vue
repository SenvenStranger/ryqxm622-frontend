<template>
  <div class="scientific-project-edit-container">
    <el-dialog v-model="isShowDialog" width="769px">
      <template #title>
        <div style="font-size: large" v-drag="['.scientific-project-edit-container .el-dialog', '.scientific-project-edit-container .el-dialog__header']">{{ title }}</div>
      </template>
      <el-form
        :model="ruleForm"
        size="small"
        :rules="ruleRules"
        ref="ruleFormRef"
        label-width="100px"
      >
        <el-row :gutter="35">
          <el-col :span="12" class="mb20">
            <el-form-item label="项目编号" prop="projectCode">
              <el-input v-model="ruleForm.projectCode" placeholder="请输入项目编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12" class="mb20">
            <el-form-item label="项目名称" prop="projectName">
              <el-input v-model="ruleForm.projectName" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="35">
          <el-col :span="12" class="mb20">
            <el-form-item label="项目类型" prop="projectType">
              <el-select v-model="ruleForm.projectType" placeholder="请选择项目类型" style="width: 100%">
                <el-option label="国家级" value="国家级" />
                <el-option label="省部级" value="省部级" />
                <el-option label="厅局级" value="厅局级" />
                <el-option label="校级" value="校级" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" class="mb20">
            <el-form-item label="项目级别" prop="projectLevel">
              <el-select v-model="ruleForm.projectLevel" placeholder="请选择项目级别" style="width: 100%">
                <el-option label="重点" value="重点" />
                <el-option label="一般" value="一般" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="35">
          <el-col :span="12" class="mb20">
            <el-form-item label="学科分类" prop="subjectCategory">
              <el-input v-model="ruleForm.subjectCategory" placeholder="请输入学科分类" />
            </el-form-item>
          </el-col>
          <el-col :span="12" class="mb20">
            <el-form-item label="项目来源" prop="sourceFrom">
              <el-input v-model="ruleForm.sourceFrom" placeholder="请输入项目来源" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="35">
          <el-col :span="12" class="mb20">
            <el-form-item label="资助金额(万)" prop="fundingAmount">
              <el-input-number v-model="ruleForm.fundingAmount" :min="0" :precision="2" style="width: 100%" placeholder="万元" />
            </el-form-item>
          </el-col>
          <el-col :span="12" class="mb20">
            <el-form-item label="项目状态" prop="projectStatus">
              <el-select v-model="ruleForm.projectStatus" placeholder="请选择状态" style="width: 100%">
                <el-option label="筹备" value="0" />
                <el-option label="进行中" value="1" />
                <el-option label="已完成" value="2" />
                <el-option label="已终止" value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="35">
          <el-col :span="12" class="mb20">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker v-model="ruleForm.startDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12" class="mb20">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker v-model="ruleForm.endDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="35">
          <el-col :span="12" class="mb20">
            <el-form-item label="负责人" prop="principalName">
              <el-input v-model="ruleForm.principalName" placeholder="请输入负责人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12" class="mb20">
            <el-form-item label="联系电话" prop="principalPhone">
              <el-input v-model="ruleForm.principalPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="35">
          <el-col :span="24" class="mb20">
            <el-form-item label="研究方向" prop="researchDirection">
              <el-input v-model="ruleForm.researchDirection" placeholder="请输入研究方向" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="35">
          <el-col :span="24" class="mb20">
            <el-form-item label="项目简介" prop="projectIntro">
              <el-input v-model="ruleForm.projectIntro" type="textarea" :rows="3" placeholder="请输入项目简介" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="35">
          <el-col :span="24" class="mb20">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="ruleForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onCancel" size="small">取 消</el-button>
          <el-button type="primary" @click="onSubmit" size="small"
            >编 辑</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, ref, unref, getCurrentInstance } from "vue";
import { updateProject, addProject } from "/@/api/teach/scientific";
import { ElMessage } from "element-plus";

export default {
  name: "editScientificProject",
  emits: ["refresh"],
  props: {
    // 弹窗标题
    title: {
      type: String,
      default: () => "",
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance() as any;
    const ruleFormRef = ref<HTMLElement | null>(null);
    const state = reactive({
      // 是否显示弹出层
      isShowDialog: false,

      // 项目表单对象
      ruleForm: {
        projectId: undefined as number | undefined,
        projectCode: "",
        projectName: "",
        projectType: "",
        projectLevel: "",
        subjectCategory: "",
        sourceFrom: "",
        fundingAmount: undefined as number | undefined,
        startDate: "",
        endDate: "",
        projectStatus: "0",
        principalName: "",
        principalPhone: "",
        principalEmail: "",
        researchDirection: "",
        projectIntro: "",
        objectives: "",
        methods: "",
        innovations: "",
        remark: "",
      },
      // 表单校验规则
      ruleRules: {
        projectCode: [{ required: true, message: "项目编号不能为空", trigger: "blur" }],
        projectName: [{ required: true, message: "项目名称不能为空", trigger: "blur" }],
        projectType: [{ required: true, message: "项目类型不能为空", trigger: "change" }],
        principalName: [{ required: true, message: "负责人不能为空", trigger: "blur" }],
      },
    });

    // 打开弹窗
    const openDialog = (row: any) => {
      if (row.projectId && row.projectId != undefined && row.projectId != "") {
        // 编辑模式：填充数据
        state.ruleForm = { ...initFormData(), ...row };
      } else {
        // 新增模式：初始化表单
        initForm();
      }
      state.isShowDialog = true;
    };

    // 关闭弹窗
    const closeDialog = (row?: object) => {
      console.log('[editModule] closeDialog 调用，准备 emit refresh');
      state.isShowDialog = false;
      // 用 emit 通知父组件刷新，替代 mittBus
      setTimeout(() => {
        console.log('[editModule] emit refresh');
        emit("refresh");
      }, 100);
    };

    // 取消
    const onCancel = () => {
      closeDialog();
    };

    // 保存
    const onSubmit = () => {
      const formWrap = unref(ruleFormRef) as any;
      if (!formWrap) return;
      formWrap.validate((valid: boolean) => {
        if (valid) {
          if (
            state.ruleForm.projectId != undefined &&
            state.ruleForm.projectId != 0
          ) {
            updateProject(state.ruleForm).then(() => {
              ElMessage.success("修改成功");
              closeDialog(state.ruleForm);
            }).catch((err: any) => {
              console.error('[editModule] 修改项目失败:', err);
              ElMessage.error('修改失败，请检查数据或网络连接');
            });
          } else {
            addProject(state.ruleForm).then(() => {
              ElMessage.success("新增成功");
              closeDialog(state.ruleForm);
            }).catch((err: any) => {
              console.error('[editModule] 新增项目失败:', err);
              ElMessage.error('新增失败，请检查数据或网络连接');
            });
          }
        }
      });
    };

    // 默认初始数据
    const initFormData = () => ({
      projectId: undefined,
      projectCode: "",
      projectName: "",
      projectType: "",
      projectLevel: "",
      subjectCategory: "",
      sourceFrom: "",
      fundingAmount: undefined,
      startDate: "",
      endDate: "",
      projectStatus: "0",
      principalName: "",
      principalPhone: "",
      principalEmail: "",
      researchDirection: "",
      projectIntro: "",
      objectives: "",
      methods: "",
      innovations: "",
      remark: "",
    });

    // 表单初始化
    const initForm = () => {
      state.ruleForm = initFormData();
    };

    return {
      ruleFormRef,
      openDialog,
      closeDialog,
      onCancel,
      onSubmit,
      ...toRefs(state),
    };
  },
};
</script>

<style scoped>
.mb20 {
  margin-bottom: 18px;
}
</style>
