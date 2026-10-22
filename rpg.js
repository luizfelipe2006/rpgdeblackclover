var currentUser = null;
var cards = [];
var currentCategoryFilter = 'TODAS';

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
    ['viewLanding', 'viewLogin', 'viewNewPassword', 'viewDashboard'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    const target = document.getElementById(viewId);
    if(target) target.classList.remove('hidden');
}

function showLandingView() { showView('viewLanding'); }
function showLoginView() { showView('viewLogin'); }
function toggleMenu() { 
    const menu = document.getElementById('dropdownMenu');
    if(menu) menu.classList.toggle('hidden'); 
}

function switchTab(tabName) {
    ['tabWelcome', 'tabProfile', 'tabRealms', 'tabCards', 'tabNotices', 'tabTournaments', 'tabSchedule'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    
    let targetTab = 'tabWelcome';
    if(tabName === 'profile') targetTab = 'tabProfile';
    if(tabName === 'realms') targetTab = 'tabRealms';
    if(tabName === 'cards') targetTab = 'tabCards';
    if(tabName === 'notices') targetTab = 'tabNotices';
    if(tabName === 'torneios') targetTab = 'tabTournaments';
    if(tabName === 'schedule') targetTab = 'tabSchedule';

    const tabEl = document.getElementById(targetTab);
    if(tabEl) tabEl.classList.remove('hidden');

    const menu = document.getElementById('dropdownMenu');
    if(menu) menu.classList.add('hidden');

    if(tabName === 'cards') loadCards();
    if(tabName === 'realms') loadRealmsPlayers();
    if(tabName === 'profile') renderProfile();
    if(tabName === 'schedule') loadSchedule();
}

async function renderProfile() {
    if(!currentUser) return;
    try {
        const { data } = await window.supabaseClient.from('profiles').select('*').eq('id', currentUser.id).single();
        if(data) currentUser = data;
    } catch(err) {
        console.warn("Erro ao recarregar perfil:", err);
    }

    const cls = currentUser.social_class || 'Plebeu';
    const kng = currentUser.kingdom || 'Reino Clover';
    const hse = currentUser.house || 'Casa Silva';
    const rnk = currentUser.rank || 'Júnior';
    const sqd = currentUser.squad || 'Nenhum';

    const pNick = document.getElementById('profNick');
    if(pNick) pNick.textContent = currentUser.nick;

    const pClass = document.getElementById('profClass');
    if(pClass) pClass.textContent = `${cls} ${getEmoji('classes', cls)}`;

    const pKingdom = document.getElementById('profKingdom');
    if(pKingdom) pKingdom.textContent = `${kng} ${getEmoji('kingdoms', kng)}`;

    const pHouse = document.getElementById('profHouse');
    if(pHouse) pHouse.textContent = `${hse} ${getEmoji('houses', hse)}`;

    const pRank = document.getElementById('profRank');
    if(pRank) pRank.textContent = `${rnk} ${getEmoji('ranks', rnk)}`;

    const pSquad = document.getElementById('profSquad');
    if(pSquad) pSquad.textContent = `${sqd} ${getEmoji('squads', sqd)}`;

    const pHp = document.getElementById('profHp');
    if(pHp) pHp.textContent = (currentUser.hp || 200) + ' ❣️';

    const pMana = document.getElementById('profMana');
    if(pMana) pMana.textContent = (currentUser.mana || 400) + ' ♦️';
}

async function loadRealmsPlayers() {
    try {
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
                    <span class="font-bold text-white text-sm">${p.nick}</span>
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

        const lClover = document.getElementById('listClover');
        if(lClover) lClover.innerHTML = cloverHtml || '<span class="text-zinc-500 text-xs">Nenhum mago registrado</span>';

        const lDiamond = document.getElementById('listDiamond');
        if(lDiamond) lDiamond.innerHTML = diamondHtml || '<span class="text-zinc-500 text-xs">Nenhum mago registrado</span>';

        const lSpade = document.getElementById('listSpade');
        if(lSpade) lSpade.innerHTML = spadeHtml || '<span class="text-zinc-500 text-xs">Nenhum mago registrado</span>';
    } catch(err) {
        console.error("Erro ao carregar reinos:", err);
    }
}

async function loadCards() {
    if (!currentUser) return;
    try {
        const { data } = await window.supabaseClient.from('cards').select('*').eq('user_id', currentUser.id);
        cards = data || [];
        filterCards();
    } catch(err) {
        console.error("Erro ao carregar cards:", err);
    }
}

function setCategoryFilter(cat) {
    currentCategoryFilter = cat;
    
    // Atualiza o estilo visual das pílulas
    document.querySelectorAll('.pill-btn').forEach(btn => {
        btn.className = "pill-btn bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border border-zinc-800";
    });

    const activeBtn = document.getElementById(`pill-${cat}`);
    if(activeBtn) {
        activeBtn.className = "pill-btn bg-red-600 text-white px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border border-red-500 shadow-md";
    }

    filterCards();
}

function filterCards() {
    const qInput = document.getElementById('searchInput');
    const query = qInput ? qInput.value.toLowerCase() : '';

    const filtered = cards.filter(c => {
        const matchesCategory = (currentCategoryFilter === 'TODAS') || 
                                (c.name && c.name.toUpperCase() === currentCategoryFilter.toUpperCase());
        const matchesSearch = !query || 
                              (c.name && c.name.toLowerCase().includes(query)) || 
                              (c.text && c.text.toLowerCase().includes(query));

        return matchesCategory && matchesSearch;
    });

    renderCards(filtered);
}

function renderCards(list) {
    const grid = document.getElementById('cardsGrid');
    if(!grid) return;

    if(list.length === 0) {
        grid.innerHTML = '<p class="text-zinc-500 text-sm col-span-full py-8 text-center">Nenhum card encontrado nesta categoria.</p>';
        return;
    }

    grid.innerHTML = '';
    list.forEach(c => {
        grid.innerHTML += `
            <div class="bg-[#121212] border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between shadow-2xl hover:border-zinc-600 transition-all">
                <div>
                    <div class="flex justify-between items-center mb-4">
                        <span class="bg-zinc-800 text-white text-[11px] px-3 py-1 rounded-lg border border-zinc-700 font-bold uppercase tracking-widest">${c.name || 'GERAL'}</span>
                        <button onclick="deleteCard('${c.id}')" class="text-zinc-600 hover:text-red-500 transition-colors cursor-pointer p-1" title="Excluir Card"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    <div class="bg-black p-4 rounded-xl text-xs font-mono text-zinc-300 whitespace-pre-wrap border border-zinc-800 leading-relaxed max-h-60 overflow-y-auto">${c.text}</div>
                </div>
                <div class="pt-4 mt-4 border-t border-zinc-800">
                    <button onclick="copyCardText('${c.id}')" class="w-full bg-zinc-200 hover:bg-white text-black py-3 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md">
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
        showToast('Copiado!', 'Card copiado para a área de transferência.');
    }
}

function openCardModal() { 
    const modal = document.getElementById('cardModal');
    if(modal) {
        modal.classList.remove('hidden'); 
        modal.classList.add('flex'); 
    }
}

function closeCardModal() { 
    const modal = document.getElementById('cardModal');
    if(modal) {
        modal.classList.remove('flex'); 
        modal.classList.add('hidden'); 
    }
}

async function saveCardData(e) {
    e.preventDefault();
    if(!currentUser) return;

    const typeInput = document.getElementById('cardTypeInput');
    const textInput = document.getElementById('cardTextInput');

    if(!typeInput || !textInput) return;

    const typeValue = typeInput.value;
    const textValue = textInput.value;

    try {
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
            typeInput.value = '';
            textInput.value = '';
            loadCards();
            showToast('Salvo', 'Card registrado no grimório.');
        } else {
            showToast('Erro', 'Não foi possível salvar o card.');
        }
    } catch(err) {
        console.error("Erro ao salvar card:", err);
        showToast('Erro', 'Falha na conexão.');
    }
}

async function deleteCard(id) {
    try {
        await window.supabaseClient.from('cards').delete().eq('id', id);
        loadCards();
        showToast('Excluído', 'Card removido com sucesso.');
    } catch(err) {
        console.error("Erro ao deletar card:", err);
    }
}

async function loadSchedule() {
    try {
        const { data } = await window.supabaseClient.from('schedules').select('*').order('created_at', { ascending: false });
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
    } catch(err) {
        console.error("Erro ao carregar cronograma:", err);
    }
}

function showToast(title, sub) {
    const t = document.getElementById('toast');
    const tTitle = document.getElementById('toastTitle');
    const tSub = document.getElementById('toastSub');

    if(tTitle) tTitle.textContent = title;
    if(tSub) tSub.textContent = sub;

    if(t) {
        t.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => t.classList.add('translate-y-20', 'opacity-0'), 3000);
    }
}
