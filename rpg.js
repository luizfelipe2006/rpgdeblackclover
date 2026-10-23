let currentUser = null;
let cards = [];
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
    const isAdmin = currentUser.is_admin === true || currentUser.is_admin === 'true' || currentUser.is_admin === 1;
    
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

async function saveNewUser(e) {
    e.preventDefault();
    if (!currentUser || !(currentUser.is_admin === true || currentUser.is_admin === 'true')) {
        showToast('Erro', 'Apenas administradores podem cadastrar novos usuários.');
        return;
    }

    const nick = document.getElementById('newPlayerNick').value.trim();
    const password = document.getElementById('newPlayerPass').value;
    const kingdom = document.getElementById('newPlayerKingdom').value;
    const socialClass = document.getElementById('newPlayerClass').value;
    const rank = document.getElementById('newPlayerRank').value;
    const isAdmin = document.getElementById('newPlayerIsAdmin').value === 'true';

    const stats = rankStatsMap[rank] || { hp: 200, mana: 400 };

    const { error } = await window.supabaseClient.from('profiles').insert([{
        nick: nick,
        password: password,
        kingdom: kingdom,
        social_class: socialClass,
        rank: rank,
        hp: stats.hp,
        mana: stats.mana,
        first_access: true,
        is_admin: isAdmin
    }]);

    if (!error) {
        closeAddUserModal();
        document.getElementById('newPlayerNick').value = '';
        document.getElementById('newPlayerPass').value = '';
        showToast('Sucesso', `Mago ${nick} cadastrado com sucesso!`);
        if (document.getElementById('tabRealms') && !document.getElementById('tabRealms').classList.contains('hidden')) {
            loadRealmsPlayers();
        }
    } else {
        console.error("Erro ao cadastrar usuário:", error);
        showToast('Erro', 'Não foi possível cadastrar o novo usuário.');
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
    const { data } = await window.supabaseClient.from('profiles').select('nick, kingdom, squad, rank, social_class, house');
    if(!data) return;

    let cloverHtml = '', diamondHtml = '', spadeHtml = '';
    data.forEach(p => {
        const cEmoji = getEmoji('classes', p.social_class);
        const hEmoji = getEmoji('houses', p.house);
        const rEmoji = getEmoji('ranks', p.rank);
        const sEmoji = getEmoji('squads', p.squad);

        const item = `
            <div class="bg-black/60 p-3 rounded-xl border border-zinc-800 mb-2.5 flex items-center justify-between hover:border-zinc-700 transition-colors">
                <span class="font-bold text-white">${p.nick || 'Mago'}</span>
                <div class="text-sm space-x-1">
                    <span>${cEmoji}</span>
                    <span>${hEmoji}</span>
                    <span>${rEmoji}</span>
                    <span>${sEmoji}</span>
                </div>
            </div>`;
        
        if(p.kingdom === 'Reino Diamond') diamondHtml += item;
        else if(p.kingdom === 'Reino Spade') spadeHtml += item;
        else cloverHtml += item;
    });

    document.getElementById('listClover').innerHTML = cloverHtml || '<span class="text-zinc-500 text-xs">Nenhum mago registrado</span>';
    document.getElementById('listDiamond').innerHTML = diamondHtml || '<span class="text-zinc-500 text-xs">Nenhum mago registrado</span>';
    document.getElementById('listSpade').innerHTML = spadeHtml || '<span class="text-zinc-500 text-xs">Nenhum mago registrado</span>';
}

async function loadCards() {
    if (!currentUser) return;
    const { data } = await window.supabaseClient.from('cards').select('*').eq('user_id', currentUser.id);
    cards = data || [];
    filterCards();
}

function filterCategory(cat) {
    currentCategoryFilter = cat;
    document.querySelectorAll('.pill-btn').forEach(btn => {
        btn.classList.remove('bg-red-600', 'text-white');
        btn.classList.add('bg-zinc-900', 'text-zinc-300', 'border', 'border-zinc-800');
    });

    const activeBtn = document.getElementById(`pill-${cat}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-zinc-900', 'text-zinc-300', 'border', 'border-zinc-800');
        activeBtn.classList.add('bg-red-600', 'text-white');
    }

    filterCards();
}

function filterCards() {
    const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
    
    let filtered = cards;
    if (currentCategoryFilter !== 'TODAS') {
        filtered = filtered.filter(c => c.name && c.name.toUpperCase() === currentCategoryFilter.toUpperCase());
    }

    if (query) {
        filtered = filtered.filter(c => 
            (c.name && c.name.toLowerCase().includes(query)) || 
            (c.text && c.text.toLowerCase().includes(query))
        );
    }

    renderCards(filtered);
}

function renderCards(list) {
    const grid = document.getElementById('cardsGrid');
    if(!grid) return;
    grid.innerHTML = list.length === 0 ? '<p class="text-zinc-500 text-sm col-span-full">Nenhum card encontrado nesta categoria.</p>' : '';
    list.forEach(c => {
        grid.innerHTML += `
            <div class="bg-[#121212] border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between shadow-2xl hover:border-zinc-600 transition-all">
                <div>
                    <div class="flex justify-between items-center mb-4">
                        <span class="bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-lg border border-zinc-700 font-bold uppercase tracking-widest">${c.name}</span>
                        <button onclick="deleteCard('${c.id}')" class="text-zinc-600 hover:text-red-500 transition-colors cursor-pointer" title="Excluir Card"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    <div class="bg-black p-4 rounded-xl text-xs font-mono text-zinc-300 whitespace-pre-wrap border border-zinc-800 leading-relaxed max-h-60 overflow-y-auto">${c.text}</div>
                </div>
                <div class="pt-4 mt-4 border-t border-zinc-800">
                    <button onclick="copyCardText('${c.id}')" class="w-full bg-zinc-200 hover:bg-white text-black py-3 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2">
                        <i class="fa-regular fa-copy"></i> Copiar seu Card
                    </button>
                </div>
            </div>`;
    });
}

function copyCardText(id) {
    const card = cards.find(c => c.id === id);
    if (card) {
        navigator.clipboard.writeText(card.text);
        showToast('Copiado', 'Card copiado para a área de transferência.');
    }
}

function openCardModal() { 
    const modal = document.getElementById('cardModal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}

function closeCardModal() { 
    const modal = document.getElementById('cardModal');
    if (modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
}

function openPlaqueModal() {
    const modal = document.getElementById('plaqueModal');
    if (modal) {
        if(currentUser) document.getElementById('plaqueMyNick').value = currentUser.nick || 'Mago';
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closePlaqueModal() {
    const modal = document.getElementById('plaqueModal');
    if (modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
}

function generatePlaqueText() {
    const myNick = document.getElementById('plaqueMyNick').value || 'Mago';
    const oppNick = document.getElementById('plaqueOppNick').value || 'Oponente';
    const oppRank = document.getElementById('plaqueOppRank').value || 'Júnior';

    const myRank = currentUser ? (currentUser.rank || 'Júnior') : 'Júnior';
    const myStats = rankStatsMap[myRank] || { hp: 200, mana: 400, emoji: '☪️' };
    const oppStats = rankStatsMap[oppRank] || { hp: 200, mana: 400, emoji: '☪️' };

    const text = `${myNick} ${myStats.emoji}\n${myStats.hp}←hp❤️ / ${myStats.mana}←Mana♦️\n🆚\n${oppNick} ${oppStats.emoji}\n${oppStats.hp}←hp❤️ / ${oppStats.mana}←Mana♦️`;

    document.getElementById('plaqueOutput').value = text;
    navigator.clipboard.writeText(text);
    showToast('Placa Copiada', 'Cole no WhatsApp para iniciar a batalha!');
}

function openAnnouncementModal(category) {
    document.getElementById('annCategory').value = category;
    document.getElementById('annTitle').value = '';
    document.getElementById('annContent').value = '';
    document.getElementById('annPublishType').value = 'now';
    document.getElementById('annDuration').value = 'none';
    document.getElementById('annScheduleContainer').classList.add('hidden');

    const modal = document.getElementById('announcementModal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}

function closeAnnouncementModal() {
    const modal = document.getElementById('announcementModal');
    if (modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
}

function togglePublishSchedule(val) {
    const container = document.getElementById('annScheduleContainer');
    if (val === 'schedule') container.classList.remove('hidden');
    else container.classList.add('hidden');
}

async function saveAnnouncement(e) {
    e.preventDefault();
    if (!currentUser || !(currentUser.is_admin === true || currentUser.is_admin === 'true')) {
        showToast('Erro', 'Apenas administradores podem postar.');
        return;
    }

    const category = document.getElementById('annCategory').value;
    const title = document.getElementById('annTitle').value;
    const content = document.getElementById('annContent').value;
    const publishType = document.getElementById('annPublishType').value;
    const duration = document.getElementById('annDuration').value;

    let publishAt = new Date();
    if (publishType === 'schedule') {
        const scheduledVal = document.getElementById('annPublishDate').value;
        if (scheduledVal) publishAt = new Date(scheduledVal);
    }

    let expiresAt = null;
    if (duration !== 'none') {
        expiresAt = new Date(publishAt.getTime());
        if (duration === '24h') expiresAt.setHours(expiresAt.getHours() + 24);
        if (duration === '3d') expiresAt.setDate(expiresAt.getDate() + 3);
        if (duration === '7d') expiresAt.setDate(expiresAt.getDate() + 7);
        if (duration === '30d') expiresAt.setDate(expiresAt.getDate() + 30);
    }

    const { error } = await window.supabaseClient.from('announcements').insert([{
        category: category,
        title: title,
        content: content,
        publish_at: publishAt.toISOString(),
        expires_at: expiresAt ? expiresAt.toISOString() : null,
        created_by: currentUser.id
    }]);

    if (!error) {
        closeAnnouncementModal();
        loadAnnouncements(category);
        showToast('Sucesso', 'Comunicado salvo!');
    } else {
        console.error(error);
        showToast('Erro', 'Não foi possível salvar o comunicado.');
    }
}

async function loadAnnouncements(category) {
    const containerMap = {
        'missions': 'containerMissions',
        'tournaments': 'containerTournaments',
        'schedule': 'containerSchedule',
        'notices': 'containerNotices'
    };

    const containerId = containerMap[category];
    const container = document.getElementById(containerId);
    if (!container) return;

    const nowIso = new Date().toISOString();

    const { data, error } = await window.supabaseClient
        .from('announcements')
        .select('*')
        .eq('category', category)
        .lte('publish_at', nowIso)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order('publish_at', { ascending: false });

    if (error || !data || data.length === 0) {
        container.innerHTML = '<p class="text-zinc-500 text-xs py-4">Nenhum comunicado ativo nesta seção.</p>';
        return;
    }

    let html = '';
    const isAdmin = currentUser && (currentUser.is_admin === true || currentUser.is_admin === 'true');

    data.forEach(item => {
        const pubDate = new Date(item.publish_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        const deleteBtn = isAdmin 
            ? `<button onclick="deleteAnnouncement('${item.id}', '${category}')" class="text-zinc-600 hover:text-red-500 text-xs"><i class="fa-solid fa-trash"></i></button>` 
            : '';

        html += `
            <div class="bg-black/60 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full border border-zinc-700">📅 ${pubDate}</span>
                    ${deleteBtn}
                </div>
                <h3 class="font-bold text-white text-base mb-2">${item.title}</h3>
                <p class="text-zinc-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">${item.content}</p>
            </div>`;
    });

    container.innerHTML = html;
}

async function deleteAnnouncement(id, category) {
    await window.supabaseClient.from('announcements').delete().eq('id', id);
    loadAnnouncements(category);
    showToast('Removido', 'Comunicado excluído.');
}

function renderDatabookRules() {
    const container = document.getElementById('databookList');
    if(!container) return;
    
    let html = '';
    databookRules.forEach((rule, idx) => {
        html += `
            <div class="bg-black/60 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                <span class="text-xs font-bold text-purple-400 block mb-1">Regra #${idx + 1}</span>
                <p class="text-zinc-300 text-xs leading-relaxed">${rule}</p>
            </div>`;
    });
    container.innerHTML = html;
}

function filterDatabook() {
    const query = (document.getElementById('databookSearch')?.value || '').toLowerCase();
    const container = document.getElementById('databookList');
    if(!container) return;

    let html = '';
    databookRules.forEach((rule, idx) => {
        if(rule.toLowerCase().includes(query)) {
            html += `
                <div class="bg-black/60 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                    <span class="text-xs font-bold text-purple-400 block mb-1">Regra #${idx + 1}</span>
                    <p class="text-zinc-300 text-xs leading-relaxed">${rule}</p>
                </div>`;
        }
    });
    container.innerHTML = html || '<p class="text-zinc-500 text-xs p-2">Nenhuma regra encontrada com esse termo.</p>';
}

async function saveCardData(e) {
    e.preventDefault();
    if(!currentUser) return;

    const typeValue = document.getElementById('cardTypeInput').value;
    const textValue = document.getElementById('cardTextInput').value;

    const { error } = await window.supabaseClient.from('cards').insert([{
        user_id: currentUser.id,
        name: typeValue,
        damage: '-',
        mana_cost: '-',
        usage_limit: '-',
        text: textValue
    }]);

    if(!error) {
        closeCardModal();
        document.getElementById('cardTypeInput').value = '';
        document.getElementById('cardTextInput').value = '';
        loadCards();
        showToast('Salvo', 'Card colado com sucesso.');
    } else {
        showToast('Erro', 'Não foi possível salvar o card.');
    }
}

async function deleteCard(id) {
    await window.supabaseClient.from('cards').delete().eq('id', id);
    loadCards();
    showToast('Excluído', 'Card removido.');
}

function showToast(title, sub) {
    const t = document.getElementById('toast');
    if (!t) return;
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastSub').textContent = sub;
    t.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => t.classList.add('translate-y-20', 'opacity-0'), 3000);
}
