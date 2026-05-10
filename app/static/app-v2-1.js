const v21Form = document.getElementById("v21-ask-form");
const v21QuestionInput = document.getElementById("v21-question-input");
const v21AnswerTitle = document.getElementById("v21-answer-title");
const v21AnswerText = document.getElementById("v21-answer-text");
const v21AnswerTags = document.getElementById("v21-answer-tags");
const v21FillFirstButton = document.getElementById("v21-fill-first");

async function v21AskQuestion(question) {
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

function renderV21Answer(data) {
  v21AnswerTitle.textContent = (data.match?.title || "未找到匹配").replace("上实服务物业集团", "上实服务");
  v21AnswerText.textContent = (data.answer || "").replaceAll("上实服务物业集团", "上实服务");
  v21AnswerTags.innerHTML = "";

  (data.match?.highlights || []).forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "v21-chip";
    tag.textContent = item.replaceAll("上实服务物业集团", "上实服务");
    v21AnswerTags.appendChild(tag);
  });
}

v21Form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = v21QuestionInput.value.trim();
  if (!question) {
    v21AnswerTitle.textContent = "请输入问题";
    v21AnswerText.textContent = "请先输入要测试的问题。";
    return;
  }

  v21AnswerTitle.textContent = "正在检索中";
  v21AnswerText.textContent = "2.1 版正在调用同一套知识接口返回结果。";

  try {
    const data = await v21AskQuestion(question);
    renderV21Answer(data);
  } catch (error) {
    v21AnswerTitle.textContent = "查询失败";
    v21AnswerText.textContent = error.message;
  }
});

document.querySelectorAll("[data-v21-question]").forEach((button) => {
  button.addEventListener("click", () => {
    v21QuestionInput.value = button.dataset.v21Question || "";
    v21Form?.requestSubmit();
  });
});

v21FillFirstButton?.addEventListener("click", () => {
  const first = document.querySelector("[data-v21-question]");
  if (!first) {
    return;
  }
  v21QuestionInput.value = first.dataset.v21Question || "";
  v21Form?.requestSubmit();
});
