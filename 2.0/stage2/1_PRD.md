**Foxu AI4S**  
**产品需求文档（PRD） v2.0**  
**日期**：2026年2月23日  
**版本说明**：v2.0
---

### 1. 产品概述（1页）

**产品定位**  
Foxu AI4S 是一款工业级、多Agent协同的临床研发自动化平台，由5位数字员工组成（4位专业员工 + 1位虚拟SD协调员），帮助CRO/CDMO和biotech将报告交付周期从21天压缩至4天以内，同时100%满足GLP/GCP合规要求。

**核心差异化卖点**  
- GLP专属小模型集群 + 虚拟SD（PicoClaw形态）  
- 两个独立产品线（GLP Studio、GCP Studio），统一平台底层复用  
- 层层递进商业路径：低门槛切入 → 高价值升级 → 企业锁定

**商业化路径**

**GLP Studio 产品线**

| 产品名称 | 包含模块 | 目标部门 | 满足的业务需求 | 产生的核心价值 |
|----------|----------|----------|----------------|---------------|
| **BioLab Core** | Bioanalyst + Writer + QA（18个生物分析模板）<br>仅处理二次数据<br>虚拟SD基础版 | 中小型及头部CRO生物分析部门 | 高频标准化生物分析报告 | 21天→4天交付，加速里程碑回款30-60天，年节省80-150万人力+加班费，3个月内即可看到ROI，是最快建立AI信任的入口 |
| **BioLab Automation** | LIMS/Provantis/Pristima对接 + E2B自主计算 + Protocol & Data Extractor小模型<br>虚拟SD增强版 | 已购买BioLab Core的生物分析部门 | 需要端到端自动化、二次数据零人工处理的部门 | 彻底消除人工二次数据处理，规则提取准确率99.5%+，交付周期再缩短至2-3天，ROI 3-6个月回本（可选按项目/按年/按量收费） |
| **ToxLab Pro** | BioLab Core + Scientist + 毒理学全模板 + ToxPath Reasoner + GLP Compliance Guardian + 虚拟SD完整版 | 毒理/安评部门 | 复杂毒理报告（重复给药、遗传毒性、生殖毒性等）的Discussion & Conclusion自动化 | 解决毒理报告最难最值钱的部分，NOAEL判定准确率95%+，单份报告从30-60天缩短至7-10天，战略级信任建立 |

**GCP Studio 产品线**

| 产品名称 | 包含模块 | 目标部门 | 满足的业务需求 | 产生的核心价值 |
|----------|----------|----------|----------------|---------------|
| **Medical Insights** | 实时TFL生成 + 疗效/安全性简报 + 虚拟SD基础版 | 中小biotech临床决策者 | 老板无法实时掌握临床结果 | 相当于biotech雇佣了一个高级DM，一年20万即可随时查询临床现状 |
| **IND Builder** | IND/NDA资料重整审核 + 临床前资料自动导入 + 监管沟通PPT生成 | 已使用GLP的CRO/Biotech注册部门 | IND申报资料构建耗时长、逻辑矛盾多 | 标准明确、依赖客户少，IND资料从60天→15天 |
| **PV Report Pro** | SAE/SUSAR规范化报告 + 质疑生成 + Argus对比 + deadline提醒 | PV部门 | SAE报告逻辑错误多、提交时间紧 | PV报告从5天→1天，提交deadline零风险 |
| **QA Guardian** | 临床QA稽查 + SOP体系构建 + 文档质量审查 | QA/医学部门 | 临床QA审查工作量大、合规风险高 | QA稽查自动化，体系建设效率提升3倍 |

---

### 2. 目标用户与业务场景（1页）

**主要用户角色**  
- SD/PI（最终审批与决策）  
- 生物分析主管 / Writer（日常操作）  
- 毒理学家（复杂推理审核）  
- QA经理（合规把关）  
- PV专员（安全报告）  
- 平台管理员（AgentOps管理）

