# GLP-Intelligence Suite 前端实现技术方案

> 本文档基于 `design` 目录下的设计文档，制定 GLP-Intelligence Suite 前端的工程化落地与技术实现方案。

## 1. 技术选型 (Tech Stack)

鉴于项目已基于 **React 19** 初始化，我们将充分利用 React 的生态与并发特性（Concurrent Features）来实现高性能交互。

*   **构建工具**: `Vite` - 极速冷启动与热更新。
*   **前端框架**: `React 19` - 利用 Hooks 与 Server Components (未来预留) 组织逻辑。
*   **路由管理**: `Wouter` 或 `React Router` (视当前依赖而定，目前假设轻量级方案). *校正：将引入 `react-router-dom` 或沿用现有结构*.
*   **状态管理**: `React Context + useReducer` - 管理 P1-P4 的复杂状态流转；对于全局状态（如 User Session），使用 Context。
*   **样式方案**: `Vanilla CSS (Variables + Scoped)` - **核心决策**。
    *   为了实现 Design 文档中要求的 "Premium Design" 与 "Rich Aesthetics"，不使用 TailwindCSS，而是建立语义化的 CSS 变量系统（Design Tokens）。
    *   利用 CSS Modules 或 Scoped CSS ID 隔离样式。
*   **可视化辅助**: 
    *   `IntersectionObserver API` - 实现单元格详情页的“垂直流式”导航监听。

## 2. 工程目录结构 (Directory Structure)

```bash
sci_report/src
├── assets/             # 静态资源
├── components/         # 公共组件
│   ├── common/         # 基础UI (Button, Modal, Toast)
│   ├── business/       # 业务组件
│   │   ├── Swimlane/   # 任务泳道组件
│   │   ├── CellCard/   # 任务单元格卡片
│   │   └── FlowPanel/  # P1-P4 折叠面板
├── views/ (or pages/)
│   ├── Homepage/       # 首页
│   │   ├── Wizard/     # 新建专题向导
│   │   └── Dashboard/  # 生产力看板
│   ├── ControlCenter/  # 任务控制中心
│   │   ├── Inventory/  # 左侧：原材料感知区
│   │   └── Matrix/     # 右侧：任务矩阵
│   └── CellDetail/     # 单元格详情页
├── contexts/           # 全局状态 Context (StudyContext, UIContext)
├── services/           # API 接口层
│   ├── mock/           # Mock 数据
│   └── api.ts
├── utils/              # 工具库
├── styles/             # 全局样式
│   ├── variables.css   # Design Tokens
│   └── transitions.css # 过渡动画
├── App.tsx
└── main.tsx
```

## 3. 核心功能模块实现策略

### 3.1 首页：新建向导与模拟沙箱 (Homepage)

*   **Wizard 实现**:
    *   采用 **Compound Component** 或 **State Funnel** 模式。使用 `useWizard` hook 管理步骤状态。
*   **Demo Mode (模拟沙箱)**:
    *   引入 `MockAdapter` 模式。

### 3.2 任务控制中心：泳道矩阵 (Control Center)

*   **泳道折叠 (Swimlane Folding)**:
    *   使用 CSS Grid 布局。
    *   状态结构：
        ```typescript
        interface Section {
          id: string;
          title: string;
          isCollapsed: boolean;
          children: Task[];
        }
        ```
*   **例外管理 (Management by Exception)**:
    *   利用 `useMemo` 动态计算“可批处理”的任务集合。

### 3.3 单元格详情页：垂直流式交互 (Cell Detail)

*   **渐进式展开 (Progressive Discloure)**:
    *   维护一个 `flowStage` 状态 (`P1` | `P2` | `P3` | `P4`)。
    *   **自动滚动**: 使用 `useRef` 获取 DOM 节点，配合 `scrollIntoView`。
*   **P3 智能对比 (Smart Diff)**:
    *   实现简单的 Diff 算法，对比 P2 facts 与 P3 content。

## 4. UI/UX 设计规范落地

遵循 "Premium & Dynamic" 原则：

*   **色彩体系**: 使用 HSL 颜色模式。
*   **微交互 (Micro-animations)**:
    *   使用 CSS Transitions。

## 5. 数据契约对接

严格遵循 `docs/design/生分报告数据契约JSON示例.md`。

## 6. 后续开发计划

1.  **Phase 1**: 完善目录结构，定义 CSS 变量，实现 Mock Service。
2.  **Phase 2**: 实现“单元格详情页” (CellDetail) 核心流式交互。
3.  **Phase 3**: 实现任务控制中心。
4.  **Phase 4**: 首页与集成。


---

**备注**: 请在 `src` 目录下初始化 Vite 项目，并参照上述目录结构创建文件。
