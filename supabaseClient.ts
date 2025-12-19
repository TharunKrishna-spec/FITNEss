import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yzubuvevplbkivybbmpo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6dWJ1dmV2cGxia2l2eWJibXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzQ2NzEsImV4cCI6MjA4MTcxMDY3MX0.xcKEGW4yBKb2727dh5NZFV-pAP9jIU2z-DDfATKGffM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);