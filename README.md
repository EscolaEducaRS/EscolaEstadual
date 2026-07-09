# 🎓 Portal de Jogos Educacionais - Escola Estadual

Um site educacional interativo desenvolvido para utilizar em sala de aula, ensinando **HTML, CSS e JavaScript** através de dois jogos matemáticos divertidos.

**🌐 Acesse em:** [https://escolaeducars.github.io/EscolaEstadual/](https://escolaeducars.github.io/EscolaEstadual/)

---

## 📋 Conteúdo

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Como Usar](#como-usar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tecnologias](#tecnologias)
- [Instruções dos Jogos](#instruções-dos-jogos)
- [Como Executar Localmente](#como-executar-localmente)

---

## 📚 Sobre

Este projeto foi criado para fins educacionais, permitindo que estudantes aprendam conceitos de **desenvolvimento web** enquanto se divertem com jogos interativos de matemática. O portal oferece um sistema simples de cadastro e autenticação usando o navegador, com dois desafios matemáticos distintos.

---

## ✨ Funcionalidades

### 🔐 Sistema de Cadastro e Login
- Cadastro simples com nome, escola e turma
- Persistência de dados usando localStorage
- Verificação de usuário já cadastrado
- Logout com limpeza de dados

### 🎮 Jogo dos Balões
- Matemática com adição e subtração
- Dificuldade progressiva (7 fases)
- Ranking local de melhores pontuações
- Anti-cheat (pausa automática quando perde foco)

### 🧠 Quiz de Matemática
- Três níveis de dificuldade (Fácil, Médio, Difícil)
- Drag and drop para selecionar respostas
- Feedback imediato
- Operações: adição, subtração e multiplicação

---

## 🚀 Como Usar

### Primeiro Acesso
1. Acesse [https://escolaeducars.github.io/EscolaEstadual/](https://escolaeducars.github.io/EscolaEstadual/)
2. Clique em **"Não, criar novo perfil"**
3. Preencha:
   - **Nome Completo**: seu nome
   - **Nome da Escola**: nome da sua escola
   - **Turma**: ex. 102, 201, etc.
4. Clique em **"Cadastrar e Entrar"**

### Acessos Posteriores
1. O sistema reconhecerá você automaticamente
2. Clique em **"Sim, sou eu!"** para continuar
3. Ou clique em **"Não, criar novo perfil"** para trocar de usuário

### Seleção de Jogo
Na tela principal, escolha um dos desafios:
- 🎮 **Desafio de Matemática - Quiz**: Responda perguntas arrastando as respostas
- 📚 **Desafio do Balões**: Clique em balões com respostas corretas

### Sair da Conta
- Clique em **"Sair / Trocar Usuário"**
- Confirme a ação
- Seus dados serão apagados deste navegador

---

## 📁 Estrutura do Projeto

```
EscolaEstadual/
├── index.html              # Portal principal com sistema de login
├── README.md              # Este arquivo
├── LICENSE                # Licença MIT
│
├── scripts/
│   └── auth.js            # Sistema de autenticação com localStorage
│
├── jogoBalao/
│   ├── index.html         # Página do jogo dos balões
│   ├── baloes.js          # Lógica principal do jogo de balões
│   └── style.css          # Estilos do jogo de balões
│
└── jogoQuiz/
    ├── index.html         # Página do quiz de matemática
    └── quiz.js            # Lógica principal do quiz
```

---

## 💻 Tecnologias

| Tecnologia | Uso |
|-----------|-----|
| **HTML5** | Estrutura das páginas |
| **CSS3** | Estilização e layout flexbox |
| **JavaScript (Vanilla)** | Lógica de jogos e autenticação |
| **localStorage** | Persistência de dados do usuário |
| **GitHub Pages** | Hospedagem do site |

**Sem dependências externas!** Tudo roda no navegador do cliente.

---

## 🎮 Instruções dos Jogos

### 🎈 Jogo dos Balões

**Objetivo:** Clique nos balões que contêm o resultado correto das contas mostradas.

#### Como Jogar:
1. Clique em **"INICIAR JOGO"**
2. Observe as contas matemáticas no painel à direita
3. Balões com números subirão pela tela
4. Clique apenas nos balões que correspondem aos resultados das contas
5. Erros causam Game Over imediatamente

#### Progressão:
- **Fase 1-3**: Adição simples
- **Fase 4-7**: Adição e subtração progressivas
- Velocidade aumenta a cada fase

#### Ranking:
- Top 10 melhores pontuações aparece no painel
- Classificado por pontuação (maior é melhor)
- Ordenado por tempo médio como desempate

#### Controles:
- **PAUSAR JOGO**: Interrompe e volta à tela inicial
- **JOGAR NOVAMENTE**: Reinicia com stats zeradas
- **SAIR**: Volta ao portal principal

---

### 🧠 Quiz de Matemática

**Objetivo:** Selecione o resultado correto arrastando a resposta para a zona de resposta.

#### Como Jogar:
1. Escolha um nível de dificuldade:
   - **Fácil**: Adição (1 a 10)
   - **Médio**: Subtração (10 a 60)
   - **Difícil**: Multiplicação (2 a 12)

2. Para cada pergunta:
   - Observe a operação no centro
   - Arraste uma das 4 opções para a zona "?"
   - Receba feedback imediato

3. Se acertar: ✅ Próxima pergunta em 2 segundos
4. Se errar: ❌ Tente novamente

#### Controles:
- **Drag and Drop**: Arraste o número até a zona de resposta
- Não há limite de tentativas por pergunta

---

## 💾 Como Executar Localmente

### Requisitos:
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Nenhuma dependência especial

### Opção 1: Abrir Diretamente
1. Clone ou baixe o repositório:
   ```bash
   git clone https://github.com/EscolaEducaRS/EscolaEstadual.git
   cd EscolaEstadual
   ```

2. Abra `index.html` no navegador:
   - Windows: Duplo clique em `index.html`
   - macOS/Linux: `open index.html` ou duplo clique

### Opção 2: Usar um Servidor Local (Recomendado)

**Com Python 3:**
```bash
cd EscolaEstadual
python -m http.server 8000
```
Abra http://localhost:8000 no navegador

**Com Node.js (http-server):**
```bash
npm install -g http-server
cd EscolaEstadual
http-server
```

**Com Live Server (VS Code):**
1. Instale a extensão "Live Server"
2. Clique direito em `index.html`
3. Selecione "Open with Live Server"

---

## 🔒 Privacidade e Dados

- ✅ Todos os dados são armazenados **localmente** no seu navegador
- ✅ Nenhuma informação é enviada para servidores
- ✅ Dados são apagados ao fazer logout ou limpar cache do navegador
- ✅ Seguro para uso em sala de aula

---

## 📝 Conceitos Educacionais

Este projeto ensina:

### Front-end:
- ✏️ Estrutura HTML semântica
- 🎨 CSS Grid e Flexbox
- ⚙️ JavaScript vanilla (sem frameworks)
- 💾 localStorage API
- 🎯 Event listeners e manipulação de DOM

### Programação:
- 🔄 Programação orientada a objetos (Classe BalloonGame)
- 📊 Estruturas de dados (arrays, objetos)
- 🎲 Geração de números aleatórios
- ⏱️ Timers e animações
- 🔍 Métodos de array (map, filter, find)

### Soft Skills:
- 🎯 Lógica de programação
- 🧠 Raciocínio matemático
- ⚡ Pensamento rápido (nos jogos)

---

## 🤝 Contribuindo

Para melhorias ou correções:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📧 Contato

- **Organização:** EscolaEducaRS
- **GitHub:** [@EscolaEducaRS](https://github.com/EscolaEducaRS)
- **Site do Projeto:** [https://escolaeducars.github.io/EscolaEstadual/](https://escolaeducars.github.io/EscolaEstadual/)

---

## 🎯 Melhorias Futuras

- [ ] Adicionar mais tipos de operações (divisão, potência)
- [ ] Sistema de pontuação com servidor
- [ ] Multiplayer / competição entre turmas
- [ ] Customização de dificuldade
- [ ] Suporte para temas escuros
- [ ] Relatórios de desempenho
- [ ] Badges e achievements

---

**Feito com ❤️ para educação**
