const form = document.getElementById("ask-form");
const questionInput = document.getElementById("question-input");
const welcomeOverlay = document.getElementById("welcome-overlay");
const welcomeTime = document.getElementById("welcome-time");
const welcomeDate = document.getElementById("welcome-date");
const answerTitle = document.getElementById("answer-title");
const answerText = document.getElementById("answer-text");
const answerHighlights = document.getElementById("answer-highlights");
const relatedList = document.getElementById("related-list");
const historyList = document.getElementById("history-list");
const voiceToggleButton = document.getElementById("voice-toggle");
const voiceInputButton = document.getElementById("voice-input");
const tourToggleButton = document.getElementById("tour-toggle");
const idleToggleButton = document.getElementById("idle-toggle");
const modeIndicatorButton = document.getElementById("mode-indicator");
const idleOverlay = document.getElementById("idle-overlay");
const idleSlideKicker = document.getElementById("idle-slide-kicker");
const idleSlideTitle = document.getElementById("idle-slide-title");
const idleSlideText = document.getElementById("idle-slide-text");

const HISTORY_KEY = "siic-expo-history";
const IDLE_TIMEOUT = 45000;
let voiceEnabled = false;
let recognition = null;
let idleTimer = null;
let idleSlideTimer = null;
let idleSlideIndex = 0;
let guidedTourTimer = null;
let guidedTourEnabled = false;
let guidedTourIndex = 0;
let visitMode = "self-service";

const idleSlides = window.__INITIAL_IDLE_SLIDES__ || [];
const guidedTour = window.__INITIAL_GUIDED_TOUR__ || [];

function scheduleIdleMode() {
  clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => {
    enterIdleMode();
  }, IDLE_TIMEOUT);
}

function updateClock() {
  const now = new Date();
  if (welcomeTime) {
    welcomeTime.textContent = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  }
  if (welcomeDate) {
    welcomeDate.textContent = now.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" });
  }
}

function setVisitMode(mode) {
  visitMode = mode;
  if (modeIndicatorButton) {
    modeIndicatorButton.textContent = `当前模式：${mode === "executive" ? "领导参观" : "自助参观"}`;
  }
}

function hideWelcomeOverlay() {
  if (!welcomeOverlay) {
    return;
  }
  welcomeOverlay.classList.add("hidden");
  welcomeOverlay.setAttribute("aria-hidden", "true");
}

function renderIdleSlide() {
  if (!idleSlides.length) {
    return;
  }
  const slide = idleSlides[idleSlideIndex % idleSlides.length];
  idleSlideKicker.textContent = slide.kicker || "智慧服务展演中";
  idleSlideTitle.textContent = slide.title || "展会介绍系统";
  idleSlideText.textContent = slide.description || "点击屏幕进入交互模式。";
  idleSlideIndex += 1;
}

function startIdleSlideShow() {
  renderIdleSlide();
  clearInterval(idleSlideTimer);
  idleSlideTimer = window.setInterval(renderIdleSlide, 6000);
}

function stopIdleSlideShow() {
  clearInterval(idleSlideTimer);
}

function enterIdleMode() {
  if (!idleOverlay) {
    return;
  }
  idleOverlay.classList.remove("hidden");
  idleOverlay.setAttribute("aria-hidden", "false");
  startIdleSlideShow();
}

function exitIdleMode() {
  if (!idleOverlay) {
    return;
  }
  idleOverlay.classList.add("hidden");
  idleOverlay.setAttribute("aria-hidden", "true");
  stopIdleSlideShow();
  scheduleIdleMode();
}

function registerActivity() {
  if (guidedTourEnabled) {
    stopGuidedTour();
  }
  if (idleOverlay && !idleOverlay.classList.contains("hidden")) {
    exitIdleMode();
    return;
  }
  scheduleIdleMode();
}

function getHistory() {
  try {
    const rawValue = window.localStorage.getItem(HISTORY_KEY);
    return rawValue ? JSON.parse(rawValue) : [];
  } catch {
    return [];
  }
}

function saveHistory(question) {
  const nextHistory = [question, ...getHistory().filter((item) => item !== question)].slice(0, 5);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  historyList.innerHTML = "";
  if (!history.length) {
    historyList.innerHTML = '<span class="related-item">暂无历史记录</span>';
    return;
  }

  history.forEach((question) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-chip";
    button.textContent = question;
    button.addEventListener("click", () => {
      questionInput.value = question;
      form.requestSubmit();
    });
    historyList.appendChild(button);
  });
}

function bindQuickQuestions() {
  document.querySelectorAll("[data-quick-question]").forEach((button) => {
    button.addEventListener("click", () => {
      questionInput.value = button.dataset.quickQuestion || "";
      form.requestSubmit();
    });
  });
}

