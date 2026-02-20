// --- ゲーム全体の設定 ---
let currentLevel = 1; // 現在のレベル
let maxLevel = 3; // 最終レベル
let score = 0; // 合計スコア
let levelScore = 0; // そのレベルでのスコア

// --- レベルごとの設定 ---
// 縦と横の数を配列で持つ
let levelCols = [3, 5, 3]; 
let levelRows = [1, 1, 3]; 

let numCols, numRows;
let holeX=[];
let holeY=[];
let holeSize = 60;
let isUp;
let moleTimer; // 穴ごとの時間管理

let lastMoleTime;
let showDuration; 
let appearInterval;

// --- ステージごとの条件（時間、クリアスコア） ---
let levelTimes = [10, 10, 10]; // ステージごとの制限時間(秒)
let clearScores = [50, 100, 150]; // ステージごとのクリア必要スコア(累計)
let levelShowDurations = [1500, 1000, 700]; // 出ている時間（短いほど早い）
let levelAppearIntervals = [500, 300, 100]; // 出現待ち時間（短いほど早い）

let gameState = 0; // 0: Title, 1: Play, 2: Stage Clear, 3: Game Over, 4: All Clear
let startTime;
let remainingTime;

function setup() {
  createCanvas(600, 400);
  loadLevel(currentLevel); // レベルの読み込み
}

// ステージの初期化・配置関数
function loadLevel(level) {
  numCols = levelCols[level - 1];
  numRows = levelRows[level - 1];
  
  showDuration = levelShowDurations[level - 1];
  appearInterval = levelAppearIntervals[level - 1];
  
  // 2次元配列を再定義
  holeX = Array.from(Array(numCols),()=>new Array(numRows));
  holeY = Array.from(Array(numCols),()=>new Array(numRows));
  isUp = Array.from(Array(numCols),()=>new Array(numRows));
  moleTimer = Array.from(Array(numCols),()=>new Array(numRows));
  
  
  let totalWidth = width * 0.8;
  let gap = (numCols>1)? totalWidth/(numCols-1):0;
  
  let rowGap = 100;
  let totalHeight=(numRows-1)*rowGap;
  
  let startX = (width - (numCols - 1) * gap) / 2;
  let startY = (height - totalHeight) / 2;
  
  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      holeX[col][row] = startX + (col * gap);
      holeY[col][row] = startY + (row * rowGap);
      isUp[col][row] = false;
      moleTimer[col][row]=0;
    }
  }
  lastMoleTime = millis();
}

function draw() {
  background(165);
  textFont('sans-serif');

  if (gameState == 0) {
    drawScreen("モグラたたき","クリックでスタート");
  }else if(gameState===1){
    playGame();
    drawUI();
  }else if(gameState===2){
    drawScreen("ステージ "+currentLevel,"クリア！","次へ進む");
    }else if(gameState===3){
    drawScreen("ゲームオーバー","リトライ");
    }else if(gameState===4){
    drawScreen("全ステージクリア！","最初から遊ぶ");
    }
}

function drawScreen(title, sub){
    textAlign(CENTER, CENTER);
    fill(203);
    textSize(40);
    text(title,width/2,height/2-30);
    textSize(20);
    text(sub, width/2, height/2+30);
}
  
function drawUI(){
    textAlign(LEFT, TOP);
    fill(203);
    textSize(20);
    text("レベル: " + currentLevel, 10, 10);
    text("スコア: " + score, 10, 40);
    remainingTime = levelTimes[currentLevel - 1] - (millis() - startTime) / 1000;
    text("タイム: " + remainingTime, width - 100, 10);
    
    if (remainingTime <= 0) gameState = 3; // ゲームオーバー
　  if (score >= clearScores[currentLevel - 1]) {
     gameState =(currentLevel===maxLevel)? 4:2; // 全ステージクリアORステージクリア
   }
}
    
function playGame(){
    let anyMoleUp = false;
  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      if (isUp[col][row])anyMoleUp = true;
    }
  }
  
  if (!anyMoleUp && millis() - lastMoleTime > appearInterval) {
    let nextCol = int(random(numCols));
    let nextRow = int(random(numRows));
    isUp[nextCol][nextRow] = true;
    lastMoleTime = millis();
    moleTimer[nextCol][nextRow] = millis();
  }
  
  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      if (isUp[col][row] && millis() - moleTimer[col][row] > showDuration) {
        isUp[col][row] = false;
      }
  
  
  // 描画ロジック
    fill(0);
      rectMode(CENTER);
      rect(holeX[col][row], holeY[col][row], holeSize, holeSize,10);
      if (isUp[col][row]) {
        fill(0, 100, 255);
        rect(holeX[col][row], holeY[col][row], 40, 40,5);
        fill(255);
        ellipse(holeX[col][row] - 10, holeY[col][row], 5, 5);
        ellipse(holeX[col][row] + 10, holeY[col][row], 5, 5);
      }
    }
  }
}

//マウス、タッチ両対応
function mousePressed() {
  if (gameState == 0) {
    startTime = millis();
    gameState = 1;
  } else if (gameState == 1) {
    for (let col = 0; col < numCols; col++) {
      for (let row = 0; row < numRows; row++) {
        if (isUp[col][row]) {
          let d = dist(mouseX, mouseY, holeX[col][row], holeY[col][row]);
          if (d < holeSize / 2) {
            isUp[col][row] = false;
          score += 10;
          lastMoleTime = millis();
          }
        }
      }
    }
  } else if (gameState == 2) {
    currentLevel++;
    loadLevel(currentLevel);
    startTime = millis();
    gameState = 1;
  } else if (gameState == 3 || gameState===4) {
    currentLevel = 1;
    score = 0;
    loadLevel(currentLevel);
    gameState = 0;
  }
  return false;
}
  
 