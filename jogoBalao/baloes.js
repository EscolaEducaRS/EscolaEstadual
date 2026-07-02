/**
 * baloes.js - Lógica com Início por Botão Central
 * Analisado conforme o repositório EscolaEstadual.
 */

// 1. Definições de Variáveis e Elementos
const nomeUser = localStorage.getItem('escola_nome') || "Estudante";
const areaJogo = document.getElementById('campo-baloes');
const displayConta = document.getElementById('texto-conta');
const displayStatus = document.getElementById('painel-status');
const overlay = document.getElementById('overlay-inicio');

let pts = 0, level = 1, acertosFase = 0, resCorreta;
let tempoInicio, temposAcertos = [], criadorBaloes;
let jogoPausado = true; // Jogo começa travado até o clique no botão
const ACERTOS_PARA_SUBIR = 5;

document.getElementById('msg-boas-vindas').innerText = `Oi, ${nomeUser}!`;

/**
 * FUNÇÃO DE INÍCIO IMEDIATO: Chamada pelo botão grande no centro da tela
 */
function iniciarJogo() {
    overlay.style.display = 'none'; // Esconde o botão grande
    jogoPausado = false;           // Libera o estado do jogo
    
    novaRodada();                  // Gera a primeira conta
    criarBalao();                  // Cria o primeiro balão IMEDIATAMENTE
    reiniciarGerador();            // Inicia o ciclo automático
}

/**
 * Gera novos cálculos matemáticos
 */
function novaRodada() {
    const n1 = Math.floor(Math.random() * (level * 7)) + 2;
    const n2 = Math.floor(Math.random() * n1);
    const op = (level > 1 && Math.random() > 0.5) ? "-" : "+";
    
    resCorreta = op === "+" ? n1 + n2 : n1 - n2;
    displayConta.innerText = `${n1}${op}${n2}`;
    displayStatus.innerText = `Fase: ${level} | Pontos: ${pts} | Acertos: ${acertosFase}/${ACERTOS_PARA_SUBIR}`;
    tempoInicio = Date.now();
}

/**
 * Lógica de criação e movimento dos balões
 */
function criarBalao() {
    if (jogoPausado || document.hidden) return;

    const b = document.createElement('div');
    b.className = 'balao';
    const correto = Math.random() > 0.7;
    b.innerText = correto ? resCorreta : resCorreta + (Math.floor(Math.random() * 6) - 3);
    b.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
    b.style.left = Math.random() * (areaJogo.clientWidth - 100) + 'px';
    areaJogo.appendChild(b);

    let pos = -150;
    const loop = setInterval(() => {
        if (!jogoPausado && !document.hidden) {
            pos += 1.5 + (level * 0.4);
            b.style.bottom = pos + 'px';
            if (pos > areaJogo.clientHeight) { clearInterval(loop); b.remove(); }
        } else { clearInterval(loop); b.remove(); } // Destrói balões se pausar ou sair do foco
    }, 16);

    b.onclick = () => {
        if (jogoPausado) return;
        if (parseInt(b.innerText) === resCorreta) {
            temposAcertos.push((Date.now() - tempoInicio) / 1000);
            pts += 10; acertosFase++;
            if (acertosFase >= ACERTOS_PARA_SUBIR) { level++; acertosFase = 0; }
            
            b.classList.add('estourando');
            clearInterval(loop);
            setTimeout(() => { b.remove(); novaRodada(); }, 300);
        } else { fimDeJogo(); }
    };
}

/**
 * Gerenciador do ciclo de balões
 */
function reiniciarGerador() {
    clearInterval(criadorBaloes);
    if (!jogoPausado) {
        criadorBaloes = setInterval(criarBalao, Math.max(800, 2000 - (level * 200)));
    }
}

// Inicializa o ranking mas espera o botão para começar a subir balões
mostrarRank();
