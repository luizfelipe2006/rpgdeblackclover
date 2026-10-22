let currentUser = null;
let cards = [];

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
        if (cleanVal.includes(cleanKey)) {
            return emojiMap[category][key];
        }
    }
    return '';
}

function showView(viewId) {
    ['viewLanding', 'viewLogin', 'viewNewPassword', 'viewDashboard'].forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
}

function showLandingView() { showView('viewLanding'); }
function showLoginView() { showView('viewLogin'); }
function toggleMenu() { document.getElementById('dropdownMenu').classList.toggle('hidden'); }

function switchTab(tabName) {
    ['tabWelcome', 'tabProfile', 'tabRealms', 'tabCards', 'tabNotices', 'tabTournaments', 'tabSchedule'].forEach(id => document.getElementById(id).classList.add('hidden'));
    
    let targetTab = 'tabWelcome';
    if(tabName === 'profile') targetTab = 'tabProfile';
    if(tabName === 'realms') targetTab = 'tabRealms';
    if(tabName === 'cards') targetTab = 'tabCards';
    if(tabName === 'notices') targetTab = 'tabNotices';
    if(tabName === 'torneios') targetTab = 'tabTournaments';
    if(tabName === 'schedule') targetTab = 'tabSchedule';

    document.getElementById(targetTab).classList.remove('hidden');
    document.getElementById('dropdownMenu').classList.add('hidden');

    if(tabName === 'cards') loadCards();
    if(tabName === 'realms') loadRealmsPlayers();
    if(tabName === 'profile') renderProfile();
    if(tabName === 'schedule') loadSchedule();
}

async function renderProfile() {
    if(!currentUser) return;
    const { data } = await window.supabaseClient.from('profiles').select('*').eq('id', currentUser.id).single();
    if(data) currentUser = data;

    const cls = currentUser.social_class || 'Plebeu';
    const kng = currentUser.kingdom || 'Reino Clover';
    const hse = currentUser.house || 'Casa Silva';
    const rnk = currentUser.rank || 'Júnior';
    const sqd = currentUser.squad || 'Nenhum';

    document.getElementById('profNick').textContent = currentUser.nick;
    document.getElementById('profClass').textContent = `${cls} ${getEmoji('classes', cls)}`;
    document.getElementById('profKingdom').textContent = `${kng} ${getEmoji('kingdoms', kng)}`;
    document.getElementById('profHouse').textContent = `${hse} ${getEmoji('houses', hse)}`;
    document.getElementById('profRank').textContent = `${rnk} ${getEmoji('ranks', rnk)}`;
    document.getElementById('profSquad').textContent = `${sqd} ${getEmoji('squads', sqd)}`;
    document.getElementById('profHp').textContent = (currentUser.hp || 200) + ' ❣️';
    document.getElementById('profMana').textContent = (currentUser.mana || 400) + ' ♦️';
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
                <span class="font-bold text-white">${p.nick}</span>
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
    renderCards(cards);
}

function renderCards(list) {
    const grid = document.getElementById('cardsGrid');
    if(!grid) return;
    grid.innerHTML = list.length === 0 ? '<p class="text-zinc-500 text-sm col-span-full">Nenhum card cadastrado no grimório.</p>' : '';
    list.forEach(c => {
        grid.innerHTML += `
            <div class="bg-[#121212] border border-[#262626] rounded-3xl p-6 flex flex-col justify-between shadow-2xl hover:border-zinc-600 transition-all">
                <div>
                    <h3 class="font-bold text-white text-base mb-3 flex items-center justify-between">${c.name}</h3>
                    <div class="flex gap-2 mb-4">
                        <span class="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-xl border border-zinc-700 font-medium">💥 Dano: ${c.damage}</span>
                        <span class="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-xl border border-zinc-700 font-medium">💧 Mana: ${c.mana_cost}</span>
                    </div>
                    <div class="bg-black p-4 rounded-2xl text-xs font-mono text-zinc-300 whitespace-pre-wrap border border-[#262626] leading-relaxed">${c.text}</div>
                </div>
                <div class="flex gap-2.5 pt-4 border-t border-[#262626] mt-5">
                    <button onclick="navigator.clipboard.writeText('${c.text.replace(/'/g, "\\'")}'); showToast('Copiado', '${c.name}');" class="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border border-zinc-700">Copiar Card</button>
                    <button onclick="deleteCard('${c.id}')" class="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-all border border-[#262626]"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
    });
}

function openCardModal() { document.getElementById('cardModal').classList.remove('hidden'); document.getElementById('cardModal').classList.add('flex'); }
function closeCardModal() { document.getElementById('cardModal').classList.remove('flex'); document.getElementById('cardModal').classList.add('hidden'); }

async function saveCardData(e) {
    e.preventDefault();
    if(!currentUser) return;

    const { error } = await window.supabaseClient.from('cards').insert([{
        user_id: currentUser.id,
        name: document.getElementById('cardNameInput').value,
        damage: document.getElementById('cardDamageInput').value,
        mana_cost: document.getElementById('cardManaInput').value,
        usage_limit: 'Infinity',
        text: document.getElementById('cardTextInput').value
    }]);

    if(!error) {
        closeCardModal();
        document.getElementById('cardNameInput').value = '';
        document.getElementById('cardDamageInput').value = '';
        document.getElementById('cardManaInput').value = '';
        document.getElementById('cardTextInput').value = '';
        loadCards();
        showToast('Salvo', 'Card criado com sucesso.');
    } else {
        showToast('Erro', 'Não foi possível salvar o card.');
    }
}

async function deleteCard(id) {
    await window.supabaseClient.from('cards').delete().eq('id', id);
    loadCards();
    showToast('Excluído', 'Card removido.');
}

async function loadSchedule() {
    const { data, error } = await window.supabaseClient
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false });

    const container = document.getElementById('scheduleContainer');
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = '<p class="text-zinc-500 text-sm">Nenhum cronograma cadastrado para este mês.</p>';
        return;
    }

    let html = '';
    data.forEach(item => {
        html += `
            <div class="bg-black/60 p-4 rounded-2xl border border-zinc-800 mb-3 hover:border-zinc-700 transition-colors">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-bold text-red-500 uppercase tracking-wider">${item.month_year}</span>
                    <span class="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-0.5 rounded-full border border-zinc-700 font-mono">📅 ${item.event_date}</span>
                </div>
                <h3 class="font-bold text-white text-base mb-1">${item.title}</h3>
                <p class="text-zinc-400 text-xs leading-relaxed">${item.description || ''}</p>
            </div>
        `;
    });

    container.innerHTML = html;
}

function showToast(title, sub) {
    const t = document.getElementById('toast');
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastSub').textContent = sub;
    t.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => t.classList.add('translate-y-20', 'opacity-0'), 3000);
}

function filterCards() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    renderCards(cards.filter(c => c.name.toLowerCase().includes(q)));
}
