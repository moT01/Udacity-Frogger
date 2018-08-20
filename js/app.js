//TO DO
//enemy speed based on window size
//add some animation/fun
//sounds
//look into moving the player -> drawing the player -> checking collisions
//subtract score for deaths
//player collision with water/rocks etc...
//controls for phone/touch
//more/better levels

//global variables //global variables //global variables //global variables //global variables //global variables
//elements
const background = document.getElementById('background'),
  levelHUD = document.getElementById('level'),
  timerHUD = document.getElementById('timer'),
  scoreHUD = document.getElementById('score'),
  deathsHUD = document.getElementById('deaths');

//HUD variables - these are for the HUD display
let currentLevel = 0,
  score = 0,
  timeInSeconds = 0,
  deaths = 0;

//from/for levels.js
let levelIndex = 0,
  board,
  numberOfEnemies,
  numberOfLevels = levels.length;

//for gameplay
let timerInterval,
  cols,
  rows,
  cellWidth,
  cellHeight,
  playerLeftEdge,
  playerRightEdge,
  player,
  enemies = [],
  vmin = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;

//global functions //global functions //global functions //global functions //global functions //global functions
function loadNextLevel() {
  currentLevel = levelIndex + 1;
  board = levels[levelIndex].board;
  rows = levels[levelIndex].board.length;
  cols = levels[levelIndex].board[0].length;
  numberOfEnemies = levels[levelIndex].enemies;
  rowsEnemiesUse = levels[levelIndex].rowsEnemiesUse;
  cellWidth = vmin/cols;
  cellHeight = vmin/rows;
  playerLeftEdge = cellWidth*.35;
  playerRightEdge = cellWidth*.65;

  enemies = [];
  for(var e=0; e<numberOfEnemies; e++) {
    enemies.push(new Enemy());
  }

  drawBoard();
  player.backToStart();
  clearInterval(timerInterval);
  timeInSeconds = 0;
  updateHUD();
  timerInterval = setInterval(function() {
    timeInSeconds++;
    updateHUD();
  }, 1000);
}


function levelWon() {
  score += 100;
  score += 30 - timeInSeconds > 0 ? 30 - timeInSeconds : 0;
  levelIndex++;
  updateHUD();
  if(currentLevel === levels.length) {
    alert("YOU WIN!");
  } else {
    loadNextLevel();
  }
}

function drawBoard() {
  for(var row=0; row<rows; row++) {
    for(var col=0; col<cols; col++) {
      image(boardImages[board[row][col]], col*(cellWidth), row*(cellHeight), cellWidth, cellHeight);
    }
  }
}

function updateHUD() {
  levelHUD.innerHTML = "LEVEL " + currentLevel;
  scoreHUD.innerHTML = "SCORE " + score;
  timerHUD.innerHTML = "TIME " + timeInSeconds;
  deathsHUD.innerHTML = "DEATHS " + deaths;
}


//event listeners //event listeners //event listeners //event listeners //event listeners //event listeners
window.addEventListener('resize', function() {
  vmin = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
  cellWidth = vmin/cols;
  cellHeight = vmin/rows;
  playerLeftEdge = cellWidth*.35;
  playerRightEdge = cellWidth*.65;
  resizeCanvas(vmin, vmin);
});

function keyPressed() {
  switch (keyCode) {
    case 37: case 65: // left or 'a'
      player.movePlayer(-1,0);
      break;
    case 38: case 87: // up or 'w'
      player.movePlayer(0,-1);
      break;
    case 39: case 68: // right or 'd'
      player.movePlayer(1,0);
      break;
    case 40: case 83: // down or 's'
      player.movePlayer(0,1);
      break;
    default:
      break;
  }
}

//constructor functions //constructor functions //constructor functions //constructor functions //constructor functions
function Enemy() {
  this.x = random(-150, vmin);
  this.y = rowsEnemiesUse[Math.floor(random(0, rowsEnemiesUse.length))];
  this.speed = random(2,6);
  this.rightEdge = this.x+cellWidth;
  this.checkIfCollide = function() {
    if(player.y === this.y && (this.rightEdge >= player.leftEdge && this.x <= player.rightEdge)) {
      player.death();
      player.backToStart();
    }
  }
  this.moveEnemy = function() {
    //if enemy off screen => move back to random start
    if(this.x >= vmin+100) {
      this.x = random(-150, -150);
      this.y = rowsEnemiesUse[Math.floor(random(0, rowsEnemiesUse.length))];
      this.speed = random(2,6);
      this.rightEdge = this.x + cellWidth;
    } else {
      //this area makes it so enemies dont run into each other
      for(var e=0; e<enemies.length; e++) {
        if(this !== enemies[e] && this.y === enemies[e].y) {
          if(this.rightEdge >= enemies[e].x - cellWidth && this.rightEdge < enemies[e].rightEdge) {
            this.speed -= (this.speed - enemies[e].speed)/10;
          }
          if(this.rightEdge === enemies[e].x - playerLeftEdge && this.rightEdge < enemies[e].rightEdge) {
            this.speed = enemies[e].speed;
          }
          if(this.rightEdge >= enemies[e].x - playerLeftEdge && this.rightEdge < enemies[e].rightEdge) {
            this.speed = 0;
          }
        }
      }
      this.x += this.speed;
      this.rightEdge = this.x + cellWidth;
      this.checkIfCollide();
    }
  }
}

function Player() {
  this.backToStart = function() {
    this.x = Math.floor(cols/2);
    this.y = rows-1;
    this.leftEdge = this.x + playerLeftEdge;
    this.rightEdge = this.x + playerRightEdge;
  }
  this.death = function() {
    deaths++;
    if(score>=50) {
      score-=50;
    } else {
      score = 0;
    }
    updateHUD();
  }
  this.movePlayer = function(x, y) {
    //if water
    if(!board[player.y+y][player.x+x]) {
      new Audio('./sounds/splash2.wav').play();
      player.death();
      player.backToStart();
    }


    //keep player in game board
    if(!(this.x + x > cols-1) && !(this.x + x < 0)) {
      this.x += x;
      this.leftEdge = this.x * cellWidth + playerLeftEdge;
      this.rightEdge = this.x * cellWidth + playerRightEdge;
    }
    if(!(this.y + y > rows-1) && !(this.y + y < 0)) {
      this.y += y;
    }

    if(this.y === 0) {
      levelWon();
    }
  }
}

//p5 functions //p5 functions //p5 functions //p5 functions //p5 functions //p5 functions //p5 functions //p5 functions
function setup() {
  createCanvas(vmin, vmin);
  frameRate(48);
  player = new Player();
  loadNextLevel();
}

function draw() {
  drawBoard();
  for(var e=0; e<enemies.length; e++) {
    enemies[e].moveEnemy();
    image(enemyImages[0], enemies[e].x, enemies[e].y*(cellHeight), cellWidth, cellHeight);
  }
  image(playerImages[0], player.x*(cellWidth), player.y*(cellHeight), cellWidth, cellHeight);
}
