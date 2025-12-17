
export type ClassLevel = '6' | '7' | '8' | '9' | '10' | '11' | '12';
export type Board = 'CBSE' | 'BSEB';
export type Stream = 'Science' | 'Commerce' | 'Arts';
export type Role = 'STUDENT' | 'ADMIN';
export type ContentType = 'NOTES_SIMPLE' | 'NOTES_PREMIUM' | 'MCQ_ANALYSIS' | 'MCQ_SIMPLE' | 'PDF_FREE' | 'PDF_PREMIUM' | 'PDF_VIEWER' | 'WEEKLY_TEST';

// Added missing fundamental interfaces
export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Chapter {
  id: string;
  title: string;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  details: string;
  timestamp: string;
}

export interface RecoveryRequest {
  id: string;
  name: string;
  mobile: string;
  timestamp: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
}

export interface GiftCode {
  code: string;
  amount: number;
  isRedeemed: boolean;
  redeemedBy?: string;
  redeemedDate?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  text: string;
  timestamp: string;
  isDeleted?: boolean;
}

export interface IICPost {
  id: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO';
  title: string;
  content: string;
  timestamp: string;
  authorName: string;
}

export interface LeaderboardEntry {
  id: string;
  topic: string;
  score: number;
  total: number;
  date: string;
  userName: string;
}

export interface StartupConfig {
  enabled: boolean;
  duration: number;
  title: string;
  features: string[];
  bgColor: string;
  textColor: string;
}

export interface SubjectProgress {
  currentChapterIndex: number;
  totalMCQsSolved: number;
}

export interface InboxMessage {
  id: string;
  text: string;
  date: string;
  read: boolean;
}

export interface User {
  id: string;
  password: string;
  name: string;
  mobile: string;
  email: string;
  role: Role;
  createdAt: string;
  credits: number;
  streak: number;
  lastLoginDate: string;
  lastActiveTime?: string;
  redeemedCodes: string[];
  isArchived?: boolean;
  isLocked?: boolean;
  deletedAt?: string;
  recoveryCode?: string;
  isChatBanned?: boolean;
  isGameBanned?: boolean;
  inbox?: InboxMessage[];
  board?: Board;
  classLevel?: ClassLevel;
  stream?: Stream;
  isPremium?: boolean;
  lastChatTime?: string;
  lastSpinTime?: string;
  lastRewardClaimDate?: string;
  progress: Record<string, SubjectProgress>;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  color?: string;
}

export interface PrizeConfig {
    rank1: number;
    rank2: number;
    rank3: number;
    above60: number;
    above45: number;
    above30: number;
}

export interface SystemSettings {
  appName: string;
  themeColor?: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  customCSS: string;
  apiKeys: string[];
  adminCode?: string;
  adminEmail?: string;
  adminPhone?: string;
  aiInstruction?: string;
  footerText?: string;
  welcomeTitle?: string;
  welcomeMessage?: string;
  termsText?: string;
  supportEmail?: string;
  aiModel?: string;
  marqueeLines: string[];
  liveMessage1?: string;
  liveMessage2?: string;
  wheelRewards: number[];
  chatCost: number;
  chatCooldownMinutes: number; 
  dailyReward: number;
  signupBonus: number;
  isChatEnabled: boolean;
  isGameEnabled?: boolean;
  allowSignup: boolean;
  loginMessage: string;
  allowedClasses?: ClassLevel[];
  allowedBoards?: Board[];
  allowedStreams?: Stream[];
  hiddenSubjects?: string[];
  storageCapacity?: string;
  isPaymentEnabled?: boolean;
  paymentDisabledMessage?: string;
  upiId: string;
  upiName: string;
  qrCodeUrl: string;
  paymentInstructions: string;
  packages: CreditPackage[];
  
  // Added startupAd configuration to resolve SystemSettings missing property errors
  startupAd?: StartupConfig;

  // MEGA TEST CONFIG
  isMegaTestLive: boolean;
  megaTestQuestionLimit: number;
  megaTestPrizes: PrizeConfig;
}

export interface MCQItem {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LessonContent {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  type: ContentType;
  dateCreated: string;
  subjectName: string;
  mcqData?: MCQItem[];
  isComingSoon?: boolean;
}

export type ViewState = 'BOARDS' | 'CLASSES' | 'STREAMS' | 'SUBJECTS' | 'CHAPTERS' | 'LESSON' | 'ADMIN_DASHBOARD' | 'AUDIO_STUDIO' | 'STUDENT_DASHBOARD' | 'UNIVERSAL_CHAT' | 'RULES' | 'IIC' | 'LEADERBOARD';
export type StudentTab = 'ROUTINE' | 'CHAT' | 'HISTORY' | 'REDEEM' | 'PREMIUM' | 'GAME';
export type Language = 'English' | 'Hindi';

export interface AppState {
  user: User | null;
  originalAdmin: User | null;
  view: ViewState;
  selectedBoard: Board | null;
  selectedClass: ClassLevel | null;
  selectedStream: Stream | null;
  selectedSubject: Subject | null;
  selectedChapter: Chapter | null;
  chapters: Chapter[];
  lessonContent: LessonContent | null;
  loading: boolean;
  error: string | null;
  language: Language;
  showWelcome: boolean;
  globalMessage: string | null;
  settings: SystemSettings;
}
