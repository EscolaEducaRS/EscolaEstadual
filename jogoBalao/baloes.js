/**
 * CLASSE BALLOONGAME
 * Gerencia o ciclo de vida do jogo, UI dinâmica e Anti-Cheat.
 */
class BalloonGame {
    constructor() {
        this.nomeUser = localStorage.getItem('escola_nome') || "Estudante";
        this.pontos = 0;
        this.fase = 1;
        this.acertos = 0;
        this.expFila = []; // Fila de no máximo 5 expressões
        this.isAtivo = false;
        this.spawnTimer = null;
        this.expTimer = null;

        this.initInterface(); // Injeta o front-end via JS
        this.bindEvents(); // Configura segurança (Focus/Blur)
    }

    /**
     * Injeta a interface no DOM respeitando a regra de não usar HTML estático.
     */
    initInterface() {
        const root = document.getElementById('game-app');
        root.innerHTML = `
            <div id="overlay-start"><button id="btn-play">INICIAR JOGO</button></div>
            <div id="main-wrapper">
                <main id="canvas-jogo"></main>
                <aside id="painel-info">
                    <h2>${this.nomeUser}</h2>
                    <div id="status">Fase: 1 | Pontos: 0</div>
                    <button id="btn-pause" style="margin-top:10px; cursor:pointer;">PAUSE</button>
                    <hr style="width:100%; margin:20px 0;">
                    <div id="container-lista-exp"></div>
                    <div id="ranking" style="margin-top:auto;"><h3>🏆 Top 10</h3><div id="rank-data"></div></div>
                </aside>
            </div>
        `;
        document.getElementById('btn-play').onclick = () => this.setGameState(true);
        document.getElementById('btn-pause').onclick = () => this.setGameState(false);
    }

    /**
     * Alterna estado do jogo. Se pausar ou perder o foco, limpa tudo.
     */
    setGameState(ativo) {
        this.isAtivo = ativo;
        document.getElementById('overlay-start').style.display = ativo ? 'none' : 'flex';
        if (ativo) {
            this.startLoop();
        } else {
            this.clearGameplay(); // Destrói balões e expressões (Anti-Cheat)
        }
    }

    /**
     * Gerencia a fila de expressões matemáticas (Máx 5).
     */
    gerarExpressao() {
        if (this.expFila.length >= 5) this.expFila.shift(); // Remove a mais antiga

        const n1 = Math.floor(Math.random() * (this.fase * 10)) + 1;
        const n2 = Math.floor(Math.random() * (this.fase * 5)) + 1;
        const op = (this.fase > 2 && Math.random() > 0.5) ? '-' : '+';
        const res = op === '+' ? n1 + n2 : n1 - n2;

        this.expFila.push({ texto: `${n1}${op}${n2}`, valor: res });
        this.renderExp();
    }

    renderExp() {
        const lista = document.getElementById('container-lista-exp');
        lista.innerHTML = this.expFila.map(e => `
            <div class="box-conta"><div class="texto-conta">${e.texto}</div></div>
        `).join('');
    }

    /**
     * Cria balões e define movimento.
     */
    spawnBalao() {
        if (!this.isAtivo || this.expFila.length === 0) return;

        const cena = document.getElementById('canvas-jogo');
        const b = document.createElement('div');
        b.className = 'balao';
        
        // Sorteia se é resposta de qualquer uma das 5 expressões ativas
        const alvo = this.expFila[Math.floor(Math.random() * this.expFila.length)];
        const valor = Math.random() > 0.6 ? alvo.valor : alvo.valor + (Math.floor(Math.random() * 6) - 3);

        b.innerText = valor;
        b.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
        b.style.left = Math.random() * (cena.clientWidth - 80) + 'px';
        cena.appendChild(b);

        this.animar(b, valor);
    }

    animar(el, val) {
        let pos = -120;
        const speed = 1.2 + (this.fase * 0.4);
        const loop = setInterval(() => {
            if (!this.isAtivo) { clearInterval(loop); el.remove(); return; }
            pos += speed;
            el.style.bottom = pos + 'px';
            if (pos > window.innerHeight) { clearInterval(loop); el.remove(); }
        }, 16);

        el.onclick = () => {
            const idx = this.expFila.findIndex(ex => ex.valor === parseInt(val));
            if (idx !== -1) {
                this.handleHit(idx, el, loop);
            } else {
                this.setGameState(false); // Game Over
            }
        };
    }

    handleHit(idx, el, timer) {
        this.pontos += 10;
        this.acertos++;
        this.expFila.splice(idx, 1); // Remove a conta resolvida
        el.remove();
        clearInterval(timer);
        if (this.acertos % 5 === 0) { this.fase++; this.startLoop(); } // Sobe de fase
        this.renderExp();
        document.getElementById('status').innerText = `Fase: ${this.fase} | Pontos: ${this.pontos}`;
    }

    clearGameplay() {
        clearInterval(this.spawnTimer);
        clearInterval(this.expTimer);
        this.expFila = [];
        document.getElementById('canvas-jogo').innerHTML = '';
        document.getElementById('container-lista-exp').innerHTML = '';
    }

    startLoop() {
        this.clearGameplay();
        this.gerarExpressao();
        this.spawnBalao(); // Começa imediatamente sem delay
        this.spawnTimer = setInterval(() => this.spawnBalao(), Math.max(600, 2000 - (this.fase * 150)));
        this.expTimer = setInterval(() => this.gerarExpressao(), 5000);
    }

    bindEvents() {
        window.onblur = () => this.setGameState(false); // Segurança: limpa ao perder foco
        document.addEventListener("visibilitychange", () => { if(document.hidden) this.setGameState(false); });
    }
}

// Inicializa o jogo
window.onload = () => { new BalloonGame(); };
