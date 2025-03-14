// app/lib/store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Category, Question, UserAnswer, ShuffledQuestion } from '~/types';
import { logDebug, getQuestionById } from './supabase';
import { shuffleArray } from './utils';

// New interface for the store to handle question IDs
interface QuizState {
  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;

  // Current quiz - modified to use question IDs
  currentCategory: Omit<Category, 'questions'> & {
    questions: (Question | ShuffledQuestion)[];
    questionIds?: number[];
  } | null;
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  isQuizComplete: boolean;
  isLoadingQuestion: boolean;
  currentQuestionError: string | null;

  // Actions
  startQuiz: (category: Omit<Category, 'questions'> & { questionIds: number[] }) => void;
  fetchNextQuestion: () => Promise<void>;
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
      isLoadingQuestion: false,
      currentQuestionError: null,

      isTimerRunning: false,

      // Start a new quiz with the selected category - now using question IDs
      startQuiz: (category) => {
        logDebug('Starting review with category', {
          id: category.id,
          name: category.name,
          questionIdsCount: category.questionIds.length
        });

        // Initialize with empty questions array - we'll fetch them one by one
        const quizCategory = {
          ...category,
          questions: [], // Start with empty questions array
          questionIds: shuffleArray([...category.questionIds]) // Shuffle question IDs
        };

        // Reset state and set the category with question IDs
        set({
          currentCategory: quizCategory,
          currentQuestionIndex: 0,
          userAnswers: [],
          isQuizComplete: false,
          isLoadingQuestion: true,
          currentQuestionError: null,
          isTimerRunning: false,
        });

        // Fetch the first question
        get().fetchNextQuestion();
      },

      // Fetch the next question - new function
      fetchNextQuestion: async () => {
        const { currentCategory, currentQuestionIndex } = get();
        if (!currentCategory || !currentCategory.questionIds) return;

        try {
          set({ isLoadingQuestion: true, currentQuestionError: null });

          // Get the ID of the current question
          const questionId = currentCategory.questionIds[currentQuestionIndex];
          if (!questionId) {
            throw new Error('Question ID not found');
          }

          // Fetch the question by ID
          const question = await getQuestionById(questionId);

          // Create a question with shuffled options
          const originalOptions = [...question.options];
          const shuffledOptions = shuffleArray(originalOptions);

          // Create a mapping between new positions and original positions
          const optionIndexMap = new Map<number, number>();

          // Fill the mapping
          shuffledOptions.forEach((option, newIndex) => {
            const originalIndex = originalOptions.indexOf(option);
            optionIndexMap.set(newIndex, originalIndex);
          });

          // Create the shuffled question
          const shuffledQuestion: ShuffledQuestion = {
            ...question,
            options: shuffledOptions,
            optionIndexMap
          };

          // Update the current category with the new question
          const updatedQuestions = [...currentCategory.questions];
          updatedQuestions[currentQuestionIndex] = shuffledQuestion;

          set({
            currentCategory: {
              ...currentCategory,
              questions: updatedQuestions
            },
            isLoadingQuestion: false,
            isTimerRunning: true
          });
        } catch (error: any) {
          console.error('Error fetching question:', error);
          set({
            isLoadingQuestion: false,
            currentQuestionError: error.message || 'Failed to load question'
          });
        }
      },

      // Record the user's answer for the current question with time tracking
      answerQuestion: (questionId, selectedOption, timeRemaining) => {
        const { currentCategory, userAnswers } = get();
        if (!currentCategory) return;

        const currentQuestion = get().getCurrentQuestion() as ShuffledQuestion;
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
          timeRemaining,
          originalCorrectAnswer: currentQuestion.correctAnswer,
          isCorrect,
          timeTaken: 120 - timeRemaining
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

      // Move to the next question - modified to fetch the next question
      nextQuestion: () => {
        const { currentQuestionIndex, currentCategory } = get();
        if (!currentCategory || !currentCategory.questionIds) return;

        const nextIndex = currentQuestionIndex + 1;
        const isLastQuestion = nextIndex >= currentCategory.questionIds.length;

        logDebug('Moving to next question', {
          currentIndex: currentQuestionIndex,
          nextIndex,
          isLastQuestion
        });

        if (isLastQuestion) {
          set({
            isQuizComplete: true,
            isTimerRunning: false,
          });
        } else {
          set({
            currentQuestionIndex: nextIndex,
            isTimerRunning: false,
          });
          // Fetch the next question
          get().fetchNextQuestion();
        }
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
          isLoadingQuestion: false,
          currentQuestionError: null,
        });
      },

      // Timer controls
      startTimer: () => set({ isTimerRunning: true }),
      stopTimer: () => set({ isTimerRunning: false }),

      // Getter for the current question
      getCurrentQuestion: () => {
        const { currentCategory, currentQuestionIndex } = get();
        if (!currentCategory || !currentCategory.questions) return null;
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
        if (!currentCategory || !currentCategory.questionIds || !currentCategory.questionIds.length) return 0;

        const score = userAnswers.filter(answer => answer.isCorrect).length;
        return (score / currentCategory.questionIds.length) * 100;
      },
    })
  )
);