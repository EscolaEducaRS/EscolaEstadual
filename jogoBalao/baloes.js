const nomeUsuario = localStorage.getItem('escola_nome') || "Estudante";
const cenario = document.getElementById('cenario');
const displayConta = document.getElementById('conta');
const displayStatus = document.getElementById('status');

let pontos = 0;
let fase = 1;
let respostaCorreta;
let velocidadeBalao = 2; // Pixels por frame
let intervaloCriacao = 2000; // Milissegundos

document.getElementById('saudacao').innerText = `Boa sorte, ${nomeUsuario}!`;

function gerarNovaConta() {
    const n1 = Math.floor(Math.random() * (5 * fase)) + 1;
    const n2 = Math.floor(Math.random() * (5 * fase)) + 1;
    respostaCorreta = n1 + n2;
    displayConta.innerText = `${n1} + ${n2} = ?`;
}

function criarBalao() {
    const balao = document.createElement('div');
    balao.className = 'balao';
    
    // Define se este balão terá a resposta certa ou errada
    const eCorreto = Math.random() > 0.7; 
    const valor = eCorreto ? respostaCorreta : respostaCorreta + (Math.floor(Math.random() * 10) - 5);
    
    balao.innerText = valor;
    balao.style.left = Math.random() * (window.innerWidth - 80) + 'px';
    cenario.appendChild(balao);

    // Movimentação do balão
    let posicaoBottom = -100;
    const animacao = setInterval(() => {
        posicaoBottom += velocidadeBalao;
        balao.style.bottom = posicaoBottom + 'px';

        // Remove se sair da tela por cima
        if (posicaoBottom > window.innerHeight) {
            clearInterval(animacao);
            balao.remove();
        }
    }, 1000 / 60);

    balao.onclick = () => {
        if (parseInt(balao.innerText) === respostaCorreta) {
            pontos += 10;
            clearInterval(animacao);
            balao.remove();
            proximaFase();
        } else {
            alert("Resposta errada! Tente novamente.");
            balao.remove();
        }
        atualizarPlacar();
    };
}

function proximaFase() {
    gerarNovaConta();
    if (pontos % 50 === 0) { // A cada 50 pontos, aumenta a dificuldade
        fase++;
        velocidadeBalao += 0.5; // Balões mais rápidos
        intervaloCriacao = Math.max(500, intervaloCriacao - 200); // Expressões mais frequentes
        reiniciarCiclo();
    }
}

function atualizarPlacar() {
    displayStatus.innerText = `Fase: ${fase} | Pontos: ${pontos}`;
}

let criadorBaloes;
function reiniciarCiclo() {
    clearInterval(criadorBaloes);
    criadorBaloes = setInterval(criarBalao, intervaloCriacao);
}

// Início do jogo
gerarNovaConta();
reiniciarCiclo();
