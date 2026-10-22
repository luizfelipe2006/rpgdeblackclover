const SUPABASE_URL = 'https://uacnhqjvvcfulbtegtyh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jN6S3CFhzMPYjOi2niy18w_pNMPb1E7';

// Inicialização limpa e segura do novo cliente do Supabase
if (window.supabase && window.supabase.createClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error("A biblioteca do Supabase não foi carregada corretamente.");
}
