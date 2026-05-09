import { FormEvent, useEffect, useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { checkModelHealth, createCase, createFaq, deleteCaseItem, deleteDocumentItem, deleteFaqItem, fetchAdminOverview, fetchDocumentChunks, type CaseItem, type ChunkItem, type DocumentItem, type FaqItem, type HomeContent, type ModelHealth, type QaLogItem, updateAdminHomeContent, updateCaseItem, updateFaqItem, uploadDocument } from '../lib/api';

type AdminDataState = {
  documents: DocumentItem[];
  faqs: FaqItem[];
  cases: CaseItem[];
  logs: QaLogItem[];
};

export function AdminPage() {
  const [data, setData] = useState<AdminDataState>({ documents: [], faqs: [], cases: [], logs: [] });
  const [homeForm, setHomeForm] = useState<HomeContent>({
    heroTitle: '让物业服务从空间管理走向智慧运营',
    heroSubtitle: '以上实服务为载体，展示数字化、平台化、精细化的现代物业服务能力。',
    ctas: [
      { label: '了解上实服务', href: '/about' },
      { label: '体验 AI 问答', href: '/ai' },
    ],
  });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '' });
  const [caseForm, setCaseForm] = useState({ title: '', category: '', summary: '' });
  const [uploadTitle, setUploadTitle] = useState('');
  const [message, setMessage] = useState('');
  const [activeDocumentId, setActiveDocumentId] = useState('');
  const [chunks, setChunks] = useState<ChunkItem[]>([]);
  const [editingFaqId, setEditingFaqId] = useState('');
  const [editingCaseId, setEditingCaseId] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'processing' | 'failed'>('all');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<QaLogItem | null>(null);
  const [modelHealth, setModelHealth] = useState<ModelHealth | null>(null);
  const [checkingModel, setCheckingModel] = useState(false);

  async function load() {
    const overview = await fetchAdminOverview();
    setData(overview);
  }

  useEffect(() => {
    void load();
  }, []);

  async function submitFaq(event: FormEvent) {
    event.preventDefault();
    await createFaq(faqForm);
    setFaqForm({ question: '', answer: '' });
    setMessage('FAQ 已新增');
    await load();
  }

  async function submitCase(event: FormEvent) {
    event.preventDefault();
    await createCase(caseForm);
    setCaseForm({ title: '', category: '', summary: '' });
    setMessage('案例已新增');
    await load();
  }

  async function submitHome(event: FormEvent) {
    event.preventDefault();
    await updateAdminHomeContent(homeForm);
    setMessage('首页内容已更新');
  }

  async function submitDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file) {
      setMessage('请先选择文档');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', uploadTitle);
    await uploadDocument(formData);
    setUploadTitle('');
    form.reset();
    setMessage('文档已上传并进入知识库');
    await load();
  }

  async function saveFaqEdit(item: FaqItem) {
    await updateFaqItem(item.id, { question: item.question, answer: item.answer });
    setEditingFaqId('');
    setMessage('FAQ 已更新');
    await load();
  }

  async function saveCaseEdit(item: CaseItem) {
    await updateCaseItem(item.id, { title: item.title, category: item.category, summary: item.summary });
    setEditingCaseId('');
    setMessage('案例已更新');
    await load();
  }

  async function inspectChunks(documentId: string) {
    setActiveDocumentId(documentId);
    const items = await fetchDocumentChunks(documentId);
    setChunks(items);
    setMessage(`已加载 ${items.length} 个知识分块`);
  }

  async function removeDocumentById(id: string) {
    await deleteDocumentItem(id);
    if (activeDocumentId === id) {
      setActiveDocumentId('');
      setChunks([]);
    }
    setMessage('文档已删除');
    await load();
  }

  async function removeFaqById(id: string) {
    await deleteFaqItem(id);
    setMessage('FAQ 已删除');
    await load();
  }

  async function removeCaseById(id: string) {
    await deleteCaseItem(id);
    setMessage('案例已删除');
    await load();
  }

  async function runModelHealthCheck() {
    setCheckingModel(true);
    try {
      const result = await checkModelHealth();
      setModelHealth(result);
      setMessage(`模型检查完成：${result.message}`);
    } catch (error) {
      const next: ModelHealth = {
        ok: false,
        mode: 'live',
        message: error instanceof Error ? error.message : '模型连通性检查失败',
      };
      setModelHealth(next);
      setMessage(`模型检查失败：${next.message}`);
    } finally {
      setCheckingModel(false);
    }
  }

  const keyword = search.trim().toLowerCase();
  const filteredDocuments = data.documents.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = !keyword || `${item.title} ${item.content} ${item.source}`.toLowerCase().includes(keyword);
    return matchesStatus && matchesSearch;
  });
  const filteredFaqs = data.faqs.filter((item) => !keyword || `${item.question} ${item.answer}`.toLowerCase().includes(keyword));
  const filteredCases = data.cases.filter((item) => !keyword || `${item.title} ${item.category} ${item.summary}`.toLowerCase().includes(keyword));
  const filteredLogs = data.logs.filter((item) => !keyword || `${item.question} ${item.status}`.toLowerCase().includes(keyword));

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="ADMIN"
        title="内容与知识库管理总览"
        description="用于演示后台信息结构，包括知识文档、FAQ、案例内容与问答记录。后续可在此基础上继续接入鉴权、编辑和真实存储。"
      />

      {message ? <div className="rounded-[20px] border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{message}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="知识文档" value={String(data.documents.length)} />
        <InfoCard label="FAQ 条目" value={String(data.faqs.length)} />
        <InfoCard label="案例条目" value={String(data.cases.length)} />
        <InfoCard label="问答记录" value={String(data.logs.length)} />
      </div>

      <div className="glass-panel rounded-[24px] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Workspace Filter</div>
            <div className="mt-2 text-lg font-semibold text-white">后台内容快速筛选</div>
          </div>
          <div className="text-sm text-slate-300/80">当前结果：文档 {filteredDocuments.length} / FAQ {filteredFaqs.length} / 案例 {filteredCases.length} / 日志 {filteredLogs.length}</div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="text-sm text-slate-300/80">文档状态筛选</div>
        {(['all', 'ready', 'processing', 'failed'] as const).map((status) => (
          <button
            key={status}
            className={`min-h-11 rounded-full px-4 py-2 text-sm ${statusFilter === status ? 'bg-cyan-400 text-slate-950' : 'border border-cyan-300/20 text-cyan-100'}`}
            onClick={() => setStatusFilter(status)}
            type="button"
          >
            {status}
          </button>
        ))}
        <div className="min-w-64 flex-1">
          <input
            className="min-h-11 w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
            placeholder="搜索文档、FAQ、案例或问答记录"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <button
          className="rounded-full border border-cyan-300/20 px-4 py-2 text-sm text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void runModelHealthCheck()}
          type="button"
          disabled={checkingModel}
        >
          {checkingModel ? '检查中...' : '检查模型连通性'}
        </button>
        </div>
      </div>

      {modelHealth ? (
        <div className={`rounded-[24px] border px-4 py-4 text-sm ${modelHealth.ok ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100' : 'border-amber-300/20 bg-amber-400/10 text-amber-100'}`}>
          <div className="font-medium">模型状态：{modelHealth.ok ? '正常' : '异常'}</div>
          <div className="mt-1">模式：{modelHealth.mode}</div>
          {modelHealth.model ? <div className="mt-1">模型：{modelHealth.model}</div> : null}
          <div className="mt-1">结果：{modelHealth.message}</div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <FormCard title="首页内容管理" onSubmit={submitHome}>
          <Input label="主标题" value={homeForm.heroTitle} onChange={(value) => setHomeForm((prev) => ({ ...prev, heroTitle: value }))} />
          <TextArea label="副标题" value={homeForm.heroSubtitle} onChange={(value) => setHomeForm((prev) => ({ ...prev, heroSubtitle: value }))} />
          <Input
            label="主按钮文案"
            value={homeForm.ctas[0]?.label ?? ''}
            onChange={(value) =>
              setHomeForm((prev) => ({ ...prev, ctas: [{ ...(prev.ctas[0] || { href: '/about', label: '' }), label: value }, prev.ctas[1] || { label: '体验 AI 问答', href: '/ai' }] }))
            }
          />
          <Input
            label="次按钮文案"
            value={homeForm.ctas[1]?.label ?? ''}
            onChange={(value) =>
              setHomeForm((prev) => ({ ...prev, ctas: [prev.ctas[0] || { label: '了解上实服务', href: '/about' }, { ...(prev.ctas[1] || { href: '/ai', label: '' }), label: value }] }))
            }
          />
          <SubmitButton label="保存首页内容" />
        </FormCard>

        <FormCard title="知识文档上传" onSubmit={submitDocument}>
          <Input label="文档标题" value={uploadTitle} onChange={setUploadTitle} />
          <label className="text-sm text-slate-300/80">
            文档文件
            <input className="mt-2 block w-full rounded-[16px] border border-white/10 bg-white/5 px-4 py-3" name="file" type="file" />
          </label>
          <div className="text-xs text-slate-400">当前支持 txt、md、docx 自动提取正文；pdf 支持基础文本抽取，扫描件建议继续走外部解析结果导入。</div>
          <SubmitButton label="上传到知识库" />
        </FormCard>

        <FormCard title="新增 FAQ" onSubmit={submitFaq}>
          <Input label="问题" value={faqForm.question} onChange={(value) => setFaqForm((prev) => ({ ...prev, question: value }))} />
          <TextArea label="答案" value={faqForm.answer} onChange={(value) => setFaqForm((prev) => ({ ...prev, answer: value }))} />
          <SubmitButton label="新增 FAQ" />
        </FormCard>

        <FormCard title="新增案例" onSubmit={submitCase}>
          <Input label="案例标题" value={caseForm.title} onChange={(value) => setCaseForm((prev) => ({ ...prev, title: value }))} />
          <Input label="案例分类" value={caseForm.category} onChange={(value) => setCaseForm((prev) => ({ ...prev, category: value }))} />
          <TextArea label="案例摘要" value={caseForm.summary} onChange={(value) => setCaseForm((prev) => ({ ...prev, summary: value }))} />
          <SubmitButton label="新增案例" />
        </FormCard>

        <DocumentCard documents={filteredDocuments} activeDocumentId={activeDocumentId} onInspect={inspectChunks} onRemove={removeDocumentById} />
        <EditableFaqCard items={filteredFaqs} editingFaqId={editingFaqId} onEdit={setEditingFaqId} onSave={saveFaqEdit} onRemove={removeFaqById} />
        <EditableCaseCard items={filteredCases} editingCaseId={editingCaseId} onEdit={setEditingCaseId} onSave={saveCaseEdit} onRemove={removeCaseById} />
        <QaLogCard items={filteredLogs} onOpen={setSelectedLog} />
        <ChunkPreviewCard chunks={chunks} />
      </div>

      {selectedLog ? <QaLogModal item={selectedLog} onClose={() => setSelectedLog(null)} /> : null}
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel rounded-[28px] p-6">
      <div className="text-sm text-slate-300/70">{label}</div>
      <div className="mt-3 text-4xl font-semibold text-cyan-100">{value}</div>
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-panel rounded-[28px] p-6">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100/80">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentCard({
  documents,
  activeDocumentId,
  onInspect,
  onRemove,
}: {
  documents: DocumentItem[];
  activeDocumentId: string;
  onInspect: (documentId: string) => void | Promise<void>;
  onRemove: (documentId: string) => void | Promise<void>;
}) {
  return (
    <div className="glass-panel rounded-[28px] p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="text-lg font-semibold">知识文档</div>
        <div className="text-sm text-slate-300/70">共 {documents.length} 篇</div>
      </div>
      <div className="mt-4 space-y-3">
        {documents.length === 0 ? <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300/70">当前筛选条件下暂无知识文档。</div> : null}
        {documents.map((item) => (
          <div key={item.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-slate-100/80">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-medium leading-7 text-cyan-100">{item.title}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                  <span>{item.source}</span>
                  <span className={`rounded-full px-3 py-1 ${item.status === 'ready' ? 'bg-cyan-400/10 text-cyan-100' : item.status === 'processing' ? 'bg-amber-400/10 text-amber-200' : 'bg-rose-400/10 text-rose-200'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 text-sm leading-7 text-slate-300/75">{item.content.slice(0, 160)}...</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium ${activeDocumentId === item.id ? 'bg-cyan-400 text-slate-950' : 'border border-cyan-300/20 text-cyan-100'}`}
                  onClick={() => {
                    void onInspect(item.id);
                  }}
                  type="button"
                >
                  查看分块
                </button>
                <button className="min-h-11 rounded-full border border-rose-300/20 px-4 py-2 text-sm text-rose-200" onClick={() => void onRemove(item.id)} type="button">
                  删除文档
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChunkPreviewCard({ chunks }: { chunks: ChunkItem[] }) {
  return (
    <div className="glass-panel rounded-[28px] p-6 xl:col-span-2">
      <div className="flex items-center justify-between gap-4">
        <div className="text-lg font-semibold">知识分块预览</div>
        <div className="text-sm text-slate-300/70">共 {chunks.length} 个分块</div>
      </div>
      <div className="mt-4 space-y-3">
        {chunks.length === 0 ? (
          <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300/70">选择一篇知识文档后，可查看系统切分出的知识块。</div>
        ) : (
          chunks.map((chunk) => (
            <div key={chunk.id} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-cyan-100">{chunk.id}</div>
                <div className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">chunk</div>
              </div>
              <div className="mt-3 text-sm leading-6 text-slate-300/75">{chunk.snippet}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function QaLogCard({ items, onOpen }: { items: QaLogItem[]; onOpen: (item: QaLogItem) => void }) {
  return (
    <div className="glass-panel rounded-[28px] p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="text-lg font-semibold">问答日志</div>
        <div className="text-sm text-slate-300/70">共 {items.length} 条</div>
      </div>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300/70">当前筛选条件下暂无问答日志。</div> : null}
        {items.map((item) => (
          <button
            key={item.id}
            className="block min-h-20 w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-4 text-left text-sm text-slate-100/80 transition hover:border-cyan-300/25"
            onClick={() => onOpen(item)}
            type="button"
          >
            <div className="font-medium leading-7 text-cyan-100">{item.question}</div>
            <div className="mt-2 text-xs text-slate-400">{item.status} | {new Date(item.createdAt).toLocaleString('zh-CN')}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function QaLogModal({ item, onClose }: { item: QaLogItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4 py-6">
      <div className="glass-panel max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[32px] p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">QA LOG DETAIL</div>
            <div className="mt-3 text-2xl font-semibold">问答记录详情</div>
          </div>
          <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200" onClick={onClose} type="button">
            关闭
          </button>
        </div>
        <div className="mt-6 space-y-4">
          <DetailItem label="问题" value={item.question} />
          <DetailItem label="状态" value={item.status} />
          <DetailItem label="时间" value={new Date(item.createdAt).toLocaleString('zh-CN')} />
          <DetailItem label="答案快照" value={item.answer || '当前记录暂无答案快照。'} />
          <DetailList
            label="引用快照"
            items={(item.citations || []).map((citation) => `${citation.title} | ${citation.chunkId || 'source'} | ${citation.snippet}`)}
            emptyText="当前记录暂无引用快照。"
          />
          <DetailList
            label="相关问题快照"
            items={(item.relatedQuestions || []).map((entry) => `${entry.question} | ${entry.answer}`)}
            emptyText="当前记录暂无相关问题快照。"
          />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">{label}</div>
      <div className="mt-2 text-sm leading-6 text-slate-200/85">{value}</div>
    </div>
  );
}

function DetailList({ label, items, emptyText }: { label: string; items: string[]; emptyText: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">{label}</div>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-slate-300/75">{emptyText}</div>
        ) : (
          items.map((item) => (
            <div key={item} className="rounded-[16px] border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-slate-200/85">
              {item}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EditableFaqCard({
  items,
  editingFaqId,
  onEdit,
  onSave,
  onRemove,
}: {
  items: FaqItem[];
  editingFaqId: string;
  onEdit: (id: string) => void;
  onSave: (item: FaqItem) => void | Promise<void>;
  onRemove: (id: string) => void | Promise<void>;
}) {
  const [drafts, setDrafts] = useState<Record<string, FaqItem>>({});

  useEffect(() => {
    setDrafts(Object.fromEntries(items.map((item) => [item.id, item])));
  }, [items]);

  return (
    <div className="glass-panel rounded-[28px] p-6">
      <div className="text-lg font-semibold">FAQ</div>
      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const draft = drafts[item.id] || item;
          const editing = editingFaqId === item.id;

          return (
            <div key={item.id} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              {editing ? (
                <div className="space-y-3">
                  <Input label="问题" value={draft.question} onChange={(value) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draft, question: value } }))} />
                  <TextArea label="答案" value={draft.answer} onChange={(value) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draft, answer: value } }))} />
                  <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950" onClick={() => void onSave(draft)} type="button">
                    保存 FAQ
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-cyan-100">{item.question}</div>
                    <div className="mt-2 text-sm text-slate-300/75">{item.answer}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="min-h-11 rounded-full border border-cyan-300/20 px-4 py-2 text-sm text-cyan-100" onClick={() => onEdit(item.id)} type="button">
                      编辑
                    </button>
                    <button className="min-h-11 rounded-full border border-rose-300/20 px-4 py-2 text-sm text-rose-200" onClick={() => void onRemove(item.id)} type="button">
                      删除
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditableCaseCard({
  items,
  editingCaseId,
  onEdit,
  onSave,
  onRemove,
}: {
  items: CaseItem[];
  editingCaseId: string;
  onEdit: (id: string) => void;
  onSave: (item: CaseItem) => void | Promise<void>;
  onRemove: (id: string) => void | Promise<void>;
}) {
  const [drafts, setDrafts] = useState<Record<string, CaseItem>>({});

  useEffect(() => {
    setDrafts(Object.fromEntries(items.map((item) => [item.id, item])));
  }, [items]);

  return (
    <div className="glass-panel rounded-[28px] p-6">
      <div className="text-lg font-semibold">案例</div>
      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const draft = drafts[item.id] || item;
          const editing = editingCaseId === item.id;

          return (
            <div key={item.id} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              {editing ? (
                <div className="space-y-3">
                  <Input label="标题" value={draft.title} onChange={(value) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draft, title: value } }))} />
                  <Input label="分类" value={draft.category} onChange={(value) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draft, category: value } }))} />
                  <TextArea label="摘要" value={draft.summary} onChange={(value) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draft, summary: value } }))} />
                  <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950" onClick={() => void onSave(draft)} type="button">
                    保存案例
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-cyan-100">{item.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{item.category}</div>
                    <div className="mt-2 text-sm text-slate-300/75">{item.summary}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="min-h-11 rounded-full border border-cyan-300/20 px-4 py-2 text-sm text-cyan-100" onClick={() => onEdit(item.id)} type="button">
                      编辑
                    </button>
                    <button className="min-h-11 rounded-full border border-rose-300/20 px-4 py-2 text-sm text-rose-200" onClick={() => void onRemove(item.id)} type="button">
                      删除
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FormCard({ title, onSubmit, children }: { title: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>; children: React.ReactNode }) {
  return (
    <form className="glass-panel space-y-4 rounded-[28px] p-6" onSubmit={onSubmit}>
      <div className="text-lg font-semibold">{title}</div>
      {children}
    </form>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm text-slate-300/80">
      {label}
      <input
        className="mt-2 w-full rounded-[16px] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm text-slate-300/80">
      {label}
      <textarea
        className="mt-2 min-h-28 w-full rounded-[16px] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  return <button className="min-h-11 rounded-full bg-cyan-400 px-5 py-3 text-sm font-medium text-slate-950" type="submit">{label}</button>;
}
