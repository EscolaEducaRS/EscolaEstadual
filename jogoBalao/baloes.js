// Recupera usuário do portal principal do repositório
const nomeUsuario = localStorage.getItem('escola_nome') || "Estudante";
const cenario = document.getElementById('cenario');
const displayConta = document.getElementById('conta');
const displayPlacar = document.getElementById('placar-geral');

let pontos = 0;
let fase = 1;
let respostaCorreta;
let tempoInicio;
let listaTempos = [];

document.getElementById('saudacao').innerText = `Oi, ${nomeUsuario}!`;

// CORREÇÃO: Função centralizada para atualizar a tela
function proximaPergunta() {
    const n1 = Math.floor(Math.random() * (fase * 5)) + 2;
    const n2 = Math.floor(Math.random() * (fase * 5)) + 2;
    respostaCorreta = n1 + n2;
    
    // Atualiza o HTML da conta
    displayConta.innerText = `${n1}+${n2}`;
    // Atualiza o HTML do placar
    displayPlacar.innerText = `Fase: ${fase} | Pontos: ${pontos}`;
    
    tempoInicio = Date.now();
}

function criarBalao() {
    const balao = document.createElement('div');
    balao.className = 'balao';
    
    // 30% de chance de ser o balão correto
    const eCorreto = Math.random() > 0.7;
    balao.innerText = eCorreto ? respostaCorreta : respostaCorreta + (Math.floor(Math.random() * 8) - 4);
    
    balao.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
    balao.style.left = Math.random() * (cenario.clientWidth - 100) + 'px';
    cenario.appendChild(balao);

    let pos = -150;
    const velocidade = 1.5 + (fase * 0.4);
    const intervalo = setInterval(() => {
        pos += velocidade;
        balao.style.bottom = pos + 'px';
        if (pos > cenario.clientHeight) { clearInterval(intervalo); balao.remove(); }
    }, 16);

    balao.onclick = () => {
        if (parseInt(balao.innerText) === respostaCorreta) {
            // Lógica de Acerto
            const tempoGasto = (Date.now() - tempoInicio) / 1000;
            listaTempos.push(tempoGasto);
            pontos += 10;
            
            if (pontos % 50 === 0) fase++;
            
            balao.classList.add('estourando');
            clearInterval(intervalo);
            
            // CORREÇÃO: Chama a próxima pergunta IMEDIATAMENTE
            setTimeout(() => {
                balao.remove();
                proximaPergunta();
                const media = (listaTempos.reduce((a,b) => a+b, 0) / listaTempos.length).toFixed(2);
                document.getElementById('media-atual').innerText = media;
            }, 300);
        } else {
            finalizarJogo();
        }
    };
}

function salvarRanking() {
    let ranking = JSON.parse(localStorage.getItem('ranking_baloes')) || [];
    const media = listaTempos.length > 0 ? (listaTempos.reduce((a,b) => a+b,0)/listaTempos.length) : 0;
    
    ranking.push({ nome: nomeUsuario, pontos: pontos, tempo: parseFloat(media.toFixed(2)) });
    
    // Ordenação: Pontos (Maior) -> Tempo (Menor)
    ranking.sort((a,b) => b.pontos - a.pontos || a.tempo - b.tempo);
    localStorage.setItem('ranking_baloes', JSON.stringify(ranking.slice(0, 10)));
}

function mostrarRanking() {
    const dados = JSON.parse(localStorage.getItem('ranking_baloes')) || [];
    document.getElementById('lista-ranking').innerHTML = dados.map((r, i) => 
        `<div>${i+1}º ${r.nome} - ${r.pontos}pts (${r.tempo}s)</div>`
    ).join('');
}

function finalizarJogo() {
    salvarRanking();
    alert(`Fim de jogo! Você fez ${pontos} pontos.`);
    location.reload();
}

// Inicialização
proximaPergunta();
mostrarRanking();
setInterval(criarBalao, 2000);
