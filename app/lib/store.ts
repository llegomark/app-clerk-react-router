// app/lib/store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Category, Question, UserAnswer, ShuffledQuestion } from '~/types';
import { logDebug } from './supabase';
import { shuffleArray } from './utils';

interface QuizState {
  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;

  // Current quiz
  currentCategory: Category | null;
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
    (set, get) => ({
      // Initial state
      categories: [],
      setCategories: (categories) => set({ categories }),

      currentCategory: null,
      currentQuestionIndex: 0,
      userAnswers: [],
      isQuizComplete: false,

      isTimerRunning: false,

      // Start a new quiz with the selected category and shuffle questions/options
      startQuiz: (category) => {
        logDebug('Starting review with category', {
          id: category.id,
          name: category.name,
          questionsCount: category.questions?.length
        });

        // Step 1: Create shuffled questions with shuffled options
        const questionsWithShuffledOptions = category.questions.map(question => {
          // Make a copy of the original options
          const originalOptions = [...question.options];

          // Shuffle the options
          const shuffledOptions = shuffleArray(originalOptions);

          // Create a mapping between new positions and original positions
          const optionIndexMap = new Map<number, number>();

          // Fill the mapping
          shuffledOptions.forEach((option, newIndex) => {
            const originalIndex = originalOptions.indexOf(option);
            optionIndexMap.set(newIndex, originalIndex);
          });

          // Return question with shuffled options and index mapping
          return {
            ...question,
            options: shuffledOptions,
            optionIndexMap
          } as ShuffledQuestion;
        });

        // Step 2: Shuffle the questions themselves
        const shuffledQuestions = shuffleArray(questionsWithShuffledOptions);

        // Step 3: Create a new category with shuffled questions
        const shuffledCategory = {
          ...category,
          questions: shuffledQuestions
        };

        // Reset state first, then set new state
        set({
          currentCategory: shuffledCategory,
          currentQuestionIndex: 0,
          userAnswers: [],
          isQuizComplete: false,
          isTimerRunning: true,
        });
      },

      // Record the user's answer for the current question with time tracking
      answerQuestion: (questionId, selectedOption, timeRemaining) => {
        const { currentCategory, userAnswers } = get();
        if (!currentCategory) return;

        const currentQuestion = currentCategory.questions.find(q => q.id === questionId) as ShuffledQuestion;
        if (!currentQuestion) return;

        // Use the mapping to determine if the answer is correct
        // We need to convert the shuffled index back to the original index
        let isCorrect = false;

        if (selectedOption !== null) {
          // Get the original index that corresponds to the selected option
          const originalSelectedIndex = currentQuestion.optionIndexMap.get(selectedOption);
          // Check if that original index was the correct answer
          isCorrect = originalSelectedIndex === currentQuestion.correctAnswer;
        }

        logDebug('Answering question', {
          questionId,
          selectedOption,
          timeRemaining,  // Now we log the actual time remaining
          // Additional debug info
          originalCorrectAnswer: currentQuestion.correctAnswer,
          isCorrect,
          timeTaken: 120 - timeRemaining  // Log the time taken to answer
        });

        set({
          userAnswers: [
            ...userAnswers,
            {
              questionId,
              selectedOption,
              isCorrect,
              timeRemaining,  // Store the actual time remaining
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

        set({
          currentQuestionIndex: isLastQuestion ? currentQuestionIndex : nextIndex,
          isQuizComplete: isLastQuestion,
          isTimerRunning: !isLastQuestion,
        });
      },

      // Complete the quiz
      completeQuiz: () => {
        logDebug('Completing review');
        set({
          isQuizComplete: true,
          isTimerRunning: false,
        });
      },

      // Reset the quiz state
      resetQuiz: () => {
        logDebug('Resetting review state');
        set({
          currentCategory: null,
          currentQuestionIndex: 0,
          userAnswers: [],
          isQuizComplete: false,
          isTimerRunning: false,
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
    })
  )
);