// app/lib/bookmark-service.ts
import { useSupabase } from './supabase-clerk';
import type { Question, Category } from '~/types';
import { toast } from 'sonner';

/**
 * Adds a question to the user's bookmarks
 */
export async function addBookmark(
    question: Question,
    categoryId: number,
    categoryName: string
) {
    const supabase = useSupabase();

    try {
        const { error } = await supabase
            .from('bookmarked_questions')
            .insert({
                question_id: question.id,
                category_id: categoryId,
                category_name: categoryName,
                question_text: question.question
            });

        if (error) {
            // If the error is because the question is already bookmarked, just return
            if (error.code === '23505') {
                toast.info('Question is already bookmarked');
                return { success: true, alreadyExists: true };
            }
            throw error;
        }

        return { success: true };
    } catch (error) {
        console.error('Error adding bookmark:', error);
        return { success: false, error };
    }
}

/**
 * Removes a question from the user's bookmarks
 */
export async function removeBookmark(questionId: number) {
    const supabase = useSupabase();

    try {
        const { error } = await supabase
            .from('bookmarked_questions')
            .delete()
            .eq('question_id', questionId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error removing bookmark:', error);
        return { success: false, error };
    }
}

/**
 * Checks if a question is bookmarked by the user
 */
export async function isQuestionBookmarked(questionId: number) {
    const supabase = useSupabase();

    try {
        const { data, error } = await supabase
            .from('bookmarked_questions')
            .select('id')
            .eq('question_id', questionId)
            .single();

        if (error) {
            // Single throws error if not found, which is expected
            if (error.code === 'PGRST116') {
                return { isBookmarked: false };
            }
            throw error;
        }

        return { isBookmarked: true, bookmarkId: data.id };
    } catch (error) {
        console.error('Error checking bookmark status:', error);
        return { isBookmarked: false, error };
    }
}

/**
 * Gets all bookmarked questions for the current user
 */
export async function getBookmarkedQuestions() {
    const supabase = useSupabase();

    try {
        const { data, error } = await supabase
            .from('bookmarked_questions')
            .select('*')
            .order('bookmarked_at', { ascending: false });

        if (error) throw error;

        return { bookmarks: data || [] };
    } catch (error) {
        console.error('Error fetching bookmarked questions:', error);
        return { bookmarks: [], error };
    }
}

/**
 * Gets the count of bookmarked questions for the current user
 */
export async function getBookmarkedQuestionsCount() {
    const supabase = useSupabase();

    try {
        const { count, error } = await supabase
            .from('bookmarked_questions')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;

        return { count: count || 0 };
    } catch (error) {
        console.error('Error counting bookmarked questions:', error);
        return { count: 0, error };
    }
}