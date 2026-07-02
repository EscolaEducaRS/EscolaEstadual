/**
 * jogoBaloes/baloes.js
 * Lógica do jogo de balões com correção de acúmulo em segundo plano.
 */

// 1. Variáveis Globais e Integração
const nomeUser = localStorage.getItem('escola_nome') || "Estudante";
const areaJogo = document.getElementById('campo-baloes');
const displayConta = document.getElementById('texto-conta');
const displayPontos = document.getElementById('painel-pontos');
const btnPause = document.getElementById('btn-pause');

let pts = 0;
let level = 1;
let acertosNaSessao = 0;
let resCorreta;
let tempoInicio;
let listaTempos = [];
let criadorBaloes;
let jogoPausado = false; // Estado inicial do pause
const ACERTOS_PARA_SUBIR = 5;

document.getElementById('msg-boas-vindas').innerText = `Oi, ${nomeUser}!`;

/**
 * Alterna entre Pausado e Rodando
 */
function alternarPause() {
    jogoPausado = !jogoPausado;
    
    if (jogoPausado) {
        clearInterval(criadorBaloes);
        btnPause.innerText = "Retomar Jogo";
        btnPause.style.backgroundColor = "#27ae60";
        document.body.classList.add('pausado');
    } else {
        reiniciarCiclo();
        btnPause.innerText = "Pausar Jogo";
        btnPause.style.backgroundColor = "#f39c12";
        document.body.classList.remove('pausado');
        tempoInicio = Date.now(); // Reseta o tempo da pergunta ao despausar
    }
}

/**
 * Gera uma nova rodada matemática
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
        operador = Math.random() > 0.5 ? "-" : "+";
        resCorreta = operador === "-" ? n1 - n2 : n1 + n2;
    }
    
    displayConta.innerText = `${n1}${operador}${n2}`;
    displayPontos.innerText = `Fase: ${level} | Pontos: ${pts} | Acertos: ${acertosNaSessao}/${ACERTOS_PARA_SUBIR}`;
    tempoInicio = Date.now();
}

/**
 * Cria o balão respeitando o estado de pause
 */
function criarBalao() {
    if (jogoPausado || document.hidden) return;

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
        // Só move se não estiver pausado e a aba estiver visível
        if (!jogoPausado && !document.hidden) {
            p += v;
            b.style.bottom = p + 'px';
            if (p > areaJogo.clientHeight) { clearInterval(loop); b.remove(); }
        }
    }, 16);

    b.onclick = () => {
        if (jogoPausado) return; // Impede clique enquanto pausado

        if (parseInt(b.innerText) === resCorreta) {
            listaTempos.push((Date.now() - tempoInicio) / 1000);
            pts += 10;
            acertosNaSessao++;

            if (acertosNaSessao >= ACERTOS_PARA_SUBIR) {
                level++;
                acertosNaSessao = 0;
                alert(`Nível ${level}!`);
                reiniciarCiclo();
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

// ... (Funções de Ranking e Finalização mantidas conforme última versão) ...

function reiniciarCiclo() {
    clearInterval(criadorBaloes);
    if (!jogoPausado) {
        const intervalo = Math.max(800, 2500 - (level * 200));
        criadorBaloes = setInterval(criarBalao, intervalo);
    }
}

// Monitor de Visibilidade (Visibility API)
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        clearInterval(criadorBaloes);
    } else if (!jogoPausado) {
        reiniciarCiclo();
    }
});

// Inicialização
novaRodada();
mostrarRank();
reiniciarCiclo();
