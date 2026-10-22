function validatePasswordStrength(pass) {
    const btn = document.getElementById('btnSavePassword');
    if(btn) {
        btn.disabled = false;
        btn.className = "w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3.5 rounded-xl text-sm cursor-pointer transition-all border border-zinc-700";
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
        // Busca os usuários no banco de dados do Supabase
        const { data, error } = await window.supabaseClient.from('profiles').select('*');

        if (error) throw error;

        if (data && data.length > 0) {
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
        } else {
            if (errEl) {
                errEl.textContent = "Nenhum usuário cadastrado no banco.";
                errEl.classList.remove('hidden');
            }
            return;
        }

        document.getElementById('menuUserNick').textContent = currentUser.nick;
        
        // VERIFICAÇÃO DE PRIMEIRO ACESSO:
        // Se first_access for true, obriga a mudar a senha. Se for false, entra direto no painel!
        if (currentUser.first_access === true) {
            showView('viewNewPassword');
        } else {
            showView('viewDashboard');
            switchTab('welcome');
        }

    } catch (err) {
        console.error("Erro na conexão com o servidor:", err);
        if (errEl) {
            errEl.textContent = "Erro de conexão com o servidor.";
            errEl.classList.remove('hidden');
        }
    }
}

async function handleNewPassword(e) {
    e.preventDefault();
    const newPassInput = document.getElementById('newPassInput');
    
    if (!newPassInput || !currentUser) return;
    
    const newPass = newPassInput.value;

    // Atualiza a nova senha no Supabase e define first_access como false permanentemente
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
    
    // Atualiza o objeto local para refletir que já não é o primeiro acesso
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
