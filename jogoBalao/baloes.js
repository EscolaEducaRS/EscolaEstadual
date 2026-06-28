/**
 * jogoBaloes/baloes.js
 * Lógica do jogo de balões matemáticos para o repositório EscolaEstadual.
 */
// Integração com o portal do repositório
const nomeUsuario = localStorage.getItem('escola_nome') || "Estudante";
const cenario = document.getElementById('cenario');
const displayConta = document.getElementById('conta');

let pontos = 0;
let fase = 1;
let respostaCorreta;
let tempoInicioPergunta;
let temposRespostas = []; // Armazena o tempo de cada acerto

document.getElementById('saudacao').innerText = `Oi, ${nomeUsuario}!`;

function gerarNovaConta() {
    const n1 = Math.floor(Math.random() * (fase * 5)) + 1;
    const n2 = Math.floor(Math.random() * (fase * 5)) + 1;
    respostaCorreta = n1 + n2;
    displayConta.innerText = `${n1}+${n2}`;
    tempoInicioPergunta = Date.now(); // Marca o início da pergunta
}

function calcularTempoMedio() {
    if (temposRespostas.length === 0) return 0;
    const soma = temposRespostas.reduce((a, b) => a + b, 0);
    return (soma / temposRespostas.length).toFixed(2);
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
    const velocidade = 1.5 + (fase * 0.3);
    const anim = setInterval(() => {
        pos += velocidade;
        balao.style.bottom = pos + 'px';
        if (pos > cenario.clientHeight) { clearInterval(anim); balao.remove(); }
    }, 16);

    balao.onclick = () => {
        if (parseInt(balao.innerText) === respostaCorreta) {
            // Calcula tempo gasto nesta resposta
            const tempoGasto = (Date.now() - tempoInicioPergunta) / 1000;
            temposRespostas.push(tempoGasto);
            
            pontos += 10;
            balao.classList.add('estourando');
            document.getElementById('tempo-atual').innerText = calcularTempoMedio();
            setTimeout(() => { balao.remove(); next(); }, 300);
            clearInterval(anim);
        } else {
            finalizarJogo();
        }
    };
}

function next() {
    if (pontos % 50 === 0) fase++;
    document.getElementById('placar').innerText = `Fase: ${fase} | Pontos: ${pontos}`;
    gerarNovaConta();
}

function finalizarJogo() {
    salvarNoRanking();
    alert(`Fim de jogo para ${nomeUsuario}!\nPontos: ${pontos}\nTempo Médio: ${calcularTempoMedio()}s`);
    location.reload();
}

function salvarNoRanking() {
    let ranking = JSON.parse(localStorage.getItem('ranking_baloes')) || [];
    const media = parseFloat(calcularTempoMedio());
    
    ranking.push({ nome: nomeUsuario, pontos: pontos, tempoMedio: media });

    // Lógica de Ordenação: 1º Pontos (Maior), 2º Tempo Médio (Menor - Desempate)
    ranking.sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        return a.tempoMedio - b.tempoMedio;
    });

    localStorage.setItem('ranking_baloes', JSON.stringify(ranking.slice(0, 10)));
}

function exibirRanking() {
    const lista = JSON.parse(localStorage.getItem('ranking_baloes')) || [];
    document.getElementById('lista-ranking').innerHTML = lista.map((r, i) => 
        `<div>${i+1}º ${r.nome} - ${r.pontos}pts (${r.tempoMedio}s)</div>`
    ).join('');
}

gerarNovaConta();
exibirRanking();
setInterval(criarBalao, 1500);
