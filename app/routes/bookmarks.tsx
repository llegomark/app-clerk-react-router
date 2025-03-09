// app/routes/bookmarks.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/react-router';
import {
    BookmarkIcon,
    ArrowLeftIcon,
    PlayIcon,
    TrashIcon,
    PlusIcon,
    FilterIcon,
    CheckIcon
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '~/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { ProtectedRoute } from '~/components/protected-route';
import { useBookmarkService } from '~/lib/bookmark-service';
import { useQuizStore } from '~/lib/store';
import type { Database } from '~/lib/supabase-types';
import type { Question } from '~/types';

export function meta() {
    return [
        { title: "Bookmarked Questions - NQESH Reviewer Pro" },
        { name: "description", content: "Review your bookmarked questions" },
    ];
}

export default function BookmarksPage() {
    return (
        <ProtectedRoute>
            <BookmarksContent />
        </ProtectedRoute>
    );
}

type BookmarkedQuestion = Database['public']['Tables']['bookmarked_questions']['Row'];

// Function to properly reconstruct a complete Question object from the bookmark data
function reconstructQuestion(bookmark: BookmarkedQuestion): Question {
    // Check if we have the full question_data JSON
    if (bookmark.question_data) {
        try {
            // Parse the question data if it's a string
            const questionData = typeof bookmark.question_data === 'string'
                ? JSON.parse(bookmark.question_data)
                : bookmark.question_data;

            // Combine the data into a complete Question object
            return {
                id: bookmark.question_id,
                question: bookmark.question_text,
                options: questionData.options || ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: questionData.correctAnswer || 0,
                explanation: questionData.explanation || 'No explanation available',
                reference: questionData.reference || undefined
            };
        } catch (e) {
            console.error('Error parsing question data:', e);
        }
    }

    // If no complete data is available or there was an error parsing it,
    // return a basic Question object with placeholders
    return {
        id: bookmark.question_id,
        question: bookmark.question_text,
        options: ['Option A', 'Option B', 'Option C', 'Option D'], // Placeholder options
        correctAnswer: 0, // Default to first option
        explanation: 'No explanation available',
    };
}

function BookmarksContent() {
    const navigate = useNavigate();
    const { user } = useUser();
    const { startQuiz } = useQuizStore();

    // Use our custom hook
    const { getBookmarkedQuestions, removeBookmark } = useBookmarkService();

    const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentFilter, setCurrentFilter] = useState<number | null>(null);
    const [selectedBookmarks, setSelectedBookmarks] = useState<number[]>([]);

    // Delete confirmation state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingBookmarkId, setDeletingBookmarkId] = useState<number | null>(null);

    // Load bookmarked questions
    const loadBookmarks = async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            const { bookmarks, error } = await getBookmarkedQuestions();

            if (error) throw error;

            // Process the retrieved data to ensure type safety
            const processedBookmarks: BookmarkedQuestion[] = bookmarks || [];
            setBookmarks(processedBookmarks);
        } catch (err: any) {
            console.error('Error loading bookmarks:', err);
            setError(err.message || 'Failed to load your bookmarked questions');
            toast.error('Failed to load bookmarked questions');
        } finally {
            setIsLoading(false);
        }
    };

    // Load bookmarks on mount
    useEffect(() => {
        if (user) {
            loadBookmarks();
        }
    }, [user]);

    // Handle removing a bookmark
    const handleRemoveBookmark = async (bookmarkId: number, questionId: number) => {
        setDeletingBookmarkId(bookmarkId);
        setIsDeleteDialogOpen(true);
    };

    // Confirm delete bookmark
    const confirmDeleteBookmark = async () => {
        if (!deletingBookmarkId) return;

        try {
            // Get the question id associated with this bookmark
            const bookmark = bookmarks.find(b => b.id === deletingBookmarkId);
            if (!bookmark) {
                throw new Error('Bookmark not found');
            }

            const { success } = await removeBookmark(bookmark.question_id);

            if (success) {
                // Remove from local state
                setBookmarks(bookmarks.filter(b => b.id !== deletingBookmarkId));
                setSelectedBookmarks(selectedBookmarks.filter(id => id !== deletingBookmarkId));
                toast.success('Bookmark removed');
            } else {
                throw new Error('Failed to remove bookmark');
            }
        } catch (err) {
            console.error('Error removing bookmark:', err);
            toast.error('Failed to remove bookmark');
        } finally {
            setIsDeleteDialogOpen(false);
            setDeletingBookmarkId(null);
        }
    };

    // Toggle selection of a bookmark
    const toggleSelection = (bookmarkId: number) => {
        if (selectedBookmarks.includes(bookmarkId)) {
            setSelectedBookmarks(selectedBookmarks.filter(id => id !== bookmarkId));
        } else {
            setSelectedBookmarks([...selectedBookmarks, bookmarkId]);
        }
    };

    // Clear all selections
    const clearSelection = () => {
        setSelectedBookmarks([]);
    };

    // Select all filtered bookmarks
    const selectAllFiltered = () => {
        const filteredBookmarks = getFilteredBookmarks();
        setSelectedBookmarks(filteredBookmarks.map(bookmark => bookmark.id));
    };

    // Start a quiz with selected bookmarked questions
    const startBookmarkedQuiz = () => {
        // If no bookmarks are selected, use all filtered bookmarks
        const bookmarksToUse = selectedBookmarks.length > 0
            ? bookmarks.filter(b => selectedBookmarks.includes(b.id))
            : getFilteredBookmarks();

        if (bookmarksToUse.length === 0) {
            toast.error('No questions selected for the quiz');
            return;
        }

        // Create complete questions from bookmarks using the reconstruction function
        const questions: Question[] = bookmarksToUse.map(bookmark =>
            reconstructQuestion(bookmark)
        );

        // Create a custom category for bookmarked questions
        const bookmarkedCategory = {
            id: -999, // Use a special ID to identify this as a bookmarked questions category
            name: 'Bookmarked Questions',
            description: `A custom quiz with ${questions.length} bookmarked questions`,
            icon: '🔖',
            questions: questions,
            // Add a special flag to help identify this is a bookmarked quiz
            isBookmarkedQuiz: true,
            // Store the bookmark IDs used to create this quiz to recreate it later
            bookmarkIds: bookmarksToUse.map(b => b.id)
        };

        // Save to localStorage to help with Try Again functionality
        try {
            localStorage.setItem('lastBookmarkedQuizIds', JSON.stringify(bookmarksToUse.map(b => b.id)));
        } catch (e) {
            console.error('Failed to save bookmark IDs to localStorage:', e);
        }

        // Start the quiz with this category
        startQuiz(bookmarkedCategory);
        navigate('/reviewer');
    };

    // Apply search and category filters to bookmarks
    const getFilteredBookmarks = () => {
        return bookmarks.filter(bookmark => {
            // Apply search filter
            const matchesSearch = bookmark.question_text.toLowerCase().includes(searchTerm.toLowerCase());

            // Apply category filter
            const matchesCategory = currentFilter === null || bookmark.category_id === currentFilter;

            return matchesSearch && matchesCategory;
        });
    };

    // Get unique categories from bookmarks
    const categories = Array.from(
        new Set(bookmarks.map(bookmark => bookmark.category_id))
    ).map(categoryId => {
        const bookmark = bookmarks.find(b => b.category_id === categoryId);
        return {
            id: categoryId,
            name: bookmark?.category_name || 'Unknown'
        };
    });

    // Get filtered bookmarks
    const filteredBookmarks = getFilteredBookmarks();

    return (
        <div className="container mx-auto py-6 px-4 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/')}
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeftIcon className="size-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookmarkIcon className="size-6" />
                        Bookmarked Questions
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Review and practice with your saved questions
                    </p>
                </div>
            </div>

            {/* Search and filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Input
                        type="search"
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="cursor-pointer gap-1.5">
                                <FilterIcon className="size-4" />
                                <span className="hidden sm:inline-block">Filter</span>
                                {currentFilter !== null && <Badge className="ml-1">{categories.find(c => c.id === currentFilter)?.name}</Badge>}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setCurrentFilter(null)}>
                                All Categories
                            </DropdownMenuItem>
                            {categories.map(category => (
                                <DropdownMenuItem
                                    key={category.id}
                                    onClick={() => setCurrentFilter(category.id)}
                                >
                                    {category.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        onClick={startBookmarkedQuiz}
                        disabled={bookmarks.length === 0}
                        className="cursor-pointer gap-1.5"
                    >
                        <PlayIcon className="size-4" />
                        <span className="hidden sm:inline-block">Start Quiz</span>
                    </Button>
                </div>
            </div>

            {/* Selection options */}
            {bookmarks.length > 0 && (
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm">
                        {selectedBookmarks.length > 0 ? (
                            <span>{selectedBookmarks.length} of {filteredBookmarks.length} selected</span>
                        ) : (
                            <span>{filteredBookmarks.length} questions found</span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {selectedBookmarks.length > 0 ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearSelection}
                                className="cursor-pointer"
                            >
                                Clear Selection
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={selectAllFiltered}
                                className="cursor-pointer"
                            >
                                Select All
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <Card className="mb-4 bg-destructive/10">
                    <CardContent className="p-4">
                        <p className="text-destructive">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadBookmarks}
                            className="mt-2 cursor-pointer"
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Loading state */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3"></div>
                    <p className="text-muted-foreground">Loading your bookmarked questions...</p>
                </div>
            ) : filteredBookmarks.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        {bookmarks.length === 0 ? (
                            <>
                                <div className="text-muted-foreground mb-4">
                                    <BookmarkIcon className="size-12 mx-auto mb-3 opacity-40" />
                                    <p className="mb-2">You haven't bookmarked any questions yet.</p>
                                    <p className="text-sm">
                                        Bookmark questions during quizzes to save them for later review.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => navigate('/')}
                                    className="cursor-pointer gap-1.5"
                                >
                                    <PlusIcon className="size-4" />
                                    Start a New Quiz
                                </Button>
                            </>
                        ) : (
                            <>
                                <p className="text-muted-foreground mb-2">
                                    No questions match your search or filter.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setCurrentFilter(null);
                                    }}
                                    className="cursor-pointer"
                                >
                                    Clear Filters
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredBookmarks.map((bookmark) => (
                        <Card
                            key={bookmark.id}
                            className={cn(
                                "transition-colors",
                                selectedBookmarks.includes(bookmark.id) && "border-primary/50 bg-primary/5"
                            )}
                        >
                            <CardHeader className="py-3 px-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">
                                        {bookmark.category_name}
                                    </Badge>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 cursor-pointer text-destructive hover:text-destructive"
                                            onClick={() => handleRemoveBookmark(bookmark.id, bookmark.question_id)}
                                            title="Remove bookmark"
                                        >
                                            <TrashIcon className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "size-8 cursor-pointer",
                                                selectedBookmarks.includes(bookmark.id)
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                            )}
                                            onClick={() => toggleSelection(bookmark.id)}
                                            title={selectedBookmarks.includes(bookmark.id) ? "Deselect" : "Select"}
                                        >
                                            {selectedBookmarks.includes(bookmark.id) ? (
                                                <CheckIcon className="size-4" />
                                            ) : (
                                                <PlusIcon className="size-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="py-2 px-4">
                                <p className="text-sm">{bookmark.question_text}</p>

                                {/* Display preview of options if available */}
                                {bookmark.question_data && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        <p className="font-medium">Options:</p>
                                        <div className="pl-3 mt-1">
                                            {(() => {
                                                try {
                                                    const data = JSON.parse(bookmark.question_data);
                                                    return data.options?.slice(0, 2).map((option: string, index: number) => (
                                                        <p key={index} className="truncate">• {option}{index === 1 && data.options.length > 2 ? ' ...' : ''}</p>
                                                    ));
                                                } catch (e) {
                                                    return null;
                                                }
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="py-3 px-4 text-xs text-muted-foreground flex justify-between">
                                <span>Question ID: {bookmark.question_id}</span>
                                <span>
                                    Bookmarked: {new Date(bookmark.bookmarked_at).toLocaleDateString()}
                                </span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Quiz action button */}
            {filteredBookmarks.length > 0 && (
                <div className="mt-6 flex justify-center">
                    <Button
                        onClick={startBookmarkedQuiz}
                        size="lg"
                        className="cursor-pointer gap-2"
                    >
                        <PlayIcon className="size-5" />
                        {selectedBookmarks.length > 0
                            ? `Start Quiz with ${selectedBookmarks.length} Selected Questions`
                            : `Start Quiz with All ${filteredBookmarks.length} Questions`}
                    </Button>
                </div>
            )}

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent
                    className="sm:max-w-md"
                    aria-describedby="delete-dialog-description"  // Added aria-describedby
                >
                    <DialogHeader>
                        <DialogTitle>Remove Bookmark</DialogTitle>
                        <DialogDescription id="delete-dialog-description">
                            Are you sure you want to remove this bookmark? This will not delete the question itself.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteBookmark}
                            className="cursor-pointer gap-1.5"
                        >
                            <TrashIcon className="size-4" />
                            <span>Remove</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}