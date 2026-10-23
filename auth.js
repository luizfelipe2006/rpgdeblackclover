function showLoginError(msg) {
    const errEl = document.getElementById('loginError');
    if (errEl) {
        errEl.textContent = msg;
        errEl.classList.remove('hidden');
    }
}

async function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();

    const nickInput = document.getElementById('loginNick');
    const passInput = document.getElementById('loginPassword');
    const errEl = document.getElementById('loginError');

    if (!nickInput || !passInput) return false;

    const inputNick = nickInput.value.trim();
    const pass = passInput.value;

    if (errEl) errEl.classList.add('hidden');

    try {
        if (!window.supabaseClient) {
            showLoginError("Erro: Conexão com o banco não inicializada.");
            return false;
        }

        const { data, error } = await window.supabaseClient.from('profiles').select('*');

        if (error) {
            console.error("Erro no Supabase:", error);
            showLoginError("Erro ao consultar o banco de dados.");
            return false;
        }

        if (data && data.length > 0) {
            const user = data.find(p => p.nick && p.nick.toLowerCase() === inputNick.toLowerCase());

            if (!user) {
                showLoginError("Usuário não encontrado.");
                return false;
            }

            if (user.password !== pass) {
                showLoginError("Senha incorreta.");
                return false;
            }

            window.currentUser = user;
            currentUser = user;
        } else {
            showLoginError("Nenhum usuário cadastrado no banco.");
            return false;
        }

        const menuNick = document.getElementById('menuUserNick');
        const welcomeNick = document.getElementById('welcomeUserNick');
        if (menuNick) menuNick.textContent = currentUser.nick;
        if (welcomeNick) welcomeNick.textContent = currentUser.nick;
        
        if (typeof checkAdminStatus === 'function') {
            checkAdminStatus();
        }

        if (currentUser.first_access === true) {
            showView('viewNewPassword');
        } else {
            showView('viewDashboard');
            switchTab('welcome');
        }

    } catch (err) {
        console.error("Erro interno no login:", err);
        showLoginError("Falha ao realizar login. Tente novamente.");
    }

    return false;
}

async function handleNewPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    const newPassInput = document.getElementById('newPassInput');
    
    if (!newPassInput || !currentUser) return false;
    
    const newPass = newPassInput.value;

    const { error } = await window.supabaseClient
        .from('profiles')
        .update({ 
            password: newPass, 
            first_access: false 
        })
        .eq('id', currentUser.id);

    if (error) {
        console.error("Erro ao atualizar senha no Supabase:", error);
        if (typeof showToast === 'function') showToast('Erro', 'Não foi possível atualizar a senha no banco.');
        return false;
    }
    
    currentUser.password = newPass;
    currentUser.first_access = false;

    if (typeof showToast === 'function') showToast('Sucesso', 'Senha alterada e salva com sucesso!');
    showView('viewDashboard');
    switchTab('welcome');

    return false;
}

function handleLogout() { 
    currentUser = null; 
    window.currentUser = null;
    showLandingView(); 
}
