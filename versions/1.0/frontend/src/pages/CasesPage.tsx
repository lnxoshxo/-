import { useEffect, useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { fetchCases, type CaseItem } from '../lib/api';

export function CasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);

  useEffect(() => {
    void fetchCases().then(setCases).catch(() => setCases([]));
  }, []);

  return (
    <section>
      <SectionHeader
        eyebrow="CASES"
        title="以场景落地验证服务能力，以项目实践沉淀运营方法"
        description="聚焦典型空间场景，展示上实服务在园区、商办与复合业态中的综合运营能力。"
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {cases.map((item) => (
          <div key={item.id} className="glass-panel rounded-[28px] p-6">
            <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">{item.category}</div>
            <div className="mt-3 text-2xl font-semibold">{item.title}</div>
            <p className="mt-3 text-slate-200/75">{item.summary}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
