// app/components/flash-cards-list.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { SearchIcon, ChevronUpIcon, ChevronDownIcon, ArrowLeftIcon } from "lucide-react";
import { Input } from "~/components/ui/input";
import type { FlashCard } from "~/types";
import { useState } from "react";

interface FlashCardsListProps {
    cards: FlashCard[];
    onSelectCard: (index: number) => void;
    onClose: () => void;
}

export function FlashCardsList({ cards, onSelectCard, onClose }: FlashCardsListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<"term" | "category">("term");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const toggleSort = (field: "term" | "category") => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const filteredCards = cards.filter((card) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            card.term.toLowerCase().includes(searchLower) ||
            card.definition.toLowerCase().includes(searchLower) ||
            card.category.toLowerCase().includes(searchLower)
        );
    });

    const sortedCards = [...filteredCards].sort((a, b) => {
        const compareA = a[sortField].toLowerCase();
        const compareB = b[sortField].toLowerCase();

        const compareResult = compareA.localeCompare(compareB);
        return sortDirection === "asc" ? compareResult : -compareResult;
    });

    return (
        <div className="bg-card rounded-lg border border-border/40 shadow-xs w-full mx-auto">
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-sm font-medium">All Flash Cards</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="cursor-pointer h-8 gap-1.5"
                >
                    <ArrowLeftIcon className="size-3.5" />
                    <span>Back to Cards</span>
                </Button>
            </div>

            <div className="p-4">
                <div className="relative mb-4">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="search"
                        placeholder="Search terms, definitions, or categories..."
                        className="pl-9 h-9 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="border rounded-md overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleSort("term")}
                                        className="flex items-center gap-1 cursor-pointer -ml-3 h-8 text-xs font-medium"
                                    >
                                        Term
                                        {sortField === "term" ? (
                                            sortDirection === "asc" ? (
                                                <ChevronUpIcon className="size-3.5" />
                                            ) : (
                                                <ChevronDownIcon className="size-3.5" />
                                            )
                                        ) : null}
                                    </Button>
                                </TableHead>
                                <TableHead className="w-1/2">Definition</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleSort("category")}
                                        className="flex items-center gap-1 cursor-pointer -ml-3 h-8 text-xs font-medium"
                                    >
                                        Category
                                        {sortField === "category" ? (
                                            sortDirection === "asc" ? (
                                                <ChevronUpIcon className="size-3.5" />
                                            ) : (
                                                <ChevronDownIcon className="size-3.5" />
                                            )
                                        ) : null}
                                    </Button>
                                </TableHead>
                                <TableHead className="w-16 text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedCards.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-6 text-xs text-muted-foreground">
                                        No flash cards found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedCards.map((card) => {
                                    // Find the original index in the unsorted cards array
                                    const originalIndex = cards.findIndex(c => c.id === card.id);

                                    return (
                                        <TableRow key={card.id}>
                                            <TableCell className="font-medium text-xs">{card.term}</TableCell>
                                            <TableCell className="text-xs">
                                                <div className="line-clamp-2">
                                                    {card.definition}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">{card.category}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onSelectCard(originalIndex)}
                                                    className="cursor-pointer h-7 text-xs"
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}