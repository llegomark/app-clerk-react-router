// app/routes/flashcards.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeftIcon } from 'lucide-react';

import { useFlashCardStore } from '~/lib/flash-card-store';
import { FlashCard } from '~/components/flash-card';
import { FlashCardControls } from '~/components/flash-card-controls';
import { FlashCardsList } from '~/components/flash-cards-list';
import { Button } from '~/components/ui/button';

export function meta() {
    return [
        { title: "NQESH Reviewer Pro - Flash Cards" },
        { name: "description", content: "Review key NQESH terms and definitions with flash cards" },
    ];
}

export default function FlashCardsPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showList, setShowList] = useState(false);

    const {
        cards,
        currentCardIndex,
        isFlipped,
        setCards,
        shuffleCards,
        nextCard,
        previousCard,
        flipCard,
        goToCard
    } = useFlashCardStore();

    useEffect(() => {
        // In a real app, this would fetch from Supabase
        const fetchFlashCards = async () => {
            try {
                setIsLoading(true);

                // TODO: Replace with actual Supabase fetch
                // const { data, error } = await supabase.from('flash_cards').select('*');

                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 800));

                // Sample data (in a real app, this would come from Supabase)
                const sampleCards = [
                    {
                        id: '1',
                        term: 'Instructional Leadership',
                        definition: 'The actions that a principal takes to promote growth in student learning. It consists of knowledge, actions, and attitudes that create conditions for teacher growth, which, in turn, enable better student outcomes.',
                        category: 'Leadership',
                        examples: [
                            'Setting clear academic goals',
                            'Monitoring curriculum implementation',
                            'Supporting teacher development'
                        ],
                    },
                    {
                        id: '2',
                        term: 'School Climate',
                        definition: 'The quality and character of school life. It reflects norms, values, interpersonal relationships, teaching and learning practices, and organizational structures.',
                        category: 'School Management',
                        notes: 'Positive school climate is associated with reduced student behavioral issues and better academic outcomes.',
                    },
                    {
                        id: '3',
                        term: 'Professional Learning Community (PLC)',
                        definition: 'A group of educators who meet regularly, share expertise, and work collaboratively to improve teaching skills and the academic performance of students.',
                        category: 'Professional Development',
                        examples: [
                            'Grade-level team meetings',
                            'Subject-specific collaboration',
                            'Data analysis sessions'
                        ],
                    },
                    {
                        id: '4',
                        term: 'Formative Assessment',
                        definition: 'Ongoing assessments, reviews, and observations in a classroom used to inform teacher instructional methods and provide feedback to students on their learning.',
                        category: 'Assessment',
                    },
                    {
                        id: '5',
                        term: 'Differentiated Instruction',
                        definition: 'An approach to teaching that tailors instruction to meet the individual needs of students, recognizing that students have different strengths, interests, and learning styles.',
                        category: 'Pedagogy',
                        examples: [
                            'Flexible grouping',
                            'Tiered assignments',
                            'Choice boards'
                        ],
                    },
                    {
                        id: '6',
                        term: 'Curriculum Mapping',
                        definition: 'The process of documenting and aligning the curriculum with standards, assessments, and resources to ensure comprehensive and coherent learning experiences.',
                        category: 'Curriculum',
                    },
                    {
                        id: '7',
                        term: 'School Improvement Plan (SIP)',
                        definition: 'A strategic plan that outlines the school\'s goals, strategies, and action steps for improving student achievement and overall school effectiveness.',
                        category: 'School Management',
                        notes: 'Should be data-driven and regularly reviewed for progress monitoring.',
                    },
                    {
                        id: '8',
                        term: 'Response to Intervention (RTI)',
                        definition: 'A multi-tier approach to the early identification and support of students with learning and behavior needs. It integrates assessment and intervention within a multi-level prevention system.',
                        category: 'Student Support',
                        examples: [
                            'Tier 1: Universal instruction',
                            'Tier 2: Targeted interventions',
                            'Tier 3: Intensive interventions'
                        ],
                    },
                    {
                        id: '9',
                        term: 'School-Based Management (SBM)',
                        definition: 'A governance system that involves school-level decision-making by a council composed of different stakeholders including teachers, parents, community members, and the principal.',
                        category: 'Governance',
                        notes: 'In the Philippines, this is formalized as the School Governing Council (SGC).',
                    },
                    {
                        id: '10',
                        term: 'Inclusive Education',
                        definition: 'An educational approach that seeks to address the learning needs of all children, with a specific focus on those who are vulnerable to marginalization and exclusion.',
                        category: 'Equity',
                        notes: 'Aligned with DepEd Order No. 72, s. 2009 on inclusive education.',
                    },
                ];

                setCards(sampleCards);
                setError(null);
            } catch (err) {
                console.error('Error fetching flash cards:', err);
                setError('Failed to load flash cards. Please try again later.');
                toast.error('Failed to load flash cards');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFlashCards();
    }, [setCards]);

    const handleGoBack = () => {
        navigate('/');
    };

    const toggleView = () => {
        setShowList(!showList);
    };

    return (
        <div className="min-h-[calc(100vh-10rem)] bg-background py-6 px-4">
            <div className="max-w-2xl mx-auto mb-5">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGoBack}
                        className="cursor-pointer text-muted-foreground hover:text-foreground h-8 px-2"
                    >
                        <ArrowLeftIcon className="size-4" />
                    </Button>

                    <h2 className="text-sm font-medium text-foreground text-center">NQESH Terminology</h2>

                    <div className="w-8"></div>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        <p className="mt-3 text-xs text-muted-foreground">Loading flash cards...</p>
                    </div>
                ) : error ? (
                    <div className="p-4 rounded-md bg-destructive/10 text-destructive-foreground max-w-lg mx-auto text-center">
                        <p className="text-xs mb-3">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.reload()}
                            className="cursor-pointer h-8"
                        >
                            Try Again
                        </Button>
                    </div>
                ) : (
                    <>
                        {!showList && cards.length > 0 && (
                            <div className="will-change-transform">
                                <FlashCard
                                    card={cards[currentCardIndex]}
                                    isFlipped={isFlipped}
                                    onFlip={flipCard}
                                />

                                <FlashCardControls
                                    currentIndex={currentCardIndex}
                                    totalCards={cards.length}
                                    onNext={nextCard}
                                    onPrevious={previousCard}
                                    onShuffle={shuffleCards}
                                    onShowAll={toggleView}
                                />
                            </div>
                        )}

                        {showList && (
                            <FlashCardsList
                                cards={cards}
                                onSelectCard={(index) => {
                                    goToCard(index);
                                    setShowList(false);
                                }}
                                onClose={toggleView}
                            />
                        )}

                        {cards.length === 0 && !isLoading && !error && (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground text-sm">No flash cards available.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}