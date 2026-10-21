function validatePasswordStrength(pass) {
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[^A-Za-z0-9]/.test(pass);
    const btn = document.getElementById('btnSavePassword');
    if(hasUpper && hasLower && hasNumber && hasSymbol) {
        btn.disabled = false;
        btn.className = "w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3.5 rounded-xl text-sm cursor-pointer transition-all border border-zinc-700";
    } else {
        btn.disabled = true;
        btn.className = "w-full bg-zinc-900 text-zinc-600 font-medium py-3.5 rounded-xl text-sm cursor-not-allowed transition-all border border-zinc-800";
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const nickInput = document.getElementById('loginNick');
    const passInput = document.getElementById('loginPassword');
    const errEl = document.getElementById('loginError');

    if (!nickInput || !passInput) return;

    const inputNick = nickInput.value.trim().toLowerCase();
    const pass = passInput.value;

    errEl.classList.add('hidden');

    try {
        const { data, error } = await supabaseClient.from('profiles').select('*');

        if (error || !data) {
            errEl.textContent = "Erro ao conectar com o banco de dados.";
            errEl.classList.remove('hidden');
            return;
        }

        const user = data.find(p => p.nick.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === inputNick.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

        if (!user) {
            errEl.textContent = "Usuário não encontrado.";
            errEl.classList.remove('hidden');
            return;
        }

        if (user.password !== pass) {
            errEl.textContent = "Senha incorreta.";
            errEl.classList.remove('hidden');
            return;
        }

        currentUser = user;
        document.getElementById('menuUserNick').textContent = currentUser.nick;
        
        if (currentUser.first_access) {
            showView('viewNewPassword');
        } else {
            showView('viewDashboard');
            switchTab('welcome');
        }
    } catch (err) {
        console.error("Erro no login:", err);
        errEl.textContent = "Erro de conexão com o servidor.";
        errEl.classList.remove('hidden');
    }
}

async function handleNewPassword(e) {
    e.preventDefault();
    const newPass = document.getElementById('newPassInput').value;

    const { error } = await supabaseClient.from('profiles').update({ 
        password: newPass, 
        first_access: false 
    }).eq('id', currentUser.id);

    if (!error) {
        currentUser.first_access = false;
        currentUser.password = newPass;
        showToast('Sucesso', 'Senha alterada com sucesso!');
        showView('viewDashboard');
        switchTab('welcome');
    } else {
        showToast('Erro', 'Não foi possível salvar a senha.');
    }
}

function handleLogout() { currentUser = null; showLandingView(); }