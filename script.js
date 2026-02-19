// ============================================
// CONFIGURAÇÕES GLOBAIS
// ============================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbxkf7CiS7Gah22rQypyIvkuJIqa8na_flRc4HpZKL6XPocevUv0EFTlqNmuZvOHzQp5mw/exec";
 
  
let origemExclusaoAtual = 'historico'; 
let usuarioLogado = "";
let todosOsDados = [];
let todosOsPagos = [];
let configuracoesGlobais = {
  salario: 4000,
  cartoes: [
    { nome: "Principal", fechamento: 28, vencimento: 5 },
    { nome: "Secundário", fechamento: 28, vencimento: 5 },
  ],
};

// ============================================
// CONSTANTES DE BANDEIRAS DE CARTÃO
// ============================================
const BANDEIRAS_CARTAO = [
    { nome: "Visa", icon: "fab fa-cc-visa", cor: "#1A1F71" },
    { nome: "Mastercard", icon: "fab fa-cc-mastercard", cor: "#EB001B" },
    { nome: "American Express", icon: "fab fa-cc-amex", cor: "#2E77BB" },
    { nome: "Elo", icon: "fas fa-credit-card", cor: "#FF6B00" },
    { nome: "Hipercard", icon: "fas fa-credit-card", cor: "#B3131B" },
    { nome: "Outros", icon: "fas fa-credit-card", cor: "#84cc16" }
];
let tipoPDFAtual = "";
let chartPizza = null;
let chartBarras = null;
let chartFormasPagamento = null;

// Variáveis para recuperação de senha
let emailRecuperacao = "";
let codigoRecuperacao = "";

// Variável para controlar método de recuperação
let metodoRecuperacao = 'email';

// Cores das Categorias
const CORES_CAT = {
  Lazer: "bg-amber-100 text-amber-700",
  Saúde: "bg-rose-100 text-rose-700",
  Educação: "bg-blue-100 text-blue-700",
  "Aluguel/Fixo": "bg-[#84cc16] text-[#0f1217]",
  Mercado: "bg-emerald-100 text-emerald-700",
  Outros: "bg-slate-100 text-slate-700",
};

// Cores dos Gráficos
const CORES_GRAFICOS = {
  categorias: [
    "#84cc16",
    "#4d7c0f",
    "#22c55e",
    "#16a34a",
    "#15803d",
    "#166534",
    "#14532d",
  ],
  pagamentos: {
    "Cartão de Crédito": "#84cc16",
    "Cartão de Débito": "#4d7c0f",
    Dinheiro: "#22c55e",
    PIX: "#16a34a",
  },
};

// ============================================
// FUNÇÕES DE CONTROLE DE ABAS DO LOGIN
// ============================================
function mostrarAba(aba) {
  document.getElementById("abaLogin").classList.add("hidden");
  document.getElementById("abaCadastro").classList.add("hidden");
  document.getElementById("abaRecuperar").classList.add("hidden");

  document
    .getElementById("abaLoginBtn")
    .classList.remove("border-[#84cc16]", "text-white");
  document.getElementById("abaLoginBtn").classList.add("text-slate-400");
  document
    .getElementById("abaCadastroBtn")
    .classList.remove("border-[#84cc16]", "text-white");
  document.getElementById("abaCadastroBtn").classList.add("text-slate-400");
  document
    .getElementById("abaRecuperarBtn")
    .classList.remove("border-[#84cc16]", "text-white");
  document.getElementById("abaRecuperarBtn").classList.add("text-slate-400");

  if (aba === "login") {
    document.getElementById("abaLogin").classList.remove("hidden");
    document
      .getElementById("abaLoginBtn")
      .classList.add("border-[#84cc16]", "text-white");
  } else if (aba === "cadastro") {
    document.getElementById("abaCadastro").classList.remove("hidden");
    document
      .getElementById("abaCadastroBtn")
      .classList.add("border-[#84cc16]", "text-white");
  } else if (aba === "recuperar") {
    document.getElementById("abaRecuperar").classList.remove("hidden");
    document
      .getElementById("abaRecuperarBtn")
      .classList.add("border-[#84cc16]", "text-white");
    document.getElementById("etapaRecuperarEmail").classList.remove("hidden");
    document.getElementById("etapaRecuperarCodigo").classList.add("hidden");
    document.getElementById("etapaRecuperarNovaSenha").classList.add("hidden");
  }
}

// ============================================
// FUNÇÃO PARA MOSTRAR/ESCONDER SENHA (ÚNICA)
// ============================================
function toggleSenha(inputId, btn) {
  const senhaInput = document.getElementById(inputId);
  const icon = btn.querySelector("i");

  if (senhaInput.type === "password") {
    senhaInput.type = "text";
    icon.classList.remove("fa-regular", "fa-eye");
    icon.classList.add("fa-regular", "fa-eye-slash");
  } else {
    senhaInput.type = "password";
    icon.classList.remove("fa-regular", "fa-eye-slash");
    icon.classList.add("fa-regular", "fa-eye");
  }
}

// ============================================
// INICIALIZAÇÃO
// ============================================
window.onload = function () {
    const hoje = new Date().toISOString().split("T")[0];
    if (document.getElementById("data")) {
        document.getElementById("data").value = hoje;
    }
    if (document.getElementById("modalDataPagamento")) {
        document.getElementById("modalDataPagamento").value = hoje;
    }

    // VERIFICA SESSÃO NO LOCALSTORAGE
    const logado = localStorage.getItem("logadoFinan");
    const user = localStorage.getItem("userFinan");
    
    console.log("🔄 Verificando sessão:", logado, user);
    
    if (logado === "true" && user) {
        usuarioLogado = user;
        mostrarApp();
        
        // Atualiza nome do usuário
        const nome = localStorage.getItem("userName") || user;
        if (document.getElementById("nomeUsuarioLogado")) {
            document.getElementById("nomeUsuarioLogado").innerText = nome;
        }
        
        // Carrega dados
        carregarConfiguracoesLocal();
        atualizarTabela();
    } else {
        // Mostra tela de login
        document.getElementById("telaLogin").classList.remove("hidden");
        document.getElementById("app").classList.add("hidden");
    }

    carregarConfiguracoesLocal();
    window.addEventListener('resize', function () {
        if (chartPizza || chartBarras || chartFormasPagamento) {
            renderizarGraficosComDados(todosOsDados);
        }
    });

    garantirMenuFixo();
};

// ============================================
// MOSTRAR APP
// ============================================
function mostrarApp() {
    console.log("📱 Mostrando app para:", usuarioLogado);
    
    document.getElementById("telaLogin").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    
    const nome = localStorage.getItem("userName") || usuarioLogado;
    if (document.getElementById("nomeUsuarioLogado")) {
        document.getElementById("nomeUsuarioLogado").innerText = nome;
    }
    
    carregarConfiguracoesDaPlanilha();
    atualizarTabela();
    mudarTab('dash', document.querySelector('.sidebar-item'));
}

// ============================================
// FUNÇÕES DE LOGIN
// ============================================
async function fazerLogin() {
  const email = document.getElementById("inputLoginEmail").value.trim();
  const senha = document.getElementById("inputLoginSenha").value.trim();
  const btn = document.querySelector("#abaLogin button");

  if (!email || !senha) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  btn.innerText = "Verificando...";
  btn.disabled = true;

  try {
    const url = `${API_URL}?email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}&acao=login&_=${Date.now()}`;
    console.log("Tentando login:", url);

    const response = await fetch(url);
    const resultado = await response.json();
    console.log("Resposta do login:", resultado);

    if (resultado.logado) {
      localStorage.setItem("logadoFinan", "true");
      localStorage.setItem("userFinan", email);
      localStorage.setItem("userName", resultado.nome || email);
      usuarioLogado = email;
      mostrarApp();
    } else {
      alert(resultado.erro || "E-mail ou senha incorretos!");
    }
  } catch (error) {
    console.log("Fetch falhou, tentando JSONP...");
    fazerLoginJSONP(email, senha, btn);
  }
}

// ============================================
// FUNÇÃO DE LOGOUT
// ============================================
function fazerLogout() {
  if (confirm("Tem certeza que deseja sair do sistema?")) {
    console.log("Confirmando logout...");

    localStorage.removeItem("logadoFinan");
    localStorage.removeItem("userFinan");
    localStorage.removeItem("userName");

    usuarioLogado = "";
    todosOsDados = [];
    todosOsPagos = [];

    document.getElementById("app").classList.add("hidden");
    document.getElementById("telaLogin").classList.remove("hidden");

    document.getElementById("inputLoginEmail").value = "";
    document.getElementById("inputLoginSenha").value = "";

    mostrarAba("login");
  }
}
// ============================================
// FUNÇÃO JSONP
// ============================================
function fazerLoginJSONP(email, senha, btn) {
  console.log("Tentando login via JSONP...");

  const callbackName = "jsonp_callback_" + Date.now();

  window[callbackName] = function (response) {
    console.log("Resposta JSONP recebida:", response);

    const script = document.getElementById("jsonp_script");
    if (script) script.remove();
    delete window[callbackName];

    if (response && response.logado === true) {
      localStorage.setItem("logadoFinan", "true");
      localStorage.setItem("userFinan", email);
      localStorage.setItem("userName", response.nome || email.split("@")[0]);
      usuarioLogado = email;

      document.getElementById("telaLogin").classList.add("hidden");
      document.getElementById("app").classList.remove("hidden");

      if (document.getElementById("nomeUsuarioLogado")) {
        document.getElementById("nomeUsuarioLogado").innerText =
          response.nome || email.split("@")[0];
      }

      carregarConfiguracoesDaPlanilha();
      atualizarTabela();
    } else {
      alert(response.erro || "E-mail ou senha incorretos!");
    }

    btn.innerText = "Entrar no Sistema";
    btn.disabled = false;
  };

  window[callbackName + "_error"] = function () {
    console.error("Erro no JSONP");
    alert("Erro de conexão. Tente novamente.");

    delete window[callbackName];
    delete window[callbackName + "_error"];

    btn.innerText = "Entrar no Sistema";
    btn.disabled = false;
  };

  const oldScript = document.getElementById("jsonp_script");
  if (oldScript) oldScript.remove();

  const script = document.createElement("script");
  script.id = "jsonp_script";
  const timestamp = Date.now();
  script.src = `${API_URL}?email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}&acao=login&callback=${callbackName}&_=${timestamp}`;

  setTimeout(function () {
    if (window[callbackName]) {
      console.log("Timeout do JSONP");
      window[callbackName]({ logado: false, erro: "Tempo limite excedido" });
    }
  }, 10000);

  document.body.appendChild(script);
  console.log("Script JSONP adicionado:", script.src);
}

