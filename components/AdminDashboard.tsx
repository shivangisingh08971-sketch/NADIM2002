
import React, { useEffect, useState } from 'react';
import { User, ViewState, SystemSettings, MCQItem, Board, ClassLevel, GiftCode, PrizeConfig } from '../types';
import { Users, Trash2, Save, X, Eye, Shield, Megaphone, CheckCircle, Database, FileText, Monitor, Sparkles, Banknote, BrainCircuit, AlertOctagon, ArrowLeft, Key, Bell, ShieldCheck, Zap, RefreshCw, LogOut, Gift, Book, ClipboardPaste, Table, Clock, Settings, Trophy, Percent, Upload, MessageCircle } from 'lucide-react';

interface Props {
  onNavigate: (view: ViewState) => void;
  settings?: SystemSettings;
  onUpdateSettings?: (s: SystemSettings) => void;
  onImpersonate?: (user: User) => void;
  logActivity: (action: string, details: string) => void;
}

type AdminTab = 'DASHBOARD' | 'USERS' | 'MEGA_TEST' | 'CONFIG_SYSTEM' | 'RECYCLE';

export const AdminDashboard: React.FC<Props> = ({ onNavigate, settings, onUpdateSettings, onImpersonate, logActivity }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings || {
      appName: 'NST', themeColor: '#3b82f6', maintenanceMode: false, customCSS: '', apiKeys: [], 
      marqueeLines: [], chatCost: 1, chatCooldownMinutes: 360, dailyReward: 3, signupBonus: 2,
      isChatEnabled: true, isGameEnabled: true, allowSignup: true, loginMessage: '', 
      upiId: '', upiName: '', qrCodeUrl: '', paymentInstructions: '', packages: [],
      isMegaTestLive: false, megaTestQuestionLimit: 50, wheelRewards: [0, 1, 2, 5],
      megaTestPrizes: { rank1: 100, rank2: 50, rank3: 25, above60: 10, above45: 5, above30: 2 }
  } as any);

  const [megaQuestions, setMegaQuestions] = useState<MCQItem[]>([]);
  const [pasteData, setPasteData] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const storedTest = localStorage.getItem('nst_mega_test_questions');
    if (storedTest) setMegaQuestions(JSON.parse(storedTest));
  }, []);

  const handleSaveSettings = () => {
      if (onUpdateSettings) {
          onUpdateSettings(localSettings);
          logActivity("SETTINGS_UPDATE", "Updated Master Admin Configuration");
          alert("✅ Admin Master Settings Saved!");
      }
  };

  const handleBulkImport = () => {
    if (!pasteData.trim()) return;
    const rows = pasteData.trim().split('\n');
    const newMcqs: MCQItem[] = [];
    rows.forEach(row => {
        const columns = row.includes('\t') ? row.split('\t') : row.split(',');
        if (columns.length >= 6) {
            newMcqs.push({
                question: columns[0].trim(),
                options: [columns[1].trim(), columns[2].trim(), columns[3].trim(), columns[4].trim()],
                correctAnswer: ['A','B','C','D'].indexOf(columns[5].trim().toUpperCase()) || 0,
                explanation: columns[6] ? columns[6].trim() : "Answer verified."
            });
        }
    });
    const final = [...megaQuestions, ...newMcqs];
    setMegaQuestions(final);
    localStorage.setItem('nst_mega_test_questions', JSON.stringify(final));
    setPasteData('');
    setShowImportModal(false);
    alert(`Imported ${newMcqs.length} Questions! Total Bank: ${final.length}`);
  };

  const DashboardCard = ({ icon: Icon, label, onClick, color }: any) => (
      <button onClick={onClick} className={`p-6 rounded-[32px] border-2 flex flex-col items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 bg-white border-slate-100 hover:border-${color}-400 hover:bg-${color}-50 shadow-sm`}>
          <div className={`p-4 rounded-2xl bg-${color}-100 text-${color}-600`}><Icon size={28} /></div>
          <span className="font-black text-xs uppercase tracking-widest text-slate-600">{label}</span>
      </button>
  );

  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      {showImportModal && (
          <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in">
                  <div className="bg-slate-50 p-8 border-b flex justify-between items-center">
                      <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3"><ClipboardPaste className="text-blue-600" /> Sheets Bulk Import</h3>
                      <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={24} /></button>
                  </div>
                  <div className="p-8">
                      <textarea value={pasteData} onChange={e => setPasteData(e.target.value)} className="w-full h-80 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Paste data from Excel/Google Sheets here... Format: Question | A | B | C | D | CorrectLetter" />
                      <div className="flex gap-4 mt-8">
                          <button onClick={() => setShowImportModal(false)} className="flex-1 py-4 text-slate-500 font-bold uppercase tracking-widest">Cancel</button>
                          <button onClick={handleBulkImport} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2">
                              <Zap size={20} /> Process Import
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'DASHBOARD' && (
          <div className="animate-in fade-in max-w-5xl mx-auto px-4">
              <div className="flex items-center justify-between mb-10 bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
                  <div className="flex items-center gap-5">
                      <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-2xl ring-4 ring-blue-500/20"><Shield size={32} /></div>
                      <div>
                          <h2 className="font-black text-slate-800 text-3xl tracking-tight">Admin Master Console</h2>
                          <p className="text-xs text-slate-400 font-black uppercase mt-1 tracking-[0.2em]">Total Control System</p>
                      </div>
                  </div>
                  <button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl text-xs font-black shadow-xl flex items-center gap-2 transition-all active:scale-95"><Save size={20} /> UPDATE SYSTEM</button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <DashboardCard icon={AlertOctagon} label="Mega Test" onClick={() => setActiveTab('MEGA_TEST')} color="orange" />
                  <DashboardCard icon={Settings} label="Governance" onClick={() => setActiveTab('CONFIG_SYSTEM')} color="indigo" />
                  <DashboardCard icon={Users} label="User Base" onClick={() => setActiveTab('USERS')} color="blue" />
                  <DashboardCard icon={LogOut} label="Exit System" onClick={() => onNavigate('BOARDS')} color="slate" />
              </div>
          </div>
      )}

      {activeTab === 'MEGA_TEST' && (
          <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-slate-200 animate-in slide-in-from-right max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-10 border-b pb-8">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setActiveTab('DASHBOARD')} className="bg-slate-100 p-4 rounded-full hover:bg-slate-200 transition-colors"><ArrowLeft size={24} /></button>
                      <div>
                        <h3 className="text-3xl font-black text-slate-800">Mixed Mega Exam Live</h3>
                        <p className="text-xs text-slate-400 font-black uppercase mt-1 tracking-widest">Universal Question Bank & Prize Pool</p>
                      </div>
                  </div>
                  <button onClick={() => setShowImportModal(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-sm font-black shadow-xl flex items-center gap-3 active:scale-95 transition-all"><Upload size={22} /> Upload Questions (1000+)</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1 space-y-8">
                      <div className="bg-slate-50 p-8 rounded-[32px] border-2 border-slate-100">
                          <h4 className="font-black text-slate-800 flex items-center gap-2 mb-6 uppercase text-sm tracking-widest"><Monitor size={20} className="text-blue-600" /> Exam State</h4>
                          <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 mb-6 shadow-sm">
                              <span className="text-xs font-black text-slate-500 uppercase">Live On Student App</span>
                              <input type="checkbox" checked={localSettings.isMegaTestLive} onChange={e => setLocalSettings({...localSettings, isMegaTestLive: e.target.checked})} className="w-8 h-8 accent-green-600 cursor-pointer" />
                          </div>
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Display Question Limit (e.g. 50)</label>
                              <input type="number" value={localSettings.megaTestQuestionLimit} onChange={e => setLocalSettings({...localSettings, megaTestQuestionLimit: parseInt(e.target.value)})} className="w-full p-4 border-2 border-slate-100 rounded-2xl font-black text-blue-600 outline-none focus:border-blue-500" />
                          </div>
                      </div>

                      <div className="bg-orange-50 p-8 rounded-[32px] border-2 border-orange-100">
                          <h4 className="font-black text-orange-800 flex items-center gap-2 mb-6 uppercase text-sm tracking-widest"><Trophy size={20} /> Prize Configuration</h4>
                          <div className="grid grid-cols-2 gap-4">
                              {Object.entries(localSettings.megaTestPrizes).map(([key, val]) => (
                                  <div key={key} className="space-y-2">
                                      <label className="text-[9px] font-black text-orange-600 uppercase">{key.replace('rank', 'Rank ').replace('above', 'Milestone ')}</label>
                                      <div className="relative">
                                          <input type="number" value={val} onChange={e => setLocalSettings({...localSettings, megaTestPrizes: {...localSettings.megaTestPrizes, [key]: parseInt(e.target.value)}})} className="w-full p-3 pl-8 border-2 border-orange-100 rounded-xl text-xs font-black text-orange-700 outline-none" />
                                          <Zap className="absolute left-2 top-3 text-orange-300" size={12} />
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="lg:col-span-2">
                      <div className="bg-slate-900 rounded-[40px] p-8 min-h-[500px] border-4 border-slate-800 shadow-2xl">
                          <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                              <h4 className="text-white font-black text-lg flex items-center gap-3"><Table size={24} className="text-blue-500" /> Current Question Bank ({megaQuestions.length})</h4>
                              <button onClick={() => { if(window.confirm("Delete all?")) { setMegaQuestions([]); localStorage.removeItem('nst_mega_test_questions'); } }} className="text-red-400 text-xs font-black uppercase hover:underline">Reset All</button>
                          </div>
                          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                              {megaQuestions.length === 0 ? (
                                  <div className="text-center py-20 text-slate-700 font-black uppercase tracking-widest">Question Bank Empty</div>
                              ) : (
                                  megaQuestions.map((q, idx) => (
                                      <div key={idx} className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 hover:border-slate-500 transition-colors">
                                          <p className="text-white text-sm font-bold mb-3"><span className="text-blue-400 mr-2">{idx + 1}.</span> {q.question}</p>
                                          <div className="grid grid-cols-2 gap-3">
                                              {q.options.map((o, oi) => <div key={oi} className={`text-[10px] p-2 rounded-lg ${q.correctAnswer === oi ? 'bg-green-600/30 text-green-400 border border-green-600/50 font-black' : 'bg-slate-700/50 text-slate-400 border border-transparent'}`}>{o}</div>)}
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'CONFIG_SYSTEM' && (
          <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-200 animate-in slide-in-from-right max-w-5xl mx-auto">
              <div className="flex items-center gap-4 mb-10 border-b pb-8">
                  <button onClick={() => setActiveTab('DASHBOARD')} className="bg-slate-100 p-4 rounded-full hover:bg-slate-200"><ArrowLeft size={24} /></button>
                  <h3 className="text-3xl font-black text-slate-800">App Governance</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-blue-50 p-8 rounded-[32px] border-2 border-blue-100">
                      <h4 className="font-black text-blue-800 flex items-center gap-3 mb-6 uppercase text-sm tracking-widest"><MessageCircle size={24} /> Chat Power</h4>
                      <div className="space-y-6">
                          <div className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-blue-100">
                              <span className="text-xs font-black text-slate-600 uppercase">Chat Status</span>
                              <input type="checkbox" checked={localSettings.isChatEnabled} onChange={e => setLocalSettings({...localSettings, isChatEnabled: e.target.checked})} className="w-6 h-6 accent-blue-600" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cooldown Interval (Minutes)</label>
                              <div className="flex items-center gap-3">
                                  <input type="number" value={localSettings.chatCooldownMinutes} onChange={e => setLocalSettings({...localSettings, chatCooldownMinutes: parseInt(e.target.value)})} className="flex-1 p-4 border-2 border-blue-100 rounded-2xl font-black text-blue-800" />
                                  <div className="text-[10px] font-black text-blue-600 bg-white px-3 py-4 border-2 border-blue-100 rounded-2xl whitespace-nowrap uppercase">
                                      {localSettings.chatCooldownMinutes < 60 ? `${localSettings.chatCooldownMinutes} Min` : `${(localSettings.chatCooldownMinutes/60).toFixed(1)} Hr`}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-purple-50 p-8 rounded-[32px] border-2 border-purple-100">
                      <h4 className="font-black text-purple-800 flex items-center gap-3 mb-6 uppercase text-sm tracking-widest"><Zap size={24} /> Game Rewards</h4>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-purple-100">
                              <span className="text-xs font-black text-slate-600 uppercase">Spin Wheel Access</span>
                              <input type="checkbox" checked={localSettings.isGameEnabled} onChange={e => setLocalSettings({...localSettings, isGameEnabled: e.target.checked})} className="w-6 h-6 accent-purple-600" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prize Values (Comma Separated)</label>
                            <input type="text" value={localSettings.wheelRewards.join(', ')} onChange={e => setLocalSettings({...localSettings, wheelRewards: e.target.value.split(',').map(v => parseInt(v.trim()) || 0)})} className="w-full p-4 border-2 border-purple-100 rounded-2xl font-black text-purple-800" placeholder="0, 1, 2, 5, 10, 50..." />
                            <p className="text-[9px] text-purple-400 italic">Example: 0, 1, 5, 10 (Higher values = lower odds automatically)</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
