import { SectionHeader } from '../components/SectionHeader';

const solutions = [
  '商办物业服务：前台接待、秩序维护、设备保障与客户体验协同。',
  '产业园区运营：工单、巡检、安防、设备与客户诉求跨岗位联动。',
  '城市公共空间服务：面向北外滩等场景强化城市界面和公共秩序。',
  '设备设施运维：通过设备状态监测和预防性维护提升空间运行稳定性。',
  '客户服务体验管理：让报事、反馈、处理和回访形成可追踪闭环。',
  '绿色低碳运营：围绕能耗指标和运营策略，支撑 ESG 与未来社区方向。',
];

export function SolutionsPage() {
  return (
    <section>
      <SectionHeader
        eyebrow="SOLUTIONS"
        title="服务项目：多业态服务覆盖与运营能力"
        description="作为讲解结构中的服务项目板块，本页用于承接公司介绍，展示上实服务面向不同空间场景的专业服务组合。"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {solutions.map((item, index) => (
          <div key={item} className="glass-panel rounded-[28px] p-6">
            <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Service {String(index + 1).padStart(2, '0')}</div>
            <div className="mt-3 text-lg font-medium leading-8 text-white">{item}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