function speak(text) {
  if (!voiceEnabled || !("speechSynthesis" in window)) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  window.speechSynthesis.speak(utterance);
}

function stopGuidedTour() {
  guidedTourEnabled = false;
  clearTimeout(guidedTourTimer);
  if (tourToggleButton) {
    tourToggleButton.textContent = "自动讲解已关闭";
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function runGuidedTourStep() {
  if (!guidedTourEnabled || !guidedTour.length) {
    return;
  }

  const step = guidedTour[guidedTourIndex % guidedTour.length];
  guidedTourIndex += 1;

  if (step.sectionId) {
    const target = document.getElementById(step.sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  answerTitle.textContent = step.title || "自动讲解";
  answerText.textContent = step.script || step.summary || "";
  answerHighlights.innerHTML = "";
  relatedList.innerHTML = "";
  speak(step.script || step.summary || step.title || "");

  guidedTourTimer = window.setTimeout(runGuidedTourStep, Number(step.durationMs) || 9000);
}

function startGuidedTour() {
  if (!guidedTour.length) {
    answerTitle.textContent = "自动讲解未配置";
    answerText.textContent = "当前知识库中还没有自动讲解脚本。您可以在管理后台补充 guided_tour 内容。";
    return;
  }

  guidedTourEnabled = true;
  guidedTourIndex = 0;
  if (tourToggleButton) {
    tourToggleButton.textContent = "自动讲解已开启";
  }
  clearTimeout(guidedTourTimer);
  runGuidedTourStep();
}

function startExecutiveMode() {
  setVisitMode("executive");
  hideWelcomeOverlay();
  startGuidedTour();
  scheduleIdleMode();
}

function startSelfServiceMode() {
  setVisitMode("self-service");
  hideWelcomeOverlay();
  stopGuidedTour();
  scheduleIdleMode();
}

function renderAnswer(data) {
  answerTitle.textContent = data.match?.title || "未找到精确匹配";
  answerText.textContent = data.answer;
  answerHighlights.innerHTML = "";
  relatedList.innerHTML = "";

  (data.match?.highlights || []).forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item;
    answerHighlights.appendChild(tag);
  });

  (data.related || []).forEach((item) => {
    const block = document.createElement("div");
    block.className = "related-item";
    block.textContent = `${item.title}：${item.summary}`;
    relatedList.appendChild(block);
  });

  speak(data.answer);
}

async function askQuestion(question) {
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "查询失败，请稍后重试。");
  }
  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = questionInput.value.trim();
  if (!question) {
    answerTitle.textContent = "请输入问题";
    answerText.textContent = "请先输入您想了解的内容，再提交查询。";
    return;
  }

  answerTitle.textContent = "正在检索中";
  answerText.textContent = "系统正在知识库中检索相关内容，请稍候。";

  try {
    const data = await askQuestion(question);
    saveHistory(question);
    renderAnswer(data);
    registerActivity();
  } catch (error) {
    answerTitle.textContent = "查询失败";
    answerText.textContent = error.message;
  }
});

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.scrollTarget);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

voiceToggleButton.addEventListener("click", () => {
  voiceEnabled = !voiceEnabled;
  voiceToggleButton.textContent = voiceEnabled ? "语音已开启" : "语音已关闭";
  if (!voiceEnabled && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
});

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.mode === "executive") {
      startExecutiveMode();
      return;
    }
    startSelfServiceMode();
  });
});

if (idleToggleButton) {
  idleToggleButton.addEventListener("click", () => {
    enterIdleMode();
  });
}

if (tourToggleButton) {
  tourToggleButton.addEventListener("click", () => {
    if (guidedTourEnabled) {
      stopGuidedTour();
      return;
    }
    startGuidedTour();
  });
}

if (idleOverlay) {
  idleOverlay.addEventListener("click", () => {
    exitIdleMode();
  });
}

["click", "touchstart", "keydown", "mousemove"].forEach((eventName) => {
  window.addEventListener(eventName, registerActivity, { passive: true });
});

function initRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceInputButton.disabled = true;
    voiceInputButton.textContent = "当前浏览器不支持语音输入";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "zh-CN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript;
    questionInput.value = transcript;
    form.requestSubmit();
  });

  recognition.addEventListener("end", () => {
    voiceInputButton.textContent = "语音提问";
  });

  voiceInputButton.addEventListener("click", () => {
    voiceInputButton.textContent = "正在聆听...";
    recognition.start();
  });
}

renderHistory();
initRecognition();
bindQuickQuestions();
updateClock();
window.setInterval(updateClock, 1000);
setVisitMode("self-service");
scheduleIdleMode();
