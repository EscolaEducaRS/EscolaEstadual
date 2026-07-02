/**
 * Lógica do Jogo de Balões com Fases de Dificuldade
 * A cada 5 acertos: Velocidade aumenta e expressões mudam.
 */

const overlay = document.getElementById('tela-inicial');
const campo = document.getElementById('area-baloes');
const contaTexto = document.getElementById('num-conta');
const placarTexto = document.getElementById('placar');
const progressoTexto = document.getElementById('progresso');

let pontos = 0;
let fase = 1;
let acertosFase = 0; // Contador para controlar a mudança de nível
let respCerta;
let loopCriador;
let jogoAtivo = false;

/**
 * Inicia o jogo imediatamente após o clique no botão central
 */
function comecarAgora() {
    overlay.style.display = "none";
    jogoAtivo = true;
    proximaConta(); 
    gerarBalao();   // Primeiro balão surge sem delay
    iniciarCiclo(); 
}

/**
 * Gera expressões baseadas na fase atual
 * Fase 1-2: Soma | Fase 3+: Introduz Subtração
 */
function proximaConta() {
    // Aumenta o valor dos números conforme a fase
    let limite = fase * 5;
    let n1 = Math.floor(Math.random() * limite) + 2;
    let n2 = Math.floor(Math.random() * limite) + 1;
    
    let op = "+";
    // A partir da fase 3, introduz subtrações aleatórias
    if (fase >= 3 && Math.random() > 0.5) {
        op = "-";
        // Garante que o resultado não seja negativo
        if (n1 < n2) [n1, n2] = [n2, n1];
        respCerta = n1 - n2;
    } else {
        respCerta = n1 + n2;
    }
    
    contaTexto.innerText = `${n1}${op}${n2}`;
    progressoTexto.innerText = `Acertos: ${acertosFase}/5`;
}

/**
 * Cria balões e gerencia a velocidade progressiva
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
    
    // Define se o balão traz a resposta certa ou errada
    const eCerto = Math.random() > 0.7;
    b.innerText = eCerto ? respCerta : respCerta + (Math.floor(Math.random() * 5) + 1);
    campo.appendChild(b);

    // Velocidade aumenta 0.5 a cada fase subida
    let pos = -150;
    const velocidade = 1.5 + (fase * 0.5);
    
    const anim = setInterval(() => {
        if (jogoAtivo && !document.hidden) {
            pos += velocidade;
            b.style.bottom = pos + 'px';
            if (pos > campo.clientHeight) { clearInterval(anim); b.remove(); }
        } else { clearInterval(anim); b.remove(); } // Limpa ao trocar de aba (Anti-cheat)
    }, 16);

    b.onclick = () => {
        if (parseInt(b.innerText) === respCerta) {
            pontos += 10;
            acertosFase++;

            // Lógica de mudança de fase a cada 5 acertos
            if (acertosFase >= 5) {
                fase++;
                acertosFase = 0;
                alert(`Parabéns! Você avançou para a Fase ${fase}`);
                iniciarCiclo(); // Ajusta a frequência de spawn dos balões
            }
            
            b.remove();
            placarTexto.innerText = `Fase: ${fase} | Pontos: ${pontos}`;
            proximaConta();
        } else {
            alert(`Fim de Jogo! Você chegou à fase ${fase}.`);
            location.reload();
        }
    };
}

/**
 * Ajusta a frequência com que os balões aparecem conforme a fase
 */
function iniciarCiclo() {
    clearInterval(loopCriador);
    // Diminui o tempo de espera entre balões conforme a fase aumenta
    const tempoSpawn = Math.max(600, 2000 - (fase * 200));
    loopCriador = setInterval(gerarBalao, tempoSpawn);
}
