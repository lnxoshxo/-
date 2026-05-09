import { SectionHeader } from '../components/SectionHeader';

const solutions = [
  '商办物业服务',
  '产业园区运营',
  '设备设施运维',
  '客户服务体验管理',
  '安防与应急协同',
  '能源与绿色运营',
];

export function SolutionsPage() {
  return (
    <section>
      <SectionHeader
        eyebrow="SOLUTIONS"
        title="面向多场景的智慧物业解决方案矩阵"
        description="围绕服务、运营、设备、安全与能源等核心环节，形成可复制、可落地、可持续优化的智慧物业解决方案。"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {solutions.map((item) => (
          <div key={item} className="glass-panel rounded-[28px] p-6 text-xl font-medium">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
