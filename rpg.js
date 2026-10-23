let currentUser = null;
let cards = [];
let allProfilesList = [];
let currentCategoryFilter = 'TODAS';

const rankStatsMap = {
    'Júnior': { hp: 200, mana: 400, emoji: '☪️' },
    'Junior': { hp: 200, mana: 400, emoji: '☪️' },
    'Intermediário': { hp: 300, mana: 600, emoji: '⚜️' },
    'Intermediario': { hp: 300, mana: 600, emoji: '⚜️' },
    'Sênior': { hp: 400, mana: 800, emoji: '🔱' },
    'Senior': { hp: 400, mana: 800, emoji: '🔱' },
    'Grão Mago': { hp: 800, mana: 1600, emoji: '⚛️' },
    'Tenente Brilhante': { hp: 500, mana: 1000, emoji: '🥈' },
    'Vice-capitão': { hp: 500, mana: 1000, emoji: '🃏' },
    'Comandante Chefe': { hp: 600, mana: 1200, emoji: '🪖' },
    'Tríade Negra': { hp: 600, mana: 1200, emoji: '🏴‍☠️' },
    'General Brilhante': { hp: 600, mana: 1200, emoji: '🎖️' },
    'Capitão': { hp: 600, mana: 1200, emoji: '⚖️' },
    'Conselheiro': { hp: 700, mana: 1400, emoji: '🕎' },
    'Rei Mago': { hp: 900, mana: 1800, emoji: '👑' },
    'Rei': { hp: 1000, mana: 2000, emoji: '🀄' },
    'Imperador Supremo': { hp: 1100, mana: 2200, emoji: '☦️' }
};

const databookRules = [
    "Ilusão não sofre danos de Fugas e Camuflagens.",
    "Fugas ou Camuflagens com Dano destrói clones, seja eles em defesa ou ataque.",
    "Caso o usuário esteja com invocação, ou alguma defesa de hp ativa, todos efeitos contínuos (-💔-) sofridos, vão para a invocação.",
    "Falhas que Falham em 1° e em 2° Falham invocações, Barreiras, o Ataque do Ataque/Defesa.",
    "Dreno não vai para o usuário, Absorção sim.",
    "Ataque/Defesa com a mesma quantidade de Mana e Rounds, se usados um em cima do outro se anulam.",
    "Imunidades e redução não funcionam paralisado.",
    "Após a Mana do mago zerar, suas imunidades são desativadas.",
    "Falha de 2 Round's: falha as Magias do Oponente durante dois rounds.",
    "Cards Imune a Rastreamento se defendem de cards que rastreiam ou causam dano.",
    "Efeitos de Danos Contínuos: Água (Asfixia), Raio (Queimadura), Fogo (Queimadura), Vento (Hemorragia), Sombra (Hemorragia), Cristal (Hemorragia), Fumaça (Asfixia), Gelo (Hipotermia).",
    "Invocações seguram todo dano de um card, mesmo o dano sendo maior que a vida da invocação.",
    "Invocações são imunes a paralisia, mas não ao dano delas.",
    "Paralisia de 2 Round's concede direito a duas jogadas consecutivas.",
    "Aumento e Redução de dano no round se aplicam a fugas, camuflagens, barreiras e afins."
];

const emojiMap = {
    classes: { 'Plebeu': '👨🏻‍🌾', 'Nobre': '🤵🏻', 'Realeza': '🤴🏻' },
    kingdoms: { 'Reino Clover': '🕌', 'Reino Diamond': '🕍', 'Reino Spade': '🏰' },
    houses: {
        'Casa Silva': '💧', 'Casa Vermillion': '🔥', 'Casa Silvamillion': '🌪️', 'Casa Voltia': '⚡', 'Casa Faust': '🌑',
        'Casa Kruger': '🌀', 'Casa Mars': '💎', 'Casa Whomalt': '💨', 'Casa Mariella': '❄️',
        'Casa Zogratis': '☠️', 'Casa Grinberryall': '🌟', 'Casa Novachrono': '⏳'
    },
    ranks: {
        'Júnior': '☪️', 'Junior': '☪️', 'Intermediário': '⚜️', 'Sênior': '🔱', 'Grão Mago': '⚛️',
        'Sub Comandante': '⚓', 'Tenente Brilhante': '🥈', 'Vice-capitão': '🃏',
        'Comandante Chefe': '🪖', 'Tríade Negra': '🏴‍☠️', 'General Brilhante': '🎖️',
        'Capitão': '⚖️', 'Conselheiro': '🕎', 'Rei Mago': '👑', 'Rei': '🀄', 'Imperador Supremo': '☦️'
    },
    squads: {
        'Alvorecer Dourado': '☀️', 'Touros Negros': '🐃', 'Águias de Prata': '🦅',
        'Reis Leões Carmesins': '🦁', 'Rosa Azul': '🌹', 'Louva-a-Deus Verdes': '🦗',
        'Pavões Corais': '🦚', 'Orcas Púrpuras': '🫍', 'Cervo Ciano': '💠', 'Serpente Branca': '🐍', 'Nenhum': '❌', 'NENHUM': '❌'
    }
};

