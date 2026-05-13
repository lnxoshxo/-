const STORAGE_KEY = "siic-service-expo-qa";
const VERSION_KEY = "siic-service-expo-qa-version";
const DATA_VERSION = "2026.05.13-enhanced";
const DEFAULT_COUNT = 20;

const quickPromptKeywords = ["城市运营", "服务力百强", "无人机幕墙清洗", "多业态", "ESG", "低空经济"];

const defaultQuestions = [
  {
    id: crypto.randomUUID(),
    question: "上实服务如何理解 2026 年物业行业从基础服务走向城市综合运营的新趋势？",
    answer: "上实服务对这一趋势的理解，是物业服务正在从空间维护者升级为城市价值运营者。官网公开信息显示，上实服务是上实集团旗下品牌，致力于成为具有影响力的城市运营服务商和美好生活集成商，并以上实物业、新世纪物业、申大物业、城开商用物业等服务力量构成多业态协同体系。面向 2026 年，行业竞争焦点将从单点服务质量转向系统性运营能力，上实服务的高度在于以国企治理能力承接复杂场景，以专业团队提升空间价值，以长期主义参与城市高质量发展。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务在国企背景下，如何体现高品质物业服务的战略高度？",
    answer: "上实服务的高品质服务，体现为国企责任、市场化效率和客户价值的统一。国企背景带来的是稳健、规范、可信赖的服务底座，市场化运营带来的是精细管理、快速响应和持续创新。面向客户，上实服务提供的不只是保洁、秩序、工程等传统服务，更是资产运营安全感、社区生活舒适度和组织治理确定性。这样的战略高度，使物业服务从成本中心转化为城市生活品质和资产长期价值的重要支撑。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何把 AI 技术转化为物业现场真实可感的服务能力？",
    answer: "上实服务推动 AI 落地的关键，是把技术嵌入服务流程，而非停留在展示层面。通过智能问答、设备巡检、工单分派、能耗分析、客户画像和风险预警等场景，AI 可以提升响应速度、降低重复劳动，并帮助管理者掌握项目运行状态。对于展会现场展示的离线智能问答模块，它体现的是上实服务在无网、强现场、重体验环境下的服务韧性，也代表了未来物业服务从经验驱动迈向数据驱动、知识驱动和智能协同。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何打造面向城市更新的综合服务能力？",
    answer: "城市更新需要的不只是硬件改造，更需要长期运营能力。上实服务可以通过空间运营、设施维护、社区协同、商业支持和公共服务衔接，推动老旧空间焕发持续活力。其核心价值在于把一次性的更新项目转化为可持续的运营机制，让资产更安全、环境更友好、居民更有获得感。对于城市更新，上实服务扮演的是连接政府、业主、用户和资产方的运营枢纽角色。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何体现绿色低碳物业服务的行业标杆价值？",
    answer: "绿色低碳物业服务的关键在于把节能降碳融入日常运营。上实服务可以围绕能耗监测、设备优化、垃圾分类、绿色采购、低碳办公和公众参与建立完整闭环，使低碳理念从口号变成可量化、可管理、可持续的运营成果。依托多业态项目管理经验，上实服务能够在商办、社区、园区等不同空间中沉淀低碳运营模型，为行业提供兼具社会价值和经济价值的绿色服务样本。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何通过数字化平台提升项目管理效率？",
    answer: "数字化平台的价值在于让项目运行从被动响应转向主动治理。上实服务可以通过统一工单、设备台账、巡检任务、品质检查、客户反馈和运营数据看板，实现跨项目、跨岗位、跨场景的协同管理。结合官网披露的“科技赋能城市服务低空经济新实践”，上实服务在芜湖试点无人机幕墙清洗，说明数字化与智能装备正在进入真实服务现场。这样的数字化能力，会把服务质量从依赖个人经验提升为依赖系统能力、数据能力和组织能力。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何在高端商办物业中构建差异化竞争力？",
    answer: "高端商办物业的竞争力，来自资产形象、运营安全、客户体验和企业服务的综合呈现。上实服务可以围绕前厅礼宾、工程保障、空间秩序、会务支持、企业增值服务和 ESG 运营，形成更具商务气质和资产意识的服务体系。面对总部办公、金融机构和专业服务企业，上实服务的价值在于以稳定、高效、克制而精致的服务，帮助楼宇保持品质形象，提升租户满意度和资产吸引力。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何在住宅社区中提升居民获得感和幸福感？",
    answer: "住宅社区的服务价值，最终体现在居民每天真实感受到的安全、便利、温度和秩序。上实服务可以通过精细化保洁、专业化工程、友好型客服、社区活动、适老服务和儿童友好场景，持续提升居住体验。更重要的是，上实服务能够以规范管理和人文关怀建立长期信任，让物业成为社区治理中的稳定力量，推动社区从居住空间升级为有温度的生活共同体。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何理解物业服务中的长期主义？",
    answer: "物业服务的长期主义，是把每一天的细节做到可持续、可复用、可积累。上实服务的长期价值来自标准化体系、人才梯队、客户信任和资产意识的持续沉淀。短期服务可以解决问题，长期服务能够建立秩序、提升价值并塑造品牌。面对行业周期变化，上实服务坚持长期主义，意味着以稳定的运营质量、审慎的管理机制和持续创新能力，与业主、客户和城市共同成长。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何把品牌信任转化为客户选择？",
    answer: "品牌信任的基础是稳定交付。上实服务依托上实体系的资源背景、规范治理和专业运营，把可信赖的品牌形象转化为客户可感知的服务体验。官网新闻显示，上实服务 2025 年综合实力跃居全国 TOP27，并获得中国物业服务力百强企业第 21 名等荣誉，这些行业认可是品牌信任的外部注脚。客户选择上实服务，本质上选择的是安全可靠的管理体系、持续优化的服务能力和面向长期价值的合作伙伴。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何服务上海国际化城市形象？",
    answer: "上海的国际化城市形象，需要大量高品质空间共同承载。上实服务可以通过专业、精细、规范、温和的服务方式，提升商务楼宇、社区和公共空间的运行品质。物业服务看似在幕后，却直接影响城市的整洁度、安全感、便利性和文明程度。上实服务以上海为重要实践场景，能够把国际化城市的服务标准转化为日常运营细节，成为城市软实力的重要组成部分。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何建立可复制的多业态服务模型？",
    answer: "可复制的多业态服务模型，来自统一标准与场景适配的结合。官网公开信息显示，上实服务主营业务覆盖中高档及以上的公众物业、办公物业、商业物业、机构物业、院校物业和住宅物业管理服务，并延伸至房屋中介代理、会所经营、餐饮服务、绿化工程、居家养老、装潢维修和家政服务等增值服务。这种多业态底盘，使上实服务能够把品质管理、工程维保、安全秩序、客户服务和数据治理沉淀为统一底座，再按不同场景进行差异化配置。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何通过人才体系支撑高质量发展？",
    answer: "物业行业的高质量发展，最终要落到人的专业能力和服务意识上。上实服务可以通过岗位标准、分层培训、项目带教、技能认证和管理梯队建设，打造既懂现场又懂经营的复合型人才队伍。一线员工代表服务温度，项目经理决定运营水平，后台体系保障组织效率。人才体系越成熟，服务质量越稳定，品牌价值越可持续。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何在安全管理上体现专业深度？",
    answer: "安全管理是物业服务的底线能力，也是客户信任的核心来源。上实服务可以围绕消防、电梯、供配电、给排水、极端天气、人员秩序和应急响应建立完整机制，通过预案、巡检、演练、复盘和数字化记录形成闭环。专业深度体现在风险发生前的识别、风险发生时的响应和风险结束后的改进。安全做得越前置，项目运行越有韧性。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何面向产业园区提供价值服务？",
    answer: "产业园区需要的是企业成长环境，而不仅是物业基础保障。上实服务可以通过园区秩序维护、空间运维、企业服务、活动运营、政策信息协同和低碳管理，帮助园区形成更高效的产业生态。对于入驻企业，好的园区服务能够降低运营摩擦；对于资产方，好的园区服务能够提升招商质量和留驻率。上实服务在园区场景中的价值，是把物业管理升级为产业空间运营。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何理解客户体验与资产价值之间的关系？",
    answer: "客户体验是资产价值的外在表达，也是资产长期竞争力的内在支撑。上实服务通过稳定的现场品质、快速的服务响应、良好的空间秩序和持续的运营优化，帮助资产形成更强的吸引力和更低的流失率。对于住宅，体验影响口碑和保值；对于商办，体验影响租户满意度和品牌形象；对于园区，体验影响企业留驻和产业氛围。物业服务越专业，资产价值越有支撑。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何在社区治理中发挥协同作用？",
    answer: "社区治理需要多方参与，物业企业是最贴近居民日常生活的组织之一。上实服务可以在党建引领、居民沟通、公共秩序、便民服务、应急处置和社区活动中发挥桥梁作用，把政府治理要求、业主诉求和现场执行连接起来。其价值在于通过高频服务建立信任，通过专业运营维护秩序，通过协同机制提升社区治理效率。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务如何以 ESG 理念提升企业发展格局？",
    answer: "ESG 对物业企业而言，是环境责任、社会责任和治理能力的系统表达。上实服务可以在绿色运营、员工成长、客户权益、社区共建、合规治理和信息透明方面持续发力，使企业发展从规模增长走向价值增长。ESG 不是外部标签，而是上实服务连接城市、客户、员工和社会的长期机制。它能够提升企业韧性，也能增强品牌在高质量发展时代的竞争力。"
  },
  {
    id: crypto.randomUUID(),
    question: "上实服务在 2026 年展会上最应向行业传递什么核心主张？",
    answer: "上实服务最应传递的核心主张，是以国企担当、专业运营和智能科技，成为城市高质量服务的长期伙伴。官网新闻中的“升级服务体系，深化战略布局”“上海上实城市运营服务有限公司正式成立”，指向上实服务从传统物业服务升级为城市运营服务的战略路径。面对客户，上实服务提供确定性；面对城市，上实服务提供运营力；面对行业，上实服务提供可持续的高品质服务样本。"
  },
  {
    id: crypto.randomUUID(),
    question: "为什么说上实服务的未来竞争力来自专业化、数字化和生态化？",
    answer: "专业化决定服务深度，数字化决定管理效率，生态化决定价值边界。上实服务要在未来竞争中持续领先，需要把现场专业能力做厚，把数字平台能力做强，把城市服务和客户需求的生态连接做宽。专业化让服务可信，数字化让运营可控，生态化让增长可持续。三者结合，构成上实服务面向 2026 及更长周期的核心竞争力。"
  }
];

