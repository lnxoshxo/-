const v23Form = document.getElementById("v23-ask-form");
const v23QuestionInput = document.getElementById("v23-question-input");
const v23AnswerTitle = document.getElementById("v23-answer-title");
const v23AnswerText = document.getElementById("v23-answer-text");
const v23AnswerTags = document.getElementById("v23-answer-tags");
const v23FillFirstButton = document.getElementById("v23-fill-first");

async function v23AskQuestion(question) {
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

function renderV23Answer(data) {
  v23AnswerTitle.textContent = (data.match?.title || "未找到匹配").replace("上实服务物业集团", "上实服务");
  v23AnswerText.textContent = (data.answer || "").replaceAll("上实服务物业集团", "上实服务");
  v23AnswerTags.innerHTML = "";

  (data.match?.highlights || []).forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "v23-chip";
    tag.textContent = item.replaceAll("上实服务物业集团", "上实服务");
    v23AnswerTags.appendChild(tag);
  });
}

v23Form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = v23QuestionInput.value.trim();
  if (!question) {
    v23AnswerTitle.textContent = "请输入问题";
    v23AnswerText.textContent = "请先输入要测试的问题。";
    return;
  }

  v23AnswerTitle.textContent = "正在检索中";
  v23AnswerText.textContent = "第二版 2.3 正在调用同一套知识接口返回结果。";

  try {
    const data = await v23AskQuestion(question);
    renderV23Answer(data);
  } catch (error) {
    v23AnswerTitle.textContent = "查询失败";
    v23AnswerText.textContent = error.message;
  }
});

document.querySelectorAll("[data-v23-question]").forEach((button) => {
  button.addEventListener("click", () => {
    v23QuestionInput.value = button.dataset.v23Question || "";
    v23Form?.requestSubmit();
  });
});

v23FillFirstButton?.addEventListener("click", () => {
  const first = document.querySelector("[data-v23-question]");
  if (!first) {
    return;
  }
  v23QuestionInput.value = first.dataset.v23Question || "";
  v23Form?.requestSubmit();
});
