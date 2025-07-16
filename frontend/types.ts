export enum Category {
  Income = 'INCOME',
  Expense = 'EXPENSE',
  Asset = 'ASSET',
  Liability = 'LIABILITY',
  Equity = 'EQUITY',
}

export type GameLevel = 1 | 2 | 3 | 4;

export interface FinancialItemCategoryEntry {
  category: Category;
  // name?: string; // Optional: e.g., "Expense Portion", "Asset Portion" if more detail is needed in UI
}

export interface FinancialItem {
  id: string;
  name: string;
  category?: Category; // For Levels 1-3
  multiCategories?: FinancialItemCategoryEntry[]; // For Level 4 (typically two)
  explanation: string;
  level: GameLevel;
}

export interface CategoryConfig {
  id: Category;
  label: string;
  color: string;
  hoverColor: string;
  borderColor: string;
  textColor: string;
}

export enum GameState {
  Login = 'LOGIN',
  LevelSelection = 'LEVEL_SELECTION',
  Playing = 'PLAYING',
  GameOver = 'GAME_OVER',
  ReportPreview = 'REPORT_PREVIEW',
  StudentFeedback = 'STUDENT_FEEDBACK',
  AdminLogin = 'ADMIN_LOGIN', // New state for Admin Login
  AdminDashboard = 'ADMIN_DASHBOARD', // New state for Admin Dashboard
}

// Conceptual interface for student data sent to backend
export interface GameSessionResult {
  studentId: string; // Captured from login (e.g., mobile number or a generated ID)
  studentName?: string; // Optional
  level: GameLevel;
  score: number;
  totalQuestions: number;
  answers: Array<{
    questionId: string;
    questionText: string;
    selectedCategories: Category[];
    correctCategories: Category[] | FinancialItemCategoryEntry[];
    isCorrect: boolean;
  }>;
  startTime: string; // ISO string
  endTime: string; // ISO string
  timeTakenSeconds: number;
  feedbackText?: string; // Student's feedback
}

// Conceptual interface for Admin User (mock)
export interface AdminUser {
  username: string;
  // In a real app, never store passwords directly
}