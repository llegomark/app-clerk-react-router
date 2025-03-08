// app/components/deped-orders-pagination.tsx
import { Button } from "~/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination";
import { type PaginationState } from "~/types";

interface DepEdOrdersPaginationProps {
    currentPage: number;
    pageCount: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export function DepEdOrdersPagination({
    currentPage,
    pageCount,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
}: DepEdOrdersPaginationProps) {
    // Show results range (e.g., "Showing 1-20 of 100 results")
    const startItem = Math.min(currentPage * pageSize + 1, totalItems);
    const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

    // Generate page links with intelligent logic
    const getPageLinks = () => {
        if (pageCount <= 7) {
            // Show all pages if there are 7 or fewer
            return Array.from({ length: pageCount }, (_, i) => i);
        }

        // Otherwise, show smart pagination with current, first, last, and nearby pages
        const pages = [];

        // Always show first page
        pages.push(0);

        // Show pages around current page (current page +/- 1)
        const leftBoundary = Math.max(1, currentPage - 1);
        const rightBoundary = Math.min(pageCount - 2, currentPage + 1);

        // Add ellipsis if needed before the current page area
        if (leftBoundary > 1) {
            pages.push(-1); // -1 is a marker for ellipsis
        }

        // Add the pages around current page
        for (let i = leftBoundary; i <= rightBoundary; i++) {
            pages.push(i);
        }

        // Add ellipsis if needed after the current page area
        if (rightBoundary < pageCount - 2) {
            pages.push(-2); // -2 is a marker for ellipsis (using different key)
        }

        // Always show last page
        pages.push(pageCount - 1);

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                    Showing {startItem}-{endItem} of {totalItems} orders
                </span>
                <div className="flex items-center gap-1">
                    <span>Show</span>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
                    >
                        <SelectTrigger className="h-8 w-16 text-xs">
                            <SelectValue placeholder={pageSize.toString()} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <span>per page</span>
                </div>
            </div>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 0) {
                                    onPageChange(currentPage - 1);
                                }
                            }}
                            className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>

                    {getPageLinks().map((page, i) => {
                        // Render ellipsis
                        if (page < 0) {
                            return (
                                <PaginationItem key={`ellipsis-${page}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }

                        // Render page number
                        return (
                            <PaginationItem key={`page-${page}`}>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPageChange(page);
                                    }}
                                    isActive={page === currentPage}
                                    className="cursor-pointer"
                                >
                                    {page + 1}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < pageCount - 1) {
                                    onPageChange(currentPage + 1);
                                }
                            }}
                            className={
                                currentPage >= pageCount - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}