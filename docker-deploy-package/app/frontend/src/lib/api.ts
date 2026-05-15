export type AskResponse = {
  answer: string;
  citations: Array<{ chunkId?: string; title: string; snippet: string }>;
  relatedQuestions?: Array<{ question: string; answer: string }>;
};

export type HomeContent = {
  heroTitle: string;
  heroSubtitle: string;
  ctas: Array<{ label: string; href: string }>;
};

export type CaseItem = {
  id: string;
  title: string;
  category: string;
  summary: string;
  updatedAt?: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  updatedAt?: string;
};

export type DocumentItem = {
  id: string;
  title: string;
  content: string;
  source: string;
  updatedAt: string;
  status: 'ready' | 'processing' | 'failed';
};

export type QaLogItem = {
  id: string;
  question: string;
  createdAt: string;
  status: string;
  answer?: string;
  citations?: Array<{ chunkId?: string; title: string; snippet: string }>;
  relatedQuestions?: Array<{ question: string; answer: string }>;
};

export type ChunkItem = {
  id: string;
  documentId: string;
  title: string;
  snippet: string;
  score: number;
};

export type ModelHealth = {
  ok: boolean;
  mode: 'demo' | 'live';
  model?: string;
  message: string;
};

const ADMIN_TOKEN_KEY = 'siicservice_admin_token';

function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

function adminHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAdminToken();
  return {
    ...(extra || {}),
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export async function askQuestion(question: string): Promise<AskResponse> {
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error('AI 服务暂时不可用');
  }

  return response.json();
}

export async function fetchCases(): Promise<CaseItem[]> {
  const response = await fetch('/api/content/cases');
  if (!response.ok) {
    throw new Error('案例数据加载失败');
  }

  const data = await response.json();
  return data.items;
}

export async function fetchFaqs(): Promise<FaqItem[]> {
  const response = await fetch('/api/content/faqs');
  if (!response.ok) {
    throw new Error('FAQ 数据加载失败');
  }

  const data = await response.json();
  return data.items;
}

export async function fetchHomeContent(): Promise<HomeContent> {
  const response = await fetch('/api/content/home');
  if (!response.ok) {
    throw new Error('首页内容加载失败');
  }

  return response.json();
}

export async function fetchAdminOverview(): Promise<{
  documents: DocumentItem[];
  faqs: FaqItem[];
  cases: CaseItem[];
  logs: QaLogItem[];
}> {
  const [documents, faqs, cases, logs] = await Promise.all([
    fetch('/api/admin/documents', { headers: adminHeaders() }).then((res) => res.json()),
    fetch('/api/admin/faqs', { headers: adminHeaders() }).then((res) => res.json()),
    fetch('/api/admin/cases', { headers: adminHeaders() }).then((res) => res.json()),
    fetch('/api/admin/qa-logs', { headers: adminHeaders() }).then((res) => res.json()),
  ]);

  return {
    documents: documents.items,
    faqs: faqs.items,
    cases: cases.items,
    logs: logs.items,
  };
}

export async function checkModelHealth(): Promise<ModelHealth> {
  const response = await fetch('/api/admin/model-health', { headers: adminHeaders() });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || '模型连通性检查失败');
  }

  return data;
}

export async function createFaq(input: { question: string; answer: string }) {
  const response = await fetch('/api/admin/faqs', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('新增 FAQ 失败');
  }

  return response.json();
}

export async function createCase(input: { title: string; category: string; summary: string }) {
  const response = await fetch('/api/admin/cases', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('新增案例失败');
  }

  return response.json();
}

export async function updateFaqItem(id: string, input: { question: string; answer: string }) {
  const response = await fetch(`/api/admin/faqs/${id}`, {
    method: 'PUT',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('更新 FAQ 失败');
  }

  return response.json();
}

export async function updateCaseItem(id: string, input: { title: string; category: string; summary: string }) {
  const response = await fetch(`/api/admin/cases/${id}`, {
    method: 'PUT',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('更新案例失败');
  }

  return response.json();
}

export async function deleteFaqItem(id: string) {
  const response = await fetch(`/api/admin/faqs/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });

  if (!response.ok) {
    throw new Error('删除 FAQ 失败');
  }

  return response.json();
}

export async function deleteCaseItem(id: string) {
  const response = await fetch(`/api/admin/cases/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });

  if (!response.ok) {
    throw new Error('删除案例失败');
  }

  return response.json();
}

export async function deleteDocumentItem(id: string) {
  const response = await fetch(`/api/admin/documents/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });

  if (!response.ok) {
    throw new Error('删除文档失败');
  }

  return response.json();
}

export async function loginAdmin(input: { username: string; password: string }) {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || '登录失败');
  }

  return response.json();
}

export async function updateAdminHomeContent(input: HomeContent) {
  const response = await fetch('/api/admin/home-content', {
    method: 'PUT',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('更新首页内容失败');
  }

  return response.json();
}

export async function uploadDocument(formData: FormData) {
  const response = await fetch('/api/admin/documents', {
    method: 'POST',
    headers: adminHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || '文档上传失败');
  }

  return response.json();
}

export async function fetchDocumentChunks(documentId: string): Promise<ChunkItem[]> {
  const response = await fetch(`/api/admin/documents/${documentId}/chunks`, { headers: adminHeaders() });
  if (!response.ok) {
    throw new Error('文档分块加载失败');
  }

  const data = await response.json();
  return data.items;
}