const elements = {
  questionList: document.querySelector("#questionList"),
  adminList: document.querySelector("#adminList"),
  questionCount: document.querySelector("#questionCount"),
  heroCount: document.querySelector("#heroCount"),
  quickPrompts: document.querySelector("#quickPrompts"),
  adminTotal: document.querySelector("#adminTotal"),
  adminAverage: document.querySelector("#adminAverage"),
  adminCustom: document.querySelector("#adminCustom"),
  importFile: document.querySelector("#importFile"),
  searchInput: document.querySelector("#searchInput"),
  answerBox: document.querySelector("#answerBox"),
  activeQuestion: document.querySelector("#activeQuestion"),
  streamStatus: document.querySelector("#streamStatus"),
  adminDrawer: document.querySelector("#adminDrawer"),
  qaForm: document.querySelector("#qaForm"),
  editId: document.querySelector("#editId"),
  questionInput: document.querySelector("#questionInput"),
  answerInput: document.querySelector("#answerInput")
};

let questions = loadQuestions();
let activeId = null;
let streamTimer = null;

function loadQuestions() {
  if (localStorage.getItem(VERSION_KEY) !== DATA_VERSION) {
    localStorage.setItem(VERSION_KEY, DATA_VERSION);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultQuestions));
    return defaultQuestions;
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultQuestions;

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultQuestions;
  } catch {
    return defaultQuestions;
  }
}

