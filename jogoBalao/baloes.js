/**
 * jogoBaloes/baloes.js
 * Lógica do jogo de balões matemáticos para o repositório EscolaEstadual.
 */

// Recupera o nome do aluno do portal principal [1]
const nomeUsuario = localStorage.getItem('escola_nome') || "Estudante";
const cenario = document.getElementById('cenario');
const displayConta = document.getElementById('conta');
const displayStatus = document.getElementById('status');

let pontos = 0;
let fase = 1;
let respostaCorreta;
let velocidadeBalao = 1.5;
let intervaloCriacao = 2500;
let criadorBaloes;

document.getElementById('saudacao').innerText = `Estudante: ${nomeUsuario}`;

function gerarNovaConta() {
    const dificuldade = fase * 5;
    const n1 = Math.floor(Math.random() * dificuldade) + 1;
    const n2 = Math.floor(Math.random() * dificuldade) + 1;
    
    respostaCorreta = n1 + n2;
    displayConta.innerText = `${n1} + ${n2} = ?`;
}

function criarBalao() {
    const balao = document.createElement('div');
    balao.className = 'balao';
    
    const eCorreto = Math.random() > 0.7; 
    const valor = eCorreto ? respostaCorreta : respostaCorreta + (Math.floor(Math.random() * 5) + 1);
    
    balao.innerText = valor;

    // Cores dinâmicas para o CSS
    const cores = ['#ff5e5e', '#5eb5ff', '#5eff89', '#ffcc5e', '#d15eff'];
    balao.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];

    // Posição horizontal dentro do cenário
    balao.style.left = Math.random() * (cenario.clientWidth - 80) + 'px';
    cenario.appendChild(balao);

    animarSubida(balao);
}

function animarSubida(balao) {
    let posicaoBottom = -120; // Começa abaixo do cenário

    const movimento = setInterval(() => {
        posicaoBottom += velocidadeBalao;
        balao.style.bottom = posicaoBottom + 'px';

        // O balão some ao chegar no topo do cenário, sem tocar no painel superior
        if (posicaoBottom > cenario.clientHeight) {
            clearInterval(movimento);
            balao.remove();
        }
    }, 16);

    balao.onclick = () => {
        if (parseInt(balao.innerText) === respostaCorreta) {
            pontos += 10;
            balao.classList.add('estourando');
            clearInterval(movimento);
            setTimeout(() => {
                balao.remove();
                verificarProgressao();
            }, 300);
        } else {
            balao.style.backgroundColor = 'black';
            setTimeout(() => balao.remove(), 200);
        }
    };
}

function verificarProgressao() {
    if (pontos > 0 && pontos % 50 === 0) {
        fase++;
        velocidadeBalao += 0.5;
        intervaloCriacao = Math.max(1000, intervaloCriacao - 300);
        reiniciarCiclo();
    }
    displayStatus.innerText = `Fase: ${fase} | Pontos: ${pontos}`;
    gerarNovaConta();
}

function reiniciarCiclo() {
    clearInterval(criadorBaloes);
    criadorBaloes = setInterval(criarBalao, intervaloCriacao);
}

// Início do jogo
gerarNovaConta();
reiniciarCiclo();

// Início imediato ao carregar
iniciarJogo();