// ============================================
// FUNÇÕES DE CADASTRO
// ============================================
async function fazerCadastro() {
  const nome = document.getElementById("inputCadastroNome").value.trim();
  const email = document.getElementById("inputCadastroEmail").value.trim();
  const telefone = document.getElementById("inputCadastroTelefone").value.trim();
  const senha = document.getElementById("inputCadastroSenha").value.trim();
  const confirmaSenha = document.getElementById("inputCadastroConfirmaSenha").value.trim();
  const btn = document.querySelector("#abaCadastro button");

  if (!nome || !email || !senha || !confirmaSenha) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  if (!email.includes("@")) {
    alert("Por favor, digite um e-mail válido.");
    return;
  }

  if (senha.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres.");
    return;
  }

  if (senha !== confirmaSenha) {
    alert("As senhas não coincidem.");
    return;
  }

  btn.innerText = "Cadastrando...";
  btn.disabled = true;

  try {
    const url = `${API_URL}?acao=cadastrar&nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email)}&telefone=${encodeURIComponent(telefone)}&senha=${encodeURIComponent(senha)}&_=${Date.now()}`;
    console.log("Tentando cadastro:", url);

    const response = await fetch(url);
    const resultado = await response.json();
    console.log("Resposta do cadastro:", resultado);

    if (resultado.sucesso) {
      alert("✅ Cadastro realizado com sucesso! Faça login para continuar.");
      mostrarAba("login");
      document.getElementById("inputLoginEmail").value = email;
    } else {
      alert(resultado.erro || "Erro ao cadastrar. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro no cadastro:", error);
    alert("❌ Erro ao cadastrar. Verifique sua conexão.");
  } finally {
    btn.innerText = "Criar Conta";
    btn.disabled = false;
  }
}

// ============================================
// FUNÇÕES DE RECUPERAÇÃO DE SENHA
// ============================================

// MOSTRAR CAMPO CORRETO (EMAIL OU WHATSAPP)
function mostrarRecuperacaoPor(metodo) {
    metodoRecuperacao = metodo;
    
    const btnEmail = document.getElementById('btnRecEmail');
    const btnWhats = document.getElementById('btnRecWhatsapp');
    const campoEmail = document.getElementById('campoRecEmail');
    const campoWhats = document.getElementById('campoRecWhatsapp');
    
    if (!btnEmail || !btnWhats || !campoEmail || !campoWhats) return;
    
    btnEmail.classList.remove('bg-[#84cc16]', 'text-[#0f1217]');
    btnEmail.classList.add('bg-[#2a2f3a]', 'text-white');
    btnWhats.classList.remove('bg-[#84cc16]', 'text-[#0f1217]');
    btnWhats.classList.add('bg-[#2a2f3a]', 'text-white');
    
    if (metodo === 'email') {
        btnEmail.classList.add('bg-[#84cc16]', 'text-[#0f1217]');
        btnEmail.classList.remove('bg-[#2a2f3a]', 'text-white');
        campoEmail.classList.remove('hidden');
        campoWhats.classList.add('hidden');
    } else {
        btnWhats.classList.add('bg-[#84cc16]', 'text-[#0f1217]');
        btnWhats.classList.remove('bg-[#2a2f3a]', 'text-white');
        campoEmail.classList.add('hidden');
        campoWhats.classList.remove('hidden');
    }
}

// ENVIAR CÓDIGO (EMAIL OU WHATSAPP)
async function enviarCodigoRecuperacao() {
    let contato = '';
    let tipo = metodoRecuperacao;
    
    if (tipo === 'email') {
        contato = document.getElementById("inputRecuperarEmail").value.trim();
        if (!contato || !contato.includes('@')) {
            alert("❌ Digite um e-mail válido.");
            return;
        }
    } else {
        contato = document.getElementById("inputRecuperarWhatsapp").value.trim();
        contato = contato.replace(/\D/g, '');
        if (!contato || contato.length < 10) {
            alert("❌ Digite um WhatsApp válido (DDD + número).");
            return;
        }
    }

    const btn = document.querySelector("#etapaRecuperarEmail button");
    const textoOriginal = btn.innerText;
    
    btn.innerText = "⏳ Enviando...";
    btn.disabled = true;

    try {
        window.metodoRecuperacao = tipo;
        window.contatoRecuperacao = contato;
        
        const url = `${API_URL}?acao=solicitarRecuperacao&${tipo}=${encodeURIComponent(contato)}&_=${Date.now()}`;
        
        console.log(`🔍 Enviando código por ${tipo}:`, contato);
        
        const response = await fetch(url);
        const resultado = await response.json();

        if (resultado.sucesso) {
            window.codigoRecuperacao = resultado.codigo;
            window.emailRecuperacao = contato;
            
            if (tipo === 'whatsapp') {
                alert(`✅ Código enviado para WhatsApp ${contato}`);
            } else {
                alert(`✅ Código enviado para ${contato}`);
            }
            
            document.getElementById('etapaRecuperarEmail').classList.add('hidden');
            document.getElementById('etapaRecuperarCodigo').classList.remove('hidden');
        } else {
            alert(resultado.erro || "❌ Contato não encontrado.");
        }
    } catch (error) {
        console.error("❌ Erro:", error);
        alert("❌ Erro ao processar solicitação.");
    } finally {
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
}

function verificarCodigoRecuperacao() {
  const codigo = document.getElementById("inputRecuperarCodigo").value.trim();

  if (!codigo) {
    alert("Digite o código recebido.");
    return;
  }

  if (codigo === codigoRecuperacao) {
    document.getElementById("etapaRecuperarCodigo").classList.add("hidden");
    document.getElementById("etapaRecuperarNovaSenha").classList.remove("hidden");
  } else {
    alert("Código inválido. Tente novamente.");
  }
}

function voltarEtapaRecuperacao() {
  document.getElementById("etapaRecuperarEmail").classList.remove("hidden");
  document.getElementById("etapaRecuperarCodigo").classList.add("hidden");
  document.getElementById("etapaRecuperarNovaSenha").classList.add("hidden");
}

async function alterarSenhaComCodigo() {
  const novaSenha = document.getElementById("inputRecuperarNovaSenha").value.trim();
  const confirmaSenha = document.getElementById("inputRecuperarConfirmaSenha").value.trim();
  const btn = document.querySelector("#etapaRecuperarNovaSenha button");

  if (!novaSenha || !confirmaSenha) {
    alert("Preencha todos os campos.");
    return;
  }

  if (novaSenha.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres.");
    return;
  }

  if (novaSenha !== confirmaSenha) {
    alert("As senhas não coincidem.");
    return;
  }

  btn.innerText = "Alterando...";
  btn.disabled = true;

  try {
    const url = `${API_URL}?email=${encodeURIComponent(emailRecuperacao)}&codigo=${encodeURIComponent(codigoRecuperacao)}&novaSenha=${encodeURIComponent(novaSenha)}&acao=alterarSenha&_=${Date.now()}`;
    const response = await fetch(url);
    const resultado = await response.json();

    if (resultado.sucesso) {
      alert("✅ Senha alterada com sucesso! Faça login com sua nova senha.");
      mostrarAba("login");
      document.getElementById("inputLoginEmail").value = emailRecuperacao;

      document.getElementById("inputRecuperarNovaSenha").value = "";
      document.getElementById("inputRecuperarConfirmaSenha").value = "";
    } else {
      alert(resultado.erro || "Erro ao alterar senha.");
    }
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    alert("❌ Erro ao alterar senha.");
  } finally {
    btn.innerText = "Alterar Senha";
    btn.disabled = false;
  }
}

// ============================================
// FUNÇÕES DE CONFIGURAÇÕES
// ============================================
function carregarConfiguracoesLocal() {
  const salvo = localStorage.getItem("configuracoesFinanWF");
  if (salvo) {
    try {
      const configLocal = JSON.parse(salvo);
      if (configLocal.salario)
        configuracoesGlobais.salario = configLocal.salario;
      if (configLocal.cartoes && configLocal.cartoes.length > 0) {
        configuracoesGlobais.cartoes = configLocal.cartoes;
      }
    } catch (e) {}
  }

  if (document.getElementById("inputSalario")) {
    document.getElementById("inputSalario").value = configuracoesGlobais.salario;
  }

  renderizarConfigCartoes();
  atualizarSelectCartoes();
}

async function carregarConfiguracoesDaPlanilha() {
  if (!usuarioLogado) return;

  try {
    const url = `${API_URL}?usuario=${encodeURIComponent(usuarioLogado)}&acao=carregarConfiguracoes&_=${Date.now()}`;
    const response = await fetch(url);
    const dados = await response.json();

    if (dados && !dados.erro) {
      if (dados.salario) {
        configuracoesGlobais.salario = parseFloat(dados.salario) || 4000;
      }
      if (dados.cartoes && Array.isArray(dados.cartoes) && dados.cartoes.length > 0) {
        configuracoesGlobais.cartoes = dados.cartoes;
      }

      localStorage.setItem("configuracoesFinanWF", JSON.stringify(configuracoesGlobais));

      if (document.getElementById("inputSalario")) {
        document.getElementById("inputSalario").value = configuracoesGlobais.salario;
      }

      renderizarConfigCartoes();
      atualizarSelectCartoes();
      atualizarTabela();
    }
  } catch (error) {
    console.error("Erro ao carregar configurações da planilha:", error);
  }
}

async function salvarConfiguracoes(event) {
  event.preventDefault();

  const btn = event.target.querySelector('button[type="submit"]');
  const textoOriginal = btn.innerText;

  configuracoesGlobais.salario = parseFloat(document.getElementById("inputSalario").value) || 4000;

  configuracoesGlobais.cartoes.forEach((cartao, index) => {
    const nomeInput = document.getElementById(`cartaoNome_${index}`);
    const fechamentoInput = document.getElementById(`cartaoFechamento_${index}`);
    const vencimentoInput = document.getElementById(`cartaoVencimento_${index}`);

    if (nomeInput) cartao.nome = nomeInput.value || "Cartão";
    if (fechamentoInput) cartao.fechamento = parseInt(fechamentoInput.value) || 10;
    if (vencimentoInput) cartao.vencimento = parseInt(vencimentoInput.value) || 15;
  });

  localStorage.setItem("configuracoesFinanWF", JSON.stringify(configuracoesGlobais));

  btn.innerText = "Salvando...";
  btn.disabled = true;

  try {
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        acao: "salvarConfiguracoes",
        usuario: usuarioLogado,
        salario: configuracoesGlobais.salario,
        cartoes: configuracoesGlobais.cartoes,
      }),
    });

    alert("✅ Configurações salvas com sucesso na planilha!");
    atualizarSelectCartoes();
    atualizarTabela();
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    alert("❌ Erro ao salvar na planilha. As configurações foram salvas localmente.");
  } finally {
    btn.innerText = textoOriginal;
    btn.disabled = false;
  }
}

function renderizarConfigCartoes() {
  const container = document.getElementById("containerCartoesConfig");
  if (!container) return;

  let html = "";

  configuracoesGlobais.cartoes.forEach((cartao, index) => {
    html += `
      <div class="border border-slate-700 rounded-xl p-3 sm:p-4">
        <div class="flex justify-between items-center mb-2 sm:mb-3">
          <input type="text" 
                 id="cartaoNome_${index}" 
                 value="${cartao.nome || "Cartão"}"
                 class="font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#84cc16] rounded-lg p-1 w-32 text-sm sm:text-base touch-button text-white"
                 placeholder="Nome do Cartão">
          <button type="button" onclick="removerCartaoConfig(${index})" class="text-rose-400 text-xs sm:text-sm hover:text-rose-500 p-2 touch-button">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label class="text-xs font-bold mb-1 block text-slate-400">Fechamento</label>
            <input type="number" 
                   id="cartaoFechamento_${index}" 
                   value="${cartao.fechamento || 10}"
                   class="w-full border border-slate-700 rounded-lg p-2 text-xs sm:text-sm focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 touch-button bg-[#0f1217] text-white"
                   min="1" max="31">
          </div>
          <div>
            <label class="text-xs font-bold mb-1 block text-slate-400">Vencimento</label>
            <input type="number" 
                   id="cartaoVencimento_${index}" 
                   value="${cartao.vencimento || 15}"
                   class="w-full border border-slate-700 rounded-lg p-2 text-xs sm:text-sm focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 touch-button bg-[#0f1217] text-white"
                   min="1" max="31">
          </div>
        </div>
      </div>`;
  });

  container.innerHTML = html;
}

function adicionarCartaoConfig() {
  configuracoesGlobais.cartoes.push({
    nome: "Novo Cartão",
    fechamento: 10,
    vencimento: 15,
  });
  renderizarConfigCartoes();
}

function removerCartaoConfig(index) {
  if (configuracoesGlobais.cartoes.length > 1) {
    configuracoesGlobais.cartoes.splice(index, 1);
    renderizarConfigCartoes();
  } else {
    alert("É necessário manter pelo menos um cartão.");
  }
}

function atualizarSelectCartoes() {
  const selectCartao = document.getElementById("cartaoSelecionado");
  if (!selectCartao) return;

  selectCartao.innerHTML = "";

  configuracoesGlobais.cartoes.forEach((cartao) => {
    const option = document.createElement("option");
    option.value = cartao.nome;
    option.textContent = cartao.nome;
    selectCartao.appendChild(option);
  });
}

// ============================================
// CONTROLE DE TABS
// ============================================
function mudarTab(tabId, btn) {
  document.querySelectorAll(".tab-content").forEach((t) => t.classList.remove("active"));

  const tabElement = document.getElementById("tab-" + tabId);
  if (tabElement) {
    tabElement.classList.add("active");
  }

  document.querySelectorAll(".sidebar-item").forEach((b) => {
    b.classList.remove("active");
  });

  if (btn) {
    btn.classList.add("active");
  }

  document.querySelectorAll(".mobile-bottom-nav-item").forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.tab === tabId) {
      item.classList.add("active");
    }
  });

  if (tabId === "dash" || tabId === "vencimentos" || tabId === "historico" || tabId === "cartao") {
    atualizarTabela();
  }
}

function mudarTabMobile(tabId) {
  mudarTab(tabId, null);
}

