import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../supabaseClient';

interface Category {
  isOpen: boolean;
  name: string;
  code: string;
  parentCode: string | null;
  path: string;
}

interface CategoryState {
  categories: Category[];
  // setCategory: (data: Partial<CategoryState>) => void;
  setCategory: (code: string, partial: Partial<Category>) => void;
  fetchData: () => Promise<void>;
}

export const useCategoryStore = create(
  persist<CategoryState>(
    set => ({
      categories: [],
      fetchData: async () => {
        const codeToPath: Record<string, string> = {
          C100: '/my-profile',
          C101: '/member',
          C102: '/attendance',
        };
        const codeOrder: Record<string, number> = {
          C100: 1,
          C101: 2,
          C102: 3,
        };

        const { data, error } = await supabase.from('categories').select('*');

        if (error) {
          console.error('categories fetch error:', error);
          return;
        }

        // processedData 생성(path 적용, order 정렬)
        const result = data
          .filter(item => ['C101', 'C102'].includes(item.code))
          .map(item => ({
            isOpen: false,
            name: item.name,
            code: item.code,
            parentCode: item.parent_id,
            path: codeToPath[item.code] ?? '',
            // setCategory: data => set(state => ({ ...state, ...data })),
          }))
          .sort(
            (a, b) => (codeOrder[a.code] ?? 999) - (codeOrder[b.code] ?? 999),
          );
        /**
         * sort((a, b) => (codeOrder[a.code] ?? 999) - (codeOrder[b.code] ?? 999)):
         * 1. ?? 연산자: (codeOrder[a.code] ?? 999)
         * ??는 nullish 병합 연산자. 왼쪽 값이 null이나 undefined일 때만 오른쪽 값을 반환한다.
         * ?? 연산자 왼쪽 값(=codeOrder[a.code])이 null이나 undefined이면 오른쪽 값(=999)을 반환.
         * ?? 왼쪽이 falsy값도 아니고, null이나 undefined일 때만 오른쪽 값을 반환한다.
         */

        set({ categories: result });
      },
      // -----
      // setCategory: data => set(state => ({ ...state, ...data })),
      setCategory: (code, partial) =>
        set(state => ({
          categories: state.categories.map(cat =>
            cat.code === code ? { ...cat, ...partial } : cat,
          ),
        })),
      // -----
    }),
    {
      name: 'category-storage', // 세션스토리지 key
      storage: createJSONStorage(() => sessionStorage), // sessionStorage 사용
    },
  ),
);
