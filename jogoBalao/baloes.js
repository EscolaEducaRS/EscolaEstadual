/**
 * Lógica do Jogo de Balões - Escola Estadual
 * Foco: Início imediato após clique no botão central.
 */

const overlay = document.getElementById('tela-inicial');
const campo = document.getElementById('area-baloes');
const contaTexto = document.getElementById('num-conta');

let pontos = 0;
let fase = 1;
let respCerta;
let loopCriador;
let jogoAtivo = false;

/**
 * FUNÇÃO DE INÍCIO: Chamada pelo botão grande
 * Remove a tela de início e começa os balões na hora.
 */
function comecarAgora() {
    overlay.style.opacity = "0"; // Efeito de sumir suave
    setTimeout(() => overlay.style.display = "none", 500);
    
    jogoAtivo = true;
    proximaConta(); // Gera a primeira conta
    gerarBalao();   // Cria o primeiro balão IMEDIATAMENTE
    iniciarCiclo(); // Inicia o intervalo de criação
}

/**
 * Gera os cálculos matemáticos (Soma e Subtração)
 */
function proximaConta() {
    let n1 = Math.floor(Math.random() * (fase * 8)) + 2;
    let n2 = Math.floor(Math.random() * n1);
    let op = (fase > 2 && Math.random() > 0.5) ? "-" : "+";
    
    respCerta = (op === "+") ? (n1 + n2) : (n1 - n2);
    contaTexto.innerText = `${n1}${op}${n2}`;
}

/**
 * Criação e animação dos balões
 */
function gerarBalao() {
    if (!jogoAtivo || document.hidden) return;

    const b = document.createElement('div');
    b.className = 'balao';
    b.style.cssText = `
        position: absolute; bottom: -150px; width: 80px; height: 100px;
        background: hsl(${Math.random() * 360}, 70%, 50%);
        border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
        display: flex; justify-content: center; align-items: center;
        color: white; font-weight: bold; cursor: pointer; font-size: 24px;
        left: ${Math.random() * (campo.clientWidth - 100)}px;
    `;
    
    const eCerto = Math.random() > 0.7;
    b.innerText = eCerto ? respCerta : respCerta + (Math.floor(Math.random() * 6) - 3);
    campo.appendChild(b);

    // Movimento de subida
    let pos = -150;
    const vel = 1.5 + (fase * 0.5);
    const anim = setInterval(() => {
        if (jogoAtivo && !document.hidden) {
            pos += vel;
            b.style.bottom = pos + 'px';
            if (pos > campo.clientHeight) { clearInterval(anim); b.remove(); }
        } else { clearInterval(anim); b.remove(); } // Limpa ao sair do foco
    }, 16);

    b.onclick = () => {
        if (parseInt(b.innerText) === respCerta) {
            pontos += 10;
            if (pontos % 50 === 0) { fase++; iniciarCiclo(); }
            b.remove();
            proximaConta();
        } else {
            alert("Fim de Jogo!");
            location.reload();
        }
    };
}

/**
 * Controla a frequência de novos balões
 */
function iniciarCiclo() {
    clearInterval(loopCriador);
    const tempo = Math.max(700, 2000 - (fase * 200));
    loopCriador = setInterval(gerarBalao, tempo);
}

// O jogo aguarda o clique no botão para executar proximaConta() e iniciarCiclo()
