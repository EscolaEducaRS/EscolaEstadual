// Integração com os dados do portal EscolaEstadual
const nomeUser = localStorage.getItem('escola_nome') || "Estudante";
const areaJogo = document.getElementById('campo-baloes');
const displayConta = document.getElementById('texto-conta');
const displayPontos = document.getElementById('painel-pontos');

let pts = 0;
let level = 1;
let acertosNaSessao = 0; // Contador de acertos para trocar de fase
let resCorreta;
let tempoInicio;
let listaTempos = [];

const ACERTOS_PARA_SUBIR = 5; // X acertos necessários para mudar de fase

document.getElementById('msg-boas-vindas').innerText = `Oi, ${nomeUser}!`;

/**
 * Gera uma nova conta baseada na fase atual.
 * Conforme o nível sobe, as contas ficam mais difíceis e incluem subtração.
 */
function novaRodada() {
    let n1, n2, operador;
    const dificuldade = level * 7;

    if (level === 1) {
        // Fase 1: Somente somas simples
        n1 = Math.floor(Math.random() * 10) + 1;
        n2 = Math.floor(Math.random() * 10) + 1;
        operador = "+";
        resCorreta = n1 + n2;
    } else if (level === 2) {
        // Fase 2: Somas um pouco maiores
        n1 = Math.floor(Math.random() * dificuldade) + 5;
        n2 = Math.floor(Math.random() * dificuldade) + 5;
        operador = "+";
        resCorreta = n1 + n2;
    } else {
        // Fase 3 em diante: Introduz Contas de Menos (Subtração)
        n1 = Math.floor(Math.random() * dificuldade) + 10;
        n2 = Math.floor(Math.random() * n1); // Garante que n2 não seja maior que n1
        
        // Alterna entre + e - aleatoriamente nas fases avançadas
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

function criarBalao() {
    const b = document.createElement('div');
    b.className = 'balao';
    
    const correto = Math.random() > 0.7;
    b.innerText = correto ? resCorreta : resCorreta + (Math.floor(Math.random() * 10) - 5);
    
    b.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
    b.style.left = Math.random() * (areaJogo.clientWidth - 90) + 'px';
    areaJogo.appendChild(b);

    let p = -150;
    const v = 1.4 + (level * 0.4); // Velocidade aumenta conforme a fase
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
            acertosNaSessao++;

            // Verifica se atingiu o limite de acertos para trocar de fase
            if (acertosNaSessao >= ACERTOS_PARA_SUBIR) {
                level++;
                acertosNaSessao = 0; // Reinicia o contador para a nova fase
                alert(`Parabéns! Você avançou para a Fase ${level}!`);
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

function salvarRank() {
    let r = JSON.parse(localStorage.getItem('rank_baloes')) || [];
    const m = listaTempos.length > 0 ? (listaTempos.reduce((a,b)=>a+b,0)/listaTempos.length) : 0;
    r.push({ nome: nomeUser, pts: pts, t: parseFloat(m.toFixed(2)) });
    r.sort((a,b) => b.pts - a.pts || a.t - b.t); // Desempate por tempo médio
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
    alert(`Fim de Jogo! Você chegou à fase ${level} com ${pts} pontos.`);
    location.reload();
}

novaRodada();
mostrarRank();
setInterval(criarBalao, Math.max(1000, 2500 - (level * 200))); // Balões aparecem mais rápido conforme a fase
