// app/routes/deped-orders.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeftIcon, FileTextIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { useDepEdOrdersStore } from "~/lib/deped-orders-store";
import { DepEdOrdersTable } from "~/components/deped-orders-table";
import { DepEdOrdersPagination } from "~/components/deped-orders-pagination";
import { DepEdOrdersFilters } from "~/components/deped-orders-filters";
import { DepEdOrderViewer } from "~/components/deped-order-viewer";
import type { DepEdOrder, SortState } from "~/types";

export function meta() {
    return [
        { title: "NQESH Reviewer Pro - DepEd Orders" },
        { name: "description", content: "Browse and search DepEd Orders" },
    ];
}

export default function DepEdOrdersPage() {
    const navigate = useNavigate();
    const [viewingOrder, setViewingOrder] = useState<DepEdOrder | null>(null);

    const {
        orders,
        filteredOrders,
        isLoading,
        error,
        searchTerm,
        yearFilter,
        sortState,
        paginationState,
        setOrders,
        setLoading,
        setError,
        setSearchTerm,
        setYearFilter,
        setSortState,
        setPaginationState,
        resetFilters,
        getPageCount,
        getCurrentPageData,
        getYearsFromData,
    } = useDepEdOrdersStore();

    // Fetch DepEd orders data
    useEffect(() => {
        const fetchDepEdOrders = async () => {
            try {
                setLoading(true);

                // In a real app, fetch from Supabase
                // const { data, error } = await supabase.from('deped_orders').select('*');

                // For now, using sample data
                await new Promise(resolve => setTimeout(resolve, 800));

                // Sample data for demonstration
                const sampleDepEdOrders: DepEdOrder[] = [
                    {
                        id: '1',
                        year: 2023,
                        orderNumber: '003',
                        dateIssued: '2023-01-15',
                        title: 'School Calendar and Activities for School Year 2023-2024',
                        description: 'This DepEd Order prescribes the school calendar and activities for School Year 2023-2024.',
                        fileUrl: '#',
                        tags: ['Calendar', 'Academic Year']
                    },
                    {
                        id: '2',
                        year: 2023,
                        orderNumber: '012',
                        dateIssued: '2023-03-20',
                        title: 'Guidelines on the Preparation for the Opening of Classes for School Year 2023-2024',
                        description: 'This Order provides guidance to schools on preparing for the next academic year.',
                        fileUrl: '#',
                        tags: ['Guidelines', 'School Opening']
                    },
                    {
                        id: '3',
                        year: 2022,
                        orderNumber: '034',
                        dateIssued: '2022-07-11',
                        title: 'Revised Implementing Guidelines on School-Based Feeding Program',
                        fileUrl: '#',
                        tags: ['Feeding Program', 'Nutrition']
                    },
                    {
                        id: '4',
                        year: 2022,
                        orderNumber: '048',
                        dateIssued: '2022-09-05',
                        title: 'Policy Guidelines on Classroom Assessment for the K to 12 Basic Education Program',
                        description: 'Guidelines on assessment methodologies for K-12 education.',
                        tags: ['Assessment', 'K-12']
                    },
                    {
                        id: '5',
                        year: 2021,
                        orderNumber: '029',
                        dateIssued: '2021-08-05',
                        title: 'School Safety and Disaster Preparedness Measures',
                        fileUrl: '#',
                    },
                    {
                        id: '6',
                        year: 2021,
                        orderNumber: '018',
                        dateIssued: '2021-05-17',
                        title: 'Policy Guidelines on the Implementation of Brigada Eskwela in Basic Education',
                        description: 'Guidelines for school readiness and maintenance program.',
                        fileUrl: '#',
                        tags: ['Brigada Eskwela']
                    },
                    {
                        id: '7',
                        year: 2020,
                        orderNumber: '030',
                        dateIssued: '2020-10-02',
                        title: 'Amendments to DepEd Order No. 021, s. 2019 (Policy Guidelines on the K to 12 Basic Education Program)',
                        fileUrl: '#',
                        tags: ['K-12', 'Curriculum']
                    },
                    {
                        id: '8',
                        year: 2020,
                        orderNumber: '012',
                        dateIssued: '2020-06-19',
                        title: 'Adoption of the Basic Education Learning Continuity Plan for School Year 2020-2021',
                        description: 'Response to education continuity during the COVID-19 pandemic.',
                        fileUrl: '#',
                        tags: ['COVID-19', 'Learning Continuity']
                    },
                    {
                        id: '9',
                        year: 2019,
                        orderNumber: '021',
                        dateIssued: '2019-08-22',
                        title: 'Policy Guidelines on the K to 12 Basic Education Program',
                        fileUrl: '#',
                        tags: ['K-12', 'Policy']
                    },
                    {
                        id: '10',
                        year: 2019,
                        orderNumber: '008',
                        dateIssued: '2019-04-01',
                        title: 'Classroom-Based Assessment Tools for Learning Areas in K to 12',
                        fileUrl: '#',
                        tags: ['Assessment', 'K-12']
                    },
                    // Add more sample orders to demonstrate pagination
                    ...Array.from({ length: 20 }, (_, i) => ({
                        id: `${11 + i}`,
                        year: 2018 - Math.floor(i / 5),
                        orderNumber: `${(30 + i).toString().padStart(3, '0')}`,
                        dateIssued: `${2018 - Math.floor(i / 5)}-${(Math.floor(i % 12) + 1).toString().padStart(2, '0')}-${(Math.floor(i % 28) + 1).toString().padStart(2, '0')}`,
                        title: `Sample DepEd Order ${11 + i}`,
                        description: i % 3 === 0 ? `This is a sample description for order ${11 + i}.` : undefined,
                        fileUrl: i % 2 === 0 ? '#' : undefined,
                        tags: i % 4 === 0 ? ['Sample', 'Test'] : undefined
                    }))
                ];

                setOrders(sampleDepEdOrders);
                setError(null);
            } catch (err) {
                console.error('Error fetching DepEd orders:', err);
                setError('Failed to load DepEd orders. Please try again later.');
                toast.error('Failed to load DepEd orders');
            } finally {
                setLoading(false);
            }
        };

        fetchDepEdOrders();
    }, [setLoading, setOrders, setError]);

    const pageCount = getPageCount();
    const currentPageData = getCurrentPageData();
    const availableYears = getYearsFromData();

    // Handle sorting
    const handleSort = (column: SortState['column']) => {
        setSortState({
            column,
            direction: sortState.column === column && sortState.direction === 'asc' ? 'desc' : 'asc'
        });
    };

    // Handle viewing an order
    const handleViewOrder = (order: DepEdOrder) => {
        setViewingOrder(order);
    };

    // Handle downloading an order
    const handleDownloadOrder = (order: DepEdOrder) => {
        if (order.fileUrl) {
            // In a real app, handle actual download
            // For now, just simulate with a toast
            toast.success(`Downloading ${order.orderNumber}...`);

            // In a real app:
            // window.open(order.fileUrl, '_blank');
        }
    };

    return (
        <div className="min-h-[calc(100vh-10rem)] bg-background py-6 px-4">
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-5">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/')}
                        className="cursor-pointer text-muted-foreground hover:text-foreground h-8 px-2"
                    >
                        <ArrowLeftIcon className="size-4" />
                    </Button>

                    <h1 className="text-sm font-medium text-foreground text-center">DepEd Orders</h1>

                    <div className="w-8"></div>
                </div>
            </div>

            <div className="container mx-auto max-w-5xl">
                {/* Page Content */}
                <div className="flex items-center gap-3 mb-5">
                    <FileTextIcon className="size-5 text-primary" />
                    <div>
                        <h2 className="text-base font-medium">DepEd Orders Library</h2>
                        <p className="text-xs text-muted-foreground">Browse, search, and download Department of Education orders</p>
                    </div>
                </div>

                {/* Filters */}
                <DepEdOrdersFilters
                    searchTerm={searchTerm}
                    yearFilter={yearFilter}
                    availableYears={availableYears}
                    onSearchChange={setSearchTerm}
                    onYearFilterChange={setYearFilter}
                    onResetFilters={resetFilters}
                />

                {/* Error state */}
                {error && (
                    <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive-foreground max-w-lg mx-auto">
                        <p className="text-sm text-center mb-3">{error}</p>
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                {/* Results info */}
                {!error && !isLoading && (
                    <p className="text-xs text-muted-foreground mb-2">
                        {filteredOrders.length} {filteredOrders.length === 1 ? 'result' : 'results'}
                        {(searchTerm || yearFilter) && ' matching your filters'}
                    </p>
                )}

                {/* Table */}
                <DepEdOrdersTable
                    orders={currentPageData}
                    sortState={sortState}
                    onSort={handleSort}
                    onView={handleViewOrder}
                    onDownload={handleDownloadOrder}
                    isLoading={isLoading}
                />

                {/* Pagination */}
                {!error && filteredOrders.length > 0 && (
                    <DepEdOrdersPagination
                        currentPage={paginationState.pageIndex}
                        pageCount={pageCount}
                        pageSize={paginationState.pageSize}
                        totalItems={filteredOrders.length}
                        onPageChange={(page) => setPaginationState({ pageIndex: page })}
                        onPageSizeChange={(size) => setPaginationState({ pageSize: size, pageIndex: 0 })}
                    />
                )}

                {/* Order Viewer Dialog */}
                <DepEdOrderViewer
                    order={viewingOrder}
                    isOpen={!!viewingOrder}
                    onClose={() => setViewingOrder(null)}
                    onDownload={handleDownloadOrder}
                />
            </div>
        </div>
    );
}