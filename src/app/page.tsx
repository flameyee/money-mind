"use client";

import { useState } from "react";

type Step = "intro" | "skills" | "interests" | "resources" | "analyzing" | "result" | "detail";

interface Direction {
  id: number;
  name: string;
  why: string;
  how: string;
  priority: string;
  details: string;
}

// 解析 AI 返回的内容
function parseResult(text: string): Direction[] {
  const directions: Direction[] = [];
  const lines = text.split('\n');
  
  let current: Partial<Direction> = { details: "" };
  let currentContent: string[] = [];
  
  // 尝试按"方向"分割
  const sections = text.split(/(?:^|\n)(?:#{1,3}\s*|第[一二三四五]\s*|方向\s*\d+\s*[：:])\s*/);
  
  // 简单的分段解析
  let id = 1;
  let name = "";
  let why = "";
  let how = "";
  let priority = "中";
  let details = "";
  
  const lines2 = text.split('\n');
  let currentSection = "";
  
  for (let i = 0; i < lines2.length; i++) {
    const line = lines2[i].trim();
    if (!line) continue;
    
    // 检测新方向
    if (line.match(/^#{1,3}\s*|^\d+[.、]\s*方向|^方向[：:]/)) {
      if (name) {
        directions.push({ id, name, why, how, priority, details: details || why + "\n" + how });
      }
      id++;
      name = line.replace(/^#{1,3}\s*|\d+[.、]\s*方向[：:]\s*/g, "").trim();
      why = ""; how = ""; priority = "中"; details = "";
    } else if (line.match(/为什么|适合|原因/) && !why) {
      why = line.replace(/.*[为什么适合原因：:]\s*/g, "").trim();
    } else if (line.match(/起步|如何|第一步/) && !how) {
      how = line.replace(/.*[起步如何第一步：:]\s*/g, "").trim();
    } else if (line.match(/优先/) && !priority.match(/高|中|低/)) {
      const p = line.match(/高|中|低/)?.[0];
      if (p) priority = p;
    } else if (name && !line.startsWith("#") && !line.match(/^小结|^===|^---/)) {
      details += line + "\n";
    }
  }
  
  // 加入最后一个
  if (name) {
    directions.push({ id, name, why, how, priority, details: details || why + "\n" + how });
  }
  
  // 如果解析失败，创建默认
  if (directions.length === 0) {
    return [{
      id: 1,
      name: "AI 赚钱建议",
      why: "基于你的背景分析",
      how: "查看下方详细方案",
      priority: "中",
      details: text
    }];
  }
  
  return directions;
}

// 方向卡片组件
function DirectionCard({ dir, onClick }: { dir: Direction; onClick: () => void }) {
  const priorityConfig: Record<string, { bg: string; text: string; label: string }> = {
    '高': { bg: 'from-red-500/20 to-red-600/20', text: 'text-red-400', label: '⭐ 高优先' },
    '中': { bg: 'from-yellow-500/20 to-yellow-600/20', text: 'text-yellow-400', label: '✨ 中等' },
    '低': { bg: 'from-green-500/20 to-green-600/20', text: 'text-green-400', label: '📌 长期' },
  };
  
  const config = priorityConfig[dir.priority] || priorityConfig['中'];
  const emojis = ['🎯', '💡', '🚀', '📈', '💰', '🤖', '📚', '🎨'];
  const emoji = emojis[dir.id % emojis.length];
  
  return (
    <button 
      onClick={onClick}
      className={`w-full bg-gradient-to-br ${config.bg} backdrop-blur rounded-2xl p-6 border border-white/10 text-left hover:scale-[1.02] transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{emoji}</span>
          <div>
            <h3 className="text-xl font-bold text-white">{dir.name}</h3>
            <p className="text-purple-300 text-sm mt-1">点击查看详细方案 →</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${config.text} bg-white/10`}>
          {config.label}
        </span>
      </div>
    </button>
  );
}

// AI 技能推荐 (参考 ClawHub 13000+ 技能)
const skillRecommendations: Record<string, { name: string; desc: string; icon: string; category: string; howItHelps: string }[]> = {
  "AI": [
    { name: "tavily-search", desc: "AI 搜索引擎", icon: "🔍", category: "研究", howItHelps: "帮你搜索行业最新趋势、市场动态、技术资讯" },
    { name: "summarize", desc: "内容总结工具", icon: "📝", category: "效率", howItHelps: "把长文章、报告、会议记录浓缩成要点" },
    { name: "coding-agent", desc: "编程助手", icon: "💻", category: "开发", howItHelps: "写代码、改 bug、帮你开发 AI 产品" },
    { name: "gog", desc: "Google 工作区", icon: "📧", category: "效率", howItHelps: "管理 Gmail、Google Calendar、文档，一站式" },
    { name: "agent-browser", desc: "浏览器自动化", icon: "🌐", category: "自动化", howItHelps: "自动填写表单、采集数据、操作网页" },
    { name: "mission-control", desc: "任务管理中心", icon: "🎯", category: "效率", howItHelps: "每天早上汇总待办事项、日程、通知" },
    { name: "elevenlabs-agent", desc: "语音合成", icon: "🎤", category: "创作", howItHelps: "文字转语音，做有声内容、语音助手" },
    { name: "n8n-workflow", desc: "自动化工作流", icon: "⚙️", category: "自动化", howItHelps: "连接各个平台，自动处理重复工作" },
  ],
  "编程": [
    { name: "coding-agent", desc: "编程助手", icon: "💻", category: "开发", howItHelps: "写代码、改 bug、Code Review、解释代码" },
    { name: "gh-issues", desc: "GitHub 工具", icon: "🐙", category: "开发", howItHelps: "管理代码仓库、Issue、PR、自动化部署" },
    { name: "agent-browser", desc: "浏览器自动化", icon: "🌐", category: "自动化", howItHelps: "自动测试 UI、采集数据、填表" },
    { name: "gog", desc: "Google 工作区", icon: "📧", category: "效率", howItHelps: "写文档、安排会议、管理项目文档" },
    { name: "summarize", desc: "内容总结", icon: "📝", category: "效率", howItHelps: "写技术文档、API 说明、代码注释" },
    { name: "tavily-search", desc: "AI 搜索", icon: "🔍", category: "研究", howItHelps: "查技术文档、解决方案、最佳实践" },
    { name: "mission-control", desc: "任务管理", icon: "🎯", category: "效率", howItHelps: "管理开发任务、追踪进度" },
    { name: "capability-evolver", desc: "能力进化", icon: "🧬", category: "开发", howItHelps: "让 AI 自动优化自己的工作方式" },
  ],
  "内容": [
    { name: "summarize", desc: "内容总结", icon: "📝", category: "效率", howItHelps: "写文章摘要、提炼要点、辅助写作" },
    { name: "tavily-search", desc: "AI 搜索", icon: "🔍", category: "研究", howItHelps: "找素材、研究热点、收集资料" },
    { name: "elevenlabs-agent", desc: "语音合成", icon: "🎤", category: "创作", howItHelps: "做播客、有声书、视频配音" },
    { name: "videoagent-video-studio", desc: "AI 视频生成", icon: "🎬", category: "创作", howItHelps: "文字转视频，做内容更快" },
    { name: "agent-browser", desc: "浏览器自动化", icon: "🌐", category: "自动化", howItHelps: "自动发布内容到各平台、采集数据" },
    { name: "gog", desc: "Google 工作区", icon: "📧", category: "效率", howItHelps: "管理内容排程、协作写作" },
    { name: "mission-control", desc: "任务管理", icon: "🎯", category: "效率", howItHelps: "规划内容日历、追踪发布进度" },
    { name: "n8n-workflow", desc: "自动化", icon: "⚙️", category: "自动化", howItHelps: "自动分发内容到各平台" },
  ],
  "写作": [
    { name: "summarize", desc: "内容总结", icon: "📝", category: "效率", howItHelps: "辅助写作、语法检查、内容润色" },
    { name: "tavily-search", desc: "AI 搜索", icon: "🔍", category: "研究", howItHelps: "研究主题、找参考资料" },
    { name: "gog", desc: "Google 工作区", icon: "📧", category: "效率", howItHelps: "在 Google Docs 协作写作" },
    { name: "elevenlabs-agent", desc: "语音合成", icon: "🎤", category: "创作", howItHelps: "把文章转成语音、有声书" },
    { name: "agent-browser", desc: "浏览器自动化", icon: "🌐", category: "自动化", howItHelps: "自动发布文章到博客、平台" },
    { name: "mission-control", desc: "任务管理", icon: "🎯", category: "效率", howItHelps: "追踪写作进度、设定截稿日" },
    { name: "coding-agent", desc: "编程助手", icon: "💻", category: "开发", howItHelps: "写写作工具、自动化脚本" },
    { name: "n8n-workflow", desc: "自动化", icon: "⚙️", category: "自动化", howItHelps: "自动发布、定时推送" },
  ],
  "视频": [
    { name: "videoagent-video-studio", desc: "AI 视频生成", icon: "🎬", category: "创作", howItHelps: "文字转视频，生成短片" },
    { name: "summarize", desc: "内容总结", icon: "📝", category: "效率", howItHelps: "写视频脚本、描述、标题" },
    { name: "elevenlabs-agent", desc: "语音合成", icon: "🎤", category: "创作", howItHelps: "AI 配音、多种语言转语音" },
    { name: "tavily-search", desc: "AI 搜索", icon: "🔍", category: "研究", howItHelps: "研究热门话题、找创意素材" },
    { name: "agent-browser", desc: "浏览器自动化", icon: "🌐", category: "自动化", howItHelps: "自动上传视频、采集数据" },
    { name: "gog", desc: "Google 工作区", icon: "📧", category: "效率", howItHelps: "管理视频文案、协作" },
    { name: "mission-control", desc: "任务管理", icon: "🎯", category: "效率", howItHelps: "规划视频制作进度" },
    { name: "n8n-workflow", desc: "自动化", icon: "⚙️", category: "自动化", howItHelps: "自动发布、字幕生成" },
  ],
  "电商": [
    { name: "tavily-search", desc: "AI 搜索", icon: "🔍", category: "研究", howItHelps: "市场调查、竞品分析、趋势研究" },
    { name: "agent-browser", desc: "浏览器自动化", icon: "🌐", category: "自动化", howItHelps: "自动处理订单、上架商品、客服回复" },
    { name: "gog", desc: "Google 工作区", icon: "📧", category: "效率", howItHelps: "管理客户表單、销售数据" },
    { name: "summarize", desc: "内容总结", icon: "📝", category: "效率", howItHelps: "写产品描述、客服话术" },
    { name: "n8n-workflow", desc: "自动化", icon: "⚙️", category: "自动化", howItHelps: "订单处理、库存同步、通知提醒" },
    { name: "mission-control", desc: "任务管理", icon: "🎯", category: "效率", howItHelps: "追踪订单、处理进度" },
    { name: "coding-agent", desc: "编程助手", icon: "💻", category: "开发", howItHelps: "开发电商小工具、自动化脚本" },
    { name: "capability-evolver", desc: "能力进化", icon: "🧬", category: "开发", howItHelps: "让 AI 优化电商运营流程" },
  ],
  "默认": [
    { name: "tavily-search", desc: "AI 搜索", icon: "🔍", category: "研究", howItHelps: "研究任何你感兴趣的话题" },
    { name: "summarize", desc: "内容总结", icon: "📝", category: "效率", howItHelps: "总结长内容、辅助决策" },
    { name: "gog", desc: "Google 工作区", icon: "📧", category: "效率", howItHelps: "一站式管理邮件、日历、文档" },
    { name: "mission-control", desc: "任务管理", icon: "🎯", category: "效率", howItHelps: "每天汇总任务和日程" },
    { name: "coding-agent", desc: "编程助手", icon: "💻", category: "开发", howItHelps: "帮你写代码、做项目" },
    { name: "agent-browser", desc: "浏览器自动化", icon: "🌐", category: "自动化", howItHelps: "自动操作网页、采集数据" },
    { name: "n8n-workflow", desc: "自动化", icon: "⚙️", category: "自动化", howItHelps: "连接各平台，自动化工作流" },
    { name: "elevenlabs-agent", desc: "语音合成", icon: "🎤", category: "创作", howItHelps: "文字转语音，多种应用" },
  ],
};

function getRecommendedSkills(directionName: string) {
  for (const [key, skills] of Object.entries(skillRecommendations)) {
    if (directionName.includes(key)) return skills;
  }
  return skillRecommendations["默认"];
}

// 详情页面
function DetailView({ dir, onBack }: { dir: Direction; onBack: () => void }) {
  const [showDetails, setShowDetails] = useState(false);
  const recommendedSkills = getRecommendedSkills(dir.name);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        
        <div className="bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl">{'🎯💡🚀📈💰'[dir.id % 5]}</span>
            <div>
              <h1 className="text-2xl font-bold text-white">{dir.name}</h1>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 ${
                dir.priority === '高' ? 'bg-red-500/20 text-red-400' :
                dir.priority === '中' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {dir.priority === '高' ? '⭐ 高优先' : dir.priority === '中' ? '✨ 中等' : '📌 长期'}
              </span>
            </div>
          </div>
          
          <div className="space-y-6">
            {dir.why && (
              <div className="bg-purple-500/10 rounded-2xl p-5 border border-purple-500/20">
                <h3 className="text-purple-300 font-bold mb-3 flex items-center gap-2">
                  <span>✓</span> 为什么适合你
                </h3>
                <p className="text-purple-100 leading-relaxed">{dir.why}</p>
              </div>
            )}
            
            {dir.how && (
              <div className="bg-yellow-500/10 rounded-2xl p-5 border border-yellow-500/20">
                <h3 className="text-yellow-300 font-bold mb-3 flex items-center gap-2">
                  <span>⚡</span> 如何起步（第一步）
                </h3>
                <p className="text-yellow-100 leading-relaxed">{dir.how}</p>
              </div>
            )}
            
            <div className="bg-blue-500/10 rounded-2xl p-5 border border-blue-500/20">
              <h3 className="text-blue-300 font-bold mb-3 flex items-center gap-2">
                <span>📋</span> 详细方案
              </h3>
              <div className="text-blue-100 leading-relaxed whitespace-pre-wrap">
                {dir.details || "请根据上述建议开始行动。如果需要更详细的指导，可以联系获取付费咨询。"}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold py-4 rounded-2xl text-lg"
            >
              {showDetails ? "收起详细方案 ▲" : "获取更详细指导 💬"}
            </button>
            
            {/* 展开的详细方案 */}
            {showDetails && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                {/* 执行步骤 */}
                <div className="bg-green-500/10 rounded-2xl p-5 border border-green-500/20">
                  <h3 className="text-green-300 font-bold mb-3 flex items-center gap-2">
                    <span>📝</span> 具体执行步骤
                  </h3>
                  <ol className="text-green-100 space-y-2 text-sm">
                    <li><span className="font-bold">1.</span> 确定细分方向（如：AI 客服 / AI 写作助手）</li>
                    <li><span className="font-bold">2.</span> 制作 1-2 个成功案例（Demo）</li>
                    <li><span className="font-bold">3.</span> 在以下平台发布服务：</li>
                    <ul className="ml-4 text-green-200 text-xs space-y-1">
                      <li>• <strong>Malaysia</strong>: LowYat、Shopee 卖家中心、Tradespace</li>
                      <li>• <strong>全球</strong>: Upwork、Freelancer.com、Fiverr</li>
                      <li>• <strong>社交</strong>: Facebook Marketplace、LinkedIn</li>
                    </ul>
                    <li><span className="font-bold">4.</span> 定价 RM200-800/项目或 $50-200/USD，逐步涨价</li>
                    <li><span className="font-bold">5.</span> 收集客户评价，循环获客</li>
                  </ol>
                </div>
                
                {/* 🧑‍💼 让我们帮你搭建 */}
                <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl p-5 border border-indigo-500/30">
                  <h3 className="text-indigo-300 font-bold mb-3 flex items-center gap-2">
                    <span>🤖</span> 让我们帮你搭建 AI 顾问
                  </h3>
                  <p className="text-indigo-200 text-sm mb-4">
                    不懂技术？我们帮你搭建专属的 AI 助手，直接可用！
                  </p>
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <div className="text-white font-semibold mb-2">✨ 搭建你的 AI 顾问</div>
                    <ul className="text-indigo-100 text-sm space-y-1">
                      <li>• 根据你的业务需求定制 AI 工具</li>
                      <li>• 帮你部署上线，在 Telegram/WhatsApp 直接使用</li>
                      <li>• 后续维护和更新支持</li>
                    </ul>
                  </div>
                  <a 
                    href="https://t.me/flameyee" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>💬</span> 点击联系：@flameyee
                  </a>
                  <p className="text-center text-indigo-300 text-xs mt-2">
                    工作时间：周一至周五 9AM-6PM MYT
                  </p>
                </div>
                
                {/* AI 技能推荐 */}
                <div className="bg-cyan-500/10 rounded-2xl p-5 border border-cyan-500/20">
                  <h3 className="text-cyan-300 font-bold mb-3 flex items-center gap-2">
                    <span>🤖</span> 推荐安装的 AI 技能
                  </h3>
                  <p className="text-cyan-200 text-sm mb-4">
                    这些技能可以帮助你更快完成对应方向的工作：
                  </p>
                  <div className="space-y-3">
                    {recommendedSkills.map((skill, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{skill.icon}</span>
                          <div className="flex-1">
                            <div className="text-white font-semibold flex items-center gap-2">
                              {skill.name}
                              <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">{skill.category}</span>
                            </div>
                            <div className="text-cyan-300 text-sm">{skill.desc}</div>
                          </div>
                        </div>
                        <div className="bg-cyan-500/10 rounded-lg p-2 text-xs text-cyan-200">
                          💡 能帮你：{skill.howItHelps}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-cyan-500/20">
                    <p className="text-cyan-200 text-sm">
                      💡 安装命令：<code className="bg-cyan-500/20 px-2 py-1 rounded">npx skills add {recommendedSkills[0]?.name}</code>
                    </p>
                  </div>
                </div>
                
                {/* 工具推荐 */}
                <div className="bg-purple-500/10 rounded-2xl p-5 border border-purple-500/20">
                  <h3 className="text-purple-300 font-bold mb-3 flex items-center gap-2">
                    <span>🛠️</span> 推荐工具
                  </h3>
                  <ul className="text-purple-100 text-sm space-y-2">
                    <li>• <strong>Next.js</strong> - 快速搭建 Web 应用</li>
                    <li>• <strong>Vercel</strong> - 免费托管部署</li>
                    <li>• <strong>OpenRouter</strong> - 聚合 AI API (免费额度)</li>
                    <li>• <strong>Stripe</strong> - 接受付款</li>
                  </ul>
                </div>
              </div>
            )}
            
            <button onClick={onBack} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all">
              ← 返回全部方向
            </button>
          </div>
        </div>
        
        <div className="mt-6 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4">
          <p className="text-yellow-300 text-sm text-center">
            ⚠️ 这是 AI 建议，请自行评估风险后再做决定
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("intro");
  const [formData, setFormData] = useState({ skills: "", interests: "", resources: "" });
  const [result, setResult] = useState("");
  const [directions, setDirections] = useState<Direction[]>([]);
  const [selectedDir, setSelectedDir] = useState<Direction | null>(null);
  const [error, setError] = useState("");

  const handleNext = () => {
    if (step === "skills") setStep("interests");
    else if (step === "interests") setStep("resources");
    else if (step === "resources") {
      setStep("analyzing");
      submitForm();
    }
  };

  const submitForm = async () => {
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "出错了"); return; }
      setResult(data.result);
      setDirections(parseResult(data.result));
      setStep("result");
    } catch (err) { setError("网络错误"); }
  };

  const reset = () => {
    setStep("intro");
    setFormData({ skills: "", interests: "", resources: "" });
    setResult("");
    setDirections([]);
    setSelectedDir(null);
    setError("");
  };

  // 详情页
  if (step === "detail" && selectedDir) {
    return <DetailView dir={selectedDir} onBack={() => setStep("result")} />;
  }

  // Intro
  if (step === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg text-center">
          <div className="text-6xl mb-6">💰</div>
          <h1 className="text-4xl font-bold text-white mb-4">MoneyMind</h1>
          <p className="text-xl text-purple-200 mb-8">AI 赚钱顾问 · 发现你的财富方向</p>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-white font-semibold mb-4">为什么选择 MoneyMind？</h3>
            <ul className="space-y-3 text-purple-100">
              <li className="flex items-start gap-3"><span className="text-2xl">🎯</span><span>基于你的技能和兴趣，AI 分析最适合你的赚钱方向</span></li>
              <li className="flex items-start gap-3"><span className="text-2xl">📖</span><span>每个方向都有详细的执行方案</span></li>
              <li className="flex items-start gap-3"><span className="text-2xl">🔒</span><span>免费使用，AI 建议仅供参考</span></li>
            </ul>
          </div>

          <div className="text-purple-300 text-sm mb-6">🏆 已有 1,234+ 人使用</div>

          <button onClick={() => setStep("skills")} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105">
            开始分析 🎯
          </button>
        </div>
      </div>
    );
  }

  // Questions
  if (step === "skills" || step === "interests" || step === "resources") {
    const questions = {
      skills: { emoji: "⚙️", title: "你会什么技能？", placeholder: "如：编程、设计、写作、剪辑...", key: "skills" as const },
      interests: { emoji: "💡", title: "你对什么感兴趣？", placeholder: "如：AI、电商、音乐、健身...", key: "interests" as const },
      resources: { emoji: "📦", title: "你有什么资源？", placeholder: "如：时间充裕、有电脑、有资金...", key: "resources" as const },
    };
    const q = questions[step];
    const progress = step === "skills" ? 33 : step === "interests" ? 66 : 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="mb-8">
            <div className="flex justify-between text-purple-300 text-sm mb-2"><span>进度</span><span>{progress}%</span></div>
            <div className="h-2 bg-white/10 rounded-full"><div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8">
            <div className="text-5xl mb-6 text-center">{q.emoji}</div>
            <h2 className="text-3xl font-bold text-white text-center mb-6">{q.title}</h2>
            <input type="text" value={formData[q.key]} onChange={(e) => setFormData({ ...formData, [q.key]: e.target.value })} placeholder={q.placeholder} className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-purple-300 text-lg focus:ring-2 focus:ring-yellow-400 outline-none mb-6" autoFocus onKeyDown={(e) => e.key === "Enter" && handleNext()} />
            <button onClick={handleNext} disabled={!formData[q.key].trim()} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 disabled:from-slate-600 text-slate-900 font-bold py-4 rounded-2xl text-lg">下一题 →</button>
          </div>
          <div className="text-center mt-6"><button onClick={() => setStep(step === "interests" ? "skills" : "intro")} className="text-purple-300 hover:text-white">← 上一步</button></div>
        </div>
      </div>
    );
  }

  // Analyzing
  if (step === "analyzing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-bounce">🧠</div>
          <h2 className="text-2xl font-bold text-white mb-4">AI 正在分析中...</h2>
          <p className="text-purple-300">根据你的独特情况，生成个性化的赚钱方案</p>
        </div>
      </div>
    );
  }

  // Result - 方向列表
  if (step === "result") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-2">为你推荐 {directions.length} 个赚钱方向</h1>
            <p className="text-purple-300">点击下方卡片查看详细方案</p>
          </div>

          {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-2xl mb-6">{error}</div>}

          <div className="space-y-4 mb-8">
            {directions.map((dir) => (
              <DirectionCard 
                key={dir.id} 
                dir={dir} 
                onClick={() => { setSelectedDir(dir); setStep("detail"); }}
              />
            ))}
          </div>

          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4 mb-6 text-center">
            <p className="text-yellow-300 text-sm">💡 点击卡片获取详细方案</p>
          </div>

          <div className="text-center">
            <button onClick={reset} className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-2xl">重新分析 🔄</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
