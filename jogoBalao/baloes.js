/**
 * CLASSE BALLOONGAME
 * Gerencia a fila de 5 expressões, ranking persistente e anti-cheat.
 */
class BalloonGame {
    constructor() {
        // Inicialização de variáveis de estado
        this.userName = localStorage.getItem('escola_nome') || "Estudante";
        this.score = 0;
        this.phase = 1;
        this.hits = 0;
        this.expressionQueue = []; // Máximo 5 simultâneas
        this.responseTimes = [];
        this.isActive = false;
        this.timers = { spawn: null, queue: null };

        // CHAMADA CORRIGIDA: Nome deve bater com a definição abaixo
        this.initInterface(); 
        this.setupSecurity(); 
    }

    /**
     * Injeta todo o front-end via JavaScript respeitando a regra de HTML limpo.
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
                    <button id="btn-pause-manual" style="margin-top:10px; cursor:pointer;">PAUSAR JOGO</button>
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
     * Anti-Cheat: Destrói elementos e pausa ao perder o foco [MDN 343].
     */
    setupSecurity() {
        window.onblur = () => { if(this.isActive) this.toggleGameState(false); };
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && this.isActive) this.toggleGameState(false);
        });
    }

    /**
     * Gerencia o estado do jogo e a limpeza da tela.
     */
    toggleGameState(active) {
        this.isActive = active;
        document.getElementById('overlay-start').style.display = active ? 'none' : 'flex';
        if (active) {
            this.startEngine();
        } else {
            this.clearScreen();
        }
    }

    /**
     * Adiciona nova conta na fila e remove a mais antiga se passar de 5.
     */
    generateExpression() {
        if (this.expressionQueue.length >= 5) this.expressionQueue.shift();

        const n1 = Math.floor(Math.random() * (this.phase * 8)) + 2;
        const n2 = Math.floor(Math.random() * n1);
        const op = (this.phase > 1 && Math.random() > 0.5) ? '-' : '+';
        const result = op === '+' ? n1 + n2 : n1 - n2;

        this.expressionQueue.push({ text: `${n1}${op}${n2}`, value: result, start: Date.now() });
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
     * Cria o balão fisicamente e define sua velocidade por fase.
     */
    spawnBalloon() {
        if (!this.isActive || this.expressionQueue.length === 0) return;

        const scene = document.getElementById('canvas-jogo');
        const balloon = document.createElement('div');
        balloon.className = 'balao';
        
        const target = this.expressionQueue[Math.floor(Math.random() * this.expressionQueue.length)];
        const isRight = Math.random() > 0.6;
        const val = isRight ? target.value : target.value + (Math.floor(Math.random() * 8) - 4);

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
            if (!this.isActive) { clearInterval(move); el.remove(); return; }
            bottom += speed;
            el.style.bottom = bottom + 'px';
            if (bottom > window.innerHeight) { clearInterval(move); el.remove(); }
        }, 16);

        el.onclick = () => {
            const idx = this.expressionQueue.findIndex(ex => ex.value === parseInt(val));
            if (idx !== -1) {
                this.handleHit(idx, el, move);
            } else {
                this.triggerGameOver();
            }
        };
    }

    handleHit(idx, el, timer) {
        this.responseTimes.push((Date.now() - this.expressionQueue[idx].start) / 1000);
        this.score += 10;
        this.hits++;
        this.expressionQueue.splice(idx, 1);
        el.remove();
        clearInterval(timer);

        if (this.hits >= 5) {
            this.phase++;
            this.hits = 0;
            this.startEngine();
        }
        this.updateHUD();
    }

    /**
     * Tela de Game Over com Nome, Pontos, Tempo e Opções de Reiniciar/Sair.
     */
    triggerGameOver() {
        this.isActive = false;
        this.clearScreen();
        this.saveRanking();

        const avg = this.responseTimes.length > 0 ? (this.responseTimes.reduce((a,b)=>a+b,0)/this.responseTimes.length).toFixed(2) : 0;
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
        const list = document.getElementById('rank-data');
        if (list) list.innerHTML = data.map((r, i) => `<div><span>${i+1}º ${r.n}</span> <span>${r.p}pts (${r.t}s)</span></div>`).join('');
    }

    clearScreen() {
        clearInterval(this.timers.spawn);
        clearInterval(this.timers.queue);
        this.expressionQueue = [];
        document.getElementById('canvas-jogo').innerHTML = '';
        document.getElementById('list-expressions').innerHTML = '';
    }

    startEngine() {
        this.clearScreen();
        this.generateExpression();
        this.spawnBalloon();
        this.timers.spawn = setInterval(() => this.spawnBalloon(), Math.max(600, 2000 - (this.phase * 150)));
        this.timers.queue = setInterval(() => this.generateExpression(), Math.max(3000, 7000 - (this.phase * 500)));
    }
}

// Inicialização segura após o carregamento do DOM
window.onload = () => { new BalloonGame(); };
