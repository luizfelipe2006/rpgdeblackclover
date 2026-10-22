const SUPABASE_URL = 'https://uacnhqjvvcfulbtegtyh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SS38c3eQ74fwM6NNv4noVQ_uRz_gcig';

// Inicialização segura do cliente global do Supabase para o projeto
if (window.supabase && window.supabase.createClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error("A biblioteca do Supabase não foi carregada corretamente.");
}
