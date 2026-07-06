/**
 * CLASSE BALLOONGAME
 * Gerencia fila de 5 expressões, ranking persistente e anti-cheat de foco.
 */
class BalloonGame {
    constructor() {
        // Inicialização de estados e recuperação de dados do localStorage
        this.userName = localStorage.getItem('escola_nome') || "Estudante";
        this.score = 0;
        this.phase = 1;
        this.hits = 0;
        this.expressionQueue = []; // Máximo de 5 contas simultâneas
        this.responseTimes = []; // Para cálculo da média de tempo
        this.isActive = false;
        this.timers = { spawn: null, queue: null };

        // Correção do erro: nome do método deve ser idêntico à definição abaixo
        this.initInterface(); 
        this.setupSecurity(); 
    }

    /**
     * Injeta todo o front-end via JavaScript no elemento raiz game-app.
     */
    initInterface() {
        const root = document.getElementById('game-app');
        if (!root) {
            console.error("Erro: elemento 'game-app' não encontrado.");
            return;
        }

        root.innerHTML = `
            <div id="overlay-start">
                <button id="btn-begin" class="btn-ui btn-play">INICIAR JOGO</button>
            </div>
            <div id="overlay-gameover" style="display:none;"></div>
            <div id="main-wrapper">
                <main id="canvas-jogo"></main>
                <aside id="painel-info">
                    <h2>👤 ${this.userName}</h2>
                    <div id="hud-status">Fase: 1 | Pontos: 0</div>
                    <button id="btn-pause-manual" style="margin-top:10px; cursor:pointer;">PAUSAR</button>
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
        document.getElementById('btn-pause-manual').onclick = () => this.toggleGameState(false);
    }

    /**
     * Anti-Cheat: Pausa e destrói elementos ao perder foco ou minimizar.
     */
    setupSecurity() {
        window.onblur = () => { if(this.isActive) this.toggleGameState(false); };
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && this.isActive) this.toggleGameState(false);
        });
    }

    /**
     * Controla o fluxo de execução e a destruição total para evitar ganho de tempo.
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
     * Gerencia a fila de no máximo 5 expressões; remove a antiga se exceder.
     */
    generateExpression() {
        if (this.expressionQueue.length >= 5) {
            this.expressionQueue.shift(); 
        }

        const n1 = Math.floor(Math.random() * (this.phase * 8)) + 2;
        const n2 = Math.floor(Math.random() * n1);
        const op = (this.phase > 1 && Math.random() > 0.5) ? '-' : '+';
        const result = op === '+' ? n1 + n2 : n1 - n2;

        this.expressionQueue.push({ text: `${n1}${op}${n2}`, value: result, startTime: Date.now() });
        this.updateUI();
    }

    updateUI() {
        const list = document.getElementById('list-expressions');
        list.innerHTML = this.expressionQueue.map(ex => `
            <div class="box-conta"><div class="texto-conta">${ex.text}</div></div>
        `).join('');
        document.getElementById('hud-status').innerText = `Fase: ${this.phase} | Pontos: ${this.score}`;
    }

    /**
     * Cria balões baseados nas respostas corretas da fila ativa.
     */
    spawnBalloon() {
        if (!this.isActive || this.expressionQueue.length === 0) return;

        const scene = document.getElementById('canvas-jogo');
        const balloon = document.createElement('div');
        balloon.className = 'balao';
        
        const target = this.expressionQueue[Math.floor(Math.random() * this.expressionQueue.length)];
        const isCorrect = Math.random() > 0.6;
        const val = isCorrect ? target.value : target.value + (Math.floor(Math.random() * 8) - 4);

        balloon.innerText = val;
        balloon.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
        balloon.style.left = Math.random() * (scene.clientWidth - 80) + 'px';
        scene.appendChild(balloon);

        this.animateBalloon(balloon, val);
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
        const time = (Date.now() - this.expressionQueue[idx].startTime) / 1000;
        this.responseTimes.push(time);
        this.score += 10;
        this.hits++;
        this.expressionQueue.splice(idx, 1);
        el.remove();
        clearInterval(loop);

        if (this.hits >= 5) {
            this.phase++;
            this.hits = 0;
            this.startLoops();
        }
        this.updateUI();
    }

    /**
     * Custom Game Over: exibe resultados e oferece Jogar Novamente ou Sair.
     */
    triggerGameOver() {
        this.isActive = false;
        this.clearGameplay();
        this.saveRanking();

        const avg = this.responseTimes.length > 0 ? 
            (this.responseTimes.reduce((a,b)=>a+b,0)/this.responseTimes.length).toFixed(2) : 0;
        
        const overlay = document.getElementById('overlay-gameover');
        overlay.innerHTML = `
            <div style="background:#34495E; padding:40px; border-radius:20px; border:5px solid #2ECC71;">
                <h1>FIM DE JOGO</h1>
                <p>Usuário: ${this.userName} | Pontos: ${this.score}</p>
                <p>Tempo Médio: ${avg}s</p>
                <button id="btn-retry" class="btn-ui btn-play">JOGAR NOVAMENTE</button>
                <button id="btn-quit" class="btn-ui btn-exit">SAIR</button>
            </div>
        `;
        overlay.style.display = 'flex';

        document.getElementById('btn-retry').onclick = () => {
            overlay.style.display = 'none';
            this.score = 0; this.phase = 1; this.hits = 0; this.responseTimes = [];
            this.toggleGameState(true);
        };
        document.getElementById('btn-quit').onclick = () => window.location.href = '../index.html';
    }

    saveRanking() {
        let rank = JSON.parse(localStorage.getItem('rank_balao_final')) || [];
        const avg = this.responseTimes.length > 0 ? (this.responseTimes.reduce((a,b)=>a+b,0)/this.responseTimes.length).toFixed(2) : 0;
        rank.push({ n: this.userName, p: this.score, t: parseFloat(avg) });
        rank.sort((a,b) => b.p - a.p || a.t - b.t);
        localStorage.setItem('rank_balao_final', JSON.stringify(rank.slice(0, 10)));
        this.renderRanking();
    }

    renderRanking() {
        const data = JSON.parse(localStorage.getItem('rank_balao_final')) || [];
        const container = document.getElementById('rank-data');
        if (container) container.innerHTML = data.map((r, i) => `<div><span>${i+1}º ${r.n}</span> <span>${r.p}pts (${r.t}s)</span></div>`).join('');
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
        this.spawnBalloon();
        this.timers.spawn = setInterval(() => this.spawnBalloon(), Math.max(600, 2000 - (this.phase * 150)));
        this.timers.queue = setInterval(() => this.generateExpression(), Math.max(3000, 7000 - (this.phase * 500)));
    }
}

// Inicializa o motor do jogo após o carregamento do DOM
window.onload = () => { new BalloonGame(); };
