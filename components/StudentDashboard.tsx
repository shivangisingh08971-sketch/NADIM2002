
import React, { useState } from 'react';
import { User, Subject, StudentTab, SystemSettings, LessonContent, MCQItem } from '../types';
import { getSubjectsList } from '../constants';
import { RedeemSection } from './RedeemSection';
import { Calendar, History, Gift, Sparkles, MessageCircle, Gamepad2, Timer, Trophy, ArrowRight, Activity, ShieldAlert, Rocket, BookOpen } from 'lucide-react';
import { HistoryPage } from './HistoryPage';
import { UniversalChat } from './UniversalChat';
import { SpinWheel } from './SpinWheel';
import { Leaderboard } from './Leaderboard';

interface Props {
  user: User;
  dailyStudySeconds: number;
  onSubjectSelect: (subject: Subject) => void;
  onRedeemSuccess: (user: User) => void;
  settings?: SystemSettings;
}

export const StudentDashboard: React.FC<Props> = ({ user, dailyStudySeconds, onSubjectSelect, onRedeemSuccess, settings }) => {
  const [activeTab, setActiveTab] = useState<StudentTab | 'LEADERBOARD'>('ROUTINE');
  const [megaTestContent, setMegaTestContent] = useState<LessonContent | null>(null);

  const startMegaTest = () => {
      const questionsStr = localStorage.getItem('nst_mega_test_questions');
      if (!questionsStr || JSON.parse(questionsStr).length === 0) {
          alert("Admin is currently setting up the global questions. Check back soon!");
          return;
      }
      
      const allQs: MCQItem[] = JSON.parse(questionsStr);
      const limit = settings?.megaTestQuestionLimit || 50;
      const selection = allQs.sort(() => 0.5 - Math.random()).slice(0, limit);

      setMegaTestContent({
          id: 'MEGA_TEST_LIVE',
          title: "MEGA WEEKLY EXAM",
          subtitle: `Live Global Ranking`,
          content: '',
          type: 'WEEKLY_TEST',
          dateCreated: new Date().toISOString(),
          subjectName: 'Mega Exam',
          mcqData: selection
      });
  };

  const RoutineView = () => {
    const subjects = getSubjectsList(user.classLevel || '10', user.stream || null);
    const isExamLive = settings?.isMegaTestLive;

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* GLOBAL MEGA EXAM BANNER */}
            <div className={`rounded-[40px] p-8 text-white mb-10 shadow-2xl relative overflow-hidden group transition-all transform hover:scale-[1.01] ${isExamLive ? 'bg-gradient-to-br from-indigo-700 via-blue-800 to-purple-900 ring-8 ring-blue-500/20' : 'bg-slate-200 text-slate-500'}`}>
                <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform rotate-12"><Rocket size={200} /></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className={`p-3 rounded-2xl ${isExamLive ? 'bg-white text-blue-700 shadow-2xl animate-pulse' : 'bg-slate-300 text-slate-500'}`}>
                            {isExamLive ? <Activity size={32} /> : <ShieldAlert size={32} />}
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter leading-none">{isExamLive ? 'MEGA WEEKLY EXAM LIVE' : 'EXAM CLOSED'}</h3>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${isExamLive ? 'text-blue-200' : 'text-slate-400'}`}>Eligibility: Class {user.classLevel} Student</p>
                        </div>
                    </div>
                    
                    {isExamLive ? (
                        <div className="mt-8 flex flex-col md:flex-row md:items-center gap-8">
                            <button onClick={startMegaTest} className="bg-white text-blue-900 px-10 py-5 rounded-[24px] font-black text-xl shadow-2xl shadow-blue-950/40 hover:scale-105 active:scale-95 transition-all">ENTER EXAM HALL</button>
                            <div className="flex gap-6">
                                <div className="text-center bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl border border-white/10">
                                    <div className="text-xl font-black text-yellow-400">{settings?.megaTestPrizes.rank1} CR</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-blue-100">Rank 1 Prize</div>
                                </div>
                                <div className="text-center bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl border border-white/10">
                                    <div className="text-xl font-black text-blue-100">{settings?.megaTestQuestionLimit}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-blue-100">Questions</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-6 text-sm font-bold italic opacity-60">The global exam room is currently locked. Admin will open it on the scheduled date.</p>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">Standard Syllabus</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((subj, idx) => (
                    <div key={idx} onClick={() => onSubjectSelect(subj)} className="p-6 rounded-[32px] border-2 bg-white border-slate-100 hover:border-blue-500 hover:shadow-xl flex items-center gap-5 transition-all cursor-pointer group">
                        <div className={`h-14 w-14 ${subj.color.split(' ')[0]} rounded-2xl flex items-center justify-center text-current group-hover:scale-110 transition-transform shadow-sm`}>
                            <BookOpen size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-black text-lg text-slate-800 leading-none mb-1">{subj.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Chapters & Practice</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors"><ArrowRight size={20} /></div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  if (megaTestContent) {
      const LessonView = require('./LessonView').LessonView;
      return <LessonView content={megaTestContent} subject={{id:'mega', name:'Mega Exam', color:'bg-blue-600', icon:'rocket'} as any} classLevel={user.classLevel || '10'} chapter={{id:'mega', title: 'Global Mega Exam Live'}} loading={false} onBack={() => setMegaTestContent(null)} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-2">
        <div className={`grid ${settings?.isGameEnabled ? 'grid-cols-7' : 'grid-cols-6'} gap-2 bg-white p-3 rounded-[32px] border border-slate-200 shadow-sm mb-10 sticky top-20 z-20 overflow-x-auto scrollbar-hide`}>
            <button onClick={() => setActiveTab('ROUTINE')} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[75px] ${activeTab === 'ROUTINE' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><Calendar size={20} /><span className="text-[9px] font-black uppercase mt-1">Syllabus</span></button>
            <button onClick={() => setActiveTab('CHAT')} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[75px] ${activeTab === 'CHAT' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}><MessageCircle size={20} /><span className="text-[9px] font-black uppercase mt-1">Chat</span></button>
            <button onClick={() => setActiveTab('LEADERBOARD')} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[75px] ${activeTab === 'LEADERBOARD' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}><Trophy size={20} /><span className="text-[9px] font-black uppercase mt-1">Ranking</span></button>
            {settings?.isGameEnabled && <button onClick={() => setActiveTab('GAME')} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[75px] ${activeTab === 'GAME' ? 'bg-orange-100 text-orange-600' : 'text-slate-400 hover:bg-slate-50'}`}><Gamepad2 size={20} /><span className="text-[9px] font-black uppercase mt-1">Game</span></button>}
            <button onClick={() => setActiveTab('HISTORY')} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[75px] ${activeTab === 'HISTORY' ? 'bg-slate-100 text-slate-600' : 'text-slate-400 hover:bg-slate-50'}`}><History size={20} /><span className="text-[9px] font-black uppercase mt-1">Library</span></button>
            <button onClick={() => setActiveTab('REDEEM')} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[75px] ${activeTab === 'REDEEM' ? 'bg-slate-100 text-slate-600' : 'text-slate-400 hover:bg-slate-50'}`}><Gift size={20} /><span className="text-[9px] font-black uppercase mt-1">Gift</span></button>
            <button onClick={() => setActiveTab('PREMIUM')} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[75px] ${activeTab === 'PREMIUM' ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><Sparkles size={20} /><span className="text-[9px] font-black uppercase mt-1">Store</span></button>
        </div>

        <div className="min-h-[500px] pb-24">
            {activeTab === 'ROUTINE' && <RoutineView />}
            {activeTab === 'CHAT' && <UniversalChat currentUser={user} onUserUpdate={onRedeemSuccess} settings={settings} />}
            {activeTab === 'LEADERBOARD' && <Leaderboard />}
            {activeTab === 'GAME' && settings?.isGameEnabled && <SpinWheel user={user} onUpdateUser={onRedeemSuccess} settings={settings} />}
            {activeTab === 'HISTORY' && <HistoryPage />}
            {activeTab === 'REDEEM' && <RedeemSection user={user} onSuccess={onRedeemSuccess} />}
            {activeTab === 'PREMIUM' && <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest">Premium Store Coming Soon</div>}
        </div>
    </div>
  );
};
