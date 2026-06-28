/**
 * jogoBaloes/baloes.js
 * Lógica do jogo de balões matemáticos para o repositório EscolaEstadual.
 */

// 1. Configurações Iniciais e Integração com o Portal
const nomeUsuario = localStorage.getItem('escola_nome') || "Estudante";
const cenario = document.getElementById('cenario');
const displayConta = document.getElementById('conta');
const displayStatus = document.getElementById('status');

let pontos = 0;
let fase = 1;
let respostaCorreta;
let velocidadeBalao = 1.5; // Pixels por frame
let intervaloCriacao = 2500; // Tempo entre novos balões (ms)
let criadorBaloes;

// Saudação inicial usando os dados do portal [3]
document.getElementById('saudacao').innerText = `Boa sorte, ${nomeUsuario}!`;

/**
 * Gera uma nova expressão matemática baseada na fase atual.
 */
function gerarNovaConta() {
    // A dificuldade aumenta o valor máximo dos números conforme a fase
    const dificuldade = fase * 5;
    const n1 = Math.floor(Math.random() * dificuldade) + 1;
    const n2 = Math.floor(Math.random() * dificuldade) + 1;
    
    // Alterna entre soma e subtração dependendo da fase
    if (fase > 2 && Math.random() > 0.5) {
        respostaCorreta = n1 + n2;
        displayConta.innerText = `${n1} + ${n2} = ?`;
    } else {
        // Garante que o resultado não seja negativo para facilitar o aprendizado
        const maior = Math.max(n1, n2);
        const menor = Math.min(n1, n2);
        respostaCorreta = maior - menor;
        displayConta.innerText = `${maior} - ${menor} = ?`;
    }
}

/**
 * Cria o elemento do balão (desenhado via CSS) e define seu comportamento.
 */
function criarBalao() {
    const balao = document.createElement('div');
    balao.className = 'balao';
    
    // Lógica de Resposta: 30% de chance de ser o balão correto
    const eCorreto = Math.random() > 0.7; 
    const valor = eCorreto ? respostaCorreta : gerarRespostaErrada();
    
    balao.innerText = valor;

    // Cores aleatórias para os balões CSS
    const cores = ['#ff5e5e', '#5eb5ff', '#5eff89', '#ffcc5e', '#d15eff'];
    const corSorteada = cores[Math.floor(Math.random() * cores.length)];
    balao.style.backgroundColor = corSorteada;
    // Passa a cor para o pseudo-elemento (nó do balão) se necessário via variável CSS
    balao.style.setProperty('--cor-base', corSorteada);

    // Posição horizontal aleatória
    balao.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    cenario.appendChild(balao);

    animarSubida(balao);
}

/**
 * Gerencia a movimentação vertical e a remoção do balão.
 */
function animarSubida(balao) {
    let posicaoBottom = -150;

    const movimento = setInterval(() => {
        posicaoBottom += velocidadeBalao;
        balao.style.bottom = posicaoBottom + 'px';

        // Remove o balão se ele sumir no topo da tela
        if (posicaoBottom > window.innerHeight) {
            finalizarBalao(balao, movimento);
        }
    }, 16); // Aproximadamente 60 FPS

    // Evento de clique para validar a resposta e animar o estouro
    balao.onclick = () => {
        if (parseInt(balao.innerText) === respostaCorreta) {
            processarAcerto(balao, movimento);
        } else {
            processarErro(balao);
        }
    };
}

function processarAcerto(balao, intervalo) {
    pontos += 10;
    balao.classList.add('estourando'); // Aciona animação do style.css
    clearInterval(intervalo);
    balao.style.pointerEvents = 'none'; // Impede múltiplos cliques

    setTimeout(() => {
        balao.remove();
        verificarProgressao();
    }, 300); // Tempo da animação de estouro
}

function processarErro(balao) {
    balao.style.backgroundColor = '#000'; // Feedback visual de erro
    setTimeout(() => balao.remove(), 200);
}

function finalizarBalao(balao, intervalo) {
    clearInterval(intervalo);
    balao.remove();
}

/**
 * Aumenta a dificuldade do jogo conforme o desempenho.
 */
function verificarProgressao() {
    atualizarPlacar();
    
    // A cada 50 pontos, o jogo fica mais difícil
    if (pontos > 0 && pontos % 50 === 0) {
        fase++;
        velocidadeBalao += 0.4; // Aumenta velocidade de subida
        intervaloCriacao = Math.max(800, intervaloCriacao - 300); // Balões aparecem mais rápido
        reiniciarCiclo();
    }
    
    gerarNovaConta();
}

function gerarRespostaErrada() {
    let erro = respostaCorreta + (Math.floor(Math.random() * 10) - 5);
    return erro === respostaCorreta ? erro + 1 : erro;
}

function atualizarPlacar() {
    displayStatus.innerText = `Fase: ${fase} | Pontos: ${pontos}`;
}

function reiniciarCiclo() {
    clearInterval(criadorBaloes);
    criadorBaloes = setInterval(criarBalao, intervaloCriacao);
}

function iniciarJogo() {
    gerarNovaConta();
    atualizarPlacar();
    reiniciarCiclo();
}

// Início imediato ao carregar
iniciarJogo();