// ============================================
// FUNÇÕES DE DADOS
// ============================================
async function atualizarTabela() {
  if (!usuarioLogado) return;

  try {
    const response = await fetch(`${API_URL}?usuario=${encodeURIComponent(usuarioLogado)}&_=${Date.now()}`);
    const dados = await response.json();

    if (dados.erro) {
      console.error("Erro:", dados.erro);
      return;
    }

    todosOsDados = Array.isArray(dados) ? dados : [];

    const pendentes = todosOsDados.filter(
      (item) => item.Status === "Pendente" || !item.Status || item.Status === ""
    );
    const pagos = todosOsDados.filter((item) => item.Status === "Pago");
    todosOsPagos = pagos;

    renderizarLinhas(pendentes, "corpoTabelaVencimentos");
    renderizarLinhasPagos(pagos, "corpoTabelaPagos");
    atualizarCardsFinanceiros(pendentes, pagos);
    renderizarGraficosComDados(todosOsDados);

    renderizarFaturasCartao();
    renderizarResumoCartoes();
    renderizarTabelaCartao();

    atualizarBarraProgressoVencimentos();

    const qtdNav = document.getElementById("qtdPendentesNav");
    const qtdSidebar = document.getElementById("qtdPendentes");
    if (qtdNav) qtdNav.innerText = pendentes.length;
    if (qtdSidebar) qtdSidebar.innerText = pendentes.length;
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
}

// ============================================
// RENDERIZAR TABELAS
// ============================================
function renderizarLinhas(lista, id) {
  const corpo = document.getElementById(id);
  if (!corpo) return;

  corpo.innerHTML = "";

  if (!lista || lista.length === 0) {
    corpo.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-400 text-sm">Nenhuma conta pendente</td></tr>`;
    return;
  }

  lista.forEach((item) => {
    const idItem = item.ID || item.id || "";
    const descricao = item.Descrição || item.Descricao || item.descricao || "Sem descrição";
    const categoria = item.Categoria || item.categoria || "Outros";
    const valor = parseFloat(item.Valor || item.valor || 0);
    const dataOriginal = item.Data || item.data || item.Vencimento || "";
    const formaPagamento = item.FormaPagamento || item["Forma Pagamento"] || item.formaPagamento || "N/A";
    const bandeira = item.Bandeira || "Outros";

    let parcela = "1";
    let totalParcelas = "1";

    if (item.ParcelaAtual) parcela = item.ParcelaAtual;
    else if (item.parcelaAtual) parcela = item.parcelaAtual;
    else if (item.Parcela) parcela = item.Parcela;
    else if (item.parcela) parcela = item.parcela;

    if (item.TotalParcelas) totalParcelas = item.TotalParcelas;
    else if (item.totalParcelas) totalParcelas = item.totalParcelas;
    else if (item.Parcelas) totalParcelas = item.Parcelas;
    else if (item.parcelas) totalParcelas = item.parcelas;
    else if (item.Parcelamento) {
      const partes = item.Parcelamento.toString().split(/[_\/]/);
      if (partes.length === 2) {
        parcela = partes[0];
        totalParcelas = partes[1];
      }
    }

    let dataFormatada = "---";
    if (dataOriginal) {
      try {
        const dataStr = dataOriginal.toString().split("T")[0];
        if (dataStr.includes("-")) {
          const [ano, mes, dia] = dataStr.split("-");
          dataFormatada = `${dia}/${mes}/${ano}`;
        }
      } catch (e) {}
    }

    const valorFormatado = valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    const corCategoria = CORES_CAT[categoria] || CORES_CAT["Outros"];

    corpo.innerHTML += `
      <tr>
        <td class="font-mono text-slate-400 text-xs sm:text-sm">${parcela}/${totalParcelas}</td>
        <td class="font-bold text-white text-xs sm:text-sm">${descricao.substring(0, 20)}${descricao.length > 20 ? "..." : ""}</td>
        <td class="hide-on-mobile">
          ${formaPagamento === 'Cartão de Crédito' || formaPagamento === 'Cartão de Débito' ? 
            `<span class="badge badge-info flex items-center gap-1">
              <i class="${getBandeiraIcon(bandeira)}"></i>
              ${formaPagamento}
            </span>` : 
            `<span class="badge badge-info">${formaPagamento}</span>`
          }
        </td>
        <td>
          <span class="badge ${corCategoria}">${categoria}</span>
        </td>
        <td class="text-center font-mono text-white text-xs sm:text-sm">${dataFormatada}</td>
        <td class="text-right font-bold text-[#84cc16] text-xs sm:text-sm">${valorFormatado}</td>
        <td class="text-center">
          <button onclick="marcarComoPago('${idItem}', event)" class="action-button" title="Pagar">
            <i class="fas fa-check"></i>
          </button>
        </td>
        <td class="text-center">
          <button onclick="abrirModalExclusaoOpcoesVencimentos('${idItem}', '${descricao.replace(/'/g, "\\'")}', '${categoria.replace(/'/g, "\\'")}', ${valor})" 
                  class="action-button bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white" 
                  title="Excluir lançamento">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>`;
  });
}

function renderizarLinhasPagos(lista, id) {
  const corpo = document.getElementById(id);
  if (!corpo) return;

  corpo.innerHTML = "";

  if (!lista || lista.length === 0) {
    corpo.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-400 text-sm">Nenhum registro pago</td></tr>`;
    return;
  }

  lista.forEach((item) => {
    const idItem = item.ID || item.id || "";
    const descricao = item.Descrição || item.Descricao || item.descricao || "Sem descrição";
    const categoria = item.Categoria || item.categoria || "Outros";
    const valor = parseFloat(item.Valor || item.valor || 0);
    const dataOriginal = item.Data || item.data || item.Vencimento || "";
    const formaPagamento = item.FormaPagamento || item["Forma Pagamento"] || item.formaPagamento || "N/A";

    let parcela = "1";
    let totalParcelas = "1";

    if (item.ParcelaAtual) parcela = item.ParcelaAtual;
    else if (item.parcelaAtual) parcela = item.parcelaAtual;
    else if (item.Parcela) parcela = item.Parcela;
    else if (item.parcela) parcela = item.parcela;

    if (item.TotalParcelas) totalParcelas = item.TotalParcelas;
    else if (item.totalParcelas) totalParcelas = item.totalParcelas;
    else if (item.Parcelas) totalParcelas = item.Parcelas;
    else if (item.parcelas) totalParcelas = item.parcelas;
    else if (item.Parcelamento) {
      const partes = item.Parcelamento.toString().split(/[_\/]/);
      if (partes.length === 2) {
        parcela = partes[0];
        totalParcelas = partes[1];
      }
    }

    let dataFormatada = "---";
    if (dataOriginal) {
      try {
        const dataStr = dataOriginal.toString().split("T")[0];
        if (dataStr.includes("-")) {
          const [ano, mes, dia] = dataStr.split("-");
          dataFormatada = `${dia}/${mes}/${ano}`;
        }
      } catch (e) {}
    }

    const valorFormatado = valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    const corCategoria = CORES_CAT[categoria] || CORES_CAT["Outros"];

    // CORREÇÃO: Ajuste na estrutura das células
    corpo.innerHTML += `
      <tr>
        <td class="font-mono text-slate-400 text-xs sm:text-sm">${parcela}/${totalParcelas}</td>
        <td class="font-bold text-white text-xs sm:text-sm">${descricao.substring(0, 20)}${descricao.length > 20 ? "..." : ""}</td>
        <td class="hide-on-mobile">
          <span class="badge badge-info">${formaPagamento}</span>
        </td>
        <td>
          <span class="badge ${corCategoria}">${categoria}</span>
        </td>
        <td class="text-center font-mono text-white text-xs sm:text-sm">${dataFormatada}</td>
        <td class="text-right font-bold text-[#84cc16] text-xs sm:text-sm">${valorFormatado}</td>
        <td class="text-center">
          <button onclick="estornarRegistro('${idItem}', event)" 
                  class="text-[#84cc16] font-bold text-xs sm:text-sm hover:text-[#4d7c0f] transition hover:underline touch-button mr-1">
            Estornar
          </button>
          <button onclick="abrirModalExclusaoOpcoes('${idItem}', '${descricao.replace(/'/g, "\\'")}', '${categoria.replace(/'/g, "\\'")}', ${valor})" 
                  class="action-button bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white" 
                  title="Excluir lançamento">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>`;
  });
}

// ============================================
// FUNÇÕES DE BANDEIRAS
// ============================================
function atualizarIconBandeira() {
    const select = document.getElementById('bandeiraCartao');
    if (select) {
        const bandeira = select.value;
        console.log('Bandeira selecionada:', bandeira);
    }
}

function getBandeiraIcon(bandeira) {
    const encontrada = BANDEIRAS_CARTAO.find(b => b.nome === bandeira);
    return encontrada ? encontrada.icon : "fas fa-credit-card";
}

// ============================================
// CARDS FINANCEIROS
// ============================================
function atualizarCardsFinanceiros(pendentes, pagos) {
  const totalPendente = pendentes.reduce(
    (sum, item) => sum + parseFloat(item.Valor || item.valor || 0), 0
  );
  const totalPago = pagos.reduce(
    (sum, item) => sum + parseFloat(item.Valor || item.valor || 0), 0
  );
  const receitas = configuracoesGlobais.salario || 4000;
  const saldoLivre = receitas - totalPendente - totalPago;

  document.getElementById("cardPendente").innerText = totalPendente.toLocaleString("pt-BR", {
    style: "currency", currency: "BRL"
  });
  document.getElementById("cardPago").innerText = totalPago.toLocaleString("pt-BR", {
    style: "currency", currency: "BRL"
  });
  document.getElementById("cardReceitas").innerText = receitas.toLocaleString("pt-BR", {
    style: "currency", currency: "BRL"
  });
  document.getElementById("cardSaldoRestante").innerText = saldoLivre.toLocaleString("pt-BR", {
    style: "currency", currency: "BRL"
  });

  const totalGasto = totalPendente + totalPago;
  const porcentagem = receitas > 0 ? (totalGasto / receitas) * 100 : 0;

  document.getElementById("barraProgresso").style.width = `${Math.min(porcentagem, 100)}%`;
  document.getElementById("txtPorcentagem").innerText = `${porcentagem.toFixed(1)}%`;
}

// ============================================
// GRÁFICOS
// ============================================
function renderizarGraficosComDados(dados) {
  if (!dados || dados.length === 0) return;

  const resumoCategorias = {};
  const resumoPagamentos = {};

  dados.forEach((item) => {
    const cat = item.Categoria || item.categoria || "Outros";
    const valor = parseFloat(item.Valor || item.valor || 0);
    const forma = item.FormaPagamento || item["Forma Pagamento"] || item.formaPagamento || "Outros";

    resumoCategorias[cat] = (resumoCategorias[cat] || 0) + valor;
    resumoPagamentos[forma] = (resumoPagamentos[forma] || 0) + valor;
  });

  renderizarPizza(resumoCategorias);
  renderizarBarras(resumoCategorias);
  renderizarGraficoPagamentos(resumoPagamentos);
}

function renderizarPizza(dados) {
  const canvas = document.getElementById("graficoPizza");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (chartPizza) chartPizza.destroy();

  const labels = Object.keys(dados);
  const valores = Object.values(dados);

  if (labels.length === 0) {
    labels.push("Sem dados");
    valores.push(1);
  }

  chartPizza = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: valores,
        backgroundColor: CORES_GRAFICOS.categorias,
        borderWidth: 2,
        borderColor: "#1a1e26",
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#ffffff",
            font: {
              size: window.innerWidth < 640 ? 10 : 11,
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const valor = context.raw;
              return ` ${context.label}: ${valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
            },
          },
        },
      },
      cutout: "70%",
    },
  });
}

function renderizarBarras(dados) {
  const canvas = document.getElementById("graficoBarras");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (chartBarras) chartBarras.destroy();

  const dadosMensais = {};

  todosOsDados.forEach((item) => {
    const dataStr = item.Data || item.data || "";
    if (dataStr) {
      try {
        const data = new Date(dataStr + "T12:00:00");
        const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
        const valor = parseFloat(item.Valor || item.valor || 0);
        dadosMensais[mesAno] = (dadosMensais[mesAno] || 0) + valor;
      } catch (e) {}
    }
  });

  const mesesOrdenados = Object.keys(dadosMensais).sort((a, b) => {
    const [mesA, anoA] = a.split("/").map(Number);
    const [mesB, anoB] = b.split("/").map(Number);
    return anoA - anoB || mesA - mesB;
  });

  const nomesMeses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const labels = mesesOrdenados.map((mes) => {
    const [mesNum, ano] = mes.split("/").map(Number);
    return window.innerWidth < 640 ? nomesMeses[mesNum - 1] : `${nomesMeses[mesNum - 1]}/${ano}`;
  });

  const valores = mesesOrdenados.map((mes) => dadosMensais[mes]);

  chartBarras = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Gastos Mensais",
        data: valores,
        backgroundColor: "#84cc16",
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${context.parsed.y.toLocaleString("pt-BR", {
                style: "currency", currency: "BRL"
              })}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#ffffff",
            font: { size: window.innerWidth < 640 ? 8 : 10 },
            callback: (value) => `R$ ${value}`,
          },
          grid: { color: "#2a2f3a" },
        },
        x: {
          ticks: {
            color: "#ffffff",
            font: { size: window.innerWidth < 640 ? 8 : 10 },
          },
          grid: { color: "#2a2f3a" },
        },
      },
    },
  });
}

function renderizarGraficoPagamentos(dados) {
  const canvas = document.getElementById("graficoFormasPagamento");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (chartFormasPagamento) chartFormasPagamento.destroy();

  const labels = Object.keys(dados);
  const valores = Object.values(dados);

  if (labels.length === 0) {
    labels.push("Sem dados");
    valores.push(1);
  }

  const cores = labels.map((label) => {
    return CORES_GRAFICOS.pagamentos[label] || "#4b5563";
  });

  chartFormasPagamento = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: valores,
        backgroundColor: cores,
        borderWidth: 1,
        borderColor: "#1a1e26",
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#ffffff",
            font: {
              size: window.innerWidth < 640 ? 10 : 11,
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const valor = context.raw;
              return ` ${context.label}: ${valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
            },
          },
        },
      },
    },
  });
}

// ============================================
// LANÇAMENTO DE DESPESAS
// ============================================
async function lancar() {
  const btn = document.getElementById("btnLancar");
  const desc = document.getElementById("desc").value.trim();
  const valor = document.getElementById("valor").value.trim();
  const categoria = document.getElementById("categoria").value;
  const data = document.getElementById("data").value;
  const formaPagamento = document.getElementById("formaPagamento").value;
  const parcelas = document.getElementById("parcelas")?.value || "1";
  const cartao = document.getElementById("cartaoSelecionado")?.value || "";
  const bandeira = document.getElementById("bandeiraCartao")?.value || "Outros";

  if (!desc || !valor || !categoria || !data) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  const valorNum = parseFloat(valor);
  const parcelasNum = parseInt(parcelas);

  if (isNaN(valorNum) || valorNum <= 0) {
    alert("Valor inválido!");
    return;
  }

  if (isNaN(parcelasNum) || parcelasNum < 1) {
    alert("Número de parcelas inválido!");
    return;
  }

  if (parcelasNum > 1) {
    const valorParcela = valorNum / parcelasNum;
    const confirmacao = confirm(
      `📋 RESUMO DO PARCELAMENTO\n\n` +
      `Total: R$ ${valorNum.toFixed(2)}\n` +
      `Parcelas: ${parcelasNum}x\n` +
      `Valor por parcela: R$ ${valorParcela.toFixed(2)}\n\n` +
      `Deseja continuar?`,
    );
    if (!confirmacao) return;
  }

  btn.innerText = "Enviando...";
  btn.disabled = true;

  try {
    const dados = {
      acao: "lancar",
      usuario: usuarioLogado,
      desc: desc,
      valor: valorNum.toFixed(2),
      categoria: categoria,
      formaPagamento: formaPagamento,
      data: data,
      parcelas: parcelasNum,
      cartao: cartao,
      bandeira: bandeira,
    };

    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    alert(`✅ ${parcelasNum > 1 ? parcelasNum + " parcelas" : "Lançamento"} realizado com sucesso!`);
    limparFormLancar();
    await atualizarTabela();
  } catch (err) {
    console.error("Erro ao lançar:", err);
    alert("❌ Erro ao salvar. Verifique o console.");
  } finally {
    btn.innerText = "Confirmar Lançamento";
    btn.disabled = false;
  }
}

function limparFormLancar() {
  document.getElementById("desc").value = "";
  document.getElementById("valor").value = "";
  document.getElementById("categoria").value = "Aluguel/Fixo";
  document.getElementById("formaPagamento").value = "Cartão de Crédito";

  const hoje = new Date().toISOString().split("T")[0];
  document.getElementById("data").value = hoje;

  document.getElementById("parcelas").value = "1";
  document.getElementById("bandeiraCartao").value = "Visa";
  toggleCamposCartao();
}

// ============================================
// PAGAMENTO E ESTORNO
// ============================================
async function marcarComoPago(id, event) {
  if (!id) {
    alert("ID do registro não encontrado");
    return;
  }

  if (!confirm("Confirmar pagamento desta conta?")) return;

  const btn = event?.target;
  if (btn) {
    btn.innerText = "Pagando...";
    btn.disabled = true;
  }

  try {
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        acao: "pagar",
        id: id,
        usuario: usuarioLogado,
      }),
    });

    alert("Pagamento registrado!");
    await atualizarTabela();
  } catch (error) {
    console.error("Erro no pagamento:", error);
    alert("Erro ao registrar pagamento.");
  } finally {
    if (btn) {
      btn.innerText = "Pagar";
      btn.disabled = false;
    }
  }
}

async function estornarRegistro(id, event) {
  if (!id) {
    alert("ID do registro não encontrado");
    return;
  }

  if (!confirm("Tem certeza que deseja estornar este pagamento?")) return;

  const btn = event?.target;
  if (btn) {
    btn.innerText = "Estornando...";
    btn.disabled = true;
    btn.style.opacity = "0.7";
  }

  try {
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        acao: "estornar",
        id: id,
        usuario: usuarioLogado,
      }),
    });

    alert("Pagamento estornado com sucesso!");
    await atualizarTabela();
  } catch (error) {
    console.error("Erro no estorno:", error);
    alert("Erro ao estornar pagamento.");
  } finally {
    if (btn) {
      btn.innerText = "Estornar";
      btn.disabled = false;
      btn.style.opacity = "1";
    }
  }
}

// ============================================
// CONTROLE DE CARTÃO DE CRÉDITO
// ============================================
function toggleCamposCartao() {
  const formaPagamento = document.getElementById("formaPagamento")?.value;
  const divCartaoInfo = document.getElementById("divCartaoInfo");

  if (!divCartaoInfo) return;

  if (formaPagamento === "Cartão de Crédito") {
    divCartaoInfo.style.display = "block";
    atualizarInfoCartao();
  } else {
    divCartaoInfo.style.display = "none";
    document.getElementById("infoFaturaAtual").innerHTML =
      '<div class="text-slate-400 text-sm">💰 Pagamento à vista</div>';
  }
}

function atualizarInfoCartao() {
  const formaPagamento = document.getElementById("formaPagamento")?.value;
  const infoFaturaAtual = document.getElementById("infoFaturaAtual");

  if (!infoFaturaAtual) return;

  if (formaPagamento === "Cartão de Crédito") {
    const parcelas = parseInt(document.getElementById("parcelas")?.value) || 1;
    const dataCompra = document.getElementById("data")?.value;
    const cartao = document.getElementById("cartaoSelecionado")?.value || "Principal";
    const valor = parseFloat(document.getElementById("valor")?.value) || 0;

    if (dataCompra && valor > 0) {
      const faturas = calcularFaturasCartao(dataCompra, parcelas, cartao);
      const mesesNomes = [
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
      ];

      if (faturas.length > 0) {
        const valorParcela = valor / parcelas;

        let html = `
          <div class="bg-[#2a2f3a] p-3 rounded-lg">
            <div class="flex items-center gap-2 text-[#84cc16] text-xs sm:text-sm mb-2">
              <i class="fas fa-calendar-alt"></i>
              <span>1ª parcela em <strong>${mesesNomes[faturas[0].mes - 1]}</strong></span>
            </div>`;

        if (parcelas > 1) {
          html += `<div class="text-xs space-y-1 text-white">`;
          for (let i = 0; i < Math.min(parcelas, 3); i++) {
            const fat = faturas[i];
            html += `<div class="flex justify-between">
              <span>Parcela ${i + 1}:</span>
              <span>${mesesNomes[fat.mes - 1]}</span>
              <span class="font-bold text-[#84cc16]">R$ ${valorParcela.toFixed(2)}</span>
            </div>`;
          }
          if (parcelas > 3) {
            html += `<div class="text-center text-[#84cc16] mt-1">+${parcelas - 3} parcelas</div>`;
          }
          html += `</div>`;
        }

        html += `</div>`;
        infoFaturaAtual.innerHTML = html;
      }
    }
  } else {
    infoFaturaAtual.innerHTML = '<div class="text-slate-400 text-sm">💰 Pagamento à vista</div>';
  }
}

function calcularFaturasCartao(dataCompra, parcelas, nomeCartao) {
  if (!dataCompra) return [];

  try {
    const cartao = configuracoesGlobais.cartoes.find((c) => c.nome === nomeCartao) || configuracoesGlobais.cartoes[0];
    const data = new Date(dataCompra + "T12:00:00");

    if (isNaN(data.getTime())) return [];

    const parcelasNum = parseInt(parcelas) || 1;
    const resultados = [];

    let mesReferencia = data.getMonth();
    let anoReferencia = data.getFullYear();

    const diaFechamento = cartao?.fechamento || 10;

    if (data.getDate() >= diaFechamento) {
      mesReferencia++;
      if (mesReferencia > 11) {
        mesReferencia = 0;
        anoReferencia++;
      }
    }

    for (let i = 0; i < parcelasNum; i++) {
      let mes = mesReferencia + i;
      let ano = anoReferencia;

      while (mes > 11) {
        mes -= 12;
        ano++;
      }

      resultados.push({
        parcela: i + 1,
        mes: mes + 1,
        ano: ano,
        vencimento: new Date(ano, mes, cartao?.vencimento || 15),
      });
    }

    return resultados;
  } catch (e) {
    console.error("Erro ao calcular faturas:", e);
    return [];
  }
}

