// app/components/flash-card.tsx
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import type { FlashCard as FlashCardType } from '~/types';

interface FlashCardProps {
    card: FlashCardType;
    isFlipped: boolean;
    onFlip: () => void;
}

export function FlashCard({ card, isFlipped, onFlip }: FlashCardProps) {
    return (
        <div
            className="w-full max-w-md mx-auto h-[28rem] sm:h-96 perspective-1000"
            onClick={onFlip}
        >
            <div
                className={cn(
                    "relative w-full h-full transition-transform duration-500 transform-3d preserve-3d cursor-pointer",
                    isFlipped ? "rotate-y-180" : ""
                )}
            >
                {/* Front of card (Term) */}
                <Card
                    className={cn(
                        "absolute inset-0 backface-hidden bg-card border border-border/30",
                        "flex flex-col items-center justify-center text-center p-8"
                    )}
                >
                    <Badge variant="outline" className="mb-4">{card.category}</Badge>
                    <h3 className="text-xl font-semibold">{card.term}</h3>
                    <p className="mt-6 text-xs text-muted-foreground">Tap to reveal definition</p>
                </Card>

                {/* Back of card (Definition) */}
                <Card
                    className={cn(
                        "absolute inset-0 backface-hidden bg-card border border-border/30 rotate-y-180",
                        "flex flex-col p-6 sm:p-8"
                    )}
                >
                    <div className="flex-1 flex flex-col">
                        <div className="mb-2 flex items-center justify-between">
                            <Badge variant="outline">{card.category}</Badge>
                            <span className="text-xs text-muted-foreground">Tap to flip</span>
                        </div>

                        <div className="mt-2">
                            <h3 className="text-sm font-medium mb-1">{card.term}</h3>
                            <p className="text-sm leading-relaxed">{card.definition}</p>
                        </div>

                        {card.examples && card.examples.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-xs font-medium text-muted-foreground mb-1">Examples:</h4>
                                <ul className="list-disc pl-4 space-y-1">
                                    {card.examples.map((example, i) => (
                                        <li key={i} className="text-xs">{example}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {card.notes && (
                            <div className="mt-4">
                                <h4 className="text-xs font-medium text-muted-foreground mb-1">Notes:</h4>
                                <p className="text-xs text-muted-foreground">{card.notes}</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}