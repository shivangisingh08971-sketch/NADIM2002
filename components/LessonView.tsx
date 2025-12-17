
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { LessonContent, Subject, ClassLevel, Chapter, MCQItem, ContentType } from '../types';
import { ArrowLeft, Clock, AlertTriangle, ExternalLink, CheckCircle, XCircle, Trophy, BookOpen, AlertCircle, HelpCircle } from 'lucide-react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface Props {
  content: LessonContent | null;
  subject: Subject;
  classLevel: ClassLevel;
  chapter: Chapter;
  loading: boolean;
  onBack: () => void;
  onMCQComplete?: (count: number) => void; 
}

export const LessonView: React.FC<Props> = ({ 
  content, 
  subject, 
  classLevel, 
  chapter,
  loading, 
  onBack,
  onMCQComplete
}) => {
  const [mcqState, setMcqState] = useState<Record<number, number | null>>({});
  const [showResults, setShowResults] = useState(false);
  const [shakeId, setShakeId] = useState<number | null>(null);
  
  if (loading) {
      return (
          <div className="h-[70vh] flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <h3 className="text-xl font-bold text-slate-800 animate-pulse">Fetching Content...</h3>
              <p className="text-slate-500 text-sm">NST AI is preparing your study material.</p>
          </div>
      );
  }

  if (!content || content.isComingSoon) {
      return (
          <div className="h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl m-4 border-2 border-dashed border-slate-200">
              <Clock size={64} className="text-orange-400 mb-4 opacity-80" />
              <h2 className="text-2xl font-black text-slate-800 mb-2">Coming Soon</h2>
              <p className="text-slate-600 max-w-xs mx-auto mb-6">This content is currently being prepared by the Admin.</p>
              <button onClick={onBack} className="mt-8 text-blue-600 font-bold hover:underline">Go Back</button>
          </div>
      );
  }

  // --- MCQ & WEEKLY TEST RENDERER ---
  const isMcqMode = ['MCQ_ANALYSIS', 'MCQ_SIMPLE', 'WEEKLY_TEST'].includes(content.type);

  if (isMcqMode && content.mcqData) {
      const score = Object.keys(mcqState).reduce((acc, key) => {
          const qIdx = parseInt(key);
          return acc + (mcqState[qIdx] === content.mcqData![qIdx].correctAnswer ? 1 : 0);
      }, 0);

      const handleAnswer = (qIdx: number, oIdx: number) => {
          if (mcqState[qIdx] !== undefined) return; // Prevent changing answer
          setMcqState(prev => ({ ...prev, [qIdx]: oIdx }));
          
          // Trigger shake if wrong
          if (oIdx !== content.mcqData![qIdx].correctAnswer) {
              setShakeId(qIdx);
              setTimeout(() => setShakeId(null), 500);
          }
      };

      const handleFinish = () => {
          setShowResults(true);
          if (onMCQComplete) onMCQComplete(score);
          
          const entry = { id: Date.now().toString(), topic: chapter.title, score, total: content.mcqData!.length, date: new Date().toISOString(), userName: 'Student' };
          const existing = JSON.parse(localStorage.getItem('nst_leaderboard') || '[]');
          localStorage.setItem('nst_leaderboard', JSON.stringify([entry, ...existing].slice(0, 50)));
      };

      return (
          <div className="flex flex-col h-full bg-slate-50 animate-in fade-in">
               <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                   <button onClick={onBack} className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200">
                       <ArrowLeft size={16} /> Exit
                   </button>
                   <div className="text-right">
                       <h3 className="font-black text-slate-800 text-sm uppercase">{content.type === 'WEEKLY_TEST' ? 'Weekly Exam' : 'Practice Test'}</h3>
                       <span className="text-xs font-bold text-blue-600">{Object.keys(mcqState).length}/{content.mcqData.length} Done</span>
                   </div>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-3xl mx-auto w-full pb-32">
                   {content.mcqData.map((q, idx) => {
                       const userAnswer = mcqState[idx];
                       const isAnswered = userAnswer !== undefined && userAnswer !== null;
                       const isCorrect = userAnswer === q.correctAnswer;
                       const isShaking = shakeId === idx;
                       
                       return (
                           <div key={idx} className={`bg-white p-5 rounded-3xl border-2 transition-all duration-300 ${isShaking ? 'animate-shake border-red-200' : isAnswered ? (isCorrect ? 'border-green-500 shadow-lg' : 'border-red-200') : 'border-slate-100'}`}>
                               <div className="flex items-center justify-between mb-4">
                                   <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${isAnswered ? (isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 'bg-slate-100 text-slate-500'}`}>
                                       Question {idx + 1}
                                   </span>
                                   {isAnswered && (
                                       <span className={`flex items-center gap-1 text-[10px] font-black uppercase ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                           {isCorrect ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                           {isCorrect ? 'Correct' : 'Wrong Answer'}
                                       </span>
                                   )}
                               </div>

                               <h4 className="font-bold text-slate-800 mb-6 leading-relaxed text-lg">{q.question}</h4>

                               <div className="space-y-3">
                                   {q.options.map((opt, oIdx) => {
                                       const isCorrectOption = oIdx === q.correctAnswer;
                                       const isStudentChoice = userAnswer === oIdx;
                                       
                                       let btnClass = "w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 text-sm font-bold flex items-center justify-between ";
                                       
                                       if (isAnswered) {
                                           if (isCorrectOption) btnClass += "bg-green-500 border-green-600 text-white shadow-md scale-[1.02] z-10";
                                           else if (isStudentChoice) btnClass += "bg-red-500 border-red-600 text-white shadow-md";
                                           else btnClass += "bg-slate-50 border-slate-100 opacity-40 grayscale";
                                       } else {
                                           btnClass += "bg-white border-slate-100 hover:border-blue-500 hover:bg-blue-50 text-slate-700";
                                       }

                                       return (
                                           <button key={oIdx} disabled={isAnswered} onClick={() => handleAnswer(idx, oIdx)} className={btnClass}>
                                               <div className="flex items-center gap-3">
                                                   <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${isAnswered && (isCorrectOption || isStudentChoice) ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                                       {String.fromCharCode(65 + oIdx)}
                                                   </span>
                                                   {opt}
                                               </div>
                                               {isAnswered && isCorrectOption && <CheckCircle size={18} className="text-white" />}
                                               {isAnswered && isStudentChoice && !isCorrectOption && <XCircle size={18} className="text-white" />}
                                           </button>
                                       );
                                   })}
                               </div>
                               
                               {isAnswered && (
                                   <div className="mt-6 animate-in slide-in-from-top-4">
                                       <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden">
                                           <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Explanation</h5>
                                           <p className="text-sm leading-relaxed text-slate-300 italic">"{q.explanation || 'Answer verified by NST AI Engine.'}"</p>
                                       </div>
                                   </div>
                               )}
                           </div>
                       );
                   })}
               </div>

               {!showResults && (
                   <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 sticky bottom-0 z-10 flex justify-center shadow-2xl">
                       <button onClick={handleFinish} disabled={Object.keys(mcqState).length === 0} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-4 px-12 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3">
                           <Trophy size={20} /> Finish & See Results
                       </button>
                   </div>
               )}

               {showResults && (
                   <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in">
                        <div className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl border-8 border-blue-50">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600"><Trophy size={40} /></div>
                            <h2 className="text-3xl font-black text-slate-900 mb-1">Result Out!</h2>
                            <p className="text-slate-500 font-bold text-sm mb-6">{chapter.title}</p>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-green-50 p-4 rounded-3xl border border-green-100">
                                    <div className="text-3xl font-black text-green-600">{score}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase">Correct</div>
                                </div>
                                <div className="bg-red-50 p-4 rounded-3xl border border-red-100">
                                    <div className="text-3xl font-black text-red-600">{content.mcqData.length - score}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase">Wrong</div>
                                </div>
                            </div>
                            <button onClick={onBack} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl">Close & Return</button>
                        </div>
                   </div>
               )}
          </div>
      );
  }

  // --- PDF & NOTES RENDERER (EXISTING) ---
  return (
    <div className="bg-white min-h-screen pb-20 animate-in fade-in">
       {/* ... existing markdown/pdf rendering logic ... */}
       <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between">
           <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-slate-900"><ArrowLeft size={20} /></button>
           <h3 className="font-bold text-slate-800 text-sm truncate">{chapter.title}</h3>
           <div className="w-8"></div>
       </div>
       <div className="max-w-3xl mx-auto p-6">
           <div className="prose prose-slate max-w-none">
               <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{content.content}</ReactMarkdown>
           </div>
       </div>
    </div>
  );
};
