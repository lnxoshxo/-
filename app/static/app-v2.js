const v2Form = document.getElementById("v2-ask-form");
const v2QuestionInput = document.getElementById("v2-question-input");
const v2AnswerTitle = document.getElementById("v2-answer-title");
const v2AnswerText = document.getElementById("v2-answer-text");
const v2AnswerTags = document.getElementById("v2-answer-tags");
const v2FillFirstButton = document.getElementById("v2-fill-first");

async function v2AskQuestion(question) {
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

function renderV2Answer(data) {
  v2AnswerTitle.textContent = (data.match?.title || "未找到匹配").replace("上实服务物业集团", "上实服务");
  v2AnswerText.textContent = (data.answer || "").replaceAll("上实服务物业集团", "上实服务");
  v2AnswerTags.innerHTML = "";

  (data.match?.highlights || []).forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "v2-chip";
    tag.textContent = item.replaceAll("上实服务物业集团", "上实服务");
    v2AnswerTags.appendChild(tag);
  });
}

v2Form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = v2QuestionInput.value.trim();
  if (!question) {
    v2AnswerTitle.textContent = "请输入问题";
    v2AnswerText.textContent = "请先输入要测试的问题。";
    return;
  }

  v2AnswerTitle.textContent = "正在检索中";
  v2AnswerText.textContent = "第二版正在调用同一套知识接口返回结果。";

  try {
    const data = await v2AskQuestion(question);
    renderV2Answer(data);
  } catch (error) {
    v2AnswerTitle.textContent = "查询失败";
    v2AnswerText.textContent = error.message;
  }
});

document.querySelectorAll("[data-v2-question]").forEach((button) => {
  button.addEventListener("click", () => {
    v2QuestionInput.value = button.dataset.v2Question || "";
    v2Form?.requestSubmit();
  });
});

v2FillFirstButton?.addEventListener("click", () => {
  const first = document.querySelector("[data-v2-question]");
  if (!first) {
    return;
  }
  v2QuestionInput.value = first.dataset.v2Question || "";
  v2Form?.requestSubmit();
});
