/**
 * CLASSE BALLOONGAME - Versão Melhorada v2.0
 * Gerencia ciclo de vida, ranking, fila de expressões matemáticas
 * Com tratamento de erros, melhor tolerância a falhas e UX aprimorada
 */
class BalloonGame {
    constructor() {
        // Inicialização do estado
        this.userName = this.getSafeUserName();
        this.score = 0;
        this.phase = 1;
        this.hits = 0;
        this.errors = 0; // Novo: contador de erros
        this.maxErrors = 3; // Novo: máximo 3 erros antes do game over
        this.expressionQueue = []; // Máximo de 5 contas simultâneas
        this.responseTimes = [];
        this.isActive = false;
        this.timers = { spawn: null, queue: null, balloons: [] }; // Novo: rastrear todos os timers

        // CHAMADA CRÍTICA: Nome sincronizado com o método definido abaixo
        this.initInterface();
        this.setupSecurity();
    }

    /**
     * NOVO: Recupera nome do usuário com segurança
     */
    getSafeUserName() {
        try {
            return localStorage.getItem('escola_nome') || 'Estudante';
        } catch (e) {
            console.error('Erro ao recuperar nome:', e);
            return 'Estudante';
        }
    }

    /**
     * Injeta todo o front-end via JavaScript no elemento raiz 'game-app'.
     * Cumpre a regra de não ter texto ou estrutura no HTML original.
     */
    initInterface() {
        const root = document.getElementById('game-app');
        if (!root) {
            this.showError('Erro: Elemento game-app não encontrado!');
            return;
        }

        root.innerHTML = `
            <div id="error-message"></div>
            <div id="overlay-start">
                <button id="btn-begin" class="btn-ui btn-play">INICIAR JOGO</button>
            </div>
            <div id="overlay-gameover" style="display:none;"></div>
            <div id="main-wrapper">
                <main id="canvas-jogo"></main>
                <aside id="painel-info">
                    <h2>👤 ${this.userName}</h2>
                    <div id="hud-status">Fase: 1 | Pontos: 0 | Acertos: 0/5 | Erros: 0/3</div>
                    <button id="btn-pause-manual" style="margin-top:10px; cursor:pointer; padding:10px; background:#34495E; color:white; border:none; border-radius:6px;">PAUSAR JOGO</button>
                    <hr style="width:100%; margin:20px 0;">
                    <div id="list-expressions"></div>
                    <div id="ranking-container" style="margin-top:auto;">
                        <h3>🏆 TOP 10 RANKING</h3>
                        <div id="rank-data"></div>
                    </div>
                </aside>
            </div>
        `;
        this.renderRanking();

        // Atribuição de eventos aos elementos injetados
        const btnBegin = document.getElementById('btn-begin');
        const btnPause = document.getElementById('btn-pause-manual');
        if (btnBegin) btnBegin.onclick = () => this.toggleGameState(true);
        if (btnPause) btnPause.onclick = () => this.toggleGameState(false);
    }

