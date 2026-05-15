import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader } from '../components/SectionHeader';
import { fetchHomeContent, type HomeContent } from '../lib/api';

const stats = [
  ['管理项目', '260+'],
  ['服务面积', '3200万㎡+'],
  ['客户满意度', '96.8%'],
  ['在线设备覆盖', '18万+'],
];

const valueHighlights = [
  {
    title: '智慧运营中枢',
    description: '融合服务流程、设备状态与客户反馈，构建面向空间运营的统一协同界面。',
  },
  {
    title: '多业态服务能力',
    description: '覆盖商办、园区及复合场景，形成标准化与精细化并行的服务体系。',
  },
  {
    title: 'AI 知识交互体验',
    description: '让展会访客通过自然语言快速了解企业能力、案例成果与数字化路径。',
  },
];

const showcaseSlides = [
  {
    eyebrow: 'Smart Property',
    title: '智慧中台驱动多场景空间运营',
    description: '围绕服务协同、设备联动、客户响应与运营分析，形成面向园区与商办的数字化管理能力。',
  },
  {
    eyebrow: 'Service Experience',
    title: '展会现场可讲解、可交互、可追问',
    description: '通过触摸屏导览、案例展示和知识库问答，让观众快速建立对企业能力的完整认知。',
  },
  {
    eyebrow: 'AI Showcase',
    title: '知识库问答联动企业展示内容',
    description: '将宣传资料、FAQ 和案例信息纳入统一知识体系，提升展会讲解效率与信息触达质量。',
  },
];

export function HomePage() {
  const [content, setContent] = useState<HomeContent>({
    heroTitle: '让物业服务从空间管理走向智慧运营',
    heroSubtitle: '上实服务以城市空间服务为基础，融合数字平台、设备物联与 AI 能力，构建面向园区、商办与复合业态的智慧物业服务体系。',
    ctas: [
      { label: '了解上实服务', href: '/about' },
      { label: '体验 AI 问答', href: '/ai' },
    ],
  });
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    void fetchHomeContent().then(setContent).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % showcaseSlides.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div className="glass-panel rounded-[32px] p-8 lg:p-12">
          <SectionHeader
            eyebrow="SMART PROPERTY EXHIBITION"
            title={content.heroTitle}
            description={content.heroSubtitle}
          />
          <div className="flex flex-wrap gap-4">
            {content.ctas.map((cta, index) => (
              <Link
                key={`${cta.label}-${cta.href}`}
                className={
                  index === 0
                    ? 'rounded-full bg-cyan-400 px-6 py-4 text-base font-medium text-slate-950'
                    : 'rounded-full border border-cyan-300/30 px-6 py-4 text-base font-medium text-cyan-100'
                }
                to={cta.href}
              >
                {cta.label}
              </Link>
            ))}
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {valueHighlights.map((item) => (
              <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="text-base font-semibold text-cyan-100">{item.title}</div>
                <div className="mt-2 text-sm leading-6 text-slate-300/75">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-[32px] p-8">
          <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Brand Focus</div>
          <div className="mt-4 text-3xl font-semibold">城市服务的智慧连接器</div>
          <p className="mt-4 text-slate-200/75">
            聚焦品质服务、运营效率与客户体验，通过数字化底座持续提升物业服务的可感知价值。
          </p>
          <div className="mt-8 rounded-[28px] border border-cyan-300/15 bg-cyan-400/5 p-5">
            <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Exhibition Mode</div>
            <div className="mt-3 text-2xl font-semibold">品牌展示、案例讲解、AI 问答三位一体</div>
            <div className="mt-3 text-sm leading-6 text-slate-300/75">
              面向展会触摸屏场景设计，支持快速讲解、访客自助浏览和知识库问答联动。
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="glass-panel rounded-[28px] p-6">
            <div className="text-sm text-slate-300/70">{label}</div>
            <div className="mt-3 text-4xl font-semibold text-cyan-100">{value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[32px] p-8 lg:p-10">
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Showcase Loop</div>
          <div className="mt-4 text-xs uppercase tracking-[0.35em] text-slate-400">{showcaseSlides[activeSlide].eyebrow}</div>
          <div className="mt-4 text-3xl font-semibold lg:text-4xl">{showcaseSlides[activeSlide].title}</div>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300/75">{showcaseSlides[activeSlide].description}</p>
          <div className="mt-8 flex gap-2">
            {showcaseSlides.map((slide, index) => (
              <button
                key={slide.title}
                className={`h-2 rounded-full transition ${activeSlide === index ? 'w-10 bg-cyan-300' : 'w-4 bg-white/20'}`}
                onClick={() => setActiveSlide(index)}
                type="button"
              />
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="glass-panel rounded-[28px] p-6">
            <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">现场导览</div>
            <div className="mt-3 text-2xl font-semibold">触摸屏自助体验路径清晰可控</div>
            <p className="mt-3 text-sm leading-6 text-slate-300/75">支持品牌总览、解决方案、案例展示和 AI 提问之间快速切换，适合人流密集展位环境。</p>
          </div>
          <div className="glass-panel rounded-[28px] p-6">
            <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">知识运营</div>
            <div className="mt-3 text-2xl font-semibold">后台可持续维护知识库与展示内容</div>
            <p className="mt-3 text-sm leading-6 text-slate-300/75">支持 FAQ、案例、首页文案和知识文档维护，便于随展会主题快速更新展示重点。</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Link className="glass-panel rounded-[28px] p-6 transition hover:border-cyan-300/30" to="/solutions">
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Solution Matrix</div>
          <div className="mt-3 text-2xl font-semibold">查看解决方案矩阵</div>
          <p className="mt-3 text-sm leading-6 text-slate-300/75">聚焦园区运营、商办服务、设备运维、能源管理与客户体验。</p>
        </Link>
        <Link className="glass-panel rounded-[28px] p-6 transition hover:border-cyan-300/30" to="/cases">
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Case Showcase</div>
          <div className="mt-3 text-2xl font-semibold">查看典型项目案例</div>
          <p className="mt-3 text-sm leading-6 text-slate-300/75">通过已落地场景展示企业在综合空间服务中的能力深度与交付水平。</p>
        </Link>
        <Link className="glass-panel rounded-[28px] p-6 transition hover:border-cyan-300/30" to="/ai">
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">AI Concierge</div>
          <div className="mt-3 text-2xl font-semibold">进入 AI 知识问答</div>
          <p className="mt-3 text-sm leading-6 text-slate-300/75">基于企业知识库进行问题检索与生成式回答，适合展会现场即时讲解。</p>
        </Link>
      </section>
    </div>
  );
}
