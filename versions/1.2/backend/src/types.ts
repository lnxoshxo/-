export type DocumentRecord = {
  id: string;
  title: string;
  content: string;
  source: string;
  updatedAt: string;
  status: 'ready' | 'processing' | 'failed';
};

export type HomeContentRecord = {
  heroTitle: string;
  heroSubtitle: string;
  ctas: Array<{ label: string; href: string }>;
};

export type FaqRecord = {
  id: string;
  question: string;
  answer: string;
  updatedAt?: string;
};

export type CaseRecord = {
  id: string;
  title: string;
  category: string;
  summary: string;
  updatedAt: string;
};

export type QaLogRecord = {
  id: string;
  question: string;
  createdAt: string;
  status: string;
  answer?: string;
  citations?: Array<{ chunkId?: string; title: string; snippet: string }>;
  relatedQuestions?: Array<{ question: string; answer: string }>;
};

export type AppData = {
  homeContent: HomeContentRecord;
  documents: DocumentRecord[];
  faqs: FaqRecord[];
  cases: CaseRecord[];
  qaLogs: QaLogRecord[];
};

export type KnowledgeChunk = {
  id: string;
  documentId: string;
  title: string;
  snippet: string;
  score: number;
};
