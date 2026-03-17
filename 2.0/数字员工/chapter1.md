docker exec -it odoo_db odoo shell -d odoo << 'EOF'
user = env['res.users'].search([('login', '=', 'admin')], limit=1)
user.write({'password': 'Cc201819'})
print("✅ 管理员密码已修改为：Cc201819")
EOF


**页1：模块封面**  

**幻灯片可见文字**  
（居中大标题）  
国际主流视角下的数字员工  
定义、演进与2026前沿实践  

（副标题）  
从Agentic AI到企业新同事  

（底部信息栏，右对齐）  
讲师：[Foxu.AI 许可]  
2026年3月  

（右下角金句小字）  
“2026不是AI工具年，而是数字员工元年——国际报告一致预测。”

**讲师讲解稿**  
“各位企业家，大家好！今天我们先把‘数字员工’这个概念彻底讲透。所有内容全部来自IBM、Gartner、McKinsey、Forrester 2026最新报告，没有任何本土化包装。我们先从定义开始，再看演进、辨析，最后落地实践。让我们一起看看，2026年企业的新同事到底长什么样。”

**配图Prompt**（直接复制使用）  
"Create a futuristic Gartner-style tech presentation cover slide, dark blue gradient background (#0A2540 to #00B4D8), abstract human-AI collaboration icon in the center: a stylized glowing human silhouette shaking hands with a transparent digital agent made of light particles and neural networks, floating holographic data flows and code lines connecting them, subtle 3D depth, clean minimalist layout, high-end corporate tech aesthetic, ultra sharp, 16:9 aspect ratio, no text on image"

---

**页2：国际主流核心定义（IBM + Forrester）**  

**幻灯片可见文字**  
IBM官方定义  
Digital Worker = “software-based labor that independently runs meaningful parts of complex end-to-end processes using AI capabilities (ML, CV, NLP)”  

Forrester补充  
智能自动化组合（RPA + 对话AI）  
→ 与人类同事并肩工作  
→ 理解意图、响应问题、代为行动  
→ 人类始终保留最终控制权  

**讲师讲解稿**  
“先看IBM的定义：数字员工是‘基于软件的劳动力’，它能独立运行复杂端到端的业务流程，使用机器学习、计算机视觉、自然语言处理等AI能力。Forrester进一步强调，它不是孤立的机器人，而是真正和人类同事并肩工作的伙伴——它理解你的意图、帮你行动，但最终决定权永远在人类手里。这两家定义是全球企业采购数字员工时的黄金标准。”

**配图Prompt**  
"Professional presentation slide visual: large clean IBM and Forrester quote boxes on dark blue background, left side IBM logo stylized with glowing blue quote 'software-based labor...' in modern sans-serif font, right side Forrester icon with human-AI handshake illustration, subtle neural network patterns in background, high contrast white text, corporate tech style, 16:9"

---

**页3：国际主流核心定义（McKinsey + Gartner）**  

**幻灯片可见文字**  
McKinsey定义  
digital workforce = humans + automated agents的协作生态  

Gartner定义  
Agentic AI驱动的自主系统  
→ 能感知环境  
→ 自主规划目标  
→ 执行复杂任务  

2026核心共识：  
数字员工 = Agentic AI在企业中的具象化

**讲师讲解稿**  
“McKinsey把数字员工放在更大格局里：它不是单个工具，而是一个‘人类 + 自动化Agent’组成的协作生态。Gartner则直接点明底层技术——Agentic AI，也就是能自主感知、规划、执行目标的系统。2026年全球报告达成一致：数字员工就是Agentic AI在企业落地后的真实样子。”

**配图Prompt**  
"Gartner-style slide visual: McKinsey and Gartner definitions side by side, left McKinsey ecosystem diagram showing human figures connected to multiple glowing AI agents in a network, right Gartner Agentic AI cycle icon (perceive → plan → act → reflect), dark blue tech background with subtle data particles, clean modern typography, 16:9 aspect ratio"

---

**页4：一句话总结定义 + 与传统软件区别**  

**幻灯片可见文字**  
一句话总结定义  
数字员工不是工具，而是企业的新同事——  
它执行端到端流程，却始终与人类协同（IBM & Forrester 2026）  

与传统软件的本质区别  
传统软件：你告诉它“怎么做”  
数字员工：你告诉它“要达成什么目标”，它自己想办法完成  

（下方4个能力图标横排）  
感知环境　自主规划　执行任务　长期记忆

**讲师讲解稿**  
“总结成一句话：数字员工不是工具，而是企业的新同事。它能完整执行端到端的业务流程，但永远和人类协同工作。这和传统软件完全不同——传统软件你要一步步教它怎么做，而数字员工你只要告诉它目标，它自己会规划、执行、反思。这四个能力图标，就是2026数字员工区别于一切旧技术的核心。”

**配图Prompt**  
"Clean summary slide visual: large central quote in white '数字员工不是工具，而是企业的新同事' with English translation below, four glowing capability icons in a row (eye for perceive, brain for plan, hand for execute, memory chip for memory), dark blue gradient background, subtle human-AI silhouette in background, Gartner corporate style, ultra sharp, 16:9"
