// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvucwohzrjjfwfwznuwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dWN3b2h6cmpqZndmd3pudXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzM2ODEsImV4cCI6MjA1ODYwOTY4MX0.WnpOtsgu7Ldl69sKK8nAMemshYdt-9dvtFgds53-dVI'; 

export const supabase = createClient(supabaseUrl, supabaseKey);
