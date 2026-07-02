/**
 * baloes.js - Lógica completa para o portal EscolaEstadual
 * Implementa ranking (Pontos/Tempo), Pause e Dificuldade Progressiva.
 */

// 1. Definições de Variáveis e Integração com LocalStorage
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
 * Alterna o estado de pause do jogo
 */
function alternarPause() {
    jogoPausado = !jogoPausado;
    if (jogoPausado) {
        clearInterval(criadorBaloes);
        btnPause.innerText = "Retomar Jogo";
        btnPause.style.backgroundColor = "#27ae60";
    } else {
        reiniciarGerador();
        btnPause.innerText = "Pausar Jogo";
        btnPause.style.backgroundColor = "#f39c12";
        tempoInicio = Date.now(); // Reseta o tempo da pergunta atual
    }
}

/**
 * Gera cálculos que ficam mais difíceis a cada fase
 */
function novaRodada() {
    let n1, n2, op;
    const dif = level * 7;

    if (level === 1) {
        n1 = Math.floor(Math.random() * 10) + 1;
        n2 = Math.floor(Math.random() * 10) + 1;
        op = "+";
        resCorreta = n1 + n2;
    } else {
        n1 = Math.floor(Math.random() * dif) + 10;
        n2 = Math.floor(Math.random() * n1); // Evita resultado negativo
        op = Math.random() > 0.5 ? "-" : "+";
        resCorreta = op === "-" ? n1 - n2 : n1 + n2;
    }
    
    displayConta.innerText = `${n1}${op}${n2}`;
    displayStatus.innerText = `Fase: ${level} | Pontos: ${pts} | Acertos: ${acertosFase}/${ACERTOS_PARA_SUBIR}`;
    tempoInicio = Date.now();
}

/**
 * Cria balões e gerencia o movimento de subida
 */
function criarBalao() {
    if (jogoPausado || document.hidden) return; // Evita acúmulo em segundo plano ou pause

    const b = document.createElement('div');
    b.className = 'balao';
    const correto = Math.random() > 0.7;
    b.innerText = correto ? resCorreta : resCorreta + (Math.floor(Math.random() * 8) - 4);
    
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
        }
    }, 16);

    b.onclick = () => {
        if (jogoPausado) return;
        if (parseInt(b.innerText) === resCorreta) {
            temposAcertos.push((Date.now() - tempoInicio) / 1000);
            pts += 10;
            acertosFase++;

            if (acertosFase >= ACERTOS_PARA_SUBIR) {
                level++;
                acertosFase = 0;
                reiniciarGerador();
            }
            
            b.classList.add('estourando');
            clearInterval(loop);
            setTimeout(() => {
                b.remove();
                novaRodada();
                const media = temposAcertos.length > 0 ? 
                    (temposAcertos.reduce((a,b)=>a+b,0)/temposAcertos.length).toFixed(2) : 0;
                document.getElementById('valor-media').innerText = media;
            }, 300);
        } else {
            fimDeJogo();
        }
    };
}

/**
 * Persistência e Ranking (Desempate por tempo médio)
 */
function salvarRank() {
    let r = JSON.parse(localStorage.getItem('rank_baloes')) || [];
    const m = temposAcertos.length > 0 ? (temposAcertos.reduce((a,b)=>a+b,0)/temposAcertos.length) : 0;
    r.push({ nome: nomeUser, pts: pts, t: parseFloat(m.toFixed(2)) });
    r.sort((a,b) => b.pts - a.pts || a.t - b.t); // Ordena pontos (maior) e tempo (menor)
    localStorage.setItem('rank_baloes', JSON.stringify(r.slice(0, 10)));
}

function mostrarRank() {
    const dados = JSON.parse(localStorage.getItem('rank_baloes')) || [];
    document.getElementById('exibicao-ranking').innerHTML = dados.map((r, i) => 
        `<div>${i+1}º ${r.nome} - ${r.pts}pts (${r.t}s)</div>`
    ).join('');
}

function fimDeJogo() {
    salvarRank();
    alert(`Fim de jogo! Pontos: ${pts}`);
    location.reload();
}

function reiniciarGerador() {
    clearInterval(criadorBaloes);
    if (!jogoPausado) {
        criadorBaloes = setInterval(criarBalao, Math.max(800, 2500 - (level * 200)));
    }
}

// Bloqueia execução em segundo plano para não travar o navegador
document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInterval(criadorBaloes);
    else if (!jogoPausado) reiniciarGerador();
});

// Inicialização imediata
novaRodada();
mostrarRank();
reiniciarGerador();
