// app/types/index.ts
export type Reference = {
    title: string;
    url?: string;
    copyright?: string;
  };
  
  export type Option = string;
  
  export type Question = {
    id: number;
    question: string;
    options: Option[];
    correctAnswer: number; // Index of the correct answer (0-based)
    explanation: string;
    reference?: Reference;
  };
  
  export type Category = {
    id: number;
    name: string;
    description: string;
    icon: string;
    questions: Question[];
  };
  
  export type UserAnswer = {
    questionId: number;
    selectedOption: number | null;
    isCorrect: boolean;
    timeRemaining: number;
    answeredAt: Date;
  };
  
  export type QuizResult = {
    categoryId: number;
    answers: UserAnswer[];
    score: number;
    totalQuestions: number;
    completedAt: Date;
  };