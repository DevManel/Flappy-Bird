document.addEventListener('DOMContentLoaded', () => {
    const birdImg = new Image();
    birdImg.src = "img/bird.png";
    const bgImg = new Image();
    bgImg.src = "img/fond.jpg";
    const flapSound = new Audio("sounds/flappy_wav.mp3");

    // Effets sonores pour chaque événement
    const collisionSound = new Audio("sounds/Hit.mp3");
    const deathSound = new Audio("sounds/Die.mp3");
    const pointSound = new Audio("sounds/Point.mp3");
    const backgroundMusic = new Audio("sounds/Bensound - Buddy.mp3");
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;

    backgroundMusic.play().catch(() => {});

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const restartButton = document.getElementById('restartButton');

    let bird, pipes, pipeGap, pipeWidth, pipeSpeed, score, gameOver, frame, bestScore;

    function initGameVariables() {
        bird = {
            x: 50,
            y: 150,
            width: 30,
            height: 30,
            gravity: 0.6,
            lift: -10,
            velocity: 0,

            draw() {
                ctx.drawImage(birdImg, this.x, this.y, this.width, this.height);
            },

            update() {
                this.velocity += this.gravity;
                this.y += this.velocity;
            },

            flap() {
                this.velocity = this.lift;
                flapSound.play().catch(() => {});
            }
        };

        pipes = [];
        pipeGap = 140;
        pipeWidth = 60;
        pipeSpeed = 2;
        score = 0;
        gameOver = false;
        frame = 0;
        bestScore = 0;
    }

    function createPipe() {
        const topHeight = Math.floor(Math.random() * 200) + 50;
        const bottomY = topHeight + pipeGap;
        pipes.push({
            x: canvas.width,
            top: topHeight,
            bottom: bottomY
        });
    }

    function drawPipes() {
        ctx.fillStyle = "green";
        pipes.forEach(pipe => {
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
            ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
        });
    }

    function updatePipes() {
        pipes.forEach(pipe => pipe.x -= pipeSpeed);
        pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
    }

    function detectCollision(pipe) {
        const hitTop = bird.y < pipe.top && bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth;
        const hitBottom = bird.y + bird.height > pipe.bottom && bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth;
        const outOfBounds = bird.y + bird.height > canvas.height || bird.y < 0;

        if (hitTop || hitBottom) {
            // Collision avec un tuyau
            collisionSound.play().catch(() => {});
            return 'pipe'; // Retourne 'pipe' pour signaler que c'est une collision avec un tuyau
        }

        if (outOfBounds) {
            // Sortie de l'écran (mort)
            deathSound.play().catch(() => {});
            return 'outOfBounds'; // Retourne 'outOfBounds' pour signaler que l'oiseau est sorti de l'écran
        }

        return null; // Pas de collision
    }

    function drawScore() {
        ctx.fillStyle = "white";
        ctx.font = "24px sans-serif";
        ctx.fillText("Score: " + score, 20, 40);
        ctx.fillText("Meilleur: " + bestScore, 20, 70);
    }

    function resetGame() {
        bird.y = 200;
        bird.velocity = 0;
        pipes = [];
        score = 0;
        gameOver = false;
        frame = 0;
        loop();
    }

    // ⚡ Bouton de démarrage
    startButton.addEventListener("click", () => {
        // Démarrer la musique de fond uniquement après le clic
        backgroundMusic.play().catch(() => {});

        flapSound.play().then(() => {
            flapSound.pause();
            flapSound.currentTime = 0;
        }).catch(() => {});

        startButton.style.display = "none";
        initGameVariables();
        loop();
    });

    // Fonction pour gérer le clic sur "Rejouer"
    restartButton.addEventListener("click", () => {
        gameOverScreen.classList.add("hidden"); // Cache l'écran Game Over
        resetGame();
    });

    // Garder la fonctionnalité du saut (flap) avec la touche
    document.addEventListener("keydown", () => {
        if (!gameOver) {
            bird.flap();
        }
    });

    function loop() {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        bird.update();
        bird.draw();

        if (frame % 90 === 0) createPipe();

        updatePipes();
        drawPipes();
        drawScore();

        for (const pipe of pipes) {
            const collisionResult = detectCollision(pipe);

            if (collisionResult === 'pipe') {
                gameOver = true;
            }

            if (collisionResult === 'outOfBounds') {
                gameOver = true;
            }

            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                pipe.passed = true;
                score++;
                pointSound.play().catch(() => {});  // Jouer le son de gain de point
                if (score > bestScore) {
                    bestScore = score;
                }
            }
        }

        if (!gameOver) {
            frame++;
            requestAnimationFrame(loop);
        } else {
            ctx.fillStyle = "white";
            ctx.font = "36px sans-serif";
            ctx.fillText("Game Over", 120, canvas.height / 2);
            ctx.font = "18px sans-serif";

            // Afficher les boutons de fin de jeu
            gameOverScreen.classList.remove("hidden"); // Affiche les boutons
        }
    }
});
