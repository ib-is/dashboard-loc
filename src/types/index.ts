
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  niveau_compte?: 'free' | 'plus' | 'pro';
  date_inscription?: string;
}
