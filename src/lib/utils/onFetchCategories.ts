import { supabase } from '@/supabaseClient';
// import { Category, UserProfile } from "@/types";

//export async function fetchCategories(): Promise<Category[]> {
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, allowed_positions');

  console.log('카테고리 data: ', data);

  if (error) throw error;
  // return data as Category[];
  return data;
}
