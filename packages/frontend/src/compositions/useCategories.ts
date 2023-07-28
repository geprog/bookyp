import { Ref, ref } from 'vue';

export type Category = 'Frequent' | 'Favorite' | 'Personal' | 'All' | undefined;

const selectedCategory = ref<Category>(undefined);

export const useCategory = (): {
  selectedCategory: Ref<Category>;
} => ({ selectedCategory });
