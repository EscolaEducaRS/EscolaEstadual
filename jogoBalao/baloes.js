/**
 * CLASSE BALLOONGAME
 * Gerencia a lógica de expressões, spawn de balões, ranking e sistema de pause.
 */
class BalloonGame {
    constructor() {
        // Inicialização de variáveis de estado
        this.userName = localStorage.getItem('escola_nome') || "Estudante";
        this.score = 0;
        this.phase = 1;
        this.hits = 0;
        this.expressions = []; // Fila de no máximo 5 expressões
        this.isPaused = true;
        this.intervals = { spawn: null, expression: null };
        
        this.initDOM(); // Monta a interface via JS [14]
        this.setupSecurityEvents(); // Configura Anti-Cheat (Focus/Blur)
    }

    /**
     * Monta o Front-end inteiramente via JavaScript conforme instrução [14]
     */
    initDOM() {
        const root = document.getElementById('game-root');
        root.innerHTML = `
            <div id="overlay"><button id="btn-start">INICIAR DESAFIO</button></div>
            <div id="game-container">
                <main id="scene"></main>
                <aside id="sidebar">
                    <h2>👤 ${this.userName}</h2>
                    <div id="status-hud">Fase: 1 | Pontos: 0</div>
                    <button id="btn-pause-manual" style="margin-top:10px; padding:10px; cursor:pointer;">PAUSAR JOGO</button>
                    <hr style="width:100%; margin:20px 0;">
                    <div id="expression-list"></div>
                    <div style="margin-top: auto;">
                        <h3>🏆 TOP 10 RANKING</h3>
                        <div id="ranking-list"></div>
                    </div>
                </aside>
            </div>
        `;
        this.renderRanking();
        
        // Eventos de clique iniciais
        document.getElementById('btn-start').onclick = () => this.togglePause(false);
        document.getElementById('btn-pause-manual').onclick = () => this.togglePause(true);
    }

    /**
     * Sistema Anti-Trapaça: Pausa e limpa a tela ao perder o foco [MDN 343]
     */
    setupSecurityEvents() {
        window.onblur = () => this.togglePause(true);
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) this.togglePause(true);
        });
    }

    /**
     * Gerencia o estado de Pause e destruição de elementos
     */
    togglePause(pause) {
        this.isPaused = pause;
        document.getElementById('overlay').style.display = pause ? 'flex' : 'none';
        
        if (pause) {
            this.stopEngine();
            this.clearScreen(); // Remove balões e expressões ao pausar
        } else {
            this.startEngine();
        }
    }

    /**
     * Limpa elementos ativos para evitar que o usuário pense na resposta parado
     */
    clearScreen() {
        this.expressions = [];
        document.getElementById('scene').innerHTML = '';
        document.getElementById('expression-list').innerHTML = '';
    }

    /**
     * Inicia os timers de geração baseados na fase atual
     */
    startEngine() {
        this.generateExpression(); // Gera a primeira imediatamente
        
        // Velocidade de spawn de balões aumenta com a fase
        const spawnTime = Math.max(700, 2000 - (this.phase * 200));
        // Entrada de novas expressões acelera com o tempo
        const expTime = Math.max(3000, 6000 - (this.phase * 400));

        this.intervals.spawn = setInterval(() => this.spawnBalloon(), spawnTime);
        this.intervals.expression = setInterval(() => this.generateExpression(), expTime);
    }

    stopEngine() {
        clearInterval(this.intervals.spawn);
        clearInterval(this.intervals.expression);
    }

    /**
     * Gerencia a fila de no máximo 5 expressões
     */
    generateExpression() {
        if (this.expressions.length >= 5) {
            this.expressions.shift(); // Remove a mais antiga se houver 5
        }

        const n1 = Math.floor(Math.random() * (this.phase * 10)) + 1;
        const n2 = Math.floor(Math.random() * (this.phase * 5)) + 1;
        const op = (this.phase > 2 && Math.random() > 0.5) ? '-' : '+';
        
        const res = op === '+' ? n1 + n2 : Math.max(n1, n2) - Math.min(n1, n2);
        const text = op === '+' ? `${n1}+${n2}` : `${Math.max(n1, n2)}-${Math.min(n1, n2)}`;

        this.expressions.push({ text, res });
        this.updateUI();
    }

    updateUI() {
        const list = document.getElementById('expression-list');
        list.innerHTML = this.expressions.map(ex => `
            <div class="exp-box"><div class="exp-text">${ex.text}</div></div>
        `).join('');
        document.getElementById('status-hud').innerText = `Fase: ${this.phase} | Pontos: ${this.score}`;
    }

    /**
     * Cria o elemento físico do balão e define sua física
     */
    spawnBalloon() {
        if (this.isPaused || this.expressions.length === 0) return;

        const scene = document.getElementById('scene');
        const balloon = document.createElement('div');
        balloon.className = 'balao';
        
        // Decide se o balão contém uma resposta certa de qualquer uma das 5 expressões
        const target = this.expressions[Math.floor(Math.random() * this.expressions.length)];
        const isRight = Math.random() > 0.6;
        const val = isRight ? target.res : target.res + (Math.floor(Math.random() * 10) - 5);

        balloon.innerText = val;
        balloon.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
        balloon.style.left = Math.random() * (scene.clientWidth - 90) + 'px';
        scene.appendChild(balloon);

        this.animateBalloon(balloon, val);
    }

    animateBalloon(el, val) {
        let bottom = -120;
        const speed = 1.3 + (this.phase * 0.4); // Velocidade sobe com a fase

        const move = setInterval(() => {
            if (this.isPaused) { clearInterval(move); el.remove(); return; }
            
            bottom += speed;
            el.style.bottom = bottom + 'px';

            if (bottom > window.innerHeight) { 
                clearInterval(move); 
                el.remove(); 
            }
        }, 16);

        el.onclick = () => {
            const index = this.expressions.findIndex(ex => ex.res === parseInt(val));
            if (index !== -1) {
                this.score += 10;
                this.hits++;
                this.expressions.splice(index, 1); // Remove a expressão resolvida
                el.remove();
                clearInterval(move);
                this.checkPhase();
                this.updateUI();
            } else {
                this.endGame();
            }
        };
    }

    checkPhase() {
        if (this.hits >= 5) {
            this.phase++;
            this.hits = 0;
            this.stopEngine();
            this.startEngine(); // Reinicia com novos tempos
        }
    }

    endGame() {
        this.togglePause(true);
        this.saveRanking();
        alert(`GAME OVER! Você atingiu ${this.score} pontos na Fase ${this.phase}.`);
        this.score = 0;
        this.phase = 1;
        this.renderRanking();
    }

    saveRanking() {
        let rank = JSON.parse(localStorage.getItem('rank_baloes_final')) || [];
        rank.push({ name: this.userName, pts: this.score });
        rank.sort((a, b) => b.pts - a.pts);
        localStorage.setItem('rank_baloes_final', JSON.stringify(rank.slice(0, 10)));
    }

    renderRanking() {
        const data = JSON.parse(localStorage.getItem('rank_baloes_final')) || [];
        const list = document.getElementById('ranking-list');
        if (list) {
            list.innerHTML = data.map((r, i) => `<div>${i+1}º ${r.name} - ${r.pts} pts</div>`).join('');
        }
    }
}

// Inicializa a classe quando o documento carregar [15]
window.onload = () => { new BalloonGame(); };
