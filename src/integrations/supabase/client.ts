
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types';

const SUPABASE_URL = "https://ymrgarotbeblnqjdzorb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltcmdhcm90YmVibG5xamR6b3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDQ1MTgsImV4cCI6MjA1ODk4MDUxOH0.UWzVX3-C6BRsYWaGNeqGF-Kpfnzt48i9FtNHExhMNQU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
