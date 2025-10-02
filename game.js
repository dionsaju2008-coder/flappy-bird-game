// ---- IMAGES ----
const bgImg = new Image();
bgImg.src = "assets/images/background.png";

const birdImages = {
  yellow: new Image(),
  red: new Image(),
  blue: new Image(),
  green: new Image()
};
birdImages.yellow.src = "assets/images/birdYellow.png";
birdImages.red.src = "assets/images/birdRed.png";
birdImages.blue.src = "assets/images/birdBlue.png";
birdImages.green.src = "assets/images/birdGreen.png";

let birdImg = birdImages.yellow;

// ---- ELEMENTS ----
const homeScreen = document.getElementById("home-screen");
const customizeScreen = document.getElementById("customize-screen");
const leaderboardScreen = document.getElementById("leaderboard-screen");
const playBtn = document.getElementById("play-btn");
const customizeBtn = document.getElementById("customize-btn");
const leaderboardBtn = document.getElementById("leaderboard-btn");
const backBtn = document.getElementById("back-btn");
const backHome2 = document.getElementById("back-home-2");
const gameCanvas = document.getElementById("gameCanvas");
const ctx = gameCanvas.getContext("2d");

// ---- SOUNDS ----
const flapSound = new Audio("assets/sounds/flap.mp3");
const pointSound = new Audio("assets/sounds/point.mp3");
const hitSound = new Audio("assets/sounds/hit.mp3");

// ---- GAME VARIABLES ----
let gameRunning = false;
let birdColor = "yellow";
let bird = { x: 100, y: 300, radius: 20, gravity: 0.5, lift: -8, velocity: 0 };
let pipes = [];
let score = 0;
let frameCount = 0;
const pipeWidth = 60;
const pipeGap = 150;
const pipeSpeed = 2;

// ---- HIGH SCORE ----
let highScore = localStorage.getItem("flappyHighScore") || 0;

// ---- SCREEN SWITCHING ----
playBtn.addEventListener("click", () => switchScreen("game"));
customizeBtn.addEventListener("click", () => switchScreen("customize"));
leaderboardBtn.addEventListener("click", () => switchScreen("leaderboard"));
backBtn.addEventListener("click", () => switchScreen("home"));
backHome2.addEventListener("click", () => switchScreen("home"));

function switchScreen(screen) {
  homeScreen.style.display = "none";
  customizeScreen.style.display = "none";
  leaderboardScreen.style.display = "none";
  gameCanvas.style.display = "none";

  if (screen === "home") homeScreen.style.display = "block";
  if (screen === "customize") customizeScreen.style.display = "block";
  if (screen === "leaderboard") leaderboardScreen.style.display = "block";
  if (screen === "game") {
    gameCanvas.style.display = "block";
    startGame();
  }
}

// ---- INPUT ----
document.addEventListener("keydown", e => { if (e.code === "Space") flap(); });
gameCanvas.addEventListener("mousedown", flap);
gameCanvas.addEventListener("touchstart", flap);

function flap() {
  bird.velocity = bird.lift;
  flapSound.currentTime = 0;
  flapSound.play();
}

// ---- START GAME ----
function startGame() {
  gameRunning = true;
  bird.y = 300;
  bird.velocity = 0;
  score = 0;
  pipes = [];
  frameCount = 0;
  gameLoop();
}

// ---- GAME LOOP ----
function gameLoop() {
  if (!gameRunning) return;

  update();
  draw();

  requestAnimationFrame(gameLoop);
}

