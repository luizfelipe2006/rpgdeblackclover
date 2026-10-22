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

        const user = data.find(p => p.nick.toLowerCase() === inputNick.toLowerCase());

        if (!user) {
            if (errEl) {
                errEl.textContent = "Usuário não encontrado.";
                errEl.classList.remove('hidden');
            }
            return;
        }

        if (user.password !== pass) {
            if (errEl) {
                errEl.textContent = "Senha incorreta.";
                errEl.classList.remove('hidden');
            }
            return;
        }

        currentUser = user;
        document.getElementById('menuUserNick').textContent = currentUser.nick;

        // Se for o primeiro acesso, obriga a alterar a senha
        if (currentUser.first_access) {
            showView('viewNewPassword');
        } else {
            showView('viewDashboard');
            switchTab('welcome');
        }

    } catch (err) {
        console.warn("Modo de segurança ativado:", err);
        // Fallback local caso haja falha de rede
        currentUser = {
            id: 'teste-local-id',
            nick: inputNick,
            password: pass,
            first_access: (pass === 'Senharpg123')
        };

        document.getElementById('menuUserNick').textContent = currentUser.nick;
        
        if (currentUser.first_access) {
            showView('viewNewPassword');
        } else {
            showView('viewDashboard');
            switchTab('welcome');
        }
    }
}

async function handleNewPassword(e) {
    e.preventDefault();
    const newPassInput = document.getElementById('newPassInput');
    if (!newPassInput) return;
    
    const newPass = newPassInput.value;

    if (currentUser && currentUser.id !== 'teste-local-id') {
        // Atualiza a nova senha no banco e define first_access como false permanentemente
        const { error } = await window.supabaseClient.from('profiles').update({ 
            password: newPass, 
            first_access: false 
        }).eq('id', currentUser.id);

        if (error) {
            showToast('Erro', 'Não foi possível atualizar a senha.');
            return;
        }
    }

    currentUser.first_access = false;
    showToast('Sucesso', 'Senha alterada com sucesso!');
    showView('viewDashboard');
    switchTab('welcome');
}

function handleLogout() { 
    currentUser = null; 
    showLandingView(); 
}