// ============================================
// BARRA DE PROGRESSO
// ============================================
function atualizarBarraProgressoVencimentos() {
  const pendentes = todosOsDados.filter(
    (item) => item.Status === "Pendente" || !item.Status || item.Status === ""
  );

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const contasMesAtual = pendentes.filter((item) => {
    const dataStr = item.Data || item.data || item.Vencimento || "";
    if (!dataStr) return false;

    try {
      const data = new Date(dataStr + "T12:00:00");
      if (isNaN(data.getTime())) return false;
      return data.getMonth() + 1 === mesAtual && data.getFullYear() === anoAtual;
    } catch (e) {
      return false;
    }
  });

  const totalMesAtual = contasMesAtual.reduce(
    (sum, item) => sum + parseFloat(item.Valor || item.valor || 0), 0
  );

  const pagos = todosOsPagos || [];
  const pagosMesAtual = pagos.filter((item) => {
    const dataStr = item.Data || item.data || item.Vencimento || "";
    if (!dataStr) return false;

    try {
      const data = new Date(dataStr + "T12:00:00");
      if (isNaN(data.getTime())) return false;
      return data.getMonth() + 1 === mesAtual && data.getFullYear() === anoAtual;
    } catch (e) {
      return false;
    }
  });

  const totalPagoMesAtual = pagosMesAtual.reduce(
    (sum, item) => sum + parseFloat(item.Valor || item.valor || 0), 0
  );

  const receitaMensal = configuracoesGlobais.salario || 4000;
  const porcentagemGasto = receitaMensal > 0 ? (totalPagoMesAtual / receitaMensal) * 100 : 0;
  const porcentagemExibida = Math.min(porcentagemGasto, 100);

  document.getElementById("totalPendenteMes").innerText = totalMesAtual.toLocaleString("pt-BR", {
    style: "currency", currency: "BRL"
  });

  document.getElementById("porcentagemPagaMes").innerText = `${porcentagemExibida.toFixed(1)}%`;
  document.getElementById("barraProgressoVencimentos").style.width = `${porcentagemExibida}%`;

  if (porcentagemGasto >= 90) {
    document.getElementById("barraProgressoVencimentos").style.backgroundColor = "#dc2626";
  } else if (porcentagemGasto >= 70) {
    document.getElementById("barraProgressoVencimentos").style.backgroundColor = "#84cc16";
  } else {
    document.getElementById("barraProgressoVencimentos").style.backgroundColor = "#4d7c0f";
  }
}

// ============================================
// RENDERIZAR FATURAS DO CARTÃO
// ============================================
function renderizarFaturasCartao() {
  const container = document.getElementById("containerFaturas");
  if (!container) return;

  const comprasCartao = todosOsDados.filter((item) => {
    const formaPagamento = item.FormaPagamento || item.formaPagamento || "";
    const status = item.Status || "";
    return formaPagamento === "Cartão de Crédito" && status !== "Pago";
  });

  const faturasPorMes = {};

  comprasCartao.forEach((item) => {
    const dataCompra = item.Data || item.data || "";
    const cartao = item.Cartao || "Principal";
    const valor = parseFloat(item.Valor || item.valor || 0);
    const parcelaAtual = parseInt(item.ParcelaAtual || 1);
    const totalParcelas = parseInt(item.TotalParcelas || 1);

    if (dataCompra && dataCompra !== "" && !isNaN(parcelaAtual) && !isNaN(totalParcelas)) {
      try {
        const faturas = calcularFaturasCartao(dataCompra, totalParcelas, cartao);

        if (faturas && faturas.length > 0 && parcelaAtual <= faturas.length) {
          const faturaAtual = faturas[parcelaAtual - 1];

          if (faturaAtual) {
            const mes = faturaAtual.mes || 1;
            const ano = faturaAtual.ano || new Date().getFullYear();
            const chave = `${mes}/${ano}`;

            if (!faturasPorMes[chave]) {
              faturasPorMes[chave] = {};
            }
            if (!faturasPorMes[chave][cartao]) {
              faturasPorMes[chave][cartao] = 0;
            }
            faturasPorMes[chave][cartao] += valor;
          }
        }
      } catch (e) {}
    }
  });

  const mesesNomes = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
  ];

  const chavesOrdenadas = Object.keys(faturasPorMes).sort((a, b) => {
    const [mesA, anoA] = a.split("/").map(Number);
    const [mesB, anoB] = b.split("/").map(Number);
    return anoA - anoB || mesA - mesB;
  });

  let html = "";

  if (chavesOrdenadas.length === 0) {
    html = '<div class="text-center py-8 text-slate-400 text-sm">Nenhuma fatura pendente</div>';
  } else {
    chavesOrdenadas.forEach((chave) => {
      const [mes, ano] = chave.split("/").map(Number);
      const cartoes = faturasPorMes[chave];
      const totalFatura = Object.values(cartoes).reduce((sum, val) => sum + (val || 0), 0);

      const nomeMes = !isNaN(mes) && mes >= 1 && mes <= 12 ? mesesNomes[mes - 1] : "Mês";

      html += `
        <div class="border border-slate-700 rounded-xl p-3 sm:p-4 hover:shadow-md transition">
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-white text-sm sm:text-base">${nomeMes}/${ano}</span>
            <span class="font-bold text-[#84cc16] text-sm sm:text-base">${totalFatura.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>`;

      Object.entries(cartoes).forEach(([cartao, valor]) => {
        html += `
          <div class="flex justify-between items-center mt-1 text-xs sm:text-sm pl-2 border-l-2 border-[#84cc16]">
            <span class="text-slate-400">💳 ${cartao}</span>
            <span class="font-medium text-white">${(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>`;
      });

      html += `</div>`;
    });
  }

  container.innerHTML = html;
}

function renderizarResumoCartoes() {
  const container = document.getElementById("containerResumoCartoes");
  if (!container) return;

  const comprasCartao = todosOsDados.filter(
    (item) =>
      (item.FormaPagamento === "Cartão de Crédito" || item.formaPagamento === "Cartão de Crédito") &&
      item.Status !== "Pago"
  );

  const resumo = {};

  comprasCartao.forEach((item) => {
    const cartao = item.Cartao || "Principal";
    const valor = parseFloat(item.Valor || item.valor || 0);
    resumo[cartao] = (resumo[cartao] || 0) + valor;
  });

  let html = "";

  Object.entries(resumo).forEach(([cartao, total]) => {
    html += `
      <div class="flex justify-between items-center p-2 sm:p-3 bg-[#2a2f3a] rounded-lg text-xs sm:text-sm">
        <span class="font-bold text-white">${cartao}</span>
        <span class="font-bold text-[#84cc16]">${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
      </div>`;
  });

  if (Object.keys(resumo).length === 0) {
    html = '<p class="text-slate-400 text-center py-4 text-sm">Nenhum débito no cartão</p>';
  }

  container.innerHTML = html;
}

function renderizarTabelaCartao() {
  const corpo = document.getElementById("corpoTabelaCartao");
  if (!corpo) return;

  const comprasCartao = todosOsDados.filter(
    (item) => item.FormaPagamento === "Cartão de Crédito" || item.formaPagamento === "Cartão de Crédito"
  );

  corpo.innerHTML = "";

  if (comprasCartao.length === 0) {
    corpo.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400 text-sm">Nenhuma compra no cartão</td></tr>`;
    return;
  }

  comprasCartao.forEach((item) => {
    const descricao = item.Descrição || item.Descricao || "Sem descrição";
    const cartao = item.Cartao || "Principal";
    const parcelaAtual = item.ParcelaAtual || "1";
    const totalParcelas = item.TotalParcelas || "1";
    const valor = parseFloat(item.Valor || item.valor || 0);
    const status = item.Status || "Pendente";

    const dataOriginal = item.Data || item.data || "";
    let dataFormatada = "---";
    if (dataOriginal) {
      try {
        const dataStr = dataOriginal.toString().split("T")[0];
        if (dataStr.includes("-")) {
          const [ano, mes, dia] = dataStr.split("-");
          dataFormatada = `${dia}/${mes}/${ano}`;
        }
      } catch (e) {}
    }

    const valorFormatado = valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    corpo.innerHTML += `
      <tr>
        <td class="font-medium text-white text-xs sm:text-sm">${descricao.substring(0, 20)}${descricao.length > 20 ? "..." : ""}</td>
        <td class="hide-on-mobile text-white text-xs sm:text-sm">${cartao}</td>
        <td class="text-white text-xs sm:text-sm">${parcelaAtual}/${totalParcelas}</td>
        <td class="hide-on-mobile text-white text-xs sm:text-sm">${dataFormatada}</td>
        <td class="text-right font-bold text-[#84cc16] text-xs sm:text-sm">${valorFormatado}</td>
        <td class="text-center">
          <span class="badge ${status === "Pago" ? "badge-success" : "badge-warning"}">
            ${status === "Pago" ? "Pago" : "Pendente"}
          </span>
        </td>
      </tr>`;
  });
}

// ============================================
// FUNÇÕES DO MODAL DE PAGAMENTO DE FATURA
// ============================================
function abrirModalPagamentoFatura() {
  const select = document.getElementById("selectFaturaModal");
  select.innerHTML = "";

  const faturas = gerarListaFaturas();

  if (faturas.length === 0) {
    alert("Nenhuma fatura pendente para pagamento.");
    return;
  }

  faturas.forEach((fatura, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${fatura.nomeMes}/${fatura.ano} - ${fatura.cartao} - ${fatura.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
    option.dataset.valor = fatura.valor;
    option.dataset.mes = fatura.mes;
    option.dataset.ano = fatura.ano;
    option.dataset.cartao = fatura.cartao;
    select.appendChild(option);
  });

  select.onchange = function () {
    const selected = select.options[select.selectedIndex];
    document.getElementById("valorFaturaModal").value = selected.dataset.valor
      ? parseFloat(selected.dataset.valor).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : "R$ 0,00";
  };

  if (faturas.length > 0) {
    select.selectedIndex = 0;
    select.onchange();
  }

  document.getElementById("modalPagamentoFatura").classList.remove("hidden");
  document.getElementById("modalPagamentoFatura").classList.add("flex");
}

function fecharModalPagamentoFatura() {
  document.getElementById("modalPagamentoFatura").classList.add("hidden");
  document.getElementById("modalPagamentoFatura").classList.remove("flex");
}

function gerarListaFaturas() {
  const comprasCartao = todosOsDados.filter(
    (item) =>
      (item.FormaPagamento === "Cartão de Crédito" || item.formaPagamento === "Cartão de Crédito") &&
      item.Status !== "Pago"
  );

  const faturasMap = new Map();

  comprasCartao.forEach((item) => {
    const dataCompra = item.Data || item.data || "";
    const cartao = item.Cartao || "Principal";
    const valor = parseFloat(item.Valor || item.valor || 0);
    const parcelaAtual = parseInt(item.ParcelaAtual || 1);
    const totalParcelas = parseInt(item.TotalParcelas || 1);

    if (dataCompra && !isNaN(parcelaAtual) && !isNaN(totalParcelas)) {
      try {
        const faturas = calcularFaturasCartao(dataCompra, totalParcelas, cartao);

        if (faturas && faturas.length > 0 && parcelaAtual <= faturas.length) {
          const faturaAtual = faturas[parcelaAtual - 1];

          if (faturaAtual) {
            const mes = faturaAtual.mes;
            const ano = faturaAtual.ano;
            const chave = `${mes}/${ano}/${cartao}`;

            if (faturasMap.has(chave)) {
              const existente = faturasMap.get(chave);
              existente.valor += valor;
            } else {
              faturasMap.set(chave, {
                mes: mes,
                ano: ano,
                cartao: cartao,
                valor: valor,
                nomeMes: [
                  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
                ][mes - 1],
              });
            }
          }
        }
      } catch (e) {}
    }
  });

  const faturas = Array.from(faturasMap.values());
  faturas.sort((a, b) => {
    if (a.ano !== b.ano) return a.ano - b.ano;
    return a.mes - b.mes;
  });

  return faturas;
}

async function confirmarPagamentoFatura() {
  const select = document.getElementById("selectFaturaModal");
  const dataPagamento = document.getElementById("modalDataPagamento").value;

  if (select.selectedIndex === -1) {
    alert("Selecione uma fatura para pagar.");
    return;
  }

  const selectedOption = select.options[select.selectedIndex];
  const mes = selectedOption.dataset.mes;
  const ano = selectedOption.dataset.ano;
  const cartao = selectedOption.dataset.cartao;

  if (!confirm(`Confirmar pagamento da fatura de ${selectedOption.textContent}?`)) return;

  const comprasParaPagar = todosOsDados.filter((item) => {
    if (item.Status === "Pago") return false;

    const formaPagamento = item.FormaPagamento || item.formaPagamento || "";
    if (formaPagamento !== "Cartão de Crédito") return false;

    if ((item.Cartao || "Principal") !== cartao) return false;

    const dataCompra = item.Data || item.data || "";
    const parcelaAtual = parseInt(item.ParcelaAtual || 1);
    const totalParcelas = parseInt(item.TotalParcelas || 1);

    if (!dataCompra || isNaN(parcelaAtual) || isNaN(totalParcelas)) return false;

    try {
      const faturas = calcularFaturasCartao(dataCompra, totalParcelas, cartao);
      if (faturas && faturas.length >= parcelaAtual) {
        const faturaAtual = faturas[parcelaAtual - 1];
        return faturaAtual.mes == mes && faturaAtual.ano == ano;
      }
    } catch (e) {}

    return false;
  });

  if (comprasParaPagar.length === 0) {
    alert("Nenhuma compra encontrada para esta fatura.");
    return;
  }

  const btn = document.querySelector("#modalPagamentoFatura button.bg-\\[\\#1f2937\\]");
  if (btn) {
    btn.innerText = "Processando...";
    btn.disabled = true;
  }

  try {
    for (const compra of comprasParaPagar) {
      const id = compra.ID || compra.id;
      if (id) {
        await fetch(API_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            acao: "pagar",
            id: id,
            usuario: usuarioLogado,
            dataPagamento: dataPagamento,
          }),
        });
      }
    }

    alert(`✅ Fatura paga com sucesso! ${comprasParaPagar.length} parcela(s) quitada(s).`);
    fecharModalPagamentoFatura();
    await atualizarTabela();
  } catch (error) {
    console.error("Erro ao pagar fatura:", error);
    alert("❌ Erro ao processar pagamento da fatura.");
  } finally {
    if (btn) {
      btn.innerText = "Confirmar";
      btn.disabled = false;
    }
  }
}