// ---- UPDATE GAME STATE ----
function update() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.radius > gameCanvas.height) endGame();
  if (bird.y - bird.radius < 0) bird.y = bird.radius;

  // Spawn pipes
  if (frameCount % 100 === 0) {
    const topHeight = Math.random() * (gameCanvas.height - pipeGap - 100) + 50;
    pipes.push({
      x: gameCanvas.width,
      topHeight: topHeight,
      bottomY: topHeight + pipeGap,
      scored: false
    });
  }
  frameCount++;

  // Move pipes + collision + scoring
  for (let i = 0; i < pipes.length; i++) {
    pipes[i].x -= pipeSpeed;

    // Collision
    if (
      bird.x + bird.radius > pipes[i].x &&
      bird.x - bird.radius < pipes[i].x + pipeWidth
    ) {
      if (bird.y - bird.radius < pipes[i].topHeight || bird.y + bird.radius > pipes[i].bottomY) {
        endGame();
      }
    }

    // Score
    if (!pipes[i].scored && pipes[i].x + pipeWidth < bird.x) {
      score++;
      pipes[i].scored = true;
      pointSound.currentTime = 0;
      pointSound.play();

      if (score > highScore) {
        highScore = score;
        localStorage.setItem("flappyHighScore", highScore);
      }
    }
  }

  pipes = pipes.filter(p => p.x + pipeWidth > 0);
}

// ---- DRAW GAME ----
function draw() {
  // Background
  ctx.drawImage(bgImg, 0, 0, gameCanvas.width, gameCanvas.height);

  // Pipes (light green with dark caps)
  for (let i = 0; i < pipes.length; i++) {
    // Top pipe
    ctx.fillStyle = "#7CFC00"; // light green
    ctx.fillRect(pipes[i].x, 0, pipeWidth, pipes[i].topHeight);
    ctx.fillStyle = "#32CD32"; // darker green cap
    ctx.fillRect(pipes[i].x - 2, pipes[i].topHeight - 10, pipeWidth + 4, 10);

    // Bottom pipe
    ctx.fillStyle = "#7CFC00";
    ctx.fillRect(pipes[i].x, pipes[i].bottomY, pipeWidth, gameCanvas.height - pipes[i].bottomY);
    ctx.fillStyle = "#32CD32";
    ctx.fillRect(pipes[i].x - 2, pipes[i].bottomY, pipeWidth + 4, 10);
  }

  // Bird
  ctx.drawImage(birdImg, bird.x - bird.radius, bird.y - bird.radius, bird.radius * 2, bird.radius * 2);

  // Score
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillStyle = "darkblue";
  ctx.font = "20px Arial";
  ctx.fillText("High Score: " + highScore, 10, 60);
}

// ---- END GAME ----
function endGame() {
  gameRunning = false;
  hitSound.play();

  // Clear canvas overlay
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Game Over text
  ctx.fillStyle = "red";
  ctx.font = "40px Arial";
  ctx.fillText("Game Over!", 80, 200);
  ctx.font = "24px Arial";
  ctx.fillText("Final Score: " + score, 100, 250);
  ctx.fillText("High Score: " + highScore, 100, 280);

  // Create Play Again button
  const playAgainBtn = document.createElement("button");
  playAgainBtn.textContent = "Play Again";
  playAgainBtn.style.position = "absolute";
  playAgainBtn.style.left = "50%";
  playAgainBtn.style.top = "350px";
  playAgainBtn.style.transform = "translateX(-50%)";
  playAgainBtn.style.padding = "10px 20px";
  playAgainBtn.style.fontSize = "18px";
  document.body.appendChild(playAgainBtn);

  playAgainBtn.addEventListener("click", () => {
    document.body.removeChild(playAgainBtn);
    startGame();
  });

  // Create Home button
  const homeBtn = document.createElement("button");
  homeBtn.textContent = "Home";
  homeBtn.style.position = "absolute";
  homeBtn.style.left = "50%";
  homeBtn.style.top = "400px";
  homeBtn.style.transform = "translateX(-50%)";
  homeBtn.style.padding = "10px 20px";
  homeBtn.style.fontSize = "18px";
  document.body.appendChild(homeBtn);

  homeBtn.addEventListener("click", () => {
    document.body.removeChild(playAgainBtn);
    document.body.removeChild(homeBtn);
    switchScreen("home");
  });
}


// ---- CUSTOMIZE BIRD ----
const colorButtons = document.querySelectorAll(".color-btn");
colorButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    birdColor = btn.dataset.color;
    if (birdImages[birdColor]) birdImg = birdImages[birdColor];
  });
});
