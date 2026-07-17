# Web Admin - AGENTS.md

## 模块概览

- **平台**: Web Admin
- **范围**: Web 后台管理端
- **技术栈**: Vue3 / Vite

## 目录结构

```
apps/web-admin/
├── AGENTS.md                # 本文件
├── build/                   # 构建配置
├── mock/                    # Mock 数据
├── public/                  # 静态资源
├── src/                     # 源代码
│   ├── api/                 # API 请求
│   ├── components/          # 组件
│   ├── hooks/               # 自定义 Hooks
│   ├── layouts/             # 布局组件
│   ├── router/              # 路由配置
│   ├── store/               # 状态管理
│   ├── utils/               # 工具函数
│   ├── views/               # 页面视图
│   └── ...
├── tests/                   # 测试文件
├── types/                   # 类型定义
└── ...                      # 配置文件
```

## 编码规范

待补充。

## 构建命令

```bash
# 开发
pnpm dev --filter=web-admin
npm run dev:web-admin

# 构建
pnpm build --filter=web-admin
npm run build:web-admin
```