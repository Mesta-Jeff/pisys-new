import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Type definitions
type DisplayMode = 'grid' | 'list'; // or whatever modes you support

interface ProductStoreState {
  PRODUCT_LIST: any[];
  PAGINATED_LIST: any[];
  CATEGORY_LIST: any[];
  FAVORITES: string[]; // or number[] if product IDs are numeric
  selectedCategory: string | null;
  display: DisplayMode;
  isSaving: boolean;
  isLoading: boolean;
  searchTerm: string;
  debouncedSearchTerm: string;
  currentPage: number;
  filterCategory: string | null;

  // Actions
  setPRODUCT_LIST: (list: any[]) => void;
  setFAVORITES: (favorites: string[]) => void;
  setPAGINATED_LIST: (list: any[]) => void;
  setCATEGORY_LIST: (list: any[]) => void;
  setSelectedCategory: (category: string | null) => void;
  setDisplay: (val: DisplayMode) => void;
  setIsSaving: (val: boolean) => void;
  setIsLoading: (val: boolean) => void;
  setSearchTerm: (val: string) => void;
  setDebouncedSearchTerm: (val: string) => void;
  setCurrentPage: (val: number) => void;
  setFilterCategory: (val: string | null) => void;
  toggleFavorite: (productId: string) => void; // or number if applicable
}

const userData = JSON.parse(localStorage.getItem('userData') || '{}');
const username = userData.name || 'guest';

export const useProductStore = create<ProductStoreState>()(
  persist(
    (set, get) => ({
      PRODUCT_LIST: [],
      PAGINATED_LIST: [],
      CATEGORY_LIST: [],
      FAVORITES: [],
      selectedCategory: null,
      display: 'grid',
      isSaving: false,
      isLoading: true,
      searchTerm: '',
      debouncedSearchTerm: '',
      currentPage: 1,
      filterCategory: null,

      setPRODUCT_LIST: (list) => set({ PRODUCT_LIST: list }),
      setFAVORITES: (favorites) => set({ FAVORITES: favorites }),
      setPAGINATED_LIST: (list) => set({ PAGINATED_LIST: list }),
      setCATEGORY_LIST: (list) => set({ CATEGORY_LIST: list }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setDisplay: (val) => set({ display: val }),
      setIsSaving: (val) => set({ isSaving: val }),
      setIsLoading: (val) => set({ isLoading: val }),
      setSearchTerm: (val) => set({ searchTerm: val }),
      setDebouncedSearchTerm: (val) => set({ debouncedSearchTerm: val }),
      setCurrentPage: (val) => set({ currentPage: val }),
      setFilterCategory: (val) => set({ filterCategory: val }),

      toggleFavorite: (productId) => {
        const { FAVORITES } = get();
        const isFavorite = FAVORITES.includes(productId);
        const updated = isFavorite
          ? FAVORITES.filter((id) => id !== productId)
          : [...FAVORITES, productId];
        set({ FAVORITES: updated });
      },
    }),
    {
      name: `product-storage-${username}`,
      partialize: (state) => ({
        FAVORITES: state.FAVORITES,
      }),
    }
  )
);