// ============================================
// FUNÇÕES DO MODAL PDF
// ============================================
function abrirModalPDF(tipo) {
  tipoPDFAtual = tipo;
  const modalContent = document.getElementById("conteudoModalPDF");

  let html = "";

  if (tipo === "vencimentos") {
    html = `
      <h4 class="font-bold mb-4 text-white text-sm sm:text-base">📊 Contas a Pagar</h4>
      <div class="space-y-3">
        <label class="flex items-center p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-[#2a2f3a] text-white text-sm sm:text-base">
          <input type="radio" name="pdfOpcao" value="todos" checked class="mr-3 text-[#84cc16]">
          <span>Todas as contas pendentes</span>
        </label>
        <label class="flex items-center p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-[#2a2f3a] text-white text-sm sm:text-base">
          <input type="radio" name="pdfOpcao" value="mesAtual" class="mr-3 text-[#84cc16]">
          <span>Apenas mês atual</span>
        </label>
        <label class="flex items-center p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-[#2a2f3a] text-white text-sm sm:text-base">
          <input type="radio" name="pdfOpcao" value="selecionarMes" class="mr-3 text-[#84cc16]">
          <span>Selecionar mês específico</span>
        </label>
        <div id="campoMesEspecifico" class="hidden mt-2">
          <select id="selectMesPDF" class="w-full border border-slate-700 rounded-lg p-3 bg-[#0f1217] text-white text-sm sm:text-base"></select>
        </div>
      </div>`;
  } else if (tipo === "historico") {
    html = `
      <h4 class="font-bold mb-4 text-white text-sm sm:text-base">📜 Histórico de Pagamentos</h4>
      <div class="space-y-3">
        <label class="flex items-center p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-[#2a2f3a] text-white text-sm sm:text-base">
          <input type="radio" name="pdfOpcao" value="todos" checked class="mr-3 text-[#84cc16]">
          <span>Todos os pagamentos</span>
        </label>
        <label class="flex items-center p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-[#2a2f3a] text-white text-sm sm:text-base">
          <input type="radio" name="pdfOpcao" value="mesAtual" class="mr-3 text-[#84cc16]">
          <span>Apenas mês atual</span>
        </label>
        <label class="flex items-center p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-[#2a2f3a] text-white text-sm sm:text-base">
          <input type="radio" name="pdfOpcao" value="selecionarMes" class="mr-3 text-[#84cc16]">
          <span>Selecionar mês específico</span>
        </label>
        <div id="campoMesEspecifico" class="hidden mt-2">
          <select id="selectMesPDF" class="w-full border border-slate-700 rounded-lg p-3 bg-[#0f1217] text-white text-sm sm:text-base"></select>
        </div>
      </div>`;
  } else if (tipo === "cartao") {
    const faturas = gerarListaFaturas();

    if (faturas.length === 0) {
      html = `<p class="text-center text-slate-400 py-4 text-sm">Nenhuma fatura disponível</p>`;
    } else {
      html = `
        <h4 class="font-bold mb-4 text-white text-sm sm:text-base">💳 Faturas do Cartão</h4>
        <div class="space-y-3">
          <label class="flex items-center p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-[#2a2f3a] text-white text-sm sm:text-base">
            <input type="radio" name="pdfOpcao" value="todasFaturas" checked class="mr-3 text-[#84cc16]">
            <span>Todas as faturas</span>
          </label>
          <label class="flex items-center p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-[#2a2f3a] text-white text-sm sm:text-base">
            <input type="radio" name="pdfOpcao" value="selecionarFatura" class="mr-3 text-[#84cc16]">
            <span>Selecionar fatura específica</span>
          </label>
          <div id="campoFaturaEspecifica" class="hidden mt-2">
            <select id="selectFaturaPDF" class="w-full border border-slate-700 rounded-lg p-3 bg-[#0f1217] text-white text-sm sm:text-base">`;

      faturas.forEach((fatura, index) => {
        html += `<option value="${index}" class="text-white">${fatura.nomeMes}/${fatura.ano} - ${fatura.cartao} - ${fatura.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</option>`;
      });

      html += `
            </select>
          </div>
        </div>`;
    }
  }

  modalContent.innerHTML = html;

  if (tipo === "vencimentos" || tipo === "historico") {
    const radios = document.querySelectorAll('input[name="pdfOpcao"]');
    radios.forEach((radio) => {
      radio.addEventListener("change", function () {
        const campoMes = document.getElementById("campoMesEspecifico");
        if (this.value === "selecionarMes") {
          campoMes.classList.remove("hidden");
          preencherSelectMeses();
        } else {
          campoMes.classList.add("hidden");
        }
      });
    });
  } else if (tipo === "cartao" && document.querySelector('input[name="pdfOpcao"]')) {
    const radios = document.querySelectorAll('input[name="pdfOpcao"]');
    radios.forEach((radio) => {
      radio.addEventListener("change", function () {
        const campoFatura = document.getElementById("campoFaturaEspecifica");
        if (this.value === "selecionarFatura") {
          campoFatura.classList.remove("hidden");
        } else {
          campoFatura.classList.add("hidden");
        }
      });
    });
  }

  document.getElementById("modalPDF").classList.remove("hidden");
  document.getElementById("modalPDF").classList.add("flex");
}

function fecharModalPDF() {
  document.getElementById("modalPDF").classList.add("hidden");
  document.getElementById("modalPDF").classList.remove("flex");
  tipoPDFAtual = "";
}

function preencherSelectMeses() {
  const select = document.getElementById("selectMesPDF");
  if (!select) return;

  select.innerHTML = "";

  const mesesSet = new Set();

  todosOsDados.forEach((item) => {
    const dataStr = item.Data || item.data || item.Vencimento || "";
    if (dataStr) {
      try {
        const data = new Date(dataStr + "T12:00:00");
        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();
        mesesSet.add(`${mes}/${ano}`);
      } catch (e) {}
    }
  });

  const mesesArray = Array.from(mesesSet).sort((a, b) => {
    const [mesA, anoA] = a.split("/").map(Number);
    const [mesB, anoB] = b.split("/").map(Number);
    return anoB - anoA || mesB - mesA;
  });

  const mesesNomes = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
  ];

  mesesArray.forEach((mesAno) => {
    const [mes, ano] = mesAno.split("/").map(Number);
    const option = document.createElement("option");
    option.value = mesAno;
    option.textContent = `${mesesNomes[mes - 1]}/${ano}`;
    select.appendChild(option);
  });
}

function confirmarGerarPDF() {
  const { jsPDF } = window.jspdf;

  if (!jsPDF) {
    alert("Biblioteca jsPDF não carregada. Recarregue a página.");
    return;
  }

  let dadosParaPDF = [];
  let titulo = "";

  if (tipoPDFAtual === "vencimentos") {
    const opcao = document.querySelector('input[name="pdfOpcao"]:checked')?.value;

    if (opcao === "todos") {
      dadosParaPDF = todosOsDados.filter((item) => item.Status !== "Pago");
      titulo = "Todas as Contas Pendentes";
    } else if (opcao === "mesAtual") {
      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1;
      const anoAtual = hoje.getFullYear();

      dadosParaPDF = todosOsDados.filter((item) => {
        if (item.Status === "Pago") return false;
        const dataStr = item.Data || item.data || item.Vencimento || "";
        if (!dataStr) return false;
        try {
          const data = new Date(dataStr + "T12:00:00");
          return data.getMonth() + 1 === mesAtual && data.getFullYear() === anoAtual;
        } catch (e) {
          return false;
        }
      });
      titulo = `Contas Pendentes - ${mesesNomes[mesAtual - 1]}/${anoAtual}`;
    } else if (opcao === "selecionarMes") {
      const select = document.getElementById("selectMesPDF");
      if (!select) return;

      const [mes, ano] = select.value.split("/").map(Number);

      dadosParaPDF = todosOsDados.filter((item) => {
        if (item.Status === "Pago") return false;
        const dataStr = item.Data || item.data || item.Vencimento || "";
        if (!dataStr) return false;
        try {
          const data = new Date(dataStr + "T12:00:00");
          return data.getMonth() + 1 === mes && data.getFullYear() === ano;
        } catch (e) {
          return false;
        }
      });
      titulo = `Contas Pendentes - ${mesesNomes[mes - 1]}/${ano}`;
    }
  } else if (tipoPDFAtual === "historico") {
    const opcao = document.querySelector('input[name="pdfOpcao"]:checked')?.value;

    if (opcao === "todos") {
      dadosParaPDF = todosOsPagos;
      titulo = "Todos os Pagamentos Realizados";
    } else if (opcao === "mesAtual") {
      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1;
      const anoAtual = hoje.getFullYear();

      dadosParaPDF = todosOsPagos.filter((item) => {
        const dataStr = item.Data || item.data || item.Vencimento || "";
        if (!dataStr) return false;
        try {
          const data = new Date(dataStr + "T12:00:00");
          return data.getMonth() + 1 === mesAtual && data.getFullYear() === anoAtual;
        } catch (e) {
          return false;
        }
      });
      titulo = `Pagamentos Realizados - ${mesesNomes[mesAtual - 1]}/${anoAtual}`;
    } else if (opcao === "selecionarMes") {
      const select = document.getElementById("selectMesPDF");
      if (!select) return;

      const [mes, ano] = select.value.split("/").map(Number);

      dadosParaPDF = todosOsPagos.filter((item) => {
        const dataStr = item.Data || item.data || item.Vencimento || "";
        if (!dataStr) return false;
        try {
          const data = new Date(dataStr + "T12:00:00");
          return data.getMonth() + 1 === mes && data.getFullYear() === ano;
        } catch (e) {
          return false;
        }
      });
      titulo = `Pagamentos Realizados - ${mesesNomes[mes - 1]}/${ano}`;
    }
  } else if (tipoPDFAtual === "cartao") {
    const opcao = document.querySelector('input[name="pdfOpcao"]:checked')?.value;

    if (opcao === "todasFaturas") {
      dadosParaPDF = todosOsDados.filter(
        (item) => item.FormaPagamento === "Cartão de Crédito" || item.formaPagamento === "Cartão de Crédito"
      );
      titulo = "Todas as Compras no Cartão";
    } else if (opcao === "selecionarFatura") {
      const select = document.getElementById("selectFaturaPDF");
      if (!select) return;

      const index = parseInt(select.value);
      const faturas = gerarListaFaturas();
      const faturaSelecionada = faturas[index];

      if (faturaSelecionada) {
        dadosParaPDF = todosOsDados.filter((item) => {
          if (item.Status === "Pago") return false;

          const formaPagamento = item.FormaPagamento || item.formaPagamento || "";
          if (formaPagamento !== "Cartão de Crédito") return false;

          if ((item.Cartao || "Principal") !== faturaSelecionada.cartao) return false;

          const dataCompra = item.Data || item.data || "";
          const parcelaAtual = parseInt(item.ParcelaAtual || 1);
          const totalParcelas = parseInt(item.TotalParcelas || 1);

          if (!dataCompra || isNaN(parcelaAtual) || isNaN(totalParcelas)) return false;

          try {
            const faturas = calcularFaturasCartao(dataCompra, totalParcelas, faturaSelecionada.cartao);
            if (faturas && faturas.length >= parcelaAtual) {
              const faturaAtual = faturas[parcelaAtual - 1];
              return faturaAtual.mes == faturaSelecionada.mes && faturaAtual.ano == faturaSelecionada.ano;
            }
          } catch (e) {}

          return false;
        });

        titulo = `Fatura - ${faturaSelecionada.nomeMes}/${faturaSelecionada.ano} - ${faturaSelecionada.cartao}`;
      }
    }
  }

  if (dadosParaPDF.length === 0) {
    alert("Nenhum dado encontrado para o período selecionado.");
    fecharModalPDF();
    return;
  }

  gerarPDFComDados(dadosParaPDF, titulo);
  fecharModalPDF();
}

