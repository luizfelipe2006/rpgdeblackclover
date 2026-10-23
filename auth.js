const RPG_AUTH_URL = "https://xmiqmdiwloplnhcvonvj.supabase.co/functions/v1/rpg-auth";

function showLoginError(msg) {
  const el = document.getElementById("loginError");
  if (el) { el.textContent = msg; el.classList.remove("hidden"); }
}

async function callRpgAuth(payload, token) {
  const response = await fetch(RPG_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": "sb_publishable_jN6S3CFhzMPYjOi2niy18w_pNMPb1E7",
      ...(token ? { "Authorization": "Bearer " + token } : {})
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Não foi possível concluir a operação.");
  return result;
}

async function handleLogin(e) {
  e.preventDefault();
  const nick = document.getElementById("loginNick")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;
  const button = e.submitter || document.querySelector('#viewLogin button[type="submit"]');
  if (!nick || !password) return;
  const err = document.getElementById("loginError");
  if (err) err.classList.add("hidden");
  if (button) button.disabled = true;
  try {
    const result = await callRpgAuth({ action: "login", nick, password });
    const { error: sessionError } = await window.supabaseClient.auth.setSession({
      access_token: result.session.access_token,
      refresh_token: result.session.refresh_token
    });
    if (sessionError) throw sessionError;
    currentUser = result.profile;
    const menuNick = document.getElementById("menuUserNick");
    const welcomeNick = document.getElementById("welcomeUserNick");
    if (menuNick) menuNick.textContent = currentUser.nick;
    if (welcomeNick) welcomeNick.textContent = currentUser.nick;
    const adminButton = document.getElementById("btnManageUsers");
    if (adminButton) adminButton.classList.toggle("hidden", currentUser.is_admin !== true);
    if (currentUser.first_access === true) showView("viewNewPassword");
    else { showView("viewDashboard"); switchTab("welcome"); }
  } catch (err) {
    console.error("Falha no login:", err);
    showLoginError(err.message || "Não foi possível entrar.");
  } finally {
    if (button) button.disabled = false;
  }
}

async function handleNewPassword(e) {
  e.preventDefault();
  const input = document.getElementById("newPassInput");
  const newPass = input?.value || "";
  if (!currentUser || newPass.length < 8) {
    showToast("Senha inválida", "Use uma senha com pelo menos 8 caracteres.");
    return;
  }
  const button = document.getElementById("btnSavePassword");
  if (button) button.disabled = true;
  try {
    const { error: authError } = await window.supabaseClient.auth.updateUser({ password: newPass });
    if (authError) throw authError;
    const { data, error } = await window.supabaseClient.from("profiles")
      .update({ first_access: false }).eq("id", currentUser.id)
      .select("id,nick,social_class,kingdom,house,rank,squad,hp,mana,first_access,created_at,auth_uid,is_admin").single();
    if (error) throw error;
    currentUser = data;
    showToast("Sucesso", "Sua senha foi alterada com segurança.");
    showView("viewDashboard");
    switchTab("welcome");
  } catch (err) {
    console.error("Erro ao atualizar senha:", err);
    showToast("Erro", err.message || "Não foi possível atualizar a senha.");
  } finally {
    if (button) button.disabled = false;
  }
}

async function handleLogout() {
  try { await window.supabaseClient.auth.signOut(); } catch (err) { console.error(err); }
  currentUser = null;
  showLandingView();
}

async function openUserModal() {
  if (!currentUser?.is_admin) { showToast("🚫 Acesso negado", "Somente administradores."); return; }
  document.getElementById("userModal")?.classList.remove("hidden");
  document.getElementById("userModal")?.classList.add("flex");
  await refreshUserList();
}
function closeUserModal() {
  document.getElementById("userModal")?.classList.add("hidden");
  document.getElementById("userModal")?.classList.remove("flex");
}
async function refreshUserList() {
  const select = document.getElementById("editUserSelect");
  if (!select) return;
  try {
    const session = (await window.supabaseClient.auth.getSession()).data.session;
    if (!session) throw new Error("Sessão expirada.");
    const result = await callRpgAuth({action:"list_users"}, session.access_token);
    select.innerHTML = '<option value="">➕ Novo mago</option>';
    (result.users || []).forEach(user => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = (user.is_admin ? "👑 " : "🧙🏻‍♂️ ") + user.nick;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao listar usuários:", err);
    showToast("⚠️ Erro", err.message || "Não foi possível carregar os usuários.");
  }
}
async function loadSelectedUser() {
  const select = document.getElementById("editUserSelect");
  const id = select?.value;
  const form = document.getElementById("createUserForm");
  if (!id) {
    form?.reset();
    document.getElementById("editingUserId").value = "";
    document.getElementById("createPassword").required = true;
    document.getElementById("createNick").readOnly = false;
    document.getElementById("btnCreateUser").textContent = "✨ Cadastrar Mago";
    showToast("➕ Novo mago", "Formulário pronto para novo cadastro.");
    return;
  }
  try {
    const session = (await window.supabaseClient.auth.getSession()).data.session;
    const result = await callRpgAuth({action:"list_users"}, session?.access_token);
    const user = (result.users || []).find(u => u.id === id);
    if (!user) throw new Error("Usuário não encontrado.");
    document.getElementById("editingUserId").value = user.id;
    document.getElementById("createNick").value = user.nick || "";
    document.getElementById("createNick").readOnly = false;
    document.getElementById("createPassword").value = "";
    document.getElementById("createPassword").required = false;
    document.getElementById("createKingdom").value = user.kingdom || "Reino Clover";
    document.getElementById("createClass").value = user.social_class || "Plebeu";
    document.getElementById("createHouse").value = user.house || "Casa Silva";
    document.getElementById("createSquad").value = user.squad || "Nenhum";
    document.getElementById("createRank").value = user.rank || "Júnior";
    document.getElementById("createIsAdmin").value = user.is_admin ? "sim" : "nao";
    document.getElementById("btnCreateUser").textContent = "💾 Salvar alterações";
    showToast("✏️ Editando usuário", "Altere os dados e salve. Senha em branco mantém a atual.");
  } catch (err) {
    showToast("⚠️ Erro", err.message || "Não foi possível carregar o usuário.");
  }
}
async function createRpgUser(e) {
  e.preventDefault();
  if (!currentUser?.is_admin) { showToast("🚫 Acesso negado", "Somente administradores."); return; }
  const form = document.getElementById("createUserForm");
  const button = document.getElementById("btnCreateUser");
  const value = id => document.getElementById(id)?.value;
  const editingId = value("editingUserId");
  const payload = {
    action: editingId ? "update_user" : "create_user",
    id: editingId || undefined,
    nick: value("createNick"),
    password: value("createPassword"),
    kingdom: value("createKingdom"),
    social_class: value("createClass"),
    house: value("createHouse"),
    squad: value("createSquad"),
    rank: value("createRank"),
    is_admin: value("createIsAdmin") === "sim"
  };
  const errBox = document.getElementById("userFormError");
  if (errBox) { errBox.textContent = ""; errBox.classList.add("hidden"); }
  if (button) button.disabled = true;
  try {
    const session = (await window.supabaseClient.auth.getSession()).data.session;
    if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
    const result = await callRpgAuth(payload, session.access_token);
    const user = result.profile;
    form.reset();
    document.getElementById("editingUserId").value = "";
    document.getElementById("createPassword").required = true;
    document.getElementById("btnCreateUser").textContent = "✨ Cadastrar Mago";
    await refreshUserList();
    document.getElementById("editUserSelect").value = "";
    showToast(editingId ? "💾 Usuário atualizado" : "✨ Mago cadastrado",
      editingId ? "Os dados de " + user.nick + " foram atualizados." : user.nick + " foi cadastrado. A senha provisória será trocada no primeiro acesso.");
  } catch (err) {
    console.error("Erro ao salvar usuário:", err);
    showToast("⚠️ Erro ao salvar", err.message || "Não foi possível salvar o usuário.");
    const errBox = document.getElementById("userFormError");
    if (errBox) { errBox.textContent = "⚠️ " + (err.message || "Não foi possível salvar o usuário."); errBox.classList.remove("hidden"); }
  } finally {
    if (button) button.disabled = false;
  }
}
