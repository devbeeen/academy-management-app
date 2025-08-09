import { supabase } from '../../supabaseClient';

export async function onSignOut() {
  const { error } = await supabase.auth.signOut();
}
