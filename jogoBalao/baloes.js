/**
 * jogoBaloes/baloes.js
 * Lógica do jogo de balões matemáticos para o repositório EscolaEstadual.
 */

const nomeUsuario = localStorage.getItem('escola_nome') || "Estudante";
const cenario = document.getElementById('cenario');
const displayConta = document.getElementById('conta');
const displayStatus = document.getElementById('status');

let pontos = 0;
let fase = 1;
let respostaCorreta;
let velocidadeBalao = 1.5;

document.getElementById('saudacao').innerText = `Oi, ${nomeUsuario}!`;

function gerarNovaConta() {
    const n1 = Math.floor(Math.random() * (fase * 5)) + 1;
    const n2 = Math.floor(Math.random() * (fase * 5)) + 1;
    respostaCorreta = n1 + n2;
    displayConta.innerText = `${n1} + ${n2}`;
}

function criarBalao() {
    const balao = document.createElement('div');
    balao.className = 'balao';
    const eCorreto = Math.random() > 0.7; 
    balao.innerText = eCorreto ? respostaCorreta : respostaCorreta + (Math.floor(Math.random() * 5) + 1);
    
    balao.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
    balao.style.left = Math.random() * (cenario.clientWidth - 80) + 'px';
    cenario.appendChild(balao);

    let pos = -120;
    const anim = setInterval(() => {
        pos += velocidadeBalao;
        balao.style.bottom = pos + 'px';
        if (pos > cenario.clientHeight) { clearInterval(anim); balao.remove(); }
    }, 16);

    balao.onclick = () => {
        if (parseInt(balao.innerText) === respostaCorreta) {
            pontos += 10;
            balao.classList.add('estourando');
            setTimeout(() => { balao.remove(); verificarFase(); }, 300);
        } else {
            salvarRanking(); // Salva pontuação ao errar
            alert(`Fim de jogo! Pontos: ${pontos}`);
            location.reload();
        }
    };
}

function verificarFase() {
    if (pontos % 50 === 0) { fase++; velocidadeBalao += 0.3; }
    displayStatus.innerText = `Fase: ${fase} | Pontos: ${pontos}`;
    gerarNovaConta();
}

// Lógica de Ranking (Top 10)
function salvarRanking() {
    let ranking = JSON.parse(localStorage.getItem('ranking_baloes')) || [];
    ranking.push({ nome: nomeUsuario, pontos: pontos });
    ranking.sort((a, b) => b.pontos - a.pontos); // Ordena do maior para o menor
    ranking = ranking.slice(0, 10); // Mantém apenas os 10 primeiros
    localStorage.setItem('ranking_baloes', JSON.stringify(ranking));
}

function carregarRanking() {
    const lista = document.getElementById('lista-ranking');
    const ranking = JSON.parse(localStorage.getItem('ranking_baloes')) || [];
    lista.innerHTML = ranking.map(r => `<li>${r.nome}: ${r.pontos} pts</li>`).join('');
}

gerarNovaConta();
carregarRanking();
setInterval(criarBalao, 2000);
