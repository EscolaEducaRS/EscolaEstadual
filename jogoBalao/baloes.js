/**
 * CLASSE BALLOONGAME - Versão Final com Ranking e Custom Game Over
 * Gerencia Fila de Expressões, Persistência e Ciclo de Vida.
 */
class BalloonGame {
    constructor() {
        // Inicialização de estado e recuperação de dados do portal principal
        this.userName = localStorage.getItem('escola_nome') || "Estudante";
        this.score = 0;
        this.phase = 1;
        this.hits = 0;
        this.expressionQueue = []; // Máximo de 5 contas simultâneas
        this.responseTimes = []; // Array para cálculo da média
        this.isActive = false;
        this.timers = { spawn: null, queue: null };

        this.initInterface(); // Injeta Front-end via JS
        this.setupSecurity(); // Visibility API e Blur
    }

    /**
     * Monta a interface no DOM respeitando a restrição de código zero no HTML [2].
     */
    initInterface() {
        const root = document.getElementById('game-app');
        if (!root) return;

        root.innerHTML = `
            <div id="overlay-start">
                <button id="btn-begin" class="btn-ui btn-play">INICIAR DESAFIO</button>
            </div>
            <div id="overlay-gameover" style="display:none;"></div>
            <div id="main-wrapper">
                <main id="canvas-jogo"></main>
                <aside id="painel-info">
                    <h2>👤 ${this.userName}</h2>
                    <div id="hud-status">Fase: 1 | Pontos: 0 | Acertos: 0/5</div>
                    <button id="btn-pause-game" style="margin-top:10px; cursor:pointer;">PAUSAR JOGO</button>
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
        document.getElementById('btn-begin').onclick = () => this.toggleGameState(true);
        document.getElementById('btn-pause-game').onclick = () => this.toggleGameState(false);
    }

    /**
     * Gerencia a segurança: pausa e limpa a tela se perder o foco [MDN 343].
     */
    setupSecurity() {
        window.onblur = () => { if(this.isActive) this.toggleGameState(false); };
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && this.isActive) this.toggleGameState(false);
        });
    }

    /**
     * Controla o fluxo do jogo e destruição de elementos no pause/erro.
     */
    toggleGameState(active) {
        this.isActive = active;
        document.getElementById('overlay-start').style.display = active ? 'none' : 'flex';
        
        if (active) {
            this.startLoops();
        } else {
            this.clearGameplay();
        }
    }

    /**
     * Adiciona uma nova conta matemática na fila (máximo 5) [MDN 343].
     */
    generateExpression() {
        if (this.expressionQueue.length >= 5) {
            this.expressionQueue.shift(); // Remove a mais antiga se exceder 5
        }

        const n1 = Math.floor(Math.random() * (this.phase * 8)) + 2;
        const n2 = Math.floor(Math.random() * n1);
        const op = (this.phase > 2 && Math.random() > 0.5) ? '-' : '+';
        const result = op === '+' ? n1 + n2 : n1 - n2;

        this.expressionQueue.push({ 
            text: `${n1}${op}${n2}`, 
            value: result, 
            startTime: Date.now() 
        });
        this.updateHUD();
    }

    updateHUD() {
        const container = document.getElementById('list-expressions');
        container.innerHTML = this.expressionQueue.map(ex => `
            <div class="box-conta"><div class="texto-conta">${ex.text}</div></div>
        `).join('');
        document.getElementById('hud-status').innerText = `Fase: ${this.phase} | Pontos: ${this.score} | Acertos: ${this.hits}/5`;
    }

    /**
     * Cria e anima o balão fisicamente no DOM.
     */
    spawnBalloon() {
        if (!this.isActive || this.expressionQueue.length === 0) return;

        const scene = document.getElementById('canvas-jogo');
        const balloon = document.createElement('div');
        balloon.className = 'balao';
        
        // Sorteia alvo entre as 5 expressões ativas
        const target = this.expressionQueue[Math.floor(Math.random() * this.expressionQueue.length)];
        const isCorrect = Math.random() > 0.6;
        const value = isCorrect ? target.value : target.value + (Math.floor(Math.random() * 8) - 4);

        balloon.innerText = value;
        balloon.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
        balloon.style.left = Math.random() * (scene.clientWidth - 80) + 'px';
        scene.appendChild(balloon);

        this.animateBalloon(balloon, value);
    }

    animateBalloon(el, val) {
        let bottom = -120;
        const speed = 1.3 + (this.phase * 0.4);

        const loop = setInterval(() => {
            if (!this.isActive) { clearInterval(loop); el.remove(); return; }
            bottom += speed;
            el.style.bottom = bottom + 'px';
            if (bottom > window.innerHeight) { clearInterval(loop); el.remove(); }
        }, 16);

        el.onclick = () => {
            const idx = this.expressionQueue.findIndex(ex => ex.value === parseInt(val));
            if (idx !== -1) {
                this.handleHit(idx, el, loop);
            } else {
                this.triggerGameOver();
            }
        };
    }

    handleHit(idx, el, loop) {
        const timeSpent = (Date.now() - this.expressionQueue[idx].startTime) / 1000;
        this.responseTimes.push(timeSpent);
        this.score += 10;
        this.hits++;
        this.expressionQueue.splice(idx, 1);
        el.remove();
        clearInterval(loop);

        if (this.hits >= 5) {
            this.phase++;
            this.hits = 0;
            this.startLoops(); // Reinicia com novos tempos de fase
        }
        this.updateHUD();
    }

    /**
     * Tela de Game Over Personalizada solicitada.
     */
    triggerGameOver() {
        this.isActive = false;
        this.clearGameplay();
        this.saveRanking();

        const avgTime = this.calculateAverage();
        const gameOverOverlay = document.getElementById('overlay-gameover');
        
        gameOverOverlay.innerHTML = `
            <div class="card-result">
                <h1>FIM DE JOGO</h1>
                <p>Usuário: <strong>${this.userName}</strong></p>
                <p>Pontuação Final: <span style="color:#2ECC71">${this.score}</span></p>
                <p>Tempo Médio de Resposta: <strong>${avgTime}s</strong></p>
                <div style="margin-top:30px;">
                    <button id="btn-restart" class="btn-ui btn-play">JOGAR NOVAMENTE</button>
                    <button id="btn-quit" class="btn-ui btn-exit">SAIR</button>
                </div>
            </div>
        `;
        gameOverOverlay.style.display = 'flex';

        document.getElementById('btn-restart').onclick = () => {
            gameOverOverlay.style.display = 'none';
            this.resetStats();
            this.toggleGameState(true);
        };
        document.getElementById('btn-quit').onclick = () => {
            window.location.href = '../index.html';
        };
    }

    resetStats() {
        this.score = 0;
        this.phase = 1;
        this.hits = 0;
        this.responseTimes = [];
        this.expressionQueue = [];
    }

    /**
     * Lógica de Persistência e Ranking funcional.
     */
    saveRanking() {
        let rank = JSON.parse(localStorage.getItem('rank_baloes_pro')) || [];
        const media = this.calculateAverage();
        rank.push({ name: this.userName, pts: this.score, time: parseFloat(media) });
        // Ordena: 1º Pontos (Maior) | 2º Tempo (Menor - Desempate)
        rank.sort((a,b) => b.pts - a.pts || a.time - b.time);
        localStorage.setItem('rank_baloes_pro', JSON.stringify(rank.slice(0, 10)));
        this.renderRanking();
    }

    renderRanking() {
        const data = JSON.parse(localStorage.getItem('rank_baloes_pro')) || [];
        const list = document.getElementById('rank-data');
        if (list) {
            list.innerHTML = data.map((r, i) => `
                <div><span>${i+1}º ${r.name}</span> <span>${r.pts}pts (${r.time}s)</span></div>
            `).join('');
        }
    }

    calculateAverage() {
        return this.responseTimes.length > 0 ? 
            (this.responseTimes.reduce((a,b)=>a+b,0)/this.responseTimes.length).toFixed(2) : 0;
    }

    clearGameplay() {
        clearInterval(this.timers.spawn);
        clearInterval(this.timers.queue);
        this.expressionQueue = [];
        document.getElementById('canvas-jogo').innerHTML = '';
        document.getElementById('list-expressions').innerHTML = '';
    }

    startLoops() {
        this.clearGameplay();
        this.generateExpression();
        this.spawnBalloon(); // Primeiro balão imediato
        
        const spawnRate = Math.max(600, 2000 - (this.phase * 150));
        const queueRate = Math.max(3000, 7000 - (this.phase * 500));

        this.timers.spawn = setInterval(() => this.spawnBalloon(), spawnRate);
        this.timers.queue = setInterval(() => this.generateExpression(), queueRate);
    }
}

// Inicializa a classe após o carregamento do DOM
window.onload = () => { new BalloonGame(); };
