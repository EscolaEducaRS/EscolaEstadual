// Executa assim que a página carrega
window.onload = function() {
    verificarUsuario();
};

function verificarUsuario() {
    const nomeSalvo = localStorage.getItem('escola_nome');
    const telaVerificacao = document.getElementById('tela-verificacao');
    const telaCadastro = document.getElementById('tela-cadastro');
    const telaJogos = document.getElementById('tela-jogos');

    // Esconde todas as telas inicialmente
    telaVerificacao.classList.add('hidden');
    telaCadastro.classList.add('hidden');
    telaJogos.classList.add('hidden');

    if (nomeSalvo) {
        // Se já existe usuário, pergunta se quer continuar
        telaVerificacao.classList.remove('hidden');
        document.getElementById('mensagem-retorno').innerText = `Identificamos que você é ${nomeSalvo}. Deseja continuar?`;
    } else {
        // Se não existe, mostra tela de cadastro
        telaCadastro.classList.remove('hidden');
    }
}

function salvarNovoUsuario() {
    const nome = document.getElementById('nome').value;
    const escola = document.getElementById('escola').value;
    const turma = document.getElementById('turma').value;

    if (nome && escola && turma) {
        localStorage.setItem('escola_nome', nome);
        localStorage.setItem('escola_local', escola);
        localStorage.setItem('escola_turma', turma);
        confirmarLogin(); // Vai para a tela de jogos
    } else {
        alert("Por favor, preencha todos os campos para o seu cadastro escolar.");
    }
}

function confirmarLogin() {
    const nome = localStorage.getItem('escola_nome');
    document.getElementById('tela-verificacao').classList.add('hidden');
    document.getElementById('tela-cadastro').classList.add('hidden');
    document.getElementById('tela-jogos').classList.remove('hidden');
    document.getElementById('user-nome').innerText = nome;
}

function mostrarCadastro() {
    localStorage.clear(); // Limpa dados antigos
    verificarUsuario(); // Reinicia o fluxo
}

function logout() {
    if(confirm("Deseja realmente sair? Seus dados serão apagados deste navegador.")) {
        localStorage.clear();
        location.reload();
    }
}
