// app/routes/user-data.tsx
import { useState, useEffect, Fragment } from 'react';
import { useUser } from '@clerk/react-router';
import { format } from 'date-fns';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    PinIcon,
    BookMarkedIcon,
    CheckIcon,
    XIcon,
    SearchIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { ProtectedRoute } from '~/components/protected-route';
import { useSupabase } from '~/lib/supabase-clerk';
import type { Database } from '~/lib/supabase-types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Badge } from '~/components/ui/badge';

export function meta() {
    return [
        { title: "Study Notes - NQESH Reviewer Pro" },
        { name: "description", content: "Manage your review notes" },
    ];
}

export default function UserDataPage() {
    return (
        <ProtectedRoute>
            <StudyNotesContent />
        </ProtectedRoute>
    );
}

type StudyNote = Database['public']['Tables']['study_notes']['Row'];

// Available note categories
const CATEGORIES = [
    "General",
    "Leadership & Management",
    "School Operations",
    "Instructional Leadership",
    "Human Resource Management",
    "Legal & Policy Issues",
    "Exam Tips"
];

function StudyNotesContent() {
    const { user } = useUser();
    const supabase = useSupabase();
    const [notes, setNotes] = useState<StudyNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    // Create/Edit note state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<StudyNote | null>(null);
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [noteCategory, setNoteCategory] = useState(CATEGORIES[0]);

    // Delete confirmation state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);

    // Function to load notes
    const loadNotes = async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            console.log("Fetching study notes...");
            const { data, error } = await supabase
                .from('study_notes')
                .select('*')
                .order('is_pinned', { ascending: false })
                .order('updated_at', { ascending: false });

            if (error) {
                console.error("Supabase error:", error);
                throw error;
            }

            console.log("Notes fetched successfully:", data);
            setNotes(data || []);
        } catch (err: any) {
            console.error('Error loading notes:', err);
            setError(err.message || 'Failed to load your notes');
            toast.error('Failed to load your notes');
        } finally {
            setIsLoading(false);
        }
    };

    // Load notes on mount and when user changes
    useEffect(() => {
        if (user) {
            loadNotes();
        }
    }, [user]);

    // Handle opening the create note dialog
    const handleCreateNote = () => {
        setEditingNote(null);
        setNoteTitle("");
        setNoteContent("");
        setNoteCategory(CATEGORIES[0]);
        setIsDialogOpen(true);
    };

    // Handle opening the edit note dialog
    const handleEditNote = (note: StudyNote) => {
        setEditingNote(note);
        setNoteTitle(note.title);
        setNoteContent(note.content);
        setNoteCategory(note.category || CATEGORIES[0]);
        setIsDialogOpen(true);
    };

    // Handle saving a note (create or update)
    const handleSaveNote = async () => {
        if (!noteTitle.trim()) {
            toast.error('Please enter a title');
            return;
        }

        if (!noteContent.trim()) {
            toast.error('Please enter some content');
            return;
        }

        try {
            if (editingNote) {
                // Update existing note
                const { error } = await supabase
                    .from('study_notes')
                    .update({
                        title: noteTitle.trim(),
                        content: noteContent.trim(),
                        category: noteCategory,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingNote.id);

                if (error) throw error;
                toast.success('Note updated');
            } else {
                // Create new note
                const { error } = await supabase
                    .from('study_notes')
                    .insert({
                        title: noteTitle.trim(),
                        content: noteContent.trim(),
                        category: noteCategory,
                        is_pinned: false
                    });

                if (error) throw error;
                toast.success('Note created');
            }

            // Close dialog and refresh notes
            setIsDialogOpen(false);
            loadNotes();

        } catch (err: any) {
            console.error('Error saving note:', err);
            toast.error(err.message || 'Failed to save note');
        }
    };

    // Handle toggling a note's pin status
    const handleTogglePin = async (note: StudyNote) => {
        try {
            const { error } = await supabase
                .from('study_notes')
                .update({
                    is_pinned: !note.is_pinned,
                    updated_at: new Date().toISOString()
                })
                .eq('id', note.id);

            if (error) throw error;

            // Update the notes list with the new pin status
            setNotes(notes.map(n =>
                n.id === note.id ? { ...n, is_pinned: !note.is_pinned } : n
            ));

            toast.success(note.is_pinned ? 'Note unpinned' : 'Note pinned');
        } catch (err: any) {
            console.error('Error toggling pin:', err);
            toast.error('Failed to update note');
        }
    };

    // Handle opening delete confirmation dialog
    const handleConfirmDelete = (noteId: number) => {
        setDeletingNoteId(noteId);
        setIsDeleteDialogOpen(true);
    };

    // Handle deleting a note
    const handleDeleteNote = async () => {
        if (!deletingNoteId) return;

        try {
            const { error } = await supabase
                .from('study_notes')
                .delete()
                .eq('id', deletingNoteId);

            if (error) throw error;

            // Update notes list and close dialog
            setNotes(notes.filter(n => n.id !== deletingNoteId));
            toast.success('Note deleted');
        } catch (err: any) {
            console.error('Error deleting note:', err);
            toast.error(err.message || 'Failed to delete note');
        } finally {
            setIsDeleteDialogOpen(false);
            setDeletingNoteId(null);
        }
    };

    // Filter notes based on search term and active tab
    const filteredNotes = notes.filter(note => {
        // First filter by search term
        const matchesSearch =
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (note.category?.toLowerCase().includes(searchTerm.toLowerCase()));

        // Then filter by tab
        if (activeTab === "all") return matchesSearch;
        if (activeTab === "pinned") return matchesSearch && note.is_pinned;
        return matchesSearch && note.category === activeTab;
    });

    // Get unique categories from notes
    const usedCategories = Array.from(
        new Set(notes.map(note => note.category).filter(Boolean))
    ) as string[];

    return (
        <div className="container mx-auto py-6 px-4 max-w-4xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookMarkedIcon className="size-6" />
                        Study Notes
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Keep track of important information during your review
                    </p>
                </div>

                <Button onClick={handleCreateNote} className="cursor-pointer gap-1.5">
                    <PlusIcon className="size-4" />
                    <span>New Note</span>
                </Button>
            </div>

            {/* Search and filters */}
            <div className="mb-6">
                <div className="relative mb-4">
                    <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="search"
                        placeholder="Search your notes..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full h-auto flex-wrap">
                        <TabsTrigger value="all">All Notes</TabsTrigger>
                        <TabsTrigger value="pinned">Pinned</TabsTrigger>
                        {/* Show categories that have notes */}
                        {usedCategories.map(category => (
                            <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Error message */}
            {error && (
                <Card className="mb-4 bg-destructive/10">
                    <CardContent className="p-4">
                        <p className="text-destructive">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadNotes}
                            className="mt-2 cursor-pointer"
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Loading state */}
            {isLoading ? (
                <div className="text-center py-8">
                    <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading your notes...</p>
                </div>
            ) : filteredNotes.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        {searchTerm || activeTab !== "all" ? (
                            <>
                                <p className="text-muted-foreground mb-2">No notes match your search or filters.</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setActiveTab("all");
                                    }}
                                    className="cursor-pointer"
                                >
                                    Clear Filters
                                </Button>
                            </>
                        ) : (
                            <>
                                <p className="text-muted-foreground mb-2">You haven't created any notes yet.</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCreateNote}
                                    className="cursor-pointer"
                                >
                                    Create Your First Note
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredNotes.map((note) => (
                        <Card
                            key={note.id}
                            className={`overflow-hidden ${note.is_pinned ? 'border-primary/30' : ''}`}
                        >
                            <CardHeader className="pb-2 pt-4 px-4">
                                <div className="flex justify-between">
                                    <CardTitle className="text-lg flex-1 mr-2 truncate">{note.title}</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleTogglePin(note)}
                                        className={`size-7 cursor-pointer ${note.is_pinned ? 'text-primary' : 'text-muted-foreground'}`}
                                        title={note.is_pinned ? "Unpin note" : "Pin note"}
                                    >
                                        <PinIcon className="size-4" />
                                    </Button>
                                </div>
                                {note.category && (
                                    <Badge variant="outline" className="mt-1 mr-auto">
                                        {note.category}
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="px-4 py-2">
                                <p className="text-sm whitespace-pre-line line-clamp-5">{note.content}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between pt-0 pb-3 px-4 text-xs text-muted-foreground">
                                <span>
                                    {format(new Date(note.updated_at), "MMM d, yyyy")}
                                </span>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditNote(note)}
                                        className="size-7 cursor-pointer"
                                        title="Edit note"
                                    >
                                        <PencilIcon className="size-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleConfirmDelete(note.id)}
                                        className="size-7 cursor-pointer text-destructive"
                                        title="Delete note"
                                    >
                                        <TrashIcon className="size-3.5" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Note Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingNote ? 'Edit Note' : 'Create Note'}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-3">
                        <div className="grid gap-2">
                            <label htmlFor="title" className="text-sm font-medium">
                                Title
                            </label>
                            <Input
                                id="title"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                placeholder="Note title..."
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="category" className="text-sm font-medium">
                                Category
                            </label>
                            <Select value={noteCategory} onValueChange={setNoteCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(category => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="content" className="text-sm font-medium">
                                Content
                            </label>
                            <Textarea
                                id="content"
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="Note content..."
                                rows={6}
                                className="resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSaveNote} className="cursor-pointer">
                            {editingNote ? 'Update Note' : 'Create Note'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Note</DialogTitle>
                    </DialogHeader>
                    <div className="py-3">
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete this note? This action cannot be undone.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="cursor-pointer gap-1.5"
                        >
                            <XIcon className="size-4" />
                            <span>Cancel</span>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteNote}
                            className="cursor-pointer gap-1.5"
                        >
                            <TrashIcon className="size-4" />
                            <span>Delete</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}