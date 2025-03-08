// app/lib/flash-card-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { FlashCard } from '~/types';
import { shuffleArray } from './utils';

interface FlashCardState {
    cards: FlashCard[];
    currentCardIndex: number;
    isFlipped: boolean;

    // Actions
    setCards: (cards: FlashCard[]) => void;
    shuffleCards: () => void;
    nextCard: () => void;
    previousCard: () => void;
    flipCard: () => void;
    resetFlip: () => void;
    goToCard: (index: number) => void;
}

export const useFlashCardStore = create<FlashCardState>()(
    devtools(
        (set, get) => ({
            cards: [],
            currentCardIndex: 0,
            isFlipped: false,

            setCards: (cards) => set({
                cards,
                currentCardIndex: 0,
                isFlipped: false
            }),

            shuffleCards: () => {
                const { cards } = get();
                if (cards.length <= 1) return; // Don't shuffle if there's only one card or none

                const shuffled = shuffleArray(cards);
                set({
                    cards: shuffled,
                    currentCardIndex: 0,
                    isFlipped: false
                });
            },

            nextCard: () => {
                const { currentCardIndex, cards } = get();
                if (cards.length === 0) return;

                // Use modulo for circular navigation
                const nextIndex = (currentCardIndex + 1) % cards.length;
                set({
                    currentCardIndex: nextIndex,
                    isFlipped: false // Reset flip state when changing cards
                });
            },

            previousCard: () => {
                const { currentCardIndex, cards } = get();
                if (cards.length === 0) return;

                // Use modulo with addition for negative index handling
                const prevIndex = (currentCardIndex - 1 + cards.length) % cards.length;
                set({
                    currentCardIndex: prevIndex,
                    isFlipped: false // Reset flip state when changing cards
                });
            },

            flipCard: () => {
                const { isFlipped } = get();
                set({ isFlipped: !isFlipped });
            },

            resetFlip: () => set({ isFlipped: false }),

            goToCard: (index) => {
                const { cards } = get();
                // Validate the index bounds
                if (index >= 0 && index < cards.length) {
                    set({
                        currentCardIndex: index,
                        isFlipped: false
                    });
                }
            },
        }),
        { name: 'flash-card-store' } // Add name for better DevTools identification
    )
);