// ============================================
// FUNÇÃO CORRIGIDA - GERAR PDF
// ============================================
// ============================================
// FUNÇÃO MELHORADA - GERAR PDF PROFISSIONAL
// ============================================
function gerarPDFComDados(dados, titulo) {
    try {
        console.log("📄 Gerando PDF com", dados.length, "registros");
        
        if (typeof window.jspdf === 'undefined') {
            console.error("❌ jsPDF não carregado");
            alert("Erro: Biblioteca PDF não carregada. Recarregue a página.");
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait', // Mudamos para retrato para melhor visualização
            unit: 'mm',
            format: 'a4'
        });

        // Cores do tema
        const corPrimaria = [132, 204, 22]; // #84cc16 - Verde
        const corSecundaria = [26, 30, 38]; // #1a1e26 - Cinza escuro
        const corTexto = [255, 255, 255]; // Branco
        const corDestaque = [255, 193, 7]; // Amarelo para alertas

        // ===== CABEÇALHO =====
        // Logo e título
        doc.setFillColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setFontSize(24);
        doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
        doc.setFont("helvetica", "bold");
        doc.text("FINANWF", 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(corTexto[0], corTexto[1], corTexto[2]);
        doc.setFont("helvetica", "normal");
        doc.text("Sistema Financeiro Pessoal", 14, 28);

        // Data e usuário
        doc.setFontSize(9);
        doc.setTextColor(180, 180, 180);
        const dataAtual = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
        doc.text(`Gerado em: ${dataAtual}`, 140, 15);
        doc.text(`Usuário: ${usuarioLogado}`, 140, 22);

        // ===== TÍTULO DO RELATÓRIO =====
        doc.setDrawColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
        doc.setLineWidth(0.5);
        doc.line(14, 45, 196, 45);
        
        doc.setFontSize(16);
        doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
        doc.setFont("helvetica", "bold");
        doc.text(titulo, 14, 55);

        // ===== RESUMO EXECUTIVO =====
        let yPos = 65;
        
        // Calcula totais
        const totalGeral = dados.reduce((sum, item) => sum + (parseFloat(item.Valor || item.valor || 0)), 0);
        const totalPendente = dados.filter(item => (item.Status || "") !== "Pago").reduce((sum, item) => sum + (parseFloat(item.Valor || item.valor || 0)), 0);
        const totalPago = dados.filter(item => (item.Status || "") === "Pago").reduce((sum, item) => sum + (parseFloat(item.Valor || item.valor || 0)), 0);
        
        // Receita e percentuais
        const receita = configuracoesGlobais.salario || 4000;
        const percentualGasto = receita > 0 ? ((totalPendente + totalPago) / receita * 100).toFixed(1) : 0;
        
        // Card de resumo
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(14, yPos, 182, 35, 3, 3, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("RESUMO EXECUTIVO", 20, yPos + 7);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Total de Registros: ${dados.length}`, 20, yPos + 14);
        doc.text(`Total Geral: ${formatarMoeda(totalGeral)}`, 20, yPos + 21);
        doc.text(`% do Orçamento: ${percentualGasto}%`, 20, yPos + 28);
        
        doc.text(`Total Pendente: ${formatarMoeda(totalPendente)}`, 100, yPos + 14);
        doc.text(`Total Pago: ${formatarMoeda(totalPago)}`, 100, yPos + 21);
        
        // Indicador de saúde financeira
        const saude = totalPendente > receita * 0.5 ? "⚠️ Atenção" : "✅ Saudável";
        doc.text(`Saúde Financeira: ${saude}`, 100, yPos + 28);
        
        yPos += 45;

        // ===== GRÁFICO DE BARRAS SIMPLIFICADO =====
        if (dados.length > 0) {
            // Agrupa por categoria
            const categorias = {};
            dados.forEach(item => {
                const cat = item.Categoria || item.categoria || "Outros";
                const val = parseFloat(item.Valor || item.valor || 0);
                categorias[cat] = (categorias[cat] || 0) + val;
            });
            
            const catLabels = Object.keys(categorias).slice(0, 5); // Top 5
            const catValues = Object.values(categorias).slice(0, 5);
            const maxValor = Math.max(...catValues, 0.01);
            
            doc.setFontSize(10);
            doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
            doc.setFont("helvetica", "bold");
            doc.text("DISTRIBUIÇÃO POR CATEGORIA (Top 5)", 14, yPos);
            
            yPos += 7;
            
            catLabels.forEach((cat, index) => {
                const valor = catValues[index];
                const percentual = (valor / totalGeral * 100).toFixed(1);
                const barWidth = (valor / maxValor) * 80; // Máximo 80mm
                
                doc.setFillColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
                doc.roundedRect(14, yPos, barWidth, 4, 1, 1, 'F');
                
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.text(`${cat} (${percentual}%)`, 100, yPos + 3);
                doc.text(formatarMoeda(valor), 160, yPos + 3, { align: 'right' });
                
                yPos += 7;
            });
            
            yPos += 5;
        }

        // ===== TABELA DE DADOS =====
        doc.setFontSize(10);
        doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
        doc.setFont("helvetica", "bold");
        doc.text("DETALHAMENTO", 14, yPos);
        
        yPos += 5;

        // Preparar dados da tabela
        const tableColumn = [
            { header: 'Descrição', dataKey: 'descricao' },
            { header: 'Categoria', dataKey: 'categoria' },
            { header: 'Forma', dataKey: 'forma' },
            { header: 'Venc.', dataKey: 'data' },
            { header: 'Parc', dataKey: 'parcelas' },
            { header: 'Valor (R$)', dataKey: 'valor' },
            { header: 'Status', dataKey: 'status' }
        ];
        
        const tableRows = [];

        dados.forEach((item, index) => {
            if (index >= 30) return; // Limite para não sobrecarregar
            
            const descricao = item.Descrição || item.Descricao || "Sem descrição";
            const categoria = item.Categoria || item.categoria || "Outros";
            const forma = item.FormaPagamento || item.formaPagamento || "N/A";
            const data = item.Data || item.data || item.Vencimento || "";
            const valor = parseFloat(item.Valor || item.valor || 0);
            const status = item.Status || "Pendente";

            const parcelaAtual = item.ParcelaAtual || "1";
            const totalParcelas = item.TotalParcelas || "1";
            const parcelas = `${parcelaAtual}/${totalParcelas}`;

            let dataFormatada = data;
            if (data && data.includes("-")) {
                const [ano, mes, dia] = data.split("-");
                dataFormatada = `${dia}/${mes}`;
            }

            tableRows.push({
                descricao: descricao.substring(0, 20) + (descricao.length > 20 ? "..." : ""),
                categoria: categoria,
                forma: forma === "Cartão de Crédito" ? "Cartão" : forma,
                data: dataFormatada,
                parcelas: parcelas,
                valor: formatarMoedaSemSimbolo(valor),
                status: status
            });
        });

        // Gerar tabela
        doc.autoTable({
            startY: yPos + 5,
            head: [tableColumn.map(col => col.header)],
            body: tableRows.map(row => tableColumn.map(col => row[col.dataKey])),
            theme: 'grid',
            headStyles: { 
                fillColor: corPrimaria, 
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                fontSize: 8,
                halign: 'center'
            },
            styles: { 
                fontSize: 7,
                cellPadding: 2,
                textColor: [0, 0, 0],
                lineColor: [200, 200, 200],
                lineWidth: 0.1
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 20 },
                2: { cellWidth: 18 },
                3: { cellWidth: 15 },
                4: { cellWidth: 12 },
                5: { cellWidth: 22, halign: 'right' },
                6: { cellWidth: 15, halign: 'center' }
            },
            didDrawPage: function(data) {
                // Rodapé em cada página
                doc.setFontSize(7);
                doc.setTextColor(150, 150, 150);
                doc.text('FINANWF - Sistema Financeiro Pessoal', 14, 285);
                doc.text(`Página ${data.pageNumber}`, 180, 285, { align: 'right' });
            }
        });

        // ===== RODAPÉ =====
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Linha do rodapé
            doc.setDrawColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
            doc.setLineWidth(0.3);
            doc.line(14, 277, 196, 277);
            
            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            doc.setFont("helvetica", "italic");
            doc.text('Este relatório é gerado automaticamente pelo sistema FINANWF.', 14, 282);
            doc.text(`www.finanwf.com.br`, 180, 282, { align: 'right' });
        }

        // ===== SALVAR PDF =====
        const nomeArquivo = `FINANWF_${titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
        doc.save(nomeArquivo);
        
        console.log("✅ PDF gerado com sucesso:", nomeArquivo);
        
        // Mostrar resumo
        alert(`✅ PDF gerado com sucesso!\n\n📊 Resumo:\n• Total de registros: ${dados.length}\n• Valor total: ${formatarMoeda(totalGeral)}\n• % do orçamento: ${percentualGasto}%`);
        
    } catch (error) {
        console.error("❌ Erro ao gerar PDF:", error);
        alert("Erro ao gerar PDF: " + error.message);
    }
}

// ============================================
// FUNÇÕES AUXILIARES DE FORMATAÇÃO
// ============================================
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatarMoedaSemSimbolo(valor) {
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ============================================
// CONFIRMAR EXCLUSÃO DE LANÇAMENTO
// ============================================
function confirmarExcluirLancamento(id, descricao, event) {
  if (!id) {
    alert("ID do registro não encontrado");
    return;
  }

  const confirmacao = confirm(
    `⚠️ EXCLUIR LANÇAMENTO?\n\n` +
    `Descrição: ${descricao}\n` +
    `ID: ${id}\n\n` +
    `Esta ação irá REMOVER PERMANENTEMENTE este lançamento.\n` +
    `📌 Esta ação NÃO pode ser desfeita.\n\n` +
    `Deseja realmente excluir?`
  );

  if (confirmacao) {
    excluirLancamento(id, event);
  }
}

// ============================================
// EXCLUIR LANÇAMENTO (APENAS PENDENTES)
// ============================================
async function excluirLancamento(id, event) {
  if (!id) {
    alert("ID do registro não encontrado");
    return;
  }

  if (!usuarioLogado) {
    alert("❌ Usuário não identificado. Faça login novamente.");
    return;
  }

  const btn = event?.target?.closest('button') || event?.target;
  if (btn) {
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
  }

  try {
    console.log("🗑️ Excluindo lançamento:", id, "do usuário:", usuarioLogado);
    
    const url = `${API_URL}?acao=excluirLancamento&id=${encodeURIComponent(id)}&usuario=${encodeURIComponent(usuarioLogado)}&_=${Date.now()}`;
    
    const response = await fetch(url);
    const resultado = await response.json();

    if (resultado.sucesso) {
      alert("✅ Lançamento excluído com sucesso!");
      
      // Recarrega os dados
      await atualizarTabela();
      
    } else {
      alert("❌ Erro ao excluir: " + (resultado.erro || "Erro desconhecido"));
    }
  } catch (error) {
    console.error("❌ Erro na requisição:", error);
    alert("❌ Erro de conexão. Tente novamente.");
  } finally {
    if (btn) {
      btn.innerHTML = '<i class="fas fa-trash"></i>';
      btn.disabled = false;
    }
  }
}
// ============================================
// FUNÇÕES DO MENU FIXO - VERSÃO CORRIGIDA
// ============================================
function garantirMenuFixo() {
    // Só executa se o app estiver visível
    if (document.getElementById("app").classList.contains("hidden")) {
        return;
    }
    
    const menu = document.querySelector(".mobile-bottom-nav");
    if (menu) {
        menu.style.position = "fixed";
        menu.style.bottom = "0";
        menu.style.left = "0";
        menu.style.right = "0";
        menu.style.zIndex = "999999";
        menu.style.display = window.innerWidth <= 768 ? "flex" : "none";
        menu.style.backgroundColor = "#1a1e26";
        menu.style.borderTop = "1px solid #2a2f3a";
        menu.style.padding = "8px 4px";
        menu.style.boxShadow = "0 -4px 10px rgba(0,0,0,0.3)";
    }

    if (window.innerWidth <= 768 && !document.getElementById("app").classList.contains("hidden")) {
        document.body.style.paddingBottom = "70px";
    } else {
        document.body.style.paddingBottom = "0";
    }
}

// Modificar os event listeners para verificar se o app está visível
window.addEventListener("load", function() {
    if (!document.getElementById("app").classList.contains("hidden")) {
        garantirMenuFixo();
    }
});

window.addEventListener("resize", function() {
    if (!document.getElementById("app").classList.contains("hidden")) {
        garantirMenuFixo();
    }
});

window.addEventListener("scroll", function() {
    if (!document.getElementById("app").classList.contains("hidden")) {
        garantirMenuFixo();
    }
});

// Remover o setInterval que fica rodando sempre
// setInterval(garantirMenuFixo, 1000); // REMOVA ESTA LINHA

// ============================================
// VERIFICAR LOGO
// ============================================
function verificarLogos() {
  const logos = document.querySelectorAll('img[src*="assets/logo"]');
  logos.forEach((logo) => {
    logo.onerror = function () {
      console.warn("Logo não carregou, usando fallback");
      this.classList.add("error");

      const fallback = document.createElement("span");
      fallback.className = "logo-fallback";
      fallback.textContent = "💰";
      this.parentNode.insertBefore(fallback, this.nextSibling);
    };

    logo.onload = function () {
      console.log("Logo carregado com sucesso");
      this.classList.add("logo-image");
    };
  });
}

window.addEventListener("load", verificarLogos);

// ============================================
// REGISTRAR SERVICE WORKER PARA PWA
// ============================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log("ServiceWorker registrado com sucesso: ", registration.scope);
      })
      .catch((error) => {
        console.log("Falha ao registrar ServiceWorker: ", error);
      });
  });
}

// ============================================
// FUNÇÃO PARA INSTALAR O APP
// ============================================
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  criarBotaoInstalacao();
});

function criarBotaoInstalacao() {
  if (document.getElementById("btnInstalarPWA")) return;

  const configContainer = document.getElementById("containerCartoesConfig");
  if (configContainer) {
    const btnInstall = document.createElement("div");
    btnInstall.id = "btnInstalarPWA";
    btnInstall.className = "mt-6 pt-4 border-t border-slate-700";
    btnInstall.innerHTML = `
      <button onclick="instalarPWA()" 
              class="w-full bg-[#2a2f3a] text-[#84cc16] py-3 rounded-xl font-bold hover:bg-[#84cc16] hover:text-[#0f1217] transition touch-button flex items-center justify-center gap-2">
        <i class="fas fa-download"></i>
        Instalar App
      </button>`;
    configContainer.parentNode.insertBefore(btnInstall, configContainer.nextSibling);
  }
}

function instalarPWA() {
  if (!deferredPrompt) {
    alert("Seu navegador já tem o app instalado ou não suporta instalação automática.");
    return;
  }

  deferredPrompt.prompt();

  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === "accepted") {
      console.log("Usuário aceitou instalar o app");
    } else {
      console.log("Usuário recusou instalar o app");
    }
    deferredPrompt = null;
  });
}



