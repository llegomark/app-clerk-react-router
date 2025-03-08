// app/schemas/quiz.ts
import { z } from 'zod';

export const referenceSchema = z.object({
  title: z.string(),
  url: z.string().url().optional(),
  copyright: z.string().optional(),
});

export const questionSchema = z.object({
  id: z.number(),
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().min(0).max(3),
  explanation: z.string(),
  reference: referenceSchema.optional(),
});

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  questions: z.array(questionSchema),
});

export const userAnswerSchema = z.object({
  questionId: z.number(),
  selectedOption: z.number().nullable(),
  isCorrect: z.boolean(),
  timeRemaining: z.number(),
  answeredAt: z.date(),
});

export const quizResultSchema = z.object({
  categoryId: z.number(),
  answers: z.array(userAnswerSchema),
  score: z.number(),
  totalQuestions: z.number(),
  completedAt: z.date(),
});

// Validation functions
export function validateCategory(data: unknown) {
  return categorySchema.parse(data);
}

export function validateQuestion(data: unknown) {
  return questionSchema.parse(data);
}

export function validateQuizResult(data: unknown) {
  return quizResultSchema.parse(data);
}