window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('rpg_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            window.currentUser = currentUser;

            const menuNick = document.getElementById('menuUserNick');
            const welcomeNick = document.getElementById('welcomeUserNick');
            if (menuNick) menuNick.textContent = currentUser.nick;
            if (welcomeNick) welcomeNick.textContent = currentUser.nick;

            showView('viewDashboard');
            switchTab('welcome');
            checkAdminStatus();
        } catch(e) {
            console.error("Erro ao carregar sessão salva", e);
        }
    }
});

function getEmoji(category, val) {
    if(!val) return '';
    const cleanVal = val.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!emojiMap[category]) return '';

    for (let key in emojiMap[category]) {
        const cleanKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (cleanVal.includes(cleanKey)) return emojiMap[category][key];
    }
    return '';
}

function showView(viewId) {
    ['viewLanding', 'viewLogin', 'viewNewPassword', 'viewDashboard'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(viewId);
    if (target) target.classList.remove('hidden');
}

function showLandingView() { showView('viewLanding'); }
function showLoginView() { showView('viewLogin'); }
function toggleMenu() { 
    const menu = document.getElementById('dropdownMenu');
    if (menu) menu.classList.toggle('hidden'); 
}

function checkAdminStatus() {
    if (!currentUser) return;
    
    const nick = (currentUser.nick || '').toLowerCase();
    const isAdmin = currentUser.role === 'admin' || 
                    currentUser.is_admin === true || 
                    currentUser.is_admin === 'true' || 
                    currentUser.is_admin === 1 ||
                    nick === 'olipe' || 
                    nick === 'luizfelipe2006';

    const adminElements = ['btnNewMissionAdmin', 'btnNewTournamentAdmin', 'btnNewScheduleAdmin', 'btnNewNoticeAdmin', 'btnAddUserAdmin'];
    adminElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (isAdmin) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
    });
}

function switchTab(tabName) {
    ['tabWelcome', 'tabProfile', 'tabRealms', 'tabCards', 'tabNotices', 'tabTournaments', 'tabSchedule', 'tabDatabook', 'tabMissions'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    
    let targetTab = 'tabWelcome';
    if(tabName === 'profile') targetTab = 'tabProfile';
    if(tabName === 'realms') targetTab = 'tabRealms';
    if(tabName === 'cards') targetTab = 'tabCards';
    if(tabName === 'databook') targetTab = 'tabDatabook';
    if(tabName === 'missions') targetTab = 'tabMissions';
    if(tabName === 'notices') targetTab = 'tabNotices';
    if(tabName === 'torneios') targetTab = 'tabTournaments';
    if(tabName === 'schedule') targetTab = 'tabSchedule';

    const targetEl = document.getElementById(targetTab);
    if (targetEl) targetEl.classList.remove('hidden');
    
    const menu = document.getElementById('dropdownMenu');
    if (menu) menu.classList.add('hidden');

    checkAdminStatus();

    if(tabName === 'cards') loadCards();
    if(tabName === 'realms') loadRealmsPlayers();
    if(tabName === 'profile') renderProfile();
    if(tabName === 'databook') renderDatabookRules();

    if(tabName === 'missions') loadAnnouncements('missions');
    if(tabName === 'torneios') loadAnnouncements('tournaments');
    if(tabName === 'schedule') loadAnnouncements('schedule');
    if(tabName === 'notices') loadAnnouncements('notices');
}

function openAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
}

