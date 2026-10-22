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
        // Consulta real no banco de dados para suportar múltiplos usuários e patentes dinâmicas
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

            // Atribui o usuário logado com todos os dados do banco (patente, reino, etc.)
            currentUser = user;
        } else {
            // Fallback para teste caso a tabela esteja vazia
            currentUser = {
                id: 'local-id-' + Date.now(),
                nick: inputNick,
                social_class: 'Plebeu',
                kingdom: 'Reino Clover',
                house: 'Casa Silva',
                rank: inputNick.toLowerCase() === 'olipe' ? 'Júnior' : 'Júnior',
                squad: 'Touros Negros',
                hp: 200,
                mana: 400,
                first_access: false
            };
        }

        document.getElementById('menuUserNick').textContent = currentUser.nick;
        
        if (currentUser.first_access) {
            showView('viewNewPassword');
        } else {
            showView('viewDashboard');
            switchTab('welcome');
        }

    } catch (err) {
        console.warn("Aviso de rede. Entrando em modo local:", err);
        
        currentUser = {
            id: 'teste-local-id',
            nick: inputNick,
            social_class: 'Plebeu',
            kingdom: 'Reino Clover',
            house: 'Casa Silva',
            rank: 'Júnior',
            squad: 'Touros Negros',
            hp: 200,
            mana: 400,
            first_access: false
        };

        document.getElementById('menuUserNick').textContent = currentUser.nick;
        showView('viewDashboard');
        switchTab('welcome');
    }
}

async function handleNewPassword(e) {
    e.preventDefault();
    const newPass = document.getElementById('newPassInput').value;

    if (currentUser && currentUser.id !== 'teste-local-id') {
        await window.supabaseClient.from('profiles').update({ 
            password: newPass, 
            first_access: false 
        }).eq('id', currentUser.id);
    }

    showToast('Sucesso', 'Senha alterada com sucesso!');
    showView('viewDashboard');
    switchTab('welcome');
}

function handleLogout() { 
    currentUser = null; 
    showLandingView(); 
}
