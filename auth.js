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

function openUserModal() {
  if (!currentUser?.is_admin) { showToast("Acesso negado", "Somente administradores."); return; }
  document.getElementById("userModal")?.classList.remove("hidden");
  document.getElementById("userModal")?.classList.add("flex");
}
function closeUserModal() {
  document.getElementById("userModal")?.classList.add("hidden");
  document.getElementById("userModal")?.classList.remove("flex");
}
async function createRpgUser(e) {
  e.preventDefault();
  if (!currentUser?.is_admin) { showToast("Acesso negado", "Somente administradores."); return; }
  const form = document.getElementById("createUserForm");
  const button = document.getElementById("btnCreateUser");
  const value = id => document.getElementById(id)?.value;
  const payload = {
    action: "create_user",
    nick: value("createNick"),
    password: value("createPassword"),
    kingdom: value("createKingdom"),
    social_class: value("createClass"),
    house: value("createHouse"),
    squad: value("createSquad"),
    rank: value("createRank"),
    is_admin: value("createIsAdmin") === "sim"
  };
  if (button) button.disabled = true;
  try {
    const session = (await window.supabaseClient.auth.getSession()).data.session;
    if (!session) throw new Error("Sua sessão expirou. Entre novamente.");
    const result = await callRpgAuth(payload, session.access_token);
    closeUserModal();
    form.reset();
    showToast("Mago cadastrado", result.profile.nick + " foi cadastrado. A senha provisória será trocada no primeiro acesso.");
  } catch (err) {
    console.error("Erro ao cadastrar mago:", err);
    showToast("Erro ao cadastrar", err.message || "Não foi possível cadastrar o mago.");
  } finally {
    if (button) button.disabled = false;
  }
}
