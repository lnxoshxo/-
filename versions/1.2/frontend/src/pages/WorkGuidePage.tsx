import { SectionHeader } from '../components/SectionHeader';
import { workGuides } from '../data/expoContent';

export function WorkGuidePage() {
  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="WORK GUIDE"
        title="工作指引：安全生产与标准化执行"
        description="根据会议纪要要求，将工作指引从普通内容页升级为面向项目现场的管理方法展示，突出安全、标准、应急和客户服务闭环。"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {workGuides.map((item, index) => (
          <div key={item.title} className="glass-panel rounded-[28px] p-7">
            <div className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100 w-fit">GUIDE {String(index + 1).padStart(2, '0')}</div>
            <div className="mt-5 text-2xl font-semibold text-white">{item.title}</div>
            <p className="mt-4 text-sm leading-7 text-slate-300/80">{item.description}</p>
          </div>
        ))}
      </div>
      <div className="glass-panel rounded-[32px] p-8 lg:p-10">
        <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Management Loop</div>
        <div className="mt-3 text-3xl font-semibold">发现问题、派发任务、整改复核、沉淀标准</div>
        <p className="mt-4 text-base leading-8 text-slate-300/80">
          工作指引板块可与数据驾驶舱联动展示：通过安全巡检、标准检查和工单闭环，让制度不只停留在文件中，而是成为可执行、可监督、可复盘的项目管理机制。
        </p>
      </div>
    </section>
  );
}
