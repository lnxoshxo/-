const v24Form = document.getElementById("v24-ask-form");
const v24QuestionInput = document.getElementById("v24-question-input");
const v24AnswerTitle = document.getElementById("v24-answer-title");
const v24AnswerText = document.getElementById("v24-answer-text");
const v24AnswerTags = document.getElementById("v24-answer-tags");
const v24FillFirstButton = document.getElementById("v24-fill-first");

async function v24AskQuestion(question) {
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

function renderV24Answer(data) {
  v24AnswerTitle.textContent = (data.match?.title || "未找到匹配").replace("上实服务物业集团", "上实服务");
  v24AnswerText.textContent = (data.answer || "").replaceAll("上实服务物业集团", "上实服务");
  v24AnswerTags.innerHTML = "";

  (data.match?.highlights || []).forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "v24-chip";
    tag.textContent = item.replaceAll("上实服务物业集团", "上实服务");
    v24AnswerTags.appendChild(tag);
  });
}

v24Form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = v24QuestionInput.value.trim();
  if (!question) {
    v24AnswerTitle.textContent = "请输入问题";
    v24AnswerText.textContent = "请先输入要测试的问题。";
    return;
  }

  v24AnswerTitle.textContent = "正在检索中";
  v24AnswerText.textContent = "第二版 2.4 正在调用同一套知识接口返回结果。";

  try {
    const data = await v24AskQuestion(question);
    renderV24Answer(data);
  } catch (error) {
    v24AnswerTitle.textContent = "查询失败";
    v24AnswerText.textContent = error.message;
  }
});

document.querySelectorAll("[data-v24-question]").forEach((button) => {
  button.addEventListener("click", () => {
    v24QuestionInput.value = button.dataset.v24Question || "";
    v24Form?.requestSubmit();
  });
});

v24FillFirstButton?.addEventListener("click", () => {
  const first = document.querySelector("[data-v24-question]");
  if (!first) {
    return;
  }
  v24QuestionInput.value = first.dataset.v24Question || "";
  v24Form?.requestSubmit();
});
