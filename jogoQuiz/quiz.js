// 1. Recupera o nome do usuário salvo no portal principal
const nomeUsuario = localStorage.getItem('escola_nome') || "Estudante";
document.getElementById('saudacao').innerText = `Olá, ${nomeUsuario}! Prepare-se para o desafio.`;

let respostaCorreta;

function iniciarJogo(nivel) {
    document.getElementById('seletor-dificuldade').style.display = 'none';
    document.getElementById('area-pergunta').style.display = 'block';
    gerarPergunta(nivel);
}

function gerarPergunta(nivel) {
    let n1, n2, operador;
    
    // Configuração dos níveis de dificuldade
    if (nivel === 'facil') {
        n1 = Math.floor(Math.random() * 10) + 1;
        n2 = Math.floor(Math.random() * 10) + 1;
        operador = '+';
        respostaCorreta = n1 + n2;
    } else if (nivel === 'medio') {
        n1 = Math.floor(Math.random() * 50) + 10;
        n2 = Math.floor(Math.random() * 50) + 10;
        operador = '-';
        respostaCorreta = n1 - n2;
    } else {
        n1 = Math.floor(Math.random() * 12) + 2;
        n2 = Math.floor(Math.random() * 10) + 2;
        operador = 'x';
        respostaCorreta = n1 * n2;
    }

    document.getElementById('calculo').innerText = `${n1} ${operador} ${n2}`;
    document.getElementById('zona-resposta').innerText = "?";
    document.getElementById('feedback').innerText = "";
    
    criarAlternativas(respostaCorreta);
}

function criarAlternativas(correta) {
    const container = document.getElementById('opcoes-container');
    container.innerHTML = "";
    
    // Cria 4 opções (1 correta e 3 aleatórias)
    let escolhas = [correta];
    while(escolhas.length < 4) {
        let erro = correta + (Math.floor(Math.random() * 10) - 5);
        if(!escolhas.includes(erro)) escolhas.push(erro);
    }
    
    // Embaralha as opções
    escolhas.sort(() => Math.random() - 0.5);

    escolhas.forEach(valor => {
        const div = document.createElement('div');
        div.className = "alternativa";
        div.innerText = valor;
        div.draggable = true;
        div.ondragstart = (event) => event.dataTransfer.setData("text", event.target.innerText);
        container.appendChild(div);
    });
}

// Funções de Drag and Drop
function permitirSoltar(event) {
    event.preventDefault();
}

function soltar(event) {
    event.preventDefault();
    const dadoArrastado = event.dataTransfer.getData("text");
    const zona = document.getElementById('zona-resposta');
    zona.innerText = dadoArrastado;

    verificarResposta(parseInt(dadoArrastado));
}

function verificarResposta(palpite) {
    const feedback = document.getElementById('feedback');
    if (palpite === respostaCorreta) {
        feedback.innerText = "🎉 Parabéns, " + nomeUsuario + "! Você acertou!";
        feedback.style.color = "green";
        setTimeout(() => location.reload(), 2000); // Reinicia após 2 segundos
    } else {
        feedback.innerText = "Ops! Tente novamente.";
        feedback.style.color = "red";
        document.getElementById('zona-resposta').innerText = "?";
    }
}