**核心业务场景**  
1. 生物分析报告（GLP Studio）  
2. 端到端自动化增值服务（BioLab Automation）  
3. 毒理学报告（ToxLab Pro）  
4. 临床实时监控（Clinical Insights）  
5. IND申报资料构建（IND Builder，GCP Studio高级模块）  
6. PV报告与QA稽查（PV Report Pro / QA Guardian，GCP Studio）

---

### 3. 系统架构（1页）

**技术架构图（文字版）**

```
Next.js 项目工作台
   ↓
n8n（外层可视化编排 + Feature Flags + MinerU 7B OCR预处理）
   ↓
LangGraph微服务（4个Stateful Agent + Pydantic AI结构化输出 + 中央Router）
   ├── Bioanalyst / Writer / Scientist / QA
   ├── Heartbeat Scheduler
   └── Spawn SubAgent Tool
         ↓
PicoClaw 虚拟SD（轻量协调层）
         ↓
OpenViking统一Workspace（PicoClaw风格目录结构）
   ↓
GLP专属小模型集群 + PageIndex + E2B沙箱
   ↓
PostgreSQL（审计日志 + 项目元数据）
```

---

### 4. 核心功能模块（5页）

#### 4.1 项目工作台（7个Tab）
- **概览**：进度环形图 + 虚拟SD今日总结卡片  
- **任务**：Gantt图 + 动态任务列表  
- **交付物**：版本列表 + 工作空间按钮  
- **Issues & Approvals**：Red Flag + 电子签名  

#### 4.2 数字员工（5位）
每个Agent Node全部强制使用**Pydantic AI structured output**。

**新增：Skills开放机制**  
- Enterprise及高级用户可对部分Skills进行**修改、测试、发布**（在AgentOps的Skills管理页面完成）。

#### 4.3 用户与数字员工交互
- 结构化为主  
- 嵌入式聊天加速器（n8n子workflow，收紧版）

#### 4.4 AgentOps中心
- 数字员工档案（含虚拟SD）  
- 小模型版本管理与月度更新记录  
- **Skills管理中心**：用户可浏览、修改、测试、发布自定义Skills（Enterprise功能）

#### 4.5 数据接入与导出
- GLP Studio Core版：仅支持手动上传二次数据  
- BioLab Automation增值服务：自动对接LIMS + E2B计算

---

### 5. 非功能需求（2页）

**性能与成本**  
- 系统优先使用小模型以平衡成本与性能，同时通过智能路由确保业务稳定交付（必要时自动切换大模型）。

**合规与安全**  
- 所有heartbeat/spawn记录强制进入OpenViking + PostgreSQL，不可篡改  
- 用户自定义Skills必须经过虚拟SD审核和Pydantic AI验证后才能生效

**可扩展性**  
- 新增Agent或小模型只需在LangGraph中增加Node和路由规则

---

### 6. 技术实现要点（2页）

**智能路由机制**  
- Core版优先使用小模型  
- 增值服务开通后，Bioanalyst Agent自动开启LIMS/E2B路由  

**虚拟SD融合**  
- 单轻量PicoClaw实例作为协调层  
- 通过HTTP与LangGraph通信  
- 共享OpenViking workspace

**小模型更新管道**  
- 每月LoRA fine-tune，Enterprise客户可使用专属版本

---

### 7. 商业化与分层（1页）

见第1节两个独立表格。

---

### 8. 附录（2页）

**附录A：GLP专属小模型集群详情**  
1. Protocol & Data Extractor  
2. ToxPath Reasoner  
3. GLP Compliance Guardian  

**附录B：典型用户路径**  
GLP Studio（快速上线）→ BioLab Automation增值服务 → GCP Studio Clinical Insights → IND Builder → Foxu AI4S Enterprise  

**附录C：小优化点落地映射**  
1. Tasks动态生成 → LangGraph state  
2. Deliverables状态快照 → LangGraph checkpoint  
3. 嵌入式聊天收紧 → n8n子workflow  
4. AgentOps可视化轨迹 → OpenViking trace渲染  
5. Feature Flags → n8n IF节点  

**附录D：Skills开放机制**  
- Enterprise用户可在AgentOps中对指定Skills进行修改、测试、发布  
- 所有修改需虚拟SD审核，确保合规

