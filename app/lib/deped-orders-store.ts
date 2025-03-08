// app/lib/deped-orders-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { DepEdOrder, SortState, PaginationState } from '~/types';

interface DepEdOrdersState {
    // Data
    orders: DepEdOrder[];
    filteredOrders: DepEdOrder[];
    isLoading: boolean;
    error: string | null;

    // Filtering/Sorting/Pagination
    searchTerm: string;
    yearFilter: number | null;
    sortState: SortState;
    paginationState: PaginationState;

    // Actions
    setOrders: (orders: DepEdOrder[]) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setSearchTerm: (term: string) => void;
    setYearFilter: (year: number | null) => void;
    setSortState: (sort: SortState) => void;
    setPaginationState: (pagination: Partial<PaginationState>) => void;
    resetFilters: () => void;

    // Computed data
    getPageCount: () => number;
    getCurrentPageData: () => DepEdOrder[];
    getYearsFromData: () => number[];
}

export const useDepEdOrdersStore = create<DepEdOrdersState>()(
    devtools(
        (set, get) => ({
            // Initial data state
            orders: [],
            filteredOrders: [],
            isLoading: false,
            error: null,

            // Initial filter/sort/pagination state
            searchTerm: '',
            yearFilter: null,
            sortState: {
                column: 'year',
                direction: 'desc'
            },
            paginationState: {
                pageIndex: 0,
                pageSize: 20
            },

            // Data actions
            setOrders: (orders) => {
                set({ orders });
                // Recalculate filtered results
                get().setSearchTerm(get().searchTerm);
            },

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error }),

            // Filter/sort actions
            setSearchTerm: (searchTerm) => {
                const { orders, yearFilter, sortState } = get();

                // Step 1: Filter by search term and year
                let filtered = orders;

                if (searchTerm) {
                    const lowerCaseTerm = searchTerm.toLowerCase();
                    filtered = filtered.filter(order =>
                        order.title.toLowerCase().includes(lowerCaseTerm) ||
                        order.orderNumber.toLowerCase().includes(lowerCaseTerm) ||
                        (order.description && order.description.toLowerCase().includes(lowerCaseTerm))
                    );
                }

                if (yearFilter) {
                    filtered = filtered.filter(order => order.year === yearFilter);
                }

                // Step 2: Apply sorting
                filtered = [...filtered].sort((a, b) => {
                    const { column, direction } = sortState;
                    const multiplier = direction === 'asc' ? 1 : -1;

                    if (column === 'year') {
                        return (a.year - b.year) * multiplier;
                    } else if (column === 'dateIssued') {
                        return new Date(a.dateIssued).getTime() - new Date(b.dateIssued).getTime() * multiplier;
                    } else if (column === 'orderNumber') {
                        // Extract numeric parts for natural sort
                        const aMatch = a.orderNumber.match(/(\d+)/);
                        const bMatch = b.orderNumber.match(/(\d+)/);
                        if (aMatch && bMatch) {
                            return (parseInt(aMatch[0], 10) - parseInt(bMatch[0], 10)) * multiplier;
                        }
                        return a.orderNumber.localeCompare(b.orderNumber) * multiplier;
                    } else {
                        return a.title.localeCompare(b.title) * multiplier;
                    }
                });

                // Step 3: Reset to first page when filters change
                set({
                    searchTerm,
                    filteredOrders: filtered,
                    paginationState: {
                        ...get().paginationState,
                        pageIndex: 0
                    }
                });
            },

            setYearFilter: (yearFilter) => {
                set({ yearFilter });
                // Re-apply search term to trigger filtering
                get().setSearchTerm(get().searchTerm);
            },

            setSortState: (sortState) => {
                set({ sortState });
                // Re-apply search term to trigger filtering and sorting
                get().setSearchTerm(get().searchTerm);
            },

            setPaginationState: (pagination) => {
                set({
                    paginationState: {
                        ...get().paginationState,
                        ...pagination
                    }
                });
            },

            resetFilters: () => {
                set({
                    searchTerm: '',
                    yearFilter: null,
                    paginationState: {
                        pageIndex: 0,
                        pageSize: get().paginationState.pageSize
                    }
                });
                // Reset filtered orders to all orders
                set({ filteredOrders: get().orders });
            },

            // Computed data
            getPageCount: () => {
                const { filteredOrders, paginationState } = get();
                return Math.ceil(filteredOrders.length / paginationState.pageSize);
            },

            getCurrentPageData: () => {
                const { filteredOrders, paginationState } = get();
                const { pageIndex, pageSize } = paginationState;

                const start = pageIndex * pageSize;
                const end = start + pageSize;

                return filteredOrders.slice(start, end);
            },

            getYearsFromData: () => {
                const { orders } = get();
                const yearsSet = new Set(orders.map(order => order.year));
                return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
            }
        }),
        { name: 'deped-orders-store' }
    )
);