// ============================================
// FUNÇÃO ABRIR MODAL PDF - VERSÃO MELHORADA
// ============================================
function abrirModalPDF(tipo) {
    tipoPDFAtual = tipo;
    const modalContent = document.getElementById("conteudoModalPDF");

    let html = "";
    
    const mesesNomes = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    if (tipo === "vencimentos") {
        html = `
            <div class="space-y-4">
                <h4 class="font-bold text-white text-base flex items-center gap-2">
                    <i class="fas fa-clock text-[#84cc16]"></i>
                    Contas a Pagar
                </h4>
                
                <div class="space-y-3">
                    <label class="pdf-option flex items-center p-4 border border-slate-700 rounded-xl cursor-pointer hover:border-[#84cc16] transition-all bg-[#0f1217]">
                        <input type="radio" name="pdfOpcao" value="todos" checked class="mr-3 text-[#84cc16] w-5 h-5">
                        <div class="flex-1">
                            <span class="font-medium text-white">Todas as contas pendentes</span>
                            <p class="text-xs text-slate-400 mt-1">Inclui todas as contas não pagas</p>
                        </div>
                    </label>
                    
                    <label class="pdf-option flex items-center p-4 border border-slate-700 rounded-xl cursor-pointer hover:border-[#84cc16] transition-all bg-[#0f1217]">
                        <input type="radio" name="pdfOpcao" value="mesAtual" class="mr-3 text-[#84cc16] w-5 h-5">
                        <div class="flex-1">
                            <span class="font-medium text-white">Apenas mês atual</span>
                            <p class="text-xs text-slate-400 mt-1">${mesesNomes[new Date().getMonth()]}/${new Date().getFullYear()}</p>
                        </div>
                    </label>
                    
                    <label class="pdf-option flex items-center p-4 border border-slate-700 rounded-xl cursor-pointer hover:border-[#84cc16] transition-all bg-[#0f1217]">
                        <input type="radio" name="pdfOpcao" value="selecionarMes" class="mr-3 text-[#84cc16] w-5 h-5">
                        <div class="flex-1">
                            <span class="font-medium text-white">Selecionar mês específico</span>
                            <p class="text-xs text-slate-400 mt-1">Escolha um mês para gerar o relatório</p>
                        </div>
                    </label>
                    
                    <div id="campoMesEspecifico" class="hidden mt-2 pl-7">
                        <select id="selectMesPDF" class="pdf-select">
                            <option value="">Carregando...</option>
                        </select>
                    </div>
                </div>
            </div>`;
            
    } else if (tipo === "historico") {
        html = `
            <div class="space-y-4">
                <h4 class="font-bold text-white text-base flex items-center gap-2">
                    <i class="fas fa-history text-[#84cc16]"></i>
                    Histórico de Pagamentos
                </h4>
                
                <div class="space-y-3">
                    <label class="pdf-option flex items-center p-4 border border-slate-700 rounded-xl cursor-pointer hover:border-[#84cc16] transition-all bg-[#0f1217]">
                        <input type="radio" name="pdfOpcao" value="todos" checked class="mr-3 text-[#84cc16] w-5 h-5">
                        <div class="flex-1">
                            <span class="font-medium text-white">Todos os pagamentos</span>
                            <p class="text-xs text-slate-400 mt-1">Histórico completo de contas pagas</p>
                        </div>
                    </label>
                    
                    <label class="pdf-option flex items-center p-4 border border-slate-700 rounded-xl cursor-pointer hover:border-[#84cc16] transition-all bg-[#0f1217]">
                        <input type="radio" name="pdfOpcao" value="mesAtual" class="mr-3 text-[#84cc16] w-5 h-5">
                        <div class="flex-1">
                            <span class="font-medium text-white">Apenas mês atual</span>
                            <p class="text-xs text-slate-400 mt-1">${mesesNomes[new Date().getMonth()]}/${new Date().getFullYear()}</p>
                        </div>
                    </label>
                    
                    <label class="pdf-option flex items-center p-4 border border-slate-700 rounded-xl cursor-pointer hover:border-[#84cc16] transition-all bg-[#0f1217]">
                        <input type="radio" name="pdfOpcao" value="selecionarMes" class="mr-3 text-[#84cc16] w-5 h-5">
                        <div class="flex-1">
                            <span class="font-medium text-white">Selecionar mês específico</span>
                            <p class="text-xs text-slate-400 mt-1">Escolha um mês para ver os pagamentos</p>
                        </div>
                    </label>
                    
                    <div id="campoMesEspecifico" class="hidden mt-2 pl-7">
                        <select id="selectMesPDF" class="pdf-select">
                            <option value="">Carregando...</option>
                        </select>
                    </div>
                </div>
            </div>`;
            
    } else if (tipo === "cartao") {
        const faturas = gerarListaFaturas();

        if (faturas.length === 0) {
            html = `
                <div class="text-center py-8">
                    <i class="fas fa-credit-card text-5xl text-slate-600 mb-3"></i>
                    <p class="text-slate-400 text-sm">Nenhuma fatura disponível</p>
                </div>`;
        } else {
            html = `
                <div class="space-y-4">
                    <h4 class="font-bold text-white text-base flex items-center gap-2">
                        <i class="fas fa-credit-card text-[#84cc16]"></i>
                        Faturas do Cartão
                    </h4>
                    
                    <div class="space-y-3">
                        <label class="pdf-option flex items-center p-4 border border-slate-700 rounded-xl cursor-pointer hover:border-[#84cc16] transition-all bg-[#0f1217]">
                            <input type="radio" name="pdfOpcao" value="todasFaturas" checked class="mr-3 text-[#84cc16] w-5 h-5">
                            <div class="flex-1">
                                <span class="font-medium text-white">Todas as faturas</span>
                                <p class="text-xs text-slate-400 mt-1">Resumo completo de todas as faturas</p>
                            </div>
                        </label>
                        
                        <label class="pdf-option flex items-center p-4 border border-slate-700 rounded-xl cursor-pointer hover:border-[#84cc16] transition-all bg-[#0f1217]">
                            <input type="radio" name="pdfOpcao" value="selecionarFatura" class="mr-3 text-[#84cc16] w-5 h-5">
                            <div class="flex-1">
                                <span class="font-medium text-white">Selecionar fatura específica</span>
                                <p class="text-xs text-slate-400 mt-1">Escolha uma fatura para detalhar</p>
                            </div>
                        </label>
                        
                        <div id="campoFaturaEspecifica" class="hidden mt-2 pl-7">
                            <select id="selectFaturaPDF" class="pdf-select">
                                ${faturas.map((fatura, index) => 
                                    `<option value="${index}">${fatura.nomeMes}/${fatura.ano} - ${fatura.cartao} - ${fatura.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                </div>`;
        }
    }

    modalContent.innerHTML = html;

    // Adiciona eventos para mostrar/esconder campos
    const radios = document.querySelectorAll('input[name="pdfOpcao"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (tipo === "vencimentos" || tipo === "historico") {
                const campoMes = document.getElementById("campoMesEspecifico");
                if (this.value === "selecionarMes") {
                    campoMes.classList.remove("hidden");
                    preencherSelectMeses();
                } else {
                    campoMes.classList.add("hidden");
                }
            } else if (tipo === "cartao") {
                const campoFatura = document.getElementById("campoFaturaEspecifica");
                if (this.value === "selecionarFatura") {
                    campoFatura.classList.remove("hidden");
                } else {
                    campoFatura.classList.add("hidden");
                }
            }
        });
    });

    document.getElementById("modalPDF").classList.remove("hidden");
    document.getElementById("modalPDF").classList.add("flex");
}

// ============================================
// FUNÇÃO PARA LIMPAR HISTÓRICO DO USUÁRIO
// ============================================
// Variável global para armazenar dados da exclusão
let exclusaoPendente = {
    totalRegistros: 0
};

// ============================================
// FUNÇÃO PARA ABRIR MODAL DE CONFIRMAÇÃO
// ============================================
function confirmarLimparHistorico() {
    // Verificação reforçada
    verificarUsuarioLogado();
    
    if (!usuarioLogado) {
        alert("❌ Usuário não identificado. Tente fazer login novamente.");
        return;
    }

    const totalRegistros = todosOsPagos.length;
    
    if (totalRegistros === 0) {
        alert("📭 Seu histórico já está vazio. Nenhum registro para limpar.");
        return;
    }

    // Salva os dados para uso posterior
    exclusaoPendente = {
        totalRegistros: totalRegistros,
        usuario: usuarioLogado
    };

    // Atualiza o modal
    document.getElementById("modalExclusaoUsuario").innerText = usuarioLogado;
    document.getElementById("modalExclusaoTotal").innerText = totalRegistros;
    
    // Limpa o campo de senha
    document.getElementById("inputSenhaExclusao").value = "";
    
    // Abre o modal
    document.getElementById("modalConfirmarExclusao").classList.remove("hidden");
    document.getElementById("modalConfirmarExclusao").classList.add("flex");
}

// ============================================
// FECHAR MODAL
// ============================================
function fecharModalExclusao() {
    document.getElementById("modalConfirmarExclusao").classList.add("hidden");
    document.getElementById("modalConfirmarExclusao").classList.remove("flex");
    document.getElementById("inputSenhaExclusao").value = "";
}

// ============================================
// EXECUTAR LIMPEZA COM VERIFICAÇÃO DE SENHA
// ============================================
async function executarLimpezaComSenha() {
    const senha = document.getElementById("inputSenhaExclusao").value.trim();
    
    if (!senha) {
        alert("❌ Digite sua senha para confirmar a exclusão.");
        return;
    }

    if (!usuarioLogado) {
        alert("❌ Usuário não identificado. Faça login novamente.");
        fecharModalExclusao();
        return;
    }

    // Fecha o modal
    fecharModalExclusao();

    // Desabilita o botão original
    const btn = document.querySelector('#tab-historico button.bg-rose-500\\/20');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Verificando...';
        btn.disabled = true;
    }

    try {
        // PRIMEIRO: Verifica se a senha está correta
        console.log("🔐 Verificando senha para:", usuarioLogado);
        
        const urlVerificar = `${API_URL}?acao=verificarSenha&email=${encodeURIComponent(usuarioLogado)}&senha=${encodeURIComponent(senha)}&_=${Date.now()}`;
        
        const responseVerificar = await fetch(urlVerificar);
        const resultadoVerificar = await responseVerificar.json();

        if (!resultadoVerificar.valido) {
            alert("❌ Senha incorreta! Operação cancelada.");
            if (btn) {
                btn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i> Limpar Meu Histórico';
                btn.disabled = false;
            }
            return;
        }

        console.log("✅ Senha verificada, prosseguindo com exclusão...");

        // SEGUNDO: Executa a limpeza
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Excluindo...';
        }

        const urlLimpar = `${API_URL}?acao=limparHistorico&usuario=${encodeURIComponent(usuarioLogado)}&_=${Date.now()}`;
        
        const responseLimpar = await fetch(urlLimpar);
        const resultadoLimpar = await responseLimpar.json();

        if (resultadoLimpar.sucesso) {
            alert(`✅ Histórico limpo com sucesso!\n\n📊 Total de registros removidos: ${resultadoLimpar.totalRemovido || 0}`);
            
            // Atualiza a lista local
            todosOsPagos = [];
            
            // Atualiza a tabela
            renderizarLinhasPagos([], "corpoTabelaPagos");
            
            // Atualiza os cards
            const pendentes = todosOsDados.filter(item => item.Status !== "Pago");
            atualizarCardsFinanceiros(pendentes, []);
            
            // Recarrega os dados completos para garantir consistência
            await atualizarTabela();
            
        } else {
            alert("❌ Erro ao limpar histórico: " + (resultadoLimpar.erro || "Erro desconhecido"));
        }
    } catch (error) {
        console.error("❌ Erro na requisição:", error);
        alert("❌ Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i> Limpar Meu Histórico';
            btn.disabled = false;
        }
    }
}

async function limparHistoricoUsuario() {
    if (!usuarioLogado) {
        alert("❌ Usuário não identificado. Faça login novamente.");
        return;
    }

    console.log("🔄 Usuário logado:", usuarioLogado); // Debug

    const btn = document.querySelector('#tab-historico button.bg-rose-500\\/20');
    if (btn) {
        const textoOriginal = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Limpando...';
        btn.disabled = true;
    }

    try {
        // CORREÇÃO: Passar o usuário como parâmetro na URL corretamente
        const url = `${API_URL}?acao=limparHistorico&usuario=${encodeURIComponent(usuarioLogado)}&_=${Date.now()}`;
        
        console.log("📤 Enviando requisição:", url);
        
        const response = await fetch(url);
        const resultado = await response.json();

        console.log("📥 Resposta:", resultado);

        if (resultado.sucesso) {
            alert(`✅ Histórico limpo com sucesso!\n\n📊 Total de registros removidos: ${resultado.totalRemovido || 0}`);
            
            // Atualiza a lista local
            todosOsPagos = [];
            
            // Atualiza a tabela
            renderizarLinhasPagos([], "corpoTabelaPagos");
            
            // Atualiza os cards
            const pendentes = todosOsDados.filter(item => item.Status !== "Pago");
            atualizarCardsFinanceiros(pendentes, []);
            
            // Recarrega os dados completos para garantir consistência
            await atualizarTabela();
            
        } else {
            alert("❌ Erro ao limpar histórico: " + (resultado.erro || "Erro desconhecido"));
        }
    } catch (error) {
        console.error("❌ Erro na requisição:", error);
        alert("❌ Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i> Limpar Meu Histórico';
            btn.disabled = false;
        }
    }
}

// Função de emergência para limpar histórico local (caso a API falhe)
function limparHistoricoLocal() {
    if (!usuarioLogado) return;
    
    const confirmacao = confirm(
        "⚠️ Limpeza LOCAL apenas?\n\n" +
        "Isso limpará apenas a visualização, mas os dados permanecerão na planilha.\n\n" +
        "Deseja continuar?"
    );
    
    if (confirmacao) {
        todosOsPagos = [];
        renderizarLinhasPagos([], "corpoTabelaPagos");
        atualizarCardsFinanceiros(
            todosOsDados.filter(item => item.Status !== "Pago"), 
            []
        );
        alert("✅ Histórico limpo localmente. Os dados ainda estão na planilha.");
    }
}

// Função para debug - verificar usuário logado
function verificarUsuarioLogado() {
    console.log("🔍 Verificando usuário logado:");
    console.log("usuarioLogado:", usuarioLogado);
    console.log("localStorage userFinan:", localStorage.getItem("userFinan"));
    console.log("localStorage logadoFinan:", localStorage.getItem("logadoFinan"));
    
    if (!usuarioLogado && localStorage.getItem("logadoFinan") === "true") {
        // Tenta recuperar do localStorage
        usuarioLogado = localStorage.getItem("userFinan");
        console.log("🔄 Usuário recuperado do localStorage:", usuarioLogado);
    }
    
    return usuarioLogado;
}


window.addEventListener("appinstalled", (evt) => {
  console.log("App foi instalado com sucesso!");
  const btn = document.getElementById("btnInstalarPWA");
  if (btn) btn.remove();
});
// ============================================
// VARIÁVEIS GLOBAIS PARA EXCLUSÃO
// ============================================
let exclusaoSelecionada = {
    id: null,
    descricao: '',
    categoria: '',
    valor: 0
};

let exclusaoSelecionadaVencimentos = {
    id: null,
    descricao: '',
    categoria: '',
    valor: 0
};


// ============================================
// ABRIR MODAL DE EXCLUSÃO PARA HISTÓRICO
// ============================================
function abrirModalExclusaoOpcoes(id, descricao, categoria, valor) {
    if (!id) {
        alert("ID do registro não encontrado");
        return;
    }

    origemExclusaoAtual = 'historico';

    exclusaoSelecionada = {
        id: id,
        descricao: descricao,
        categoria: categoria,
        valor: valor
    };

    const itensMesmaCategoria = todosOsPagos.filter(item => {
        const catItem = item.Categoria || item.categoria || "Outros";
        return catItem === categoria;
    });

    document.getElementById("infoExclusaoOpcoes").innerHTML = `
        <div class="bg-[#0f1217] p-4 rounded-xl border border-slate-700">
            <div class="flex justify-between text-sm mb-2">
                <span class="text-slate-400">Item selecionado:</span>
                <span class="text-white font-bold">${descricao}</span>
            </div>
            <div class="flex justify-between text-sm mb-2">
                <span class="text-slate-400">Categoria:</span>
                <span class="text-white font-bold">${categoria}</span>
            </div>
            <div class="flex justify-between text-sm mb-2">
                <span class="text-slate-400">Valor:</span>
                <span class="text-[#84cc16] font-bold">R$ ${valor.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-sm pt-2 border-t border-slate-700">
                <span class="text-slate-400">Total na categoria:</span>
                <span class="text-white font-bold">${itensMesmaCategoria.length} item(s)</span>
            </div>
        </div>
    `;

    document.getElementById("infoCategoriaExclusao").innerHTML = 
        `Remove TODOS os ${itensMesmaCategoria.length} lançamentos da categoria "${categoria}"`;

    document.getElementById("inputSenhaExclusaoOpcoes").value = "";
    
    const modal = document.getElementById("modalExcluirOpcoes");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

// ============================================
// ABRIR MODAL DE EXCLUSÃO PARA VENCIMENTOS
// ============================================

// ============================================
// ABRIR MODAL DE EXCLUSÃO PARA VENCIMENTOS - CORRIGIDO
// ============================================
function abrirModalExclusaoOpcoesVencimentos(id, descricao, categoria, valor) {
    console.log("🔍 Abrindo modal VENCIMENTOS com:", { id, descricao, categoria, valor });
    
    if (!id) {
        alert("ID do registro não encontrado");
        return;
    }

    // Garantir que o ID seja string
    const idStr = id.toString(); // <-- DEFINE A VARIÁVEL AQUI!
    
    origemExclusaoAtual = 'vencimentos';

    exclusaoSelecionadaVencimentos = {
        id: idStr,
        descricao: descricao,
        categoria: categoria,
        valor: valor
    };

    // Buscar o item específico para confirmar
    const itemExato = todosOsDados.find(item => {
        const itemId = item.ID || item.id;
        return itemId && itemId.toString() === idStr;
    });

    console.log("📦 Item encontrado para exclusão:", itemExato);

    // Filtrar APENAS itens PENDENTES da mesma categoria
    const itensMesmaCategoria = todosOsDados.filter(item => {
        // Verifica se é pendente
        const isPendente = item.Status === "Pendente" || !item.Status || item.Status === "";
        if (!isPendente) return false;
        
        // Verifica a categoria
        const catItem = item.Categoria || item.categoria || "Outros";
        return catItem === categoria;
    });

    console.log(`📊 Encontrados ${itensMesmaCategoria.length} itens pendentes na categoria ${categoria}`);

    const valorTotal = itensMesmaCategoria.reduce((sum, item) => 
        sum + parseFloat(item.Valor || item.valor || 0), 0);

    const infoDiv = document.getElementById("infoExclusaoOpcoes");
    if (infoDiv) {
        infoDiv.innerHTML = `
            <div class="bg-[#0f1217] p-4 rounded-xl border border-slate-700">
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-slate-400">ID do item:</span>
                    <span class="text-white font-mono text-xs">${idStr}</span>
                </div>
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-slate-400">Item selecionado:</span>
                    <span class="text-white font-bold">${descricao}</span>
                </div>
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-slate-400">Categoria:</span>
                    <span class="text-white font-bold">${categoria}</span>
                </div>
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-slate-400">Valor:</span>
                    <span class="text-[#84cc16] font-bold">R$ ${valor.toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-sm pt-2 border-t border-slate-700">
                    <span class="text-slate-400">Total pendente:</span>
                    <span class="text-white font-bold">${itensMesmaCategoria.length} item(s)</span>
                </div>
                ${itensMesmaCategoria.length > 0 ? `
                <div class="flex justify-between text-sm mt-2 text-amber-400">
                    <span>💰 Valor total:</span>
                    <span class="font-bold">R$ ${valorTotal.toFixed(2)}</span>
                </div>
                ` : ''}
            </div>
        `;
    }

    const infoCategoria = document.getElementById("infoCategoriaExclusao");
    if (infoCategoria) {
        infoCategoria.innerHTML = 
            `Remove TODOS os ${itensMesmaCategoria.length} lançamentos PENDENTES da categoria "${categoria}"`;
    }

    document.getElementById("inputSenhaExclusaoOpcoes").value = "";
    
    // Resetar radio buttons
    const radioUnico = document.getElementById("radioUnico");
    const radioCategoria = document.getElementById("radioCategoria");
    if (radioUnico) radioUnico.checked = true;
    if (radioCategoria) radioCategoria.checked = false;
    
    const modal = document.getElementById("modalExcluirOpcoes");
    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        modal.style.display = "flex";
    }
}

// ============================================
// EXECUTAR EXCLUSÃO COM A OPÇÃO ESCOLHIDA
// ============================================

async function executarExclusaoComOpcao() {
    const senha = document.getElementById("inputSenhaExclusaoOpcoes").value.trim();
    const opcao = document.querySelector('input[name="opcaoExclusao"]:checked')?.value;
    
    if (!senha) {
        alert("❌ Digite sua senha para confirmar a exclusão.");
        return;
    }

    if (!usuarioLogado) {
        alert("❌ Usuário não identificado. Faça login novamente.");
        fecharModalExcluirOpcoes();
        return;
    }

    const dadosSelecionados = origemExclusaoAtual === 'vencimentos' 
        ? exclusaoSelecionadaVencimentos 
        : exclusaoSelecionada;

    if (!dadosSelecionados || !dadosSelecionados.id) {
        alert("❌ Nenhum item selecionado para exclusão.");
        fecharModalExcluirOpcoes();
        return;
    }

    // Fecha o modal imediatamente para feedback visual
    fecharModalExcluirOpcoes();

    try {
        // PRIMEIRO: Verifica se a senha está correta
        const urlVerificar = `${API_URL}?acao=verificarSenha&email=${encodeURIComponent(usuarioLogado)}&senha=${encodeURIComponent(senha)}&_=${Date.now()}`;
        
        const responseVerificar = await fetch(urlVerificar);
        const resultadoVerificar = await responseVerificar.json();

        if (!resultadoVerificar.valido) {
            alert("❌ Senha incorreta! Operação cancelada.");
            return;
        }

        // SEGUNDO: Executa a exclusão baseada na opção
        if (opcao === 'unico') {
            await excluirUnicoItem(dadosSelecionados.id);
        } else if (opcao === 'categoria') {
            await excluirTodosDaCategoria(dadosSelecionados.categoria);
        }

    } catch (error) {
        console.error("❌ Erro:", error);
        alert("❌ Erro de conexão. Tente novamente.");
    }
}
// ============================================
// EXCLUIR APENAS UM ITEM
// ============================================
// ============================================
// EXCLUIR APENAS UM ITEM (JAVASCRIPT - VERSÃO CORRIGIDA)
// ============================================
async function excluirUnicoItem(id) {
    if (!id || !usuarioLogado) {
        alert("❌ Dados inválidos para exclusão.");
        return;
    }

    console.log("🔍 JavaScript - Excluindo ID:", id);
    
    // Mostrar loading
    const btn = event?.target;
    const textoOriginal = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Excluindo...';
        btn.disabled = true;
    }

    try {
        // ENVIAR PARA O APPS SCRIPT VIA GET
        const url = `${API_URL}?acao=excluirLancamento&id=${encodeURIComponent(id)}&usuario=${encodeURIComponent(usuarioLogado)}&_=${Date.now()}`;
        
        console.log("📤 Enviando requisição para Apps Script:", url);
        
        const response = await fetch(url);
        const resultado = await response.json();
        
        console.log("📥 Resposta do Apps Script:", resultado);

        if (resultado.sucesso) {
            // Remover localmente
            const indexDados = todosOsDados.findIndex(item => {
                const itemId = item.ID || item.id;
                return itemId && itemId.toString() === id.toString();
            });
            
            if (indexDados !== -1) {
                todosOsDados.splice(indexDados, 1);
            }
            
            const indexPagos = todosOsPagos.findIndex(item => {
                const itemId = item.ID || item.id;
                return itemId && itemId.toString() === id.toString();
            });
            
            if (indexPagos !== -1) {
                todosOsPagos.splice(indexPagos, 1);
            }
            
            await atualizarTabela();
            alert("✅ Item excluído com sucesso!");
            
        } else {
            alert("❌ Erro ao excluir: " + (resultado.erro || "Erro desconhecido"));
        }
        
    } catch (error) {
        console.error("❌ Erro no JavaScript:", error);
        alert("❌ Erro de conexão. Tente novamente.");
    } finally {
        if (btn) {
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
        }
    }
}

// ============================================
// CORREÇÃO 4: Função de emergência se não excluir
// ============================================
async function excluirDiretoAPI(id) {
    if (!id || !usuarioLogado) return false;
    
    try {
        // Tentar GET primeiro
        const url = `${API_URL}?acao=excluirLancamento&id=${encodeURIComponent(id)}&usuario=${encodeURIComponent(usuarioLogado)}&_=${Date.now()}`;
        
        // Usar imagem/iframe como fallback
        const img = new Image();
        img.src = url;
        
        // Aguardar um pouco
        await new Promise(r => setTimeout(r, 1000));
        
        return true;
    } catch (e) {
        console.error("Fallback falhou:", e);
        return false;
    }
}
// ============================================
// EXCLUIR TODOS DA MESMA CATEGORIA
// ============================================

// ============================================
// EXCLUIR TODOS DA MESMA CATEGORIA - VERSÃO CORRIGIDA
// ============================================
async function excluirTodosDaCategoria(categoria) {
    if (!categoria || !usuarioLogado) {
        alert("❌ Dados inválidos para exclusão.");
        return;
    }

    try {
        // FILTRAR CORRETAMENTE os itens com base na origem
        let itensParaExcluir = [];
        
        if (origemExclusaoAtual === 'historico') {
            // Para histórico, pega TODOS os pagos da categoria
            itensParaExcluir = todosOsPagos.filter(item => {
                const catItem = item.Categoria || item.categoria || "Outros";
                return catItem === categoria;
            });
            console.log("📊 Excluindo do HISTÓRICO:", itensParaExcluir.length, "itens");
        } else {
            // Para vencimentos, pega APENAS os PENDENTES da categoria
            itensParaExcluir = todosOsDados.filter(item => {
                // Verifica se é pendente
                const isPendente = item.Status === "Pendente" || !item.Status || item.Status === "";
                if (!isPendente) return false;
                
                // Verifica a categoria
                const catItem = item.Categoria || item.categoria || "Outros";
                return catItem === categoria;
            });
            console.log("📊 Excluindo de VENCIMENTOS (PENDENTES):", itensParaExcluir.length, "itens");
        }

        if (itensParaExcluir.length === 0) {
            alert(`Nenhum item encontrado na categoria "${categoria}"`);
            return;
        }

        const valorTotal = itensParaExcluir.reduce((sum, item) => 
            sum + parseFloat(item.Valor || item.valor || 0), 0);

        // CONFIRMAÇÃO com detalhes específicos
        const tipoExclusao = origemExclusaoAtual === 'historico' ? 'HISTÓRICO' : 'CONTAS PENDENTES';
        
        if (!confirm(
            `⚠️ CONFIRMAR EXCLUSÃO EM MASSA\n\n` +
            `📍 Origem: ${tipoExclusao}\n` +
            `📁 Categoria: ${categoria}\n` +
            `📊 Total de itens: ${itensParaExcluir.length}\n` +
            `💰 Valor total: R$ ${valorTotal.toFixed(2)}\n\n` +
            `📋 Primeiros itens:\n` +
            itensParaExcluir.slice(0, 3).map(item => 
                `  • ${item.Descrição || item.Descricao}: R$ ${parseFloat(item.Valor || item.valor || 0).toFixed(2)}`
            ).join('\n') +
            (itensParaExcluir.length > 3 ? `\n  • ... e mais ${itensParaExcluir.length - 3} itens` : '') +
            `\n\n🚨 Esta ação é PERMANENTE e NÃO pode ser desfeita!`
        )) return;

        // Mostrar progresso
        const progressMsg = document.createElement('div');
        progressMsg.className = 'fixed top-4 right-4 bg-[#1a1e26] border border-[#84cc16] rounded-lg p-4 z-50 shadow-xl';
        progressMsg.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fas fa-spinner fa-spin text-[#84cc16] text-xl"></i>
                <div>
                    <span class="text-white font-bold">Excluindo itens...</span>
                    <span class="text-[#84cc16] block text-sm" id="progressoContador">0/${itensParaExcluir.length}</span>
                </div>
            </div>
        `;
        document.body.appendChild(progressMsg);

        let sucessos = 0;
        let erros = 0;

        // Excluir um por um
        for (let i = 0; i < itensParaExcluir.length; i++) {
            const item = itensParaExcluir[i];
            const id = item.ID || item.id;
            
            if (id) {
                try {
                    console.log(`📤 Excluindo item ${i+1}/${itensParaExcluir.length}: ID ${id}`);
                    
                    // Usar GET em vez de POST para garantir resposta
                    const url = `${API_URL}?acao=excluirLancamento&id=${encodeURIComponent(id)}&usuario=${encodeURIComponent(usuarioLogado)}&_=${Date.now()}`;
                    
                    const response = await fetch(url);
                    const resultado = await response.json();
                    
                    if (resultado.sucesso) {
                        sucessos++;
                        
                        // Remover localmente
                        const indexDados = todosOsDados.findIndex(d => {
                            const did = d.ID || d.id;
                            return did && did.toString() === id.toString();
                        });
                        if (indexDados !== -1) {
                            todosOsDados.splice(indexDados, 1);
                        }
                        
                        const indexPagos = todosOsPagos.findIndex(p => {
                            const pid = p.ID || p.id;
                            return pid && pid.toString() === id.toString();
                        });
                        if (indexPagos !== -1) {
                            todosOsPagos.splice(indexPagos, 1);
                        }
                        
                    } else {
                        console.error("❌ Erro na API:", resultado);
                        erros++;
                    }
                } catch (e) {
                    console.error("❌ Erro no item:", id, e);
                    erros++;
                }
            }
            
            // Atualizar progresso
            const contador = document.getElementById('progressoContador');
            if (contador) {
                contador.innerText = `${i+1}/${itensParaExcluir.length}`;
            }
            
            // Pequeno delay entre requisições
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        // Remover mensagem de progresso
        progressMsg.remove();

        // Recarregar dados
        await atualizarTabela();

        // Mostrar resultado
        if (erros === 0) {
            alert(`✅ EXCLUSÃO EM MASSA CONCLUÍDA!\n\n` +
                  `📍 Origem: ${tipoExclusao}\n` +
                  `📁 Categoria: ${categoria}\n` +
                  `✅ Itens excluídos: ${sucessos}\n` +
                  `💰 Valor total: R$ ${valorTotal.toFixed(2)}`);
        } else {
            alert(`⚠️ EXCLUSÃO PARCIAL\n\n` +
                  `📍 Origem: ${tipoExclusao}\n` +
                  `📁 Categoria: ${categoria}\n` +
                  `✅ Excluídos: ${sucessos}\n` +
                  `❌ Falhas: ${erros}\n` +
                  `💰 Valor: R$ ${valorTotal.toFixed(2)}\n\n` +
                  `Alguns itens podem precisar ser excluídos manualmente.`);
        }

    } catch (error) {
        console.error("❌ Erro na exclusão em massa:", error);
        alert("❌ Erro ao processar exclusão em massa.");
    }
}
/// ============================================
// FECHAR MODAL DE EXCLUSÃO (COM VERIFICAÇÃO)
// ============================================
function fecharModalExcluirOpcoes() {
    console.log("🔍 Fechando modal");
    const modal = document.getElementById("modalExcluirOpcoes");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        modal.style.display = "none";
    }
    
    const senhaInput = document.getElementById("inputSenhaExclusaoOpcoes");
    if (senhaInput) {
        senhaInput.value = "";
    }
    
    // Resetar as opções para o padrão
    const radioUnico = document.getElementById("radioUnico");
    if (radioUnico) radioUnico.checked = true;
}


// ============================================
// EXCLUIR LANÇAMENTO DA PLANILHA - VERSÃO CORRIGIDA
// ============================================
async function excluirLancamentoDaPlanilha(id) {
    if (!id || !usuarioLogado) {
        console.error("❌ Dados inválidos:", { id, usuarioLogado });
        return false;
    }

    console.log("🗑️ Tentando excluir lançamento:", id);

    try {
        // Tenta primeiro com POST (mais confiável para no-cors)
        const formData = new FormData();
        formData.append('acao', 'excluirLancamento');
        formData.append('id', id);
        formData.append('usuario', usuarioLogado);
        formData.append('timestamp', Date.now());

        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });

        console.log("✅ Requisição de exclusão enviada");
        
        // Como é no-cors, não podemos verificar a resposta
        // Mas vamos considerar como sucesso e recarregar
        return true;

    } catch (error) {
        console.error("❌ Erro na exclusão:", error);
        
        // Fallback: tentar com GET
        try {
            console.log("🔄 Tentando fallback com GET...");
            const url = `${API_URL}?acao=excluirLancamento&id=${encodeURIComponent(id)}&usuario=${encodeURIComponent(usuarioLogado)}&_=${Date.now()}`;
            
            await fetch(url, {
                method: 'GET',
                mode: 'no-cors'
            });
            
            return true;
        } catch (fallbackError) {
            console.error("❌ Fallback também falhou:", fallbackError);
            return false;
        }
    }
}




// ============================================
// FUNÇÃO PARA DEBUG - VERIFICAR IDs
// ============================================
function debugarIds() {
    console.log("🔍 DEBUG - Verificando IDs nos dados:");
    
    console.log("\n📊 TODOS OS DADOS:");
    todosOsDados.forEach((item, index) => {
        console.log(`${index}:`, {
            id: item.ID || item.id,
            descricao: item.Descrição || item.Descricao,
            categoria: item.Categoria || item.categoria,
            status: item.Status
        });
    });
    
    console.log("\n📜 HISTÓRICO (PAGOS):");
    todosOsPagos.forEach((item, index) => {
        console.log(`${index}:`, {
            id: item.ID || item.id,
            descricao: item.Descrição || item.Descricao,
            categoria: item.Categoria || item.categoria
        });
    });
}


// ============================================
// RECARREGAR DADOS APÓS EXCLUSÃO
// ============================================
async function recarregarDadosAposExclusao() {
    console.log("🔄 Recarregando todos os dados da planilha...");
    
    try {
        const response = await fetch(`${API_URL}?usuario=${encodeURIComponent(usuarioLogado)}&_=${Date.now()}`);
        const dados = await response.json();

        if (dados.erro) {
            console.error("❌ Erro ao recarregar:", dados.erro);
            return false;
        }

        // Atualizar dados globais
        todosOsDados = Array.isArray(dados) ? dados : [];
        todosOsPagos = todosOsDados.filter(item => item.Status === "Pago");
        
        console.log("✅ Dados recarregados:", {
            total: todosOsDados.length,
            pagos: todosOsPagos.length,
            pendentes: todosOsDados.length - todosOsPagos.length
        });
        
        return true;
    } catch (error) {
        console.error("❌ Erro ao recarregar:", error);
        return false;
    }
}

// Garantir que todas as funções estejam disponíveis globalmente
window.excluirUnicoItem = excluirUnicoItem;
window.excluirTodosDaCategoria = excluirTodosDaCategoria;
window.fecharModalExcluirOpcoes = fecharModalExcluirOpcoes;
window.executarExclusaoComOpcao = executarExclusaoComOpcao;
window.abrirModalExclusaoOpcoes = abrirModalExclusaoOpcoes;
window.abrirModalExclusaoOpcoesVencimentos = abrirModalExclusaoOpcoesVencimentos;


async function debugExclusao(id) {
    console.log("🔍 DEBUG EXCLUSÃO");
    console.log("ID:", id);
    console.log("Usuário:", usuarioLogado);
    console.log("URL:", `${API_URL}?acao=excluirLancamento&id=${id}&usuario=${usuarioLogado}`);
    
    try {
        const response = await fetch(`${API_URL}?acao=excluirLancamento&id=${id}&usuario=${usuarioLogado}&_=${Date.now()}`);
        const data = await response.json();
        console.log("Resposta da API:", data);
    } catch (e) {
        console.error("Erro:", e);
    }
}