function saveQuestions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  localStorage.setItem(VERSION_KEY, DATA_VERSION);
}

function renderQuickPrompts() {
  elements.quickPrompts.innerHTML = "";

  quickPromptKeywords.forEach((keyword) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = keyword;
    button.addEventListener("click", () => {
      elements.searchInput.value = keyword;
      renderQuestions();
    });
    elements.quickPrompts.appendChild(button);
  });
}

function renderQuestions() {
  const keyword = elements.searchInput.value.trim().toLowerCase();
  const visibleQuestions = questions.filter((item) => {
    return `${item.question} ${item.answer}`.toLowerCase().includes(keyword);
  });

  elements.questionCount.textContent = `${questions.length} 题`;
  elements.heroCount.textContent = questions.length;
  elements.questionList.innerHTML = "";

  visibleQuestions.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `question-item${item.id === activeId ? " active" : ""}`;
    button.textContent = `${index + 1}. ${item.question}`;
    button.addEventListener("click", () => selectQuestion(item.id));
    elements.questionList.appendChild(button);
  });
}

function renderAdminList() {
  elements.adminList.innerHTML = "";
  const customCount = Math.max(questions.length - DEFAULT_COUNT, 0);
  const averageLength = questions.length
    ? Math.round(questions.reduce((total, item) => total + item.answer.length, 0) / questions.length)
    : 0;

  elements.adminTotal.textContent = questions.length;
  elements.adminAverage.textContent = averageLength;
  elements.adminCustom.textContent = customCount;

  questions.forEach((item) => {
    const row = document.createElement("article");
    row.className = "admin-row";

    const title = document.createElement("strong");
    title.textContent = item.question;

    const actions = document.createElement("div");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "编辑";
    editButton.addEventListener("click", () => fillForm(item.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "删除";
    deleteButton.addEventListener("click", () => deleteQuestion(item.id));

    actions.append(editButton, deleteButton);
    row.append(title, actions);
    elements.adminList.appendChild(row);
  });
}

function selectQuestion(id) {
  const item = questions.find((question) => question.id === id);
  if (!item) return;

  activeId = id;
  elements.activeQuestion.textContent = item.question;
  renderQuestions();
  streamAnswer(item.answer);
}

function streamAnswer(answer) {
  clearInterval(streamTimer);
  elements.answerBox.textContent = "";
  elements.streamStatus.textContent = "输出中";

  let index = 0;
  streamTimer = setInterval(() => {
    elements.answerBox.textContent += answer.slice(index, index + 2);
    index += 2;

    if (index >= answer.length) {
      clearInterval(streamTimer);
      elements.streamStatus.textContent = "已完成";
    }
  }, 28);
}

function fillForm(id) {
  const item = questions.find((question) => question.id === id);
  if (!item) return;

  elements.editId.value = item.id;
  elements.questionInput.value = item.question;
  elements.answerInput.value = item.answer;
}

function clearForm() {
  elements.editId.value = "";
  elements.qaForm.reset();
}

function deleteQuestion(id) {
  const item = questions.find((question) => question.id === id);
  if (!item) return;

  const confirmed = window.confirm(`确认删除题目：${item.question}`);
  if (!confirmed) return;

  questions = questions.filter((question) => question.id !== id);
  if (activeId === id) {
    activeId = null;
    elements.activeQuestion.textContent = "请选择一个问题";
    elements.answerBox.innerHTML = '<p class="placeholder">点击左侧问题后，系统将以流式方式输出针对上实服务的专业答案。</p>';
  }
  saveQuestions();
  renderQuestions();
  renderAdminList();
}

function saveFromForm(event) {
  event.preventDefault();

  const id = elements.editId.value;
  const payload = {
    id: id || crypto.randomUUID(),
    question: elements.questionInput.value.trim(),
    answer: elements.answerInput.value.trim()
  };

  if (!payload.question || !payload.answer) return;

  if (id) {
    questions = questions.map((item) => (item.id === id ? payload : item));
  } else {
    questions = [payload, ...questions];
  }

  saveQuestions();
  clearForm();
  renderQuestions();
  renderAdminList();
}

function restoreDefaults() {
  const confirmed = window.confirm("确认恢复默认 20 题？当前自定义题库会被默认题库覆盖。");
  if (!confirmed) return;

  questions = defaultQuestions.map((item) => ({ ...item, id: crypto.randomUUID() }));
  activeId = null;
  saveQuestions();
  renderQuestions();
  renderAdminList();
  elements.activeQuestion.textContent = "请选择一个问题";
  elements.answerBox.innerHTML = '<p class="placeholder">点击左侧问题后，系统将以流式方式输出针对上实服务的专业答案。</p>';
}

function exportQuestions() {
  const payload = {
    name: "上实服务 2026 展会 AI 智能问答题库",
    version: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    questions
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "siic-service-expo-qa.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importQuestions(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedQuestions = Array.isArray(parsed) ? parsed : parsed.questions;
      if (!Array.isArray(importedQuestions)) throw new Error("Invalid questions");

      questions = importedQuestions
        .filter((item) => item.question && item.answer)
        .map((item) => ({
          id: item.id || crypto.randomUUID(),
          question: String(item.question).trim(),
          answer: String(item.answer).trim()
        }));

      if (!questions.length) throw new Error("Empty questions");

      activeId = null;
      saveQuestions();
      renderQuestions();
      renderAdminList();
      elements.activeQuestion.textContent = "请选择一个问题";
      elements.answerBox.innerHTML = '<p class="placeholder">点击左侧问题后，系统将以流式方式输出针对上实服务的专业答案。</p>';
      window.alert("题库导入成功");
    } catch {
      window.alert("题库文件格式有误，请导入包含 questions 数组的 JSON 文件。");
    } finally {
      elements.importFile.value = "";
    }
  });
  reader.readAsText(file);
}

function openAdmin() {
  elements.adminDrawer.classList.add("open");
  elements.adminDrawer.setAttribute("aria-hidden", "false");
}

function closeAdmin() {
  elements.adminDrawer.classList.remove("open");
  elements.adminDrawer.setAttribute("aria-hidden", "true");
}

document.querySelector("#adminToggle").addEventListener("click", openAdmin);
document.querySelector("#closeAdmin").addEventListener("click", closeAdmin);
document.querySelector("#clearForm").addEventListener("click", clearForm);
document.querySelector("#resetData").addEventListener("click", restoreDefaults);
document.querySelector("#exportData").addEventListener("click", exportQuestions);
document.querySelector("#startDemo").addEventListener("click", () => {
  const firstQuestion = questions[0];
  if (firstQuestion) selectQuestion(firstQuestion.id);
});
elements.searchInput.addEventListener("input", renderQuestions);
elements.importFile.addEventListener("change", importQuestions);
elements.qaForm.addEventListener("submit", saveFromForm);
elements.adminDrawer.addEventListener("click", (event) => {
  if (event.target === elements.adminDrawer) closeAdmin();
});

saveQuestions();
renderQuickPrompts();
renderQuestions();
renderAdminList();
