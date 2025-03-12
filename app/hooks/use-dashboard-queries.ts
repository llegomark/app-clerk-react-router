// app/hooks/use-dashboard-queries.ts
import { useQuery } from '@tanstack/react-query';
import { getCategoryPerformance, getTimeMetrics, getDetailedQuizAnswers } from '~/lib/supabase-dashboard';
import { getRecentQuizResults } from '~/lib/supabase'; // Import from the correct file
import type { RecentQuizResult } from '~/types';

// Hook for fetching recent quiz results
export function useRecentQuizResults(userId: string) {
    return useQuery({
        queryKey: ['recentQuizResults', userId],
        queryFn: async () => {
            const { results, totalCount } = await getRecentQuizResults(userId, 50);
            return { results, totalCount };
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

// Hook for fetching category performance data
export function useCategoryPerformance(userId: string) {
    return useQuery({
        queryKey: ['categoryPerformance', userId],
        queryFn: () => getCategoryPerformance(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Hook for fetching time metrics
export function useTimeMetrics(userId: string) {
    return useQuery({
        queryKey: ['timeMetrics', userId],
        queryFn: () => getTimeMetrics(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Hook for fetching detailed answers
export function useDetailedQuizAnswers(userId: string) {
    return useQuery({
        queryKey: ['detailedQuizAnswers', userId],
        queryFn: () => getDetailedQuizAnswers(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Hook for fetching all dashboard data efficiently
export function useDashboardData(userId: string) {
    const recentResultsQuery = useRecentQuizResults(userId);
    const categoryPerformanceQuery = useCategoryPerformance(userId);
    const timeMetricsQuery = useTimeMetrics(userId);

    // Calculate derived stats
    const calculateDashboardStats = () => {
        const results = recentResultsQuery.data?.results || [];
        const categoryData = categoryPerformanceQuery.data || [];
        const totalCount = recentResultsQuery.data?.totalCount || 0;

        let totalScore = 0;
        let bestScore = 0;
        let bestCategoryName = '';

        categoryData.forEach(category => {
            if (category.overallPercentage > bestScore) {
                bestScore = category.overallPercentage;
                bestCategoryName = category.categoryName;
            }
        });

        results.forEach(result => {
            totalScore += (result.score / result.totalQuestions) * 100;
        });

        const totalQuestions = categoryData.reduce((sum, cat) => sum + cat.totalQuestions, 0);

        return {
            totalQuizzes: totalCount || 0,
            totalQuestions,
            bestScore,
            averageScore: results.length > 0 ? totalScore / results.length : 0,
            bestCategory: bestCategoryName || 'None yet'
        };
    };

    // Calculate strengths data
    const calculateStrengthsData = () => {
        const categoryData = categoryPerformanceQuery.data || [];

        return categoryData.map(category => ({
            category: category.categoryName,
            strength: category.overallPercentage,
            correctAnswers: category.totalCorrect,
            totalAnswers: category.totalQuestions
        }));
    };

    const isPending = recentResultsQuery.isPending ||
        categoryPerformanceQuery.isPending ||
        timeMetricsQuery.isPending;

    const error = recentResultsQuery.error ||
        categoryPerformanceQuery.error ||
        timeMetricsQuery.error;

    // Compute derived data only when all queries are successful
    const dashboardStats = (!isPending && !error) ? calculateDashboardStats() : {
        totalQuizzes: 0,
        totalQuestions: 0,
        bestScore: 0,
        averageScore: 0,
        bestCategory: 'None yet'
    };

    const strengthsData = (!isPending && !error) ? calculateStrengthsData() : [];

    return {
        recentResults: recentResultsQuery.data?.results || [],
        categoryPerformance: categoryPerformanceQuery.data || [],
        timeMetrics: timeMetricsQuery.data || {
            averageTimeRemaining: 0,
            fastestAnswer: 0,
            slowestAnswer: 0,
            timeDistribution: []
        },
        dashboardStats,
        strengthsData,
        isPending,
        error: error ? error.message || 'Error loading dashboard data' : null,
        refetch: () => {
            recentResultsQuery.refetch();
            categoryPerformanceQuery.refetch();
            timeMetricsQuery.refetch();
        }
    };
}