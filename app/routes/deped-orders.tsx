// app/routes/deped-orders.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
    FileTextIcon,
    FileIcon,
    FilterIcon,
    DownloadIcon
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useDepEdOrdersStore } from "~/lib/deped-orders-store";
import { DepEdOrdersTable } from "~/components/deped-orders-table";
import { DepEdOrdersPagination } from "~/components/deped-orders-pagination";
import { DepEdOrdersFilters } from "~/components/deped-orders-filters";
import { DepEdOrderViewer } from "~/components/deped-order-viewer";
import type { DepEdOrder, SortState } from "~/types";

export function meta() {
    return [
        { title: "DepEd Orders Library - NQESH Reviewer Pro" },
        { name: "description", content: "Browse and search Department of Education official issuances" },
    ];
}

export default function DepEdOrdersPage() {
    const navigate = useNavigate();
    const [viewingOrder, setViewingOrder] = useState<DepEdOrder | null>(null);
    const [activeTab, setActiveTab] = useState("all");

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

    // Filter orders by year for tabs
    const getOrdersByYear = (year: number | null) => {
        if (!year) return filteredOrders;
        return filteredOrders.filter(order => order.year === year);
    };

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
        <div className="container mx-auto py-6 px-4 max-w-4xl">
            {/* Header with icon and title/description */}
            <div className="mb-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <FileTextIcon className="size-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">DepEd Orders</h1>
                            <p className="text-sm text-muted-foreground">
                                Browse and download Department of Education official issuances
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://www.deped.gov.ph/deped-orders/', '_blank')}
                        className="gap-1.5 cursor-pointer hidden sm:flex"
                    >
                        <FileIcon className="size-3.5" />
                        <span>Official DepEd Site</span>
                    </Button>
                </div>
            </div>

            {/* Main content card */}
            <Card className="mb-6">
                <CardHeader className="pb-0">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FilterIcon className="size-4 text-primary" />
                        Search and Filter
                    </CardTitle>
                    <CardDescription>
                        Find specific DepEd orders by title, number, or year
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    {/* Filters */}
                    <DepEdOrdersFilters
                        searchTerm={searchTerm}
                        yearFilter={yearFilter}
                        availableYears={availableYears}
                        onSearchChange={setSearchTerm}
                        onYearFilterChange={setYearFilter}
                        onResetFilters={resetFilters}
                    />
                </CardContent>
            </Card>

            {/* Error state */}
            {error && (
                <Card className="mb-6 border-destructive/50">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                            <p className="text-sm text-destructive mb-3">{error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Year tabs */}
            {!error && !isLoading && filteredOrders.length > 0 && (
                <Tabs
                    defaultValue="all"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="mb-4"
                >
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">
                            {filteredOrders.length} {filteredOrders.length === 1 ? 'result' : 'results'}
                            {(searchTerm || yearFilter) && ' matching your filters'}
                        </p>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const url = new Blob(
                                    [JSON.stringify(filteredOrders, null, 2)],
                                    { type: 'application/json' }
                                );
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(url);
                                link.download = 'deped-orders.json';
                                link.click();
                                toast.success('Downloaded orders data');
                            }}
                            className="gap-1.5 cursor-pointer"
                        >
                            <DownloadIcon className="size-3.5" />
                            <span>Export</span>
                        </Button>
                    </div>

                    <TabsList className="w-full h-auto flex-wrap mb-4">
                        <TabsTrigger value="all">All Years</TabsTrigger>
                        {availableYears.slice(0, 5).map(year => (
                            <TabsTrigger key={year} value={year.toString()}>
                                {year}
                            </TabsTrigger>
                        ))}
                        {availableYears.length > 5 && (
                            <TabsTrigger value="more">More...</TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="all" className="mt-0">
                        <DepEdOrdersTable
                            orders={currentPageData}
                            sortState={sortState}
                            onSort={handleSort}
                            onView={handleViewOrder}
                            onDownload={handleDownloadOrder}
                            isLoading={isLoading}
                        />
                    </TabsContent>

                    {availableYears.map(year => (
                        <TabsContent key={year} value={year.toString()} className="mt-0">
                            <DepEdOrdersTable
                                orders={getOrdersByYear(year)}
                                sortState={sortState}
                                onSort={handleSort}
                                onView={handleViewOrder}
                                onDownload={handleDownloadOrder}
                                isLoading={isLoading}
                            />
                        </TabsContent>
                    ))}

                    {availableYears.length > 5 && (
                        <TabsContent value="more" className="mt-0">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                                {availableYears.slice(5).map(year => (
                                    <Button
                                        key={year}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setYearFilter(year);
                                            setActiveTab("all");
                                        }}
                                        className="cursor-pointer"
                                    >
                                        {year}
                                    </Button>
                                ))}
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            )}

            {/* Loading state */}
            {isLoading && (
                <Card className="border-muted/50">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
                            <p className="text-sm font-medium">Loading DepEd Orders...</p>
                            <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
            {!isLoading && !error && filteredOrders.length === 0 && (
                <Card className="border-muted/50">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="bg-muted/30 p-4 rounded-full mb-4">
                                <FileTextIcon className="size-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">No Orders Found</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                                {searchTerm || yearFilter ?
                                    "No DepEd orders match your current search filters. Try adjusting your criteria." :
                                    "There are no DepEd orders available at the moment."}
                            </p>
                            {(searchTerm || yearFilter) && (
                                <Button
                                    variant="outline"
                                    onClick={resetFilters}
                                    className="cursor-pointer"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Table with results (when not loading or error) */}
            {!isLoading && !error && filteredOrders.length > 0 && activeTab === "all" && (
                <>
                    {/* Pagination */}
                    <div className="mt-4">
                        <DepEdOrdersPagination
                            currentPage={paginationState.pageIndex}
                            pageCount={pageCount}
                            pageSize={paginationState.pageSize}
                            totalItems={filteredOrders.length}
                            onPageChange={(page) => setPaginationState({ pageIndex: page })}
                            onPageSizeChange={(size) => setPaginationState({ pageSize: size, pageIndex: 0 })}
                        />
                    </div>
                </>
            )}

            {/* Order Viewer Dialog */}
            <DepEdOrderViewer
                order={viewingOrder}
                isOpen={!!viewingOrder}
                onClose={() => setViewingOrder(null)}
                onDownload={handleDownloadOrder}
            />
        </div>
    );
}