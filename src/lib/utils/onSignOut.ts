import { supabase } from '../../supabaseClient';
import useUserStore from '../../store/userStore';
import { useCategoryStore } from '../../store/categoryStore';

export async function onSignOut() {
  useUserStore.persist.clearStorage();
  useCategoryStore.persist.clearStorage();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('로그아웃 에러: ', error);
  }
}
