/**
 * baloes.js - Versão com Anti-Cheat
 * Objetivo: Destruir balões existentes ao perder o foco da janela.
 */

const nomeUser = localStorage.getItem('escola_nome') || "Estudante";
const areaJogo = document.getElementById('campo-baloes');
const displayConta = document.getElementById('texto-conta');
const displayStatus = document.getElementById('painel-status');
const btnPause = document.getElementById('btn-pause');

let pts = 0;
let level = 1;
let acertosFase = 0;
let resCorreta;
let tempoInicio;
let temposAcertos = [];
let criadorBaloes;
let jogoPausado = false;
const ACERTOS_PARA_SUBIR = 5;

document.getElementById('msg-boas-vindas').innerText = `Oi, ${nomeUser}!`;

/**
 * Alterna o estado de pause e limpa a tela se pausar
 */
function alternarPause() {
    jogoPausado = !jogoPausado;
    
    if (jogoPausado) {
        pararELimpar(); // Função que remove os balões
        btnPause.innerText = "Retomar";
    } else {
        novaRodada(); // Gera uma nova conta para não voltar na mesma
        reiniciarGerador();
        btnPause.innerText = "Pausar";
    }
}

/**
 * FUNÇÃO PRINCIPAL: Para os cronômetros e remove todos os balões da tela
 */
function pararELimpar() {
    clearInterval(criadorBaloes);
    
    // Seleciona todos os elementos com a classe .balao e os remove
    const baloesAtivos = document.querySelectorAll('.balao');
    baloesAtivos.forEach(balao => balao.remove());
}

function novaRodada() {
    let n1 = Math.floor(Math.random() * (level * 7)) + 2;
    let n2 = Math.floor(Math.random() * n1);
    let op = (level > 1) ? (Math.random() > 0.5 ? "-" : "+") : "+";
    
    resCorreta = (op === "+") ? (n1 + n2) : (n1 - n2);
    displayConta.innerText = `${n1}${op}${n2}`;
    displayStatus.innerText = `Fase: ${level} | Pontos: ${pts} | Acertos: ${acertosFase}/${ACERTOS_PARA_SUBIR}`;
    tempoInicio = Date.now();
}

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
    const vel = 1.5 + (level * 0.4);
    const loop = setInterval(() => {
        if (!jogoPausado && !document.hidden) {
            pos += vel;
            b.style.bottom = pos + 'px';
            if (pos > areaJogo.clientHeight) { clearInterval(loop); b.remove(); }
        } else {
            // Se o jogo pausar enquanto o balão sobe, este intervalo também limpa o balão
            clearInterval(loop);
            b.remove();
        }
    }, 16);

    b.onclick = () => {
        if (jogoPausado) return;
        if (parseInt(b.innerText) === resCorreta) {
            temposAcertos.push((Date.now() - tempoInicio) / 1000);
            pts += 10;
            acertosFase++;
            if (acertosFase >= ACERTOS_PARA_SUBIR) { level++; acertosFase = 0; }
            
            b.classList.add('estourando');
            clearInterval(loop);
            setTimeout(() => {
                b.remove();
                novaRodada();
                const media = (temposAcertos.reduce((a,b)=>a+b,0)/temposAcertos.length).toFixed(2);
                document.getElementById('valor-media').innerText = media;
            }, 300);
        } else {
            fimDeJogo();
        }
    };
}

function reiniciarGerador() {
    clearInterval(criadorBaloes);
    if (!jogoPausado) {
        criadorBaloes = setInterval(criarBalao, Math.max(800, 2500 - (level * 200)));
    }
}

/**
 * Monitor de Visibilidade: Destrói tudo ao trocar de aba
 */
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        pararELimpar(); // Apaga os balões existentes
    } else if (!jogoPausado) {
        novaRodada(); // Muda a pergunta para evitar que ele já volte com a resposta pensada
        reiniciarGerador();
    }
});

/**
 * Ajusta a frequência de novos balões
 */
function reiniciarGerador() {
    clearInterval(criadorBaloes);
    if (!jogoPausado) {
        // Reduzimos o intervalo base para 1400ms para o jogo ser mais dinâmico desde o início
        const intervalo = Math.max(600, 1400 - (level * 150));
        criadorBaloes = setInterval(criarBalao, intervalo);
    }
}

// Inicialização imediata - IMPORTANTE para não demorar
novaRodada();       // Gera a primeira conta matemática
mostrarRank();      // Carrega o ranking na lateral
criarBalao();       // CHAMADA MANUAL: Cria o primeiro balão no milissegundo 0
reiniciarGerador(); // Inicia o ciclo de criação automática (setInterval)
