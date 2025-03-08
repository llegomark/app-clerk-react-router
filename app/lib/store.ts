// app/lib/store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Category, Question, UserAnswer } from '~/types';
import { logDebug } from './supabase';

interface QuizState {
  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  
  // Current quiz
  currentCategory: Category | null;
  lastCategoryId: number | null;
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  isQuizComplete: boolean;
  
  // Actions
  startQuiz: (category: Category) => void;
  answerQuestion: (questionId: number, selectedOption: number | null, timeRemaining: number) => void;
  nextQuestion: () => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  
  // Timer state
  isTimerRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  
  // Current question helpers
  getCurrentQuestion: () => Question | null;
  getUserAnswerForCurrentQuestion: () => UserAnswer | undefined;
  
  // Results
  getScore: () => number;
  getResultPercentage: () => number;
}

export const useQuizStore = create<QuizState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        categories: [],
        setCategories: (categories) => set({ categories }),
        
        currentCategory: null,
        lastCategoryId: null,
        currentQuestionIndex: 0,
        userAnswers: [],
        isQuizComplete: false,
        
        isTimerRunning: false,
        
        // Start a new quiz with the selected category
        startQuiz: (category) => {
          logDebug('Starting quiz with category', { 
            id: category.id, 
            name: category.name,
            questionsCount: category.questions?.length 
          });
          
          // Make sure to clear everything first
          set({
            currentCategory: null,
            currentQuestionIndex: 0,
            userAnswers: [],
            isQuizComplete: false,
            isTimerRunning: false,
          });
          
          // Then set the new quiz state in a separate step
          setTimeout(() => {
            set({
              currentCategory: category,
              lastCategoryId: category.id,
              currentQuestionIndex: 0,
              userAnswers: [],
              isQuizComplete: false,
              isTimerRunning: true,
            });
          }, 10);
        },
        
        // Record the user's answer for the current question
        answerQuestion: (questionId, selectedOption, timeRemaining) => {
          const { currentCategory, userAnswers } = get();
          if (!currentCategory) return;
          
          const currentQuestion = currentCategory.questions.find(q => q.id === questionId);
          if (!currentQuestion) return;
          
          const isCorrect = selectedOption === currentQuestion.correctAnswer;
          
          logDebug('Answering question', { 
            questionId, 
            selectedOption, 
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect 
          });
          
          set({
            userAnswers: [
              ...userAnswers,
              {
                questionId,
                selectedOption,
                isCorrect,
                timeRemaining,
                answeredAt: new Date(),
              },
            ],
            isTimerRunning: false,
          });
        },
        
        // Move to the next question
        nextQuestion: () => {
          const { currentQuestionIndex, currentCategory } = get();
          if (!currentCategory) return;
          
          const nextIndex = currentQuestionIndex + 1;
          const isLastQuestion = nextIndex >= currentCategory.questions.length;
          
          logDebug('Moving to next question', {
            currentIndex: currentQuestionIndex,
            nextIndex,
            isLastQuestion
          });
          
          // First stop the timer to ensure clean state
          set({
            isTimerRunning: false,
          });
          
          // Then in the next tick start the new question with a fresh timer
          setTimeout(() => {
            set({
              currentQuestionIndex: isLastQuestion ? currentQuestionIndex : nextIndex,
              isQuizComplete: isLastQuestion,
              isTimerRunning: !isLastQuestion,
            });
          }, 10);
        },
        
        // Complete the quiz
        completeQuiz: () => {
          logDebug('Completing quiz');
          set({
            isQuizComplete: true,
            isTimerRunning: false,
          });
        },
        
        // Reset the quiz state but keep lastCategoryId
        resetQuiz: () => {
          const { lastCategoryId } = get();
          logDebug('Resetting quiz state', { lastCategoryId });
          
          set({
            currentCategory: null,
            currentQuestionIndex: 0,
            userAnswers: [],
            isQuizComplete: false,
            isTimerRunning: false,
            // Keep lastCategoryId for reference
          });
        },
        
        // Timer controls
        startTimer: () => set({ isTimerRunning: true }),
        stopTimer: () => set({ isTimerRunning: false }),
        
        // Getter for the current question
        getCurrentQuestion: () => {
          const { currentCategory, currentQuestionIndex } = get();
          if (!currentCategory) return null;
          return currentCategory.questions[currentQuestionIndex] || null;
        },
        
        // Getter for the user's answer to the current question
        getUserAnswerForCurrentQuestion: () => {
          const { userAnswers } = get();
          const currentQuestion = get().getCurrentQuestion();
          if (!currentQuestion) return undefined;
          
          return userAnswers.find(answer => answer.questionId === currentQuestion.id);
        },
        
        // Calculate the score
        getScore: () => {
          const { userAnswers } = get();
          return userAnswers.filter(answer => answer.isCorrect).length;
        },
        
        // Calculate the percentage score
        getResultPercentage: () => {
          const { userAnswers, currentCategory } = get();
          if (!currentCategory || !currentCategory.questions.length) return 0;
          
          const score = userAnswers.filter(answer => answer.isCorrect).length;
          return (score / currentCategory.questions.length) * 100;
        },
      }),
      {
        name: 'nqesh-quiz-storage',
        partialize: (state) => ({
          categories: state.categories,
          lastCategoryId: state.lastCategoryId,
          // Also persist currentCategory to maintain it between page loads
          currentCategory: state.currentCategory,
          isQuizComplete: state.isQuizComplete,
          userAnswers: state.userAnswers,
        }),
      }
    )
  )
);