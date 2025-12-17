
import { GoogleGenAI, Type } from "@google/genai";
import { ClassLevel, Subject, Chapter, LessonContent, Language, Board, Stream, ContentType, MCQItem, SystemSettings } from "../types";
import { STATIC_SYLLABUS } from "../constants";
import { getChapterData } from "./firebase"; 

const MANUAL_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; 
const getAvailableKeys = (): string[] => {
    try {
        const storedSettings = localStorage.getItem('nst_system_settings');
        const keys: string[] = [];
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings) as SystemSettings;
            if (parsed.apiKeys && Array.isArray(parsed.apiKeys)) {
                parsed.apiKeys.forEach(k => { if(k.trim()) keys.push(k.trim()); });
            }
        }
        if (MANUAL_API_KEY) keys.push(MANUAL_API_KEY);
        const envKey = process.env.API_KEY;
        if (envKey && envKey !== 'DUMMY_KEY_FOR_BUILD') keys.push(envKey);
        return Array.from(new Set(keys));
    } catch (e) { return MANUAL_API_KEY ? [MANUAL_API_KEY] : []; }
};

const executeWithRotation = async <T>(operation: (ai: GoogleGenAI) => Promise<T>): Promise<T> => {
    const keys = getAvailableKeys();
    const shuffledKeys = keys.sort(() => 0.5 - Math.random());
    if (shuffledKeys.length === 0) throw new Error("No API Keys available");
    let lastError: any = null;
    for (const key of shuffledKeys) {
        try { const ai = new GoogleGenAI({ apiKey: key }); return await operation(ai); } catch (error: any) { lastError = error; }
    }
    throw lastError || new Error("All API Keys failed.");
};

const cleanJson = (text: string) => text.replace(/```json/g, '').replace(/```/g, '').trim();

const getAdminContent = async (board: Board, classLevel: ClassLevel, stream: Stream | null, subject: Subject, chapterId: string, type: ContentType): Promise<LessonContent | null> => {
    const streamKey = stream ? `-${stream}` : '';
    let key = `nst_content_${board}_${classLevel}${streamKey}_${subject.name}_${chapterId}`;
    
    // SPECIAL CASE FOR WEEKLY TEST (SUBJECT LEVEL)
    if (type === 'WEEKLY_TEST' || chapterId === 'WEEKLY_TEST_INSTANCE') {
        key = `nst_weekly_test_${board}_${classLevel}${streamKey}_${subject.name}`;
    }
    
    try {
        let parsed = await getChapterData(key);
        if (!parsed) {
            const stored = localStorage.getItem(key);
            if(stored) parsed = JSON.parse(stored);
        }

        if (parsed) {
            if (type === 'WEEKLY_TEST' || parsed.manualMcqData) {
                return {
                    id: Date.now().toString(),
                    title: type === 'WEEKLY_TEST' ? `${subject.name} Weekly Exam` : "Class Test (Admin)",
                    subtitle: `${parsed.manualMcqData?.length || 0} Questions`,
                    content: '',
                    type: type,
                    dateCreated: new Date().toISOString(),
                    subjectName: subject.name,
                    mcqData: parsed.manualMcqData
                };
            }
            if (type === 'PDF_FREE' && parsed.freeLink) return { id: Date.now().toString(), title: "Free Notes", subtitle: "Admin PDF", content: parsed.freeLink, type: 'PDF_FREE', dateCreated: new Date().toISOString(), subjectName: subject.name };
            if (type === 'PDF_PREMIUM' && parsed.premiumLink) return { id: Date.now().toString(), title: "Premium Notes", subtitle: "High Quality", content: parsed.premiumLink, type: 'PDF_PREMIUM', dateCreated: new Date().toISOString(), subjectName: subject.name };
        }
    } catch (e) { console.error("Lookup Error", e); }
    return null;
};

export const fetchChapters = async (board: Board, classLevel: ClassLevel, stream: Stream | null, subject: Subject, language: Language): Promise<Chapter[]> => {
  const streamKey = stream ? `-${stream}` : '';
  const cacheKey = `${board}-${classLevel}${streamKey}-${subject.name}-${language}`;
  
  const staticKey = `${board}-${classLevel}-${subject.name}`; 
  const staticList = STATIC_SYLLABUS[staticKey];
  if (staticList && staticList.length > 0) return staticList.map((title, idx) => ({ id: `static-${idx + 1}`, title: title }));

  const prompt = `List 15 standard chapters for Class ${classLevel} ${stream ? stream : ''} Subject: ${subject.name} (${board}). Return JSON array: [{"title": "...", "description": "..."}].`;
  try {
    return await executeWithRotation(async (ai) => {
        const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt, config: { responseMimeType: "application/json" } });
        const data = JSON.parse(cleanJson(response.text || '[]'));
        return data.map((item: any, index: number) => ({ id: `ch-${index + 1}`, title: item.title }));
    });
  } catch (error) { return [{id:'1', title: 'Chapter 1'}]; }
};

export const fetchLessonContent = async (board: Board, classLevel: ClassLevel, stream: Stream | null, subject: Subject, chapter: Chapter, language: Language, type: ContentType): Promise<LessonContent> => {
  const adminContent = await getAdminContent(board, classLevel, stream, subject, chapter.id, type);
  if (adminContent) return adminContent;

  if (type === 'PDF_FREE' || type === 'PDF_PREMIUM' || type === 'WEEKLY_TEST') {
      return { id: Date.now().toString(), title: chapter.title, subtitle: "Unavailable", content: "", type: type, dateCreated: new Date().toISOString(), subjectName: subject.name, isComingSoon: true };
  }

  const prompt = `Create 15 MCQs for ${board} Class ${classLevel} ${subject.name}, Chapter: "${chapter.title}". Language: ${language}. Return JSON array: [{"question": "...", "options": ["A","B","C","D"], "correctAnswer": 0, "explanation": "..."}]`;
  const data = await executeWithRotation(async (ai) => {
      const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt, config: { responseMimeType: "application/json" } });
      return JSON.parse(cleanJson(response.text || '[]'));
  });

  return { id: Date.now().toString(), title: `MCQ: ${chapter.title}`, subtitle: `${data.length} Qs`, content: '', type: type, dateCreated: new Date().toISOString(), subjectName: subject.name, mcqData: data };
};

// Fix: Exported generateDevCode to fix the missing member error in AdminDevAssistant.tsx
/**
 * Generates development-related code or explanations using Gemini 3 Pro.
 */
export const generateDevCode = async (prompt: string): Promise<string> => {
  try {
    return await executeWithRotation(async (ai) => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert senior frontend engineer. Provide clear, high-quality React and TypeScript code snippets and explanations.',
        },
      });
      return response.text || "No response generated.";
    });
  } catch (error) {
    console.error("Dev Assistant Error:", error);
    return "I encountered an error while processing your request. Please try again later.";
  }
};
