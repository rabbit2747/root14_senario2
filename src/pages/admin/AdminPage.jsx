import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminGuard from './AdminGuard';
import EduFormManager from './edu-manager/EduFormManager';
import UserManager from './UserManager';
import MatrixStructureManager from './matrix-manager/MatrixStructureManager';
import AnnouncementManager from './announcement-manager/AnnouncementManager';
import EduHtmlEditor from './edu-html-editor/EduHtmlEditor';
import AuditLogViewer from './audit-log/AuditLogViewer';
import LabScenarioManager from './lab-scenario-manager/LabScenarioManager';
import EduProgressStats from './EduProgressStats';
import WikiTermManager from './wiki-manager/WikiTermManager';
import LevelTestManager from './level-test-manager/LevelTestManager';
import AccessLogsDashboard from './access-logs/AccessLogsDashboard';
import useAdminVerify from '../../hooks/useAdminVerify';
import AdminVerifyModal from '../../components/admin/AdminVerifyModal';
import NotificationBell from '../../components/admin/NotificationBell';
import { maskEmail } from '../../lib/maskUtils';
import {
  Book, Grid, Bullhorn,
  User, Chemistry, Screen, ChartBar, Task, Catalog, Education, Activity
} from '@carbon/icons-react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const TABS = [
  { id: 'edu',     label: '교육 관리',   Icon: Book },
  { id: 'matrix',  label: '매트릭스 구조', Icon: Grid },
  { id: 'announce', label: '공지 관리',  Icon: Bullhorn },
  { id: 'users',   label: '사용자 관리', Icon: User },
  { id: 'lab',     label: '실습 페이지', Icon: Chemistry },
  { id: 'labscenario', label: '랩 시나리오', Icon: Screen },
  { id: 'wiki',    label: '위키 관리',  Icon: Catalog },
  { id: 'leveltest', label: '레벨테스트', Icon: Education },
  { id: 'stats',   label: '교육 통계',  Icon: ChartBar },
  { id: 'accesslogs', label: '접속 로그', Icon: Activity },
  { id: 'audit',   label: '감사 로그',  Icon: Task },
];

function AdminContent() {
  const [activeTab, setActiveTab] = useState('edu');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const verify = useAdminVerify();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* 헤더 */}
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-full mx-auto px-4 lg:px-6 2xl:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm font-bold transition-colors">
              <ArrowLeftIcon className="w-3.5 h-3.5" /> Matrix
            </button>
            <span className="text-slate-600">|</span>
            <h1 className="text-sm font-black tracking-wider uppercase">
              <span className="text-emerald-400">ROOT14</span> Admin
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell onTabChange={setActiveTab} />
            <span className="text-xs text-slate-400 font-mono">{maskEmail(user?.email)}</span>
            <button onClick={logout} className="text-xs font-bold text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-500/30 hover:border-red-500/60 transition-colors">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 lg:px-6 2xl:px-8 flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap shrink-0 ${activeTab === tab.id ? 'text-blue-600 border-blue-600 bg-blue-50/50' : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'}`}
            >
              <tab.Icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="max-w-full mx-auto px-4 lg:px-6 2xl:px-8 py-6">
        {activeTab === 'edu' && <EduFormManager requestVerify={verify.requestVerify} />}
        {activeTab === 'matrix' && <MatrixStructureManager requestVerify={verify.requestVerify} />}
        {activeTab === 'announce' && <AnnouncementManager requestVerify={verify.requestVerify} />}
        {activeTab === 'users' && <UserManager requestVerify={verify.requestVerify} />}
        {activeTab === 'lab' && <EduHtmlEditor requestVerify={verify.requestVerify} />}
        {activeTab === 'labscenario' && <LabScenarioManager requestVerify={verify.requestVerify} />}
        {activeTab === 'wiki' && <WikiTermManager requestVerify={verify.requestVerify} />}
        {activeTab === 'leveltest' && <LevelTestManager requestVerify={verify.requestVerify} />}
        {activeTab === 'stats' && <EduProgressStats requestVerify={verify.requestVerify} />}
        {activeTab === 'accesslogs' && <AccessLogsDashboard requestVerify={verify.requestVerify} />}
        {activeTab === 'audit' && <AuditLogViewer requestVerify={verify.requestVerify} />}
      </div>

      {/* 관리자 비밀번호 재검증 모달 */}
      <AdminVerifyModal {...verify} />
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminContent />
    </AdminGuard>
  );
}
