// app/components/deped-orders-filters.tsx
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { SearchIcon, FilterIcon, XIcon } from "lucide-react";

interface DepEdOrdersFiltersProps {
    searchTerm: string;
    yearFilter: number | null;
    availableYears: number[];
    onSearchChange: (term: string) => void;
    onYearFilterChange: (year: number | null) => void;
    onResetFilters: () => void;
}

export function DepEdOrdersFilters({
    searchTerm,
    yearFilter,
    availableYears,
    onSearchChange,
    onYearFilterChange,
    onResetFilters,
}: DepEdOrdersFiltersProps) {
    // Controlled input for search with debouncing
    const [inputValue, setInputValue] = useState(searchTerm);

    // Update input value when searchTerm changes (e.g. from reset)
    useEffect(() => {
        setInputValue(searchTerm);
    }, [searchTerm]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputValue !== searchTerm) {
                onSearchChange(inputValue);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [inputValue, onSearchChange, searchTerm]);

    // Check if filters are active
    const hasActiveFilters = searchTerm !== '' || yearFilter !== null;

    return (
        <div className="space-y-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
                {/* Search input */}
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="search"
                        placeholder="Search by title or order number..."
                        className="pl-9 h-9"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </div>

                {/* Year filter */}
                <div className="flex gap-2">
                    <Select
                        value={yearFilter?.toString() || "all"}
                        onValueChange={(value) =>
                            onYearFilterChange(value === "all" ? null : parseInt(value, 10))
                        }
                    >
                        <SelectTrigger className="w-32 h-9">
                            <div className="flex items-center gap-2">
                                <FilterIcon className="size-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Filter Year" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Years</SelectItem>
                            {availableYears.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Reset filters button - only show when filters are active */}
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onResetFilters}
                            className="h-9 gap-1"
                        >
                            <XIcon className="size-3.5" />
                            <span>Clear</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}