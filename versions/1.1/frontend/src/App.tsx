import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { HomePage } from './pages/HomePage';
import { AiPage } from './pages/AiPage';
import { AboutPage } from './pages/AboutPage';
import { SolutionsPage } from './pages/SolutionsPage';
import { CasesPage } from './pages/CasesPage';
import { DataPage } from './pages/DataPage';
import { IdlePage } from './pages/IdlePage';
import { AdminPage } from './pages/AdminPage';
import { AdminLoginPage, hasAdminToken } from './pages/AdminLoginPage';
import { DownloadsPage } from './pages/DownloadsPage';
import { useIdleReset } from './hooks/useIdleReset';

const navItems = [
  ['/', '首页'],
  ['/about', '企业介绍'],
  ['/solutions', '解决方案'],
  ['/cases', '案例展示'],
  ['/data', '数据驾驶舱'],
  ['/ai', 'AI 问答'],
  ['/downloads', '文件下载'],
  ['/admin', '后台概览'],
] as const;

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const onIdle = useCallback(() => {
    if (location.pathname !== '/idle') {
      navigate('/idle');
    }
  }, [location.pathname, navigate]);

  useIdleReset(onIdle, 60000);

  return (
    <div className="min-h-screen bg-grid bg-grid text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(66,217,255,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(125,97,255,0.16),transparent_28%)]" />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">SIICSERVICE EXPO SYSTEM</div>
          <div className="text-2xl font-semibold">上实服务智慧物业展厅</div>
        </div>
        <nav className="glass-panel flex flex-wrap gap-2 rounded-full px-3 py-2 text-sm">
          {navItems.map(([to, label]) => (
            <NavLink
              key={to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${isActive ? 'bg-cyan-400/20 text-cyan-100' : 'text-slate-200/70 hover:text-white'}`
              }
              to={to}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/idle" element={<IdlePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/ai" element={<AiPage />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admin" element={hasAdminToken() ? <AdminPage /> : <Navigate to="/admin-login" replace />} />
          </Routes>
        </motion.div>
      </main>
    </div>
  );
}