async function safeInsertProfile(payload) {
    let copy = { ...payload };
    let { data, error } = await window.supabaseClient.from('profiles').insert([copy]);
    
    let attempts = 0;
    while (error && error.message && error.message.includes('Could not find the') && attempts < 5) {
        attempts++;
        const match = error.message.match(/Could not find the '([^']+)' column/);
        if (match && match[1]) {
            delete copy[match[1]];
            const retry = await window.supabaseClient.from('profiles').insert([copy]);
            error = retry.error;
            data = retry.data;
        } else {
            break;
        }
    }
    return { data, error };
}

async function safeUpdateProfile(id, payload) {
    let copy = { ...payload };
    let { data, error } = await window.supabaseClient.from('profiles').update(copy).eq('id', id);
    
    let attempts = 0;
    while (error && error.message && error.message.includes('Could not find the') && attempts < 5) {
        attempts++;
        const match = error.message.match(/Could not find the '([^']+)' column/);
        if (match && match[1]) {
            delete copy[match[1]];
            const retry = await window.supabaseClient.from('profiles').update(copy).eq('id', id);
            error = retry.error;
            data = retry.data;
        } else {
            break;
        }
    }
    return { data, error };
}

async function saveNewUser(e) {
    if (e && e.preventDefault) e.preventDefault();

    const nickInput = document.getElementById('newPlayerNick');
    const passInput = document.getElementById('newPlayerPass');
    const kingdomInput = document.getElementById('newPlayerKingdom');
    const classInput = document.getElementById('newPlayerClass');
    const houseInput = document.getElementById('newPlayerHouse');
    const squadInput = document.getElementById('newPlayerSquad');
    const rankInput = document.getElementById('newPlayerRank');
    const adminInput = document.getElementById('newPlayerIsAdmin');

    if (!nickInput || !passInput) return;

    const nick = nickInput.value.trim();
    const password = passInput.value;
    const kingdom = kingdomInput ? kingdomInput.value : 'Reino Clover';
    const socialClass = classInput ? classInput.value : 'Plebeu';
    const house = houseInput ? houseInput.value : 'Casa Silva';
    const squad = squadInput ? squadInput.value : 'Nenhum';
    const rank = rankInput ? rankInput.value : 'Júnior';
    const isAdmin = adminInput ? (adminInput.value === 'true') : false;

    if (!nick || !password) {
        showToast('Erro', 'Preencha o Nick e a Senha.');
        return;
    }

    const stats = rankStatsMap[rank] || { hp: 200, mana: 400 };

    let payload = {
        nick: nick,
        password: password,
        kingdom: kingdom,
        social_class: socialClass,
        house: house,
        squad: squad,
        rank: rank,
        hp: stats.hp,
        mana: stats.mana,
        first_access: true,
        role: isAdmin ? 'admin' : 'user',
        is_admin: isAdmin
    };

    const { error } = await safeInsertProfile(payload);

    if (error) {
        console.error("Erro no Supabase ao inserir:", error);
        showToast('Erro ao cadastrar', error.message || 'Erro ao comunicar com o banco.');
    } else {
        closeAddUserModal();
        nickInput.value = '';
        passInput.value = '';
        showToast('Sucesso', `Mago ${nick} cadastrado com sucesso!`);
        if (typeof loadRealmsPlayers === 'function') {
            loadRealmsPlayers();
        }
    }
}

