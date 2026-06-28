// Integração com os dados do portal EscolaEstadual
const nomeUser = localStorage.getItem('escola_nome') || "Estudante";
const areaJogo = document.getElementById('campo-baloes');
const displayConta = document.getElementById('texto-conta');
const displayPontos = document.getElementById('painel-pontos');

let pts = 0;
let level = 1;
let resCorreta;
let tempoInicio;
let listaTempos = [];

document.getElementById('msg-boas-vindas').innerText = `Oi, ${nomeUser}!`;

/**
 * CORREÇÃO: Função para gerar nova conta e atualizar o visual
 */
function novaRodada() {
    const n1 = Math.floor(Math.random() * (level * 5)) + 2;
    const n2 = Math.floor(Math.random() * (level * 5)) + 2;
    resCorreta = n1 + n2;
    
    // Atualiza o texto na coluna lateral
    displayConta.innerText = `${n1}+${n2}`;
    displayPontos.innerText = `Fase: ${level} | Pontos: ${pts}`;
    
    tempoInicio = Date.now();
}

function criarBalao() {
    const b = document.createElement('div');
    b.className = 'balao';
    
    // 30% de chance de ser a resposta certa
    const correto = Math.random() > 0.7;
    b.innerText = correto ? resCorreta : resCorreta + (Math.floor(Math.random() * 6) - 3);
    
    b.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
    b.style.left = Math.random() * (areaJogo.clientWidth - 90) + 'px';
    areaJogo.appendChild(b);

    let p = -150;
    const v = 1.6 + (level * 0.3);
    const loop = setInterval(() => {
        p += v;
        b.style.bottom = p + 'px';
        if (p > areaJogo.clientHeight) { clearInterval(loop); b.remove(); }
    }, 16);

    b.onclick = () => {
        if (parseInt(b.innerText) === resCorreta) {
            // Lógica de Acerto
            listaTempos.push((Date.now() - tempoInicio) / 1000);
            pts += 10;
            if (pts % 50 === 0) level++;
            
            b.classList.add('estourando');
            clearInterval(loop);
            
            // CORREÇÃO: Garante a troca da conta após o estouro
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

function salvarRank() {
    let r = JSON.parse(localStorage.getItem('rank_baloes')) || [];
    const m = listaTempos.length > 0 ? (listaTempos.reduce((a,b)=>a+b,0)/listaTempos.length) : 0;
    
    r.push({ nome: nomeUser, pts: pts, t: parseFloat(m.toFixed(2)) });
    
    // Ordenação: 1º Pontos (Maior) -> 2º Tempo (Menor - Desempate)
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
    alert(`Fim! Pontos: ${pts}`);
    location.reload();
}

// Início
novaRodada();
mostrarRank();
setInterval(criarBalao, 2200);
