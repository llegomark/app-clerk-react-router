// app/components/deped-orders-table.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
    ChevronUpIcon,
    ChevronDownIcon,
    FileTextIcon,
    DownloadIcon,
    ExternalLinkIcon,
} from "lucide-react";
import type { DepEdOrder, SortState } from "~/types";

interface DepEdOrdersTableProps {
    orders: DepEdOrder[];
    sortState: SortState;
    onSort: (column: SortState['column']) => void;
    onView: (order: DepEdOrder) => void;
    onDownload: (order: DepEdOrder) => void;
    isLoading?: boolean;
}

export function DepEdOrdersTable({
    orders,
    sortState,
    onSort,
    onView,
    onDownload,
    isLoading = false,
}: DepEdOrdersTableProps) {
    // Helper to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    // Helper to generate sort icon
    const getSortIcon = (column: SortState['column']) => {
        if (sortState.column !== column) {
            return null;
        }
        return sortState.direction === 'asc' ? (
            <ChevronUpIcon className="size-3.5 ml-1" />
        ) : (
            <ChevronDownIcon className="size-3.5 ml-1" />
        );
    };

    // No data state
    if (!isLoading && orders.length === 0) {
        return (
            <div className="border rounded-md p-8 text-center">
                <FileTextIcon className="size-10 mx-auto text-muted-foreground opacity-50 mb-3" />
                <h3 className="text-sm font-medium mb-1">No Orders Found</h3>
                <p className="text-xs text-muted-foreground">
                    Try adjusting your search or filters
                </p>
            </div>
        );
    }

    return (
        <div className="border rounded-md overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-20">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center h-8 -ml-3 px-2 font-medium text-xs"
                                onClick={() => onSort('year')}
                            >
                                Year
                                {getSortIcon('year')}
                            </Button>
                        </TableHead>
                        <TableHead className="w-32">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center h-8 -ml-3 px-2 font-medium text-xs"
                                onClick={() => onSort('orderNumber')}
                            >
                                Order No.
                                {getSortIcon('orderNumber')}
                            </Button>
                        </TableHead>
                        <TableHead className="w-32">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center h-8 -ml-3 px-2 font-medium text-xs"
                                onClick={() => onSort('dateIssued')}
                            >
                                Date
                                {getSortIcon('dateIssued')}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center h-8 -ml-3 px-2 font-medium text-xs"
                                onClick={() => onSort('title')}
                            >
                                Title
                                {getSortIcon('title')}
                            </Button>
                        </TableHead>
                        <TableHead className="w-28 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        // Loading skeletons
                        Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={`loading-${index}`}>
                                <TableCell>
                                    <div className="h-4 w-10 bg-muted rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                                        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="text-xs font-medium">{order.year}</TableCell>
                                <TableCell className="text-xs">{order.orderNumber}</TableCell>
                                <TableCell className="text-xs">{formatDate(order.dateIssued)}</TableCell>
                                <TableCell className="text-xs">{order.title}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-muted-foreground hover:text-foreground"
                                            onClick={() => onView(order)}
                                            title="View details"
                                        >
                                            <ExternalLinkIcon className="size-3.5" />
                                        </Button>
                                        {order.fileUrl && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => onDownload(order)}
                                                title="Download PDF"
                                            >
                                                <DownloadIcon className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}