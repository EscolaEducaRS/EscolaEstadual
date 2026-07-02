/**
 * jogoBaloes/baloes.js
 * Lógica do jogo de balões com correção de acúmulo em segundo plano.
 */

// 1. Definição de Variáveis Globais e Integração com o Portal
const nomeUser = localStorage.getItem('escola_nome') || "Estudante";
const areaJogo = document.getElementById('campo-baloes');
const displayConta = document.getElementById('texto-conta');
const displayPontos = document.getElementById('painel-pontos');

let pts = 0;
let level = 1;
let acertosNaSessao = 0;
let resCorreta;
let tempoInicio;
let listaTempos = [];
let criadorBaloes; // Variável para controlar o intervalo de criação
const ACERTOS_PARA_SUBIR = 5;

document.getElementById('msg-boas-vindas').innerText = `Oi, ${nomeUser}!`;

/**
 * Gera uma nova rodada matemática baseada no nível atual.
 */
function novaRodada() {
    let n1, n2, operador;
    const dificuldade = level * 7;

    if (level === 1) {
        n1 = Math.floor(Math.random() * 10) + 1;
        n2 = Math.floor(Math.random() * 10) + 1;
        operador = "+";
        resCorreta = n1 + n2;
    } else {
        n1 = Math.floor(Math.random() * dificuldade) + 10;
        n2 = Math.floor(Math.random() * n1);
        if (Math.random() > 0.5) {
            operador = "-";
            resCorreta = n1 - n2;
        } else {
            operador = "+";
            resCorreta = n1 + n2;
        }
    }
    
    displayConta.innerText = `${n1}${operador}${n2}`;
    displayPontos.innerText = `Fase: ${level} | Pontos: ${pts} | Acertos: ${acertosNaSessao}/${ACERTOS_PARA_SUBIR}`;
    tempoInicio = Date.now();
}

/**
 * Cria o balão e define seu comportamento de subida e clique.
 */
function criarBalao() {
    // Se a aba não estiver visível, não cria o balão para evitar acúmulo
    if (document.hidden) return;

    const b = document.createElement('div');
    b.className = 'balao';
    
    const correto = Math.random() > 0.7;
    b.innerText = correto ? resCorreta : resCorreta + (Math.floor(Math.random() * 10) - 5);
    
    b.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
    b.style.left = Math.random() * (areaJogo.clientWidth - 90) + 'px';
    areaJogo.appendChild(b);

    let p = -150;
    const v = 1.4 + (level * 0.4);
    const loop = setInterval(() => {
        // Pausa o movimento se a aba estiver oculta
        if (!document.hidden) {
            p += v;
            b.style.bottom = p + 'px';
            if (p > areaJogo.clientHeight) { clearInterval(loop); b.remove(); }
        }
    }, 16);

    b.onclick = () => {
        if (parseInt(b.innerText) === resCorreta) {
            listaTempos.push((Date.now() - tempoInicio) / 1000);
            pts += 10;
            acertosNaSessao++;

            if (acertosNaSessao >= ACERTOS_PARA_SUBIR) {
                level++;
                acertosNaSessao = 0;
                alert(`Nível ${level}!`);
                reiniciarCiclo(); // Ajusta velocidade de spawn
            }
            
            b.classList.add('estourando');
            clearInterval(loop);
            setTimeout(() => {
                b.remove();
                novaRodada();
                document.getElementById('valor-media').innerText = 
                    (listaTempos.reduce((a,b)=>a+b,0)/listaTempos.length).toFixed(2);
            }, 300);
        } else {
            fimDeJogo();
        }
    };
}

/**
 * Salva a pontuação e o tempo médio no localStorage do navegador.
 */
function salvarRank() {
    let r = JSON.parse(localStorage.getItem('rank_baloes')) || [];
    const m = listaTempos.length > 0 ? (listaTempos.reduce((a,b)=>a+b,0)/listaTempos.length) : 0;
    r.push({ nome: nomeUser, pts: pts, t: parseFloat(m.toFixed(2)) });
    r.sort((a,b) => b.pts - a.pts || a.t - b.t);
    localStorage.setItem('rank_baloes', JSON.stringify(r.slice(0, 10)));
}

function mostrarRank() {
    const d = JSON.parse(localStorage.getItem('rank_baloes')) || [];
    document.getElementById('exibicao-ranking').innerHTML = d.map((r, i) => 
        `<div>${i+1}º ${r.nome}: ${r.pts} pts (${r.t}s)</div>`
    ).join('');
}

function fimDeJogo() {
    salvarRank();
    alert(`Fim! Fase: ${level} | Pontos: ${pts}`);
    location.reload();
}

/**
 * Gerencia o ciclo de criação de balões, permitindo pausar/retomar.
 */
function reiniciarCiclo() {
    clearInterval(criadorBaloes);
    const intervalo = Math.max(800, 2500 - (level * 200));
    criadorBaloes = setInterval(criarBalao, intervalo);
}

// 2. CORREÇÃO: Monitor de Visibilidade da Aba
// Isso impede que o jogo continue "rodando" enquanto o aluno não está olhando
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        clearInterval(criadorBaloes); // Para a criação de novos balões
    } else {
        reiniciarCiclo(); // Retoma quando o usuário volta para o jogo
    }
});

// Inicialização do Jogo
novaRodada();
mostrarRank();
reiniciarCiclo();
