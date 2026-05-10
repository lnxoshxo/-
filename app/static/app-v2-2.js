const v22Form = document.getElementById("v22-ask-form");
const v22QuestionInput = document.getElementById("v22-question-input");
const v22AnswerTitle = document.getElementById("v22-answer-title");
const v22AnswerText = document.getElementById("v22-answer-text");
const v22AnswerTags = document.getElementById("v22-answer-tags");
const v22FillFirstButton = document.getElementById("v22-fill-first");

async function v22AskQuestion(question) {
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

function renderV22Answer(data) {
  v22AnswerTitle.textContent = (data.match?.title || "未找到匹配").replace("上实服务物业集团", "上实服务");
  v22AnswerText.textContent = (data.answer || "").replaceAll("上实服务物业集团", "上实服务");
  v22AnswerTags.innerHTML = "";

  (data.match?.highlights || []).forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "v22-chip";
    tag.textContent = item.replaceAll("上实服务物业集团", "上实服务");
    v22AnswerTags.appendChild(tag);
  });
}

v22Form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = v22QuestionInput.value.trim();
  if (!question) {
    v22AnswerTitle.textContent = "请输入问题";
    v22AnswerText.textContent = "请先输入要测试的问题。";
    return;
  }

  v22AnswerTitle.textContent = "正在检索中";
  v22AnswerText.textContent = "第二版 2.2 正在调用同一套知识接口返回结果。";

  try {
    const data = await v22AskQuestion(question);
    renderV22Answer(data);
  } catch (error) {
    v22AnswerTitle.textContent = "查询失败";
    v22AnswerText.textContent = error.message;
  }
});

document.querySelectorAll("[data-v22-question]").forEach((button) => {
  button.addEventListener("click", () => {
    v22QuestionInput.value = button.dataset.v22Question || "";
    v22Form?.requestSubmit();
  });
});

v22FillFirstButton?.addEventListener("click", () => {
  const first = document.querySelector("[data-v22-question]");
  if (!first) {
    return;
  }
  v22QuestionInput.value = first.dataset.v22Question || "";
  v22Form?.requestSubmit();
});
