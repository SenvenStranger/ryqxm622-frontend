# VueProjectFront 前端

基于 Vue3 + TypeScript + Element Plus + Vite 的科研项目管理前端。

## 主要模块

### 科研项目（核心模块）
- `src/views/projectinfo/index.vue` — 科研项目列表页，支持增删改查、条件筛选、数据导出、分页浏览
- `src/views/projectinfo/component/editModule.vue` — 新增/编辑科研项目对话框
- 页面共 10 列核心数据，不含成员数量、里程碑完成数等关联统计字段
- 后端接口：`SysScientificProjectController`

### 教学管理
- `src/views/teach/scientific/` — 科研相关教学页面
- `src/views/teach/falldowndevice/` — 跌倒设备教学页面

### 设备管理
- `src/views/device/falldowndevice/` — 跌倒设备列表
- `src/views/device/jiaobanzhuang/` — 交班装置管理

### 系统管理（RuoYi 内置）
- `src/views/system/` — 用户、角色、菜单、部门、字典、日志等

### 其他
- `src/views/home/` — 首页
- `src/views/login/` — 登录页
- `src/views/personal/` — 个人中心
- `src/views/demo/` — 示例页面

## 技术栈
- Vue 3 + TypeScript
- Element Plus
- Vite 2
- Axios（API 请求）

## 项目结构
```
src/
├── api/          # 接口请求封装
├── views/        # 页面组件
├── components/   # 通用组件
├── router/       # 路由配置
├── store/        # 状态管理
├── utils/        # 工具函数
└── layout/       # 页面布局框架
```

## 开发说明
```bash
npm install     # 安装依赖
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
```

## 仓库地址
https://github.com/SenvenStranger/ruoyi-teach.git
