import { supabase } from '../../supabaseClient';
import useUserStore from '../../store/userStore';

export async function onSignOut() {
  useUserStore.persist.clearStorage();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('로그아웃 에러: ', error);
  }
}
