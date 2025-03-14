// app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Category, Question, QuizResult } from '../types';

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a basic client with the anon key - this is now used for everything
export const supabase = createClient(supabaseUrl, supabaseKey);

// Debug log
export function logDebug(message: string, data?: any) {
  console.log(`[DEBUG] ${message}`, data ? data : '');
}

// Error log
export function logError(message: string, error: any) {
  console.error(`[ERROR] ${message}`, error);
  if (error?.message) {
    console.error('[ERROR DETAILS] Message:', error.message);
  }
  if (error?.details) {
    console.error('[ERROR DETAILS] Details:', error.details);
  }
  if (error?.hint) {
    console.error('[ERROR DETAILS] Hint:', error.hint);
  }
  if (error?.code) {
    console.error('[ERROR DETAILS] Code:', error.code);
  }
}

// Categories API - No auth required
export async function getCategories() {
  try {
    logDebug('Fetching categories');
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description, icon');

    if (error) throw error;
    logDebug('Categories fetched successfully', data?.length);
    return data as Omit<Category, 'questions'>[];
  } catch (error) {
    logError('Error fetching categories', error);
    throw error;
  }
}

// Questions API - No auth required now
export async function getQuestionsByCategory(categoryId: number) {
  try {
    logDebug(`Fetching questions for category ${categoryId}`);

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('category_id', categoryId);

    if (error) throw error;

    // Transform the data to match our type structure
    const questions = data.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      reference: q.reference
    })) as Question[];

    logDebug(`Fetched ${questions.length} questions for category ${categoryId}`);
    return questions;
  } catch (error) {
    logError(`Error fetching questions for category ${categoryId}`, error);
    throw error;
  }
}

// Category with questions - No auth required now
export async function getCategoryWithQuestions(categoryId: number): Promise<Category> {
  try {
    logDebug(`Fetching category ${categoryId} with questions`);

    // Get the category
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, description, icon')
      .eq('id', categoryId)
      .single();

    if (categoryError) throw categoryError;

    // Get the questions for this category
    const questions = await getQuestionsByCategory(categoryId);

    const result = {
      ...categoryData,
      questions
    } as Category;

    logDebug(`Successfully fetched category ${categoryId} with ${questions.length} questions`);
    return result;
  } catch (error) {
    logError(`Error fetching category ${categoryId} with questions`, error);
    throw error;
  }
}

// Get a category with just question IDs, not the full questions
export async function getCategoryWithQuestionIds(categoryId: number): Promise<Omit<Category, 'questions'> & { questionIds: number[] }> {
  try {
    logDebug(`Fetching category ${categoryId} with question IDs only`);

    // Get the category
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, description, icon')
      .eq('id', categoryId)
      .single();

    if (categoryError) throw categoryError;

    // Get just the question IDs for this category
    const { data: questionData, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .eq('category_id', categoryId);

    if (questionsError) throw questionsError;

    const questionIds = questionData.map(q => q.id);

    const result = {
      ...categoryData,
      questionIds
    };

    logDebug(`Successfully fetched category ${categoryId} with ${questionIds.length} question IDs`);
    return result;
  } catch (error) {
    logError(`Error fetching category ${categoryId} with question IDs`, error);
    throw error;
  }
}

// Get a single question by ID
export async function getQuestionById(questionId: number): Promise<Question> {
  try {
    logDebug(`Fetching single question ${questionId}`);

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (error) throw error;

    // Transform the data to match our type structure
    const question = {
      id: data.id,
      question: data.question,
      options: data.options,
      correctAnswer: data.correct_answer,
      explanation: data.explanation,
      reference: data.reference
    } as Question;

    logDebug(`Fetched question ${questionId} successfully`);
    return question;
  } catch (error) {
    logError(`Error fetching question ${questionId}`, error);
    throw error;
  }
}

// Save quiz result - Improved version with better error handling and bookmarked questions support
export async function saveQuizResult(userId: string, result: QuizResult) {
  try {
    // Don't save results for anonymous users
    if (!userId || userId === 'anonymous') {
      logDebug('Not saving quiz result for anonymous user');
      return { success: false, error: 'User not authenticated' };
    }

    logDebug('Saving quiz result', { userId, categoryId: result.categoryId });

    // Special handling for bookmarked questions category (ID -999)
    let categoryName = "Bookmarked Questions";

    // Only try to fetch the category name if it's a regular category (not bookmarked questions)
    if (result.categoryId !== -999) {
      try {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('name')
          .eq('id', result.categoryId)
          .single();

        if (categoryError) {
          logError('Error fetching category name', categoryError);
          // Continue anyway, we'll use a default name
        } else {
          categoryName = categoryData.name;
        }
      } catch (catErr) {
        logError('Exception in category fetch', catErr);
        // Continue anyway, we'll use a default name
      }
    }

    // Simplified answers for storage
    const simplifiedAnswers = result.answers.map(answer => ({
      questionId: answer.questionId,
      selectedOption: answer.selectedOption,
      isCorrect: answer.isCorrect,
      timeRemaining: answer.timeRemaining
    }));

    // Insert the quiz result with explicit logging
    const { data, error } = await supabase
      .from('quiz_results')
      .insert({
        user_id: userId,
        category_id: result.categoryId === -999 ? 0 : result.categoryId, // Use 0 for bookmarked questions
        category_name: categoryName,
        score: result.score,
        total_questions: result.totalQuestions,
        completed_at: new Date().toISOString(),
        answers: simplifiedAnswers
      });

    if (error) {
      logError('Error inserting quiz result', error);
      console.error('Full error details:', error);
      return { success: false, error };
    }

    logDebug('Quiz result saved successfully');
    return { success: true, data };
  } catch (error) {
    logError('Error saving quiz result', error);
    console.error('Exception caught in saveQuizResult:', error);
    return { success: false, error };
  }
}

// Get recent quiz results for user
export async function getRecentQuizResults(userId: string, limit = 10) {
  try {
    logDebug(`Fetching recent quiz results for user ${userId}`);

    // First, get the total count to show accurate number of completed quizzes
    const { count: totalCount, error: countError } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      logError(`Error counting quiz results for user ${userId}`, countError);
    }

    // Get the most recent results for the charts and statistics
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

    // Transform the data to match our type structure
    const formattedResults = data.map(result => ({
      id: result.id,
      categoryId: result.category_id,
      categoryName: result.category_name,
      score: result.score,
      totalQuestions: result.total_questions,
      completedAt: result.completed_at
    }));

    logDebug(`Fetched ${formattedResults?.length} recent quiz results`);
    logDebug(`Total quiz count for user: ${totalCount || 'unknown'}`);

    // Return both the formatted results and the total count
    return {
      results: formattedResults,
      totalCount: totalCount || 0
    };
  } catch (error) {
    logError(`Error fetching recent quiz results for user ${userId}`, error);
    // Return empty array instead of throwing, to avoid breaking the UI
    return {
      results: [],
      totalCount: 0
    };
  }
}