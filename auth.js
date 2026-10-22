function validatePasswordStrength(pass) {
    const btn = document.getElementById('btnSavePassword');
    if(btn) {
        btn.disabled = false;
        btn.className = "w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3.5 rounded-xl text-sm cursor-pointer transition-all border border-zinc-700";
    }
}

// Função auxiliar segura para exibir erros de login sem quebrar a estrutura HTML
function showLoginError(msg) {
    const errEl = document.getElementById('loginError');
    const errText = document.getElementById('loginErrorText');
    if (errText) {
        errText.textContent = msg;
    } else if (errEl) {
        errEl.textContent = msg;
    }
    if (errEl) errEl.classList.remove('hidden');
}

async function handleLogin(e) {
    e.preventDefault();
    const nickInput = document.getElementById('loginNick');
    const passInput = document.getElementById('loginPassword');
    const errEl = document.getElementById('loginError');

    if (!nickInput || !passInput) return;

    const inputNick = nickInput.value.trim();
    const pass = passInput.value;

    if (errEl) errEl.classList.add('hidden');

    try {
        // Inicializa o cliente do Supabase caso ainda não esteja pronto
        if (!window.supabaseClient && window.supabase && window.supabase.createClient) {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }

        if (!window.supabaseClient) {
            showLoginError("Erro de conexão com o Supabase.");
            return;
        }

        const { data, error } = await window.supabaseClient.from('profiles').select('*');

        if (error) {
            console.error("Erro na consulta do Supabase:", error);
            showLoginError("Erro de conexão com a base de dados.");
            return;
        }

        if (data && data.length > 0) {
            // Busca segura comparando o nick
            const user = data.find(p => p && p.nick && p.nick.toString().toLowerCase() === inputNick.toLowerCase());

            if (!user) {
                showLoginError("Usuário não encontrado.");
                return;
            }

            if (user.password !== pass) {
                showLoginError("Senha incorreta.");
                return;
            }

            currentUser = user;
        } else {
            showLoginError("Nenhum usuário cadastrado no banco.");
            return;
        }

        // Atualiza elementos de nick pela interface
        const menuUserNick = document.getElementById('menuUserNick');
        if(menuUserNick) menuUserNick.textContent = currentUser.nick;

        const welcomeNick = document.getElementById('welcomeNickName');
        if(welcomeNick) welcomeNick.textContent = currentUser.nick;
        
        // Se for primeiro acesso obriga troca de senha, senão vai direto ao painel
        if (currentUser.first_access === true) {
            showView('viewNewPassword');
        } else {
            showView('viewDashboard');
            switchTab('welcome');
        }

    } catch (err) {
        console.error("Erro na conexão com o servidor:", err);
        showLoginError("Erro de conexão com a base de dados.");
    }
}

async function handleNewPassword(e) {
    e.preventDefault();
    const newPassInput = document.getElementById('newPassInput');
    
    if (!newPassInput || !currentUser) return;
    
    const newPass = newPassInput.value;

    try {
        const { error } = await window.supabaseClient
            .from('profiles')
            .update({ 
                password: newPass, 
                first_access: false 
            })
            .eq('id', currentUser.id);

        if (error) {
            console.error("Erro ao atualizar senha no Supabase:", error);
            showToast('Erro', 'Não foi possível atualizar a senha no banco.');
            return;
        }
        
        currentUser.password = newPass;
        currentUser.first_access = false;

        showToast('Sucesso', 'Senha alterada e salva com sucesso!');
        showView('viewDashboard');
        switchTab('welcome');
    } catch(err) {
        console.error("Erro ao alterar senha:", err);
        showToast('Erro', 'Falha na conexão.');
    }
}

function handleLogout() { 
    currentUser = null; 
    showLandingView(); 
}