    /**
     * Anti-Cheat: Pausa e limpa o campo de jogo se a janela perder o foco.
     */
    setupSecurity() {
        window.onblur = () => { if(this.isActive) this.toggleGameState(false); };
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isActive) this.toggleGameState(false);
        });
    }

    /**
     * Gerencia a transição entre estados e destruição de objetos para otimização.
     */
    toggleGameState(active) {
        this.isActive = active;
        const overlay = document.getElementById('overlay-start');
        if (overlay) overlay.style.display = active ? 'none' : 'flex';

        if (active) {
            this.startEngine();
        } else {
            this.clearGameplay();
        }
    }

    /**
     * Adiciona nova conta na fila (máximo 5). Se exceder, a mais antiga é removida (shift).
     */
    generateExpression() {
        if (this.expressionQueue.length >= 5) {
            this.expressionQueue.shift();
        }

        const n1 = Math.floor(Math.random() * (this.phase * 8)) + 2;
        const n2 = Math.floor(Math.random() * n1);
        const op = (this.phase > 1 && Math.random() > 0.5) ? '-' : '+';
        const result = op === '+' ? n1 + n2 : n1 - n2;

        this.expressionQueue.push({
            text: `${n1}${op}${n2}`,
            value: result,
            start: Date.now()
        });
        this.updateHUD();
    }

    updateHUD() {
        const container = document.getElementById('list-expressions');
        if (container) {
            container.innerHTML = this.expressionQueue.map(ex => `
                <div class="box-conta"><div class="texto-conta">${ex.text}</div></div>
            `).join('');
        }
        const hud = document.getElementById('hud-status');
        if (hud) {
            hud.innerText = `Fase: ${this.phase} | Pontos: ${this.score} | Acertos: ${this.hits}/5 | Erros: ${this.errors}/${this.maxErrors}`;
        }
    }

    /**
     * Cria o elemento balão e define sua velocidade com base na fase atual.
     */
    spawnBalloon() {
        if (!this.isActive || this.expressionQueue.length === 0) return;

        const scene = document.getElementById('canvas-jogo');
        if (!scene) return;

        const balloon = document.createElement('div');
        balloon.className = 'balao';

        const target = this.expressionQueue[Math.floor(Math.random() * this.expressionQueue.length)];
        const isRight = Math.random() > 0.6;
        let val;

        if (isRight) {
            val = target.value;
        } else {
            // NOVO: Garantir que não gera números negativos
            const offset = Math.floor(Math.random() * 8) - 4;
            val = Math.max(0, target.value + offset); // Nunca negativo
        }

        balloon.innerText = val;
        balloon.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
        balloon.style.left = Math.random() * (scene.clientWidth - 80) + 'px';
        scene.appendChild(balloon);

        this.animateBalloon(balloon, val);
    }

    animateBalloon(el, val) {
        let bottom = -120;
        const speed = 1.3 + (this.phase * 0.4);

        const move = setInterval(() => {
            if (!this.isActive) {
                clearInterval(move);
                if (el.parentNode) el.remove();
                return;
            }
            bottom += speed;
            el.style.bottom = bottom + 'px';
            if (bottom > window.innerHeight) {
                clearInterval(move);
                if (el.parentNode) el.remove();
            }
        }, 16);

        // Novo: rastrear timers
        this.timers.balloons.push(move);

        el.onclick = () => {
            const idx = this.expressionQueue.findIndex(ex => ex.value === parseInt(val));
            if (idx !== -1) {
                this.handleHit(idx, el, move);
            } else {
                this.handleError(); // NOVO: método para tratar erros
            }
        };
    }

    /**
     * NOVO: Trata erros do jogador
     */
    handleError() {
        this.errors++;
        this.updateHUD();
        this.showError(`❌ Errado! Erros: ${this.errors}/${this.maxErrors}`);

        if (this.errors >= this.maxErrors) {
            this.triggerGameOver();
        }
    }

    /**
     * NOVO: Exibir mensagem de erro temporária
     */
    showError(message) {
        const errorEl = document.getElementById('error-message');
        if (errorEl) {
            errorEl.innerText = message;
            errorEl.style.display = 'block';
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 2000);
        }
    }

    handleHit(idx, el, timer) {
        this.responseTimes.push((Date.now() - this.expressionQueue[idx].start) / 1000);
        this.score += 10;
        this.hits++;
        this.expressionQueue.splice(idx, 1);
        if (el.parentNode) el.remove();
        clearInterval(timer);

        // Novo: remover do rastreamento
        this.timers.balloons = this.timers.balloons.filter(t => t !== timer);

        if (this.hits >= 5) {
            this.phase++;
            this.hits = 0;
            this.startEngine();
        }
        this.updateHUD();
    }

    /**
     * Tela de resultados final com opções de persistência no ranking.
     */
    triggerGameOver() {
        this.isActive = false;
        this.clearGameplay();
        this.saveRanking();

        const avg = this.calculateAvg();
        const overlay = document.getElementById('overlay-gameover');

        if (overlay) {
            overlay.innerHTML = `
                <div style="background:#34495E; padding:40px; border-radius:20px; border:5px solid #2ECC71;">
                    <h1>🎉 FIM DE JOGO 🎉</h1>
                    <p>Usuário: <strong>${this.userName}</strong></p>
                    <p>Pontuação: <span style="color:#2ECC71; font-size:28px;">${this.score}</span></p>
                    <p>Fase Alcançada: <strong>${this.phase}</strong></p>
                    <p>Tempo Médio: <strong>${avg}s</strong></p>
                    <button id="btn-retry" class="btn-ui btn-play">JOGAR NOVAMENTE</button>
                    <button id="btn-quit" class="btn-ui btn-exit">SAIR</button>
                </div>
            `;
            overlay.style.display = 'flex';

            const btnRetry = document.getElementById('btn-retry');
            const btnQuit = document.getElementById('btn-quit');

            if (btnRetry) {
                btnRetry.onclick = () => {
                    overlay.style.display = 'none';
                    this.resetStats();
                    this.toggleGameState(true);
                };
            }
            if (btnQuit) {
                btnQuit.onclick = () => window.location.href = '../index.html';
            }
        }
    }

    resetStats() {
        this.score = 0;
        this.phase = 1;
        this.hits = 0;
        this.errors = 0; // NOVO: resetar erros
        this.responseTimes = [];
        this.expressionQueue = [];
    }

    /**
     * NOVO: Salvar ranking com tratamento de erro
     */
    saveRanking() {
        try {
            let rank = [];
            try {
                const stored = localStorage.getItem('rank_balao_final');
                rank = stored ? JSON.parse(stored) : [];
            } catch (e) {
                console.error('Erro ao ler ranking:', e);
                rank = [];
            }

            const avg = this.calculateAvg();
            rank.push({ n: this.userName, p: this.score, t: parseFloat(avg) });
            rank.sort((a, b) => b.p - a.p || a.t - b.t);
            localStorage.setItem('rank_balao_final', JSON.stringify(rank.slice(0, 10)));
            this.renderRanking();
        } catch (e) {
            console.error('Erro ao salvar ranking:', e);
            this.showError('⚠️ Erro ao salvar ranking');
        }
    }

    /**
     * NOVO: Renderizar ranking com tratamento de erro
     */
    renderRanking() {
        try {
            let data = [];
            try {
                const stored = localStorage.getItem('rank_balao_final');
                data = stored ? JSON.parse(stored) : [];
            } catch (e) {
                console.error('Erro ao ler ranking para renderizar:', e);
                data = [];
            }

            const container = document.getElementById('rank-data');
            if (container) {
                container.innerHTML = data.map((r, i) =>
                    `<div><span>${i + 1}º ${r.n}</span> <span>${r.p}pts (${r.t}s)</span></div>`
                ).join('');
            }
        } catch (e) {
            console.error('Erro ao renderizar ranking:', e);
        }
    }

    calculateAvg() {
        return this.responseTimes.length > 0
            ? (this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length).toFixed(2)
            : 0;
    }

    /**
     * NOVO: Melhor limpeza de recursos
     */
    clearGameplay() {
        clearInterval(this.timers.spawn);
        clearInterval(this.timers.queue);

        // Limpar todos os timers de balões
        this.timers.balloons.forEach(timer => clearInterval(timer));
        this.timers.balloons = [];

        this.expressionQueue = [];

        const canvas = document.getElementById('canvas-jogo');
        if (canvas) canvas.innerHTML = '';

        const listExp = document.getElementById('list-expressions');
        if (listExp) listExp.innerHTML = '';
    }

    startEngine() {
        this.clearGameplay();
        this.generateExpression();
        this.spawnBalloon();

        this.timers.spawn = setInterval(
            () => this.spawnBalloon(),
            Math.max(600, 2000 - (this.phase * 150))
        );

        this.timers.queue = setInterval(
            () => this.generateExpression(),
            Math.max(3000, 7000 - (this.phase * 500))
        );
    }
}

// Inicialização segura após carregamento do DOM
window.onload = () => {
    try {
        new BalloonGame();
    } catch (e) {
        console.error('Erro ao inicializar jogo:', e);
        alert('Erro ao carregar o jogo. Recarregue a página.');
    }
};