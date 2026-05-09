import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const highlights = ['智慧物业', '园区运营', '数字中台', 'AI 知识问答'];

export function IdlePage() {
  return (
    <section className="grid min-h-[72vh] gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <motion.div
        animate={{ opacity: [0.75, 1, 0.75], y: [-4, 0, -4] }}
        className="glass-panel rounded-[40px] px-10 py-16 lg:px-16"
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="text-xs uppercase tracking-[0.45em] text-cyan-200/70">WELCOME</div>
        <h1 className="mt-5 text-5xl font-semibold leading-tight lg:text-7xl">上实服务 SIICSERVICE</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200/75">
          智慧物业展厅交互系统。点击进入，了解企业实力、解决方案、典型案例与 AI 知识问答体验。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {highlights.map((item) => (
            <div key={item} className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-start">
          <Link className="rounded-full bg-cyan-400 px-8 py-4 text-lg font-medium text-slate-950" to="/">
            点击进入展厅
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-4">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          className="glass-panel rounded-[32px] p-6"
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Current Showcase</div>
          <div className="mt-3 text-2xl font-semibold">品牌展示与智慧运营场景联动</div>
          <div className="mt-3 text-sm leading-6 text-slate-300/75">
            通过沉浸式界面、数据驾驶舱和知识问答，帮助观众在短时间内建立对企业能力的完整认知。
          </div>
        </motion.div>
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          className="glass-panel rounded-[32px] p-6"
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Touch Interaction</div>
          <div className="mt-3 text-2xl font-semibold">支持触摸屏自助浏览与即时提问</div>
          <div className="mt-3 text-sm leading-6 text-slate-300/75">
            适配展会触摸一体机，支持快速导航、自动待机和基于知识库的专业答复。
          </div>
        </motion.div>
      </div>
    </section>
  );
}