function openEditUserModal(userId) {
    const user = allProfilesList.find(p => p.id === userId);
    if (!user) return;

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editPlayerNick').value = user.nick || '';
    document.getElementById('editPlayerPass').value = user.password || '';
    document.getElementById('editPlayerKingdom').value = user.kingdom || 'Reino Clover';
    document.getElementById('editPlayerClass').value = user.social_class || 'Plebeu';
    document.getElementById('editPlayerHouse').value = user.house || 'Casa Silva';
    document.getElementById('editPlayerSquad').value = user.squad || 'Nenhum';
    document.getElementById('editPlayerRank').value = user.rank || 'Júnior';
    
    const isAdminFlag = (user.role === 'admin' || user.is_admin === true || user.is_admin === 'true');
    document.getElementById('editPlayerIsAdmin').value = isAdminFlag ? 'true' : 'false';

    const modal = document.getElementById('editUserModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeEditUserModal() {
    const modal = document.getElementById('editUserModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
}

async function saveEditedUser(e) {
    if (e && e.preventDefault) e.preventDefault();

    const id = document.getElementById('editUserId').value;
    const nick = document.getElementById('editPlayerNick').value.trim();
    const password = document.getElementById('editPlayerPass').value;
    const kingdom = document.getElementById('editPlayerKingdom').value;
    const socialClass = document.getElementById('editPlayerClass').value;
    const house = document.getElementById('editPlayerHouse').value;
    const squad = document.getElementById('editPlayerSquad').value;
    const rank = document.getElementById('editPlayerRank').value;
    const isAdmin = document.getElementById('editPlayerIsAdmin').value === 'true';

    const stats = rankStatsMap[rank] || { hp: 200, mana: 400 };

    let payload = {
        nick: nick,
        password: password,
        kingdom: kingdom,
        social_class: socialClass,
        house: house,
        squad: squad,
        rank: rank,
        hp: stats.hp,
        mana: stats.mana,
        role: isAdmin ? 'admin' : 'user',
        is_admin: isAdmin
    };

    const { error } = await safeUpdateProfile(id, payload);

    if (error) {
        console.error("Erro ao editar perfil:", error);
        showToast('Erro', error.message || 'Não foi possível atualizar o mago.');
    } else {
        closeEditUserModal();
        showToast('Sucesso', `Mago ${nick} atualizado com sucesso!`);
        
        if (currentUser && currentUser.id === id) {
            currentUser.nick = nick;
            currentUser.password = password;
            currentUser.kingdom = kingdom;
            currentUser.social_class = socialClass;
            currentUser.house = house;
            currentUser.squad = squad;
            currentUser.rank = rank;
            currentUser.hp = stats.hp;
            currentUser.mana = stats.mana;
            currentUser.role = isAdmin ? 'admin' : 'user';
            currentUser.is_admin = isAdmin;
            localStorage.setItem('rpg_user', JSON.stringify(currentUser));
            
            const menuNick = document.getElementById('menuUserNick');
            const welcomeNick = document.getElementById('welcomeUserNick');
            if (menuNick) menuNick.textContent = nick;
            if (welcomeNick) welcomeNick.textContent = nick;
        }

        loadRealmsPlayers();
    }
}

async function renderProfile() {
    if(!currentUser) return;
    const { data } = await window.supabaseClient.from('profiles').select('*').eq('id', currentUser.id).single();
    if(data) currentUser = data;

    checkAdminStatus();

    const cls = currentUser.social_class || 'Plebeu';
    const kng = currentUser.kingdom || 'Reino Clover';
    const hse = currentUser.house || 'Casa Silva';
    const rnk = currentUser.rank || 'Júnior';
    const sqd = currentUser.squad || 'Nenhum';

    const stats = rankStatsMap[rnk] || { hp: 200, mana: 400 };

    document.getElementById('profNick').textContent = currentUser.nick || '--';
    document.getElementById('profClass').textContent = `${cls} ${getEmoji('classes', cls)}`;
    document.getElementById('profKingdom').textContent = `${kng} ${getEmoji('kingdoms', kng)}`;
    document.getElementById('profHouse').textContent = `${hse} ${getEmoji('houses', hse)}`;
    document.getElementById('profRank').textContent = `${rnk} ${getEmoji('ranks', rnk)}`;
    document.getElementById('profSquad').textContent = `${sqd} ${getEmoji('squads', sqd)}`;
    document.getElementById('profHp').textContent = (currentUser.hp || stats.hp) + ' ❣️';
    document.getElementById('profMana').textContent = (currentUser.mana || stats.mana) + ' ♦️';
}

async function loadRealmsPlayers() {
    const { data } = await window.supabaseClient.from('profiles').select('*');
    if(!data) return;
    allProfilesList = data;

    const isAdmin = currentUser && (
        currentUser.role === 'admin' ||
        currentUser.is_admin === true || 
        currentUser.is_admin === 'true' || 
        currentUser.is_admin === 1 || 
        (currentUser.nick || '').toLowerCase() === 'olipe' || 
        (currentUser.nick || '').toLowerCase() === 'luizfelipe2006'
    );

    let cloverHtml = '', diamondHtml = '', spadeHtml = '';
    data.forEach(p => {
        const cEmoji = getEmoji('classes', p.social_class);
        const hEmoji = getEmoji('houses', p.house);
        const rEmoji = getEmoji('ranks', p.rank);
        const sEmoji = getEmoji('squads', p.squad);
