import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbsdrjrcbrpqbzejivfq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indic2RyanJjYnJwcWJ6ZWppdmZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTcxNzQsImV4cCI6MjA1NTUzMzE3NH0.j9e9LaZFR3bJ2QX92O9wsZjwEtu0Q3OLGa3qpg6gxDI'
const supabase = createClient(supabaseUrl, supabaseKey)


export default supabase;