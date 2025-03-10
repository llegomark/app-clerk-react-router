// app/lib/supabase-dashboard.ts
import { supabase, logDebug, logError } from './supabase';

// Get category performance for dashboard
export async function getCategoryPerformance(userId: string) {
    try {
        logDebug(`Fetching category performance for user ${userId}`);

        const { data, error } = await supabase
            .from('quiz_results')
            .select(`
          category_id,
          category_name,
          score, 
          total_questions
        `)
            .eq('user_id', userId);

        if (error) throw error;

        // Calculate performance by category
        const categoryMap = new Map();

        data.forEach(result => {
            const categoryId = result.category_id;
            const percentage = (result.score / result.total_questions) * 100;

            if (!categoryMap.has(categoryId)) {
                categoryMap.set(categoryId, {
                    categoryId,
                    categoryName: result.category_name,
                    attempts: 0,
                    totalPercentage: 0,
                    bestScore: 0,
                    totalCorrect: 0,
                    totalQuestions: 0
                });
            }

            const category = categoryMap.get(categoryId);
            category.attempts += 1;
            category.totalPercentage += percentage;
            category.bestScore = Math.max(category.bestScore, percentage);
            category.totalCorrect += result.score;
            category.totalQuestions += result.total_questions;
        });

        // Convert map to array and calculate averages
        const categoryPerformance = Array.from(categoryMap.values()).map(category => ({
            ...category,
            averagePercentage: category.totalPercentage / category.attempts,
            overallPercentage: (category.totalCorrect / category.totalQuestions) * 100
        }));

        logDebug(`Calculated performance for ${categoryPerformance.length} categories`);
        return categoryPerformance;
    } catch (error) {
        logError(`Error fetching category performance for user ${userId}`, error);
        return [];
    }
}

// Get time-based metrics for dashboard
export async function getTimeMetrics(userId: string) {
    try {
        logDebug(`Fetching time metrics for user ${userId}`);

        const { data, error } = await supabase
            .from('quiz_results')
            .select(`
          id, 
          category_id,
          category_name,
          answers
        `)
            .eq('user_id', userId);

        if (error) throw error;

        // Define answer type
        interface QuizAnswer {
            questionId: number;
            selectedOption: number | null;
            isCorrect: boolean;
            timeRemaining: number;
        }

        // Process time data from answers
        const timeMetrics = {
            averageTimeRemaining: 0,
            fastestAnswer: 120, // Initialize with max time
            slowestAnswer: 0,
            timeDistribution: [] as { bucket: string, count: number }[]
        };

        let totalAnswers = 0;
        let totalTimeRemaining = 0;

        // Time buckets for distribution (in seconds remaining)
        const buckets = [
            { min: 100, max: 120, label: '100-120' },
            { min: 80, max: 99, label: '80-99' },
            { min: 60, max: 79, label: '60-79' },
            { min: 40, max: 59, label: '40-59' },
            { min: 20, max: 39, label: '20-39' },
            { min: 0, max: 19, label: '0-19' },
        ];

        const bucketCounts = buckets.map(bucket => ({ bucket: bucket.label, count: 0 }));

        data.forEach(result => {
            const answers = (result.answers || []) as QuizAnswer[];

            answers.forEach((answer: QuizAnswer) => {
                if (answer.timeRemaining !== undefined) {
                    totalTimeRemaining += answer.timeRemaining;
                    totalAnswers++;

                    // Track fastest and slowest
                    timeMetrics.fastestAnswer = Math.min(timeMetrics.fastestAnswer, answer.timeRemaining);
                    timeMetrics.slowestAnswer = Math.max(timeMetrics.slowestAnswer, answer.timeRemaining);

                    // Count for distribution
                    for (let i = 0; i < buckets.length; i++) {
                        if (answer.timeRemaining >= buckets[i].min && answer.timeRemaining <= buckets[i].max) {
                            bucketCounts[i].count++;
                            break;
                        }
                    }
                }
            });
        });

        // Calculate average
        if (totalAnswers > 0) {
            timeMetrics.averageTimeRemaining = totalTimeRemaining / totalAnswers;
        }

        timeMetrics.timeDistribution = bucketCounts;

        logDebug(`Calculated time metrics from ${totalAnswers} answers`);
        return timeMetrics;
    } catch (error) {
        logError(`Error fetching time metrics for user ${userId}`, error);
        return {
            averageTimeRemaining: 0,
            fastestAnswer: 0,
            slowestAnswer: 0,
            timeDistribution: []
        };
    }
}

// Get detailed answer data for dashboard visualizations
export async function getDetailedQuizAnswers(userId: string, limit = 100) {
    try {
        logDebug(`Fetching detailed quiz answers for user ${userId}`);

        const { data, error } = await supabase
            .from('quiz_results')
            .select(`
          id, 
          category_id,
          category_name,
          score, 
          total_questions, 
          completed_at,
          answers
        `)
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        // Extract all answers from the results
        const allAnswers = data.flatMap(result => {
            interface QuizResult {
                id: number;
                category_id: number;
                category_name: string;
                score: number;
                total_questions: number;
                completed_at: string;
                answers: QuizAnswer[];
            }

            interface QuizAnswer {
                questionId: number;
                selectedOption: number | null;
                isCorrect: boolean;
                timeRemaining: number;
            }

            interface DetailedQuizAnswer extends QuizAnswer {
                categoryId: number;
                categoryName: string;
                quizId: number;
                completedAt: string;
            }

            return (result.answers || [] as QuizAnswer[]).map((answer: QuizAnswer): DetailedQuizAnswer => ({
                ...answer,
                categoryId: result.category_id,
                categoryName: result.category_name,
                quizId: result.id,
                completedAt: result.completed_at
            }));
        });

        logDebug(`Fetched ${allAnswers.length} detailed answers`);
        return allAnswers;
    } catch (error) {
        logError(`Error fetching detailed quiz answers for user ${userId}`, error);
        // Return empty array instead of throwing
        return [];
    }
}