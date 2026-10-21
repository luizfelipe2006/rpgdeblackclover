// 1. Atualizar o Modal de Cards no HTML para incluir a opção de Categoria (opcional)
// Se preferir, adicione este <select id="cardCategoryInput"> no seu modal do index.html:
/*
<select id="cardCategoryInput" class="w-full bg-slate-950 border border-rpgborder rounded-xl px-4 py-2 text-sm text-slate-200">
    <option value="Ofensiva">Ofensiva 💥</option>
    <option value="Defensiva">Defensiva 🛡️</option>
    <option value="Suporte">Suporte ✨</option>
    <option value="Especial">Especial ⚡</option>
</select>
*/

async function saveCardData(e) {
    e.preventDefault();
    if (!currentUser) return;

    const name = document.getElementById('cardNameInput').value;
    const damage = document.getElementById('cardDamageInput').value;
    const mana_cost = document.getElementById('cardManaInput').value;
    const text = document.getElementById('cardTextInput').value;

    const { error } = await supabaseClient.from('cards').insert([{
        user_id: currentUser.id,
        name: name,
        damage: damage,
        mana_cost: mana_cost,
        usage_limit: 'Infinity',
        text: text
    }]);

    if (error) {
        console.error("Erro ao salvar card:", error);
        showToast('Erro', 'Não foi possível salvar o card.');
        return;
    }

    closeCardModal();
    document.getElementById('cardNameInput').value = '';
    document.getElementById('cardDamageInput').value = '';
    document.getElementById('cardManaInput').value = '';
    document.getElementById('cardTextInput').value = '';
    
    loadCards();
    showToast('Salvo', 'Card criado com sucesso.');
}

async function loadCards() {
    if (!currentUser) return;
    const { data, error } = await supabaseClient
        .from('cards')
        .select('*')
        .eq('user_id', currentUser.id);

    if (error) {
        console.error("Erro ao carregar cards:", error);
        return;
    }

    cards = data || [];
    renderCards(cards);
}

function renderCards(list) {
    const grid = document.getElementById('cardsGrid');
    if (!grid) return;
    
    grid.innerHTML = list.length === 0 ? '<p class="text-slate-500 text-sm col-span-full">Nenhum card cadastrado no grimório.</p>' : '';
    
    list.forEach(c => {
        grid.innerHTML += `
            <div class="bg-slate-900 border border-rpgborder rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                <div>
                    <h3 class="font-bold text-white text-base mb-2 flex items-center justify-between">
                        <span>${c.name}</span>
                    </h3>
                    <div class="flex gap-2 mb-3">
                        <span class="bg-red-500/10 text-red-400 text-xs px-2 py-0.5 rounded-lg border border-red-500/20">💥 Dano: ${c.damage}</span>
                        <span class="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-lg border border-blue-500/20">💧 Mana: ${c.mana_cost}</span>
                    </div>
                    <div class="bg-slate-950 p-3 rounded-xl text-xs font-mono text-slate-300 whitespace-pre-wrap border border-rpgborder">${c.text}</div>
                </div>
                <div class="flex gap-2 pt-3 border-t border-rpgborder mt-3">
                    <button onclick="navigator.clipboard.writeText('${c.text.replace(/'/g, "\\'")}'); showToast('Copiado', '${c.name}');" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-xs font-semibold transition-all">Copiar Card</button>
                    <button onclick="deleteCard('${c.id}')" class="bg-slate-800 hover:bg-red-950/60 text-red-400 px-3 py-2 rounded-xl text-xs transition-all"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
    });
}