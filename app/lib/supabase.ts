// app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Category, Question, QuizResult, UserAnswer } from '../types';
import { toast } from 'sonner';

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Categories API
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, description, icon');
  
  if (error) throw error;
  return data as Omit<Category, 'questions'>[];
}

// Questions API
export async function getQuestionsByCategory(categoryId: number) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category_id', categoryId);
  
  if (error) throw error;
  
  // Transform the data to match our type structure
  return data.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    correctAnswer: q.correct_answer,
    explanation: q.explanation,
    reference: q.reference
  })) as Question[];
}

// Category with questions
export async function getCategoryWithQuestions(categoryId: number): Promise<Category> {
  // Get the category
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, description, icon')
    .eq('id', categoryId)
    .single();
  
  if (categoryError) throw categoryError;
  
  // Get the questions for this category
  const questions = await getQuestionsByCategory(categoryId);
  
  return {
    ...categoryData,
    questions
  } as Category;
}

// Save quiz result
export async function saveQuizResult(userId: string, result: QuizResult) {
  try {
    console.log('Saving quiz result:', result);
    
    // First, make sure we have the category name
    const { data: categoryData } = await supabase
      .from('categories')
      .select('name')
      .eq('id', result.categoryId)
      .single();
      
    if (!categoryData) {
      throw new Error('Category not found');
    }

    // Format answers for storage
    const formattedAnswers = result.answers.map(answer => ({
      question_id: answer.questionId,
      selected_option: answer.selectedOption,
      is_correct: answer.isCorrect,
      time_remaining: answer.timeRemaining,
      answered_at: answer.answeredAt
    }));
    
    // Insert the quiz result
    const { data, error } = await supabase
      .from('quiz_results')
      .insert([
        { 
          user_id: userId,
          category_id: result.categoryId,
          category_name: categoryData.name,
          score: result.score,
          total_questions: result.totalQuestions,
          completed_at: new Date().toISOString(),
          answers: formattedAnswers
        }
      ])
      .select();
    
    if (error) {
      console.error('Error saving quiz result:', error);
      throw error;
    }
    
    console.log('Quiz result saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception saving quiz result:', error);
    toast.error('Failed to save quiz result');
    throw error;
  }
}

// Get user's quiz history
export async function getUserScores(userId: string) {
  const { data, error } = await supabase
    .from('user_scores')
    .select(`
      id, 
      highest_score,
      total_attempts,
      last_attempt_at,
      categories (id, name, icon)
    `)
    .eq('user_id', userId)
    .order('highest_score', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Get recent quiz results
export async function getRecentQuizResults(userId: string, limit = 5) {
  const { data, error } = await supabase
    .from('quiz_results')
    .select(`
      id, 
      category_id,
      category_name,
      score, 
      total_questions, 
      completed_at
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

// Logging helper function
export function logError(message: string, error: any) {
  console.error(message, error);
  if (error?.message) {
    console.error('Error message:', error.message);
  }
  if (error?.details) {
    console.error('Error details:', error.details);
  }
}