function showLoginError(msg) {
    const errEl = document.getElementById('loginError');
    if (errEl) {
        errEl.textContent = msg;
        errEl.classList.remove('hidden');
    }
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
        const { data, error } = await window.supabaseClient.from('profiles').select('*');

        if (error) throw error;

        if (data && data.length > 0) {
            const user = data.find(p => p.nick && p.nick.toLowerCase() === inputNick.toLowerCase());

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

        const menuNick = document.getElementById('menuUserNick');
        const welcomeNick = document.getElementById('welcomeUserNick');
        if (menuNick) menuNick.textContent = currentUser.nick;
        if (welcomeNick) welcomeNick.textContent = currentUser.nick;
        
        checkAdminStatus();

        if (currentUser.first_access === true) {
            showView('viewNewPassword');
        } else {
            showView('viewDashboard');
            switchTab('welcome');
        }

    } catch (err) {
        console.error("Erro na conexão com o servidor:", err);
        showLoginError("Erro de conexão com o servidor.");
    }
}

async function handleNewPassword(e) {
    e.preventDefault();
    const newPassInput = document.getElementById('newPassInput');
    
    if (!newPassInput || !currentUser) return;
    
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
        showToast('Erro', 'Não foi possível atualizar a senha no banco.');
        return;
    }
    
    currentUser.password = newPass;
    currentUser.first_access = false;

    showToast('Sucesso', 'Senha alterada e salva com sucesso!');
    showView('viewDashboard');
    switchTab('welcome');
}

function handleLogout() { 
    currentUser = null; 
    showLandingView(); 
}
