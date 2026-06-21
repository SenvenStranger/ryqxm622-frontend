<template>
  <div class="system-menu-container">
    <el-dialog v-model="isShowDialog" width="769px">
      <template #title>
        <div style="font-size: large" v-drag="['.system-menu-container .el-dialog', '.system-menu-container .el-dialog__header']">{{title}}</div>
      </template>
      <el-form
        :model="ruleForm"
        size="small"
        :rules="ruleRules"
        ref="ruleFormRef"
        label-width="80px"
      >
        <el-row :gutter="35">
          <el-col :span="12" class="mb20">
            <el-form-item label="项目名称" prop="PrjName">
              <el-input
                v-model="ruleForm.PrjName"
                placeholder="请输入项目名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" class="mb20">
            <el-form-item label="项目编码" prop="PrjCode">
              <el-input
                v-model="ruleForm.PrjCode"
                placeholder="请输入项目编码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" class="mb20">
            <el-form-item label="项目类型" prop="PrjType">
              <el-input-number
                v-model="ruleForm.PrjType"
                controls-position="right"
                :min="0"
                placeholder="请输入项目类型"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" class="mb20">
            <el-form-item label="项目状态" prop="PrjStatus">
              <el-radio-group v-model="ruleForm.PrjStatus">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                  >{{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" class="mb20">
            <el-form-item label="负责人" prop="Manager">
              <el-input
                v-model="ruleForm.Manager"
                placeholder="请输入负责人"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" class="mb20">
            <el-form-item label="金额" prop="Money">
              <el-input-number
                v-model="ruleForm.Money"
                controls-position="right"
                :min="0"
                placeholder="请输入金额"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" class="mb20">
            <el-form-item label="开始日期" prop="StarDate">
              <el-date-picker
                v-model="ruleForm.StarDate"
                type="date"
                placeholder="请选择开始日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" class="mb20">
            <el-form-item label="结束日期" prop="EndDate">
              <el-date-picker
                v-model="ruleForm.EndDate"
                type="date"
                placeholder="请选择结束日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" class="mb20">
            <el-form-item label="项目描述" prop="PrjDesc">
              <el-input
                v-model="ruleForm.PrjDesc"
                type="textarea"
                placeholder="请输入项目描述"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" class="mb20">
            <el-form-item label="备注" prop="Remark">
              <el-input
                v-model="ruleForm.Remark"
                type="textarea"
                placeholder="请输入备注"
              />
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
import { updateProjectInfo, addProjectInfo } from "/@/api/projectinfo";
import { ElMessage } from "element-plus";

export default {
  name: "editMenu",
  props: {
    // 弹窗标题
    title: {
      type: String,
      default: () => "",
    },
  },
  setup() {
    const { proxy } = getCurrentInstance() as any;
    const ruleFormRef = ref<HTMLElement | null>(null);
    const state = reactive({
      // 是否显示弹出层
      isShowDialog: false,

      // 项目对象
      ruleForm: {
        Id: 0, // ID
        PrjName: "", // 项目名称
        PrjCode: "", // 项目编码
        PrjType: 0, // 项目类型
        PrjStatus: "", // 项目状态
        PrjDesc: "", // 项目描述
        StarDate: "", // 开始日期
        EndDate: "", // 结束日期
        Manager: "", // 负责人
        Money: 0, // 金额
        Remark: "", // 备注
      },
      // 项目状态数据字典
      statusOptions: [],
      // 表单校验
      ruleRules: {
        PrjName: [
          { required: true, message: "项目名称不能为空", trigger: "blur" }
        ],
        PrjCode: [
          { required: true, message: "项目编码不能为空", trigger: "blur" }
        ],
      },
    });
    // 打开弹窗
    const openDialog = (row: any) => {
      if (row.Id && row.Id != undefined && row.Id != "") {
        state.ruleForm = row;
        state.ruleForm.Id = row.Id;
        state.ruleForm.PrjName = row.PrjName;
        state.ruleForm.PrjCode = row.PrjCode;
        state.ruleForm.PrjType = row.PrjType;
        state.ruleForm.PrjStatus = row.PrjStatus;
        state.ruleForm.PrjDesc = row.PrjDesc;
        state.ruleForm.StarDate = row.StarDate;
        state.ruleForm.EndDate = row.EndDate;
        state.ruleForm.Manager = row.Manager;
        state.ruleForm.Money = row.Money;
        state.ruleForm.Remark = row.Remark;
      } else {
        initForm();
      }
      state.isShowDialog = true;

      // 查询状态数据字典
      proxy.getDicts("sys_normal_disable").then((response: any) => {
        state.statusOptions = response.data;
      });
    };

    // 关闭弹窗
    const closeDialog = (row?: object) => {
      proxy.mittBus.emit("onEditProjectModule", row);
      state.isShowDialog = false;
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
            state.ruleForm.Id != undefined &&
            state.ruleForm.Id != 0
          ) {
            updateProjectInfo(state.ruleForm).then((response) => {
              ElMessage.success("修改成功");
              closeDialog(state.ruleForm);
            });
          } else {
            addProjectInfo(state.ruleForm).then((response) => {
              ElMessage.success("新增成功");
              closeDialog(state.ruleForm);
            });
          }
        }
      });
    };
    // 表单初始化
    const initForm = () => {
      state.ruleForm.Id = 0;
      state.ruleForm.PrjName = "";
      state.ruleForm.PrjCode = "";
      state.ruleForm.PrjType = 0;
      state.ruleForm.PrjStatus = "0";
      state.ruleForm.PrjDesc = "";
      state.ruleForm.StarDate = "";
      state.ruleForm.EndDate = "";
      state.ruleForm.Manager = "";
      state.ruleForm.Money = 0;
      state.ruleForm.Remark = "";
    };

    return {
      ruleFormRef,
      openDialog,
      closeDialog,
      onCancel,
      initForm,
      onSubmit,
      ...toRefs(state),
    };
  },
};
</script>
