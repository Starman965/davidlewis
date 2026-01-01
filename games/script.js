/* =============================
   Config — Brad uses per turn set to 5 by default
============================= */

const CONFIG = {
  couples: ["Team 1","Team 2","Team 3","Team 4"], // Will be updated from intro
  playerCount: 3, // Will be updated from intro
  roundsPlanned: 16,
  originalRoundsPlanned: 16, // Keep track of original setting from startup
  roundPrize: 5,
  cols: 5,
  timerSeconds: 15,
  valuesSafe: [5,5,5,10,10,10,10,15,15,15,20,20,20,25,30,35,50,70,100], // 19
  bustsPerRound: 1,
  miniEverySafe: 5,
  miniMaxPerTurn: 3,
  bradUsesPerTurn: 3
};

const state = {
  started: false,
  round: 1,
  startingTeamIdx: 0,
  currentTeam: 0,
  turnsTaken: 0,
  cashWon: [0,0,0,0],
  thisRoundScores: [0,0,0,0],

  boardValues: [],
  cases: [],
  remaining: 0,
  subtotal: 0,

  timer: null,
  timeLeft: CONFIG.timerSeconds,
  locked: false,
  revealing: false,

  // per-turn helpers
  bradUsedCount: 0,
  safeStreak: 0,
  minisThisTurn: 0,
  minisPlayedThisTurn: [] // Track which mini-games have been played this turn
};

/* =============================
   Audio
============================= */

let AC=null;
function ensureAudio(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch{} } }

// Professional audio system for game sounds
const gameAudio = {
  sounds: {},
  
  // Load a sound file
  load(name, filename) {
    this.sounds[name] = new Audio(filename);
    this.sounds[name].preload = 'auto';
  },
  
  // Play a sound
  play(name, volume = 0.7) {
    if (this.sounds[name]) {
      try {
        this.sounds[name].currentTime = 0;
        this.sounds[name].volume = volume;
        this.sounds[name].play().catch(() => {}); // Ignore autoplay restrictions
      } catch(e) {}
    }
  }
};

// Load all game sounds
gameAudio.load('cheer', 'cheer.wav');
gameAudio.load('sweet_bell', 'sweet_bell.wav');
gameAudio.load('start', 'start.mp3');
gameAudio.load('bank_points', 'bank_points.mp3');
gameAudio.load('bust', 'bust.mp3');
gameAudio.load('drumroll', 'drumroll.mp3');
gameAudio.load('cardbust', 'cardbust.mp3');
gameAudio.load('points', 'points.mp3');
gameAudio.load('chest', 'chest.mp3');
gameAudio.load('crowd_ah', 'crowd_ah.mp3');

// Legacy tone functions for fallback
function tone(freq=880, dur=0.2, type='sine', gain=0.25){
  if(!AC) return;
  const o=AC.createOscillator(), g=AC.createGain();
  o.type=type; o.frequency.value=freq;
  g.gain.setValueAtTime(0.0001,AC.currentTime);
  g.gain.exponentialRampToValueAtTime(gain,AC.currentTime+0.01);
  g.gain.exponentialRampToValueAtTime(0.0001,AC.currentTime+dur);
  o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime+dur+0.02);
}
function ding(){ tone(880, 0.25, 'sine', 0.35); }
function buzzer(){ tone(120, 0.45, 'square', 0.35); }
function beep(){ tone(1200, 0.12, 'square', 0.25); }
function whoosh(){ if(!AC) return; const o=AC.createOscillator(), g=AC.createGain(); o.type='triangle'; o.frequency.setValueAtTime(1800,AC.currentTime);
  o.frequency.exponentialRampToValueAtTime(300, AC.currentTime+0.25);
  g.gain.setValueAtTime(0.0001,AC.currentTime); g.gain.exponentialRampToValueAtTime(0.3,AC.currentTime+0.03);
  g.gain.exponentialRampToValueAtTime(0.0001,AC.currentTime+0.28); o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime+0.3); }
function fanfare(){ ding(); setTimeout(()=> tone(1320,0.2,'sine',0.3), 160); }

/* =============================
   DOM
============================= */

const el = {
  // Intro screen elements
  introScreen: document.getElementById('introScreen'),
  gameWrap: document.getElementById('gameWrap'),
  startGameBtn: document.getElementById('startGameBtn'),
  nameInputs: document.getElementById('nameInputs'),

  roundNum: document.getElementById('roundNum'),
  roundsPlanned: document.getElementById('roundsPlanned'),
  roundPrize: document.getElementById('roundPrize'),
  prizeBig: document.getElementById('prizeBig'),

  teamCards: [0,1,2,3].map(i=>document.getElementById('t'+i)),
  scoreLabels: [0,1,2,3].map(i=>document.getElementById('s'+i)),
  winningsLabels: [0,1,2,3].map(i=>document.getElementById('w'+i)),

  roundTotalCard: document.getElementById('roundTotalCard'),
  subtotal: document.getElementById('subtotal'),
  casesLeft: document.getElementById('casesLeft'),
  counts: document.getElementById('counts'),
  cases: document.getElementById('cases'),
  idleMsg: document.getElementById('idleMsg'),

  bankBtn: document.getElementById('bankBtn'),
  startBtn: document.getElementById('startBtn'),
  askBtn: document.getElementById('askBtn'),
  miniHint: document.getElementById('miniHint'),

  timer: document.getElementById('timer'),
  roundLabel: document.getElementById('roundLabel'),

  bustOverlay: document.getElementById('bustOverlay'),
  plusOverlay: document.getElementById('plusOverlay'),
  plusTxt: document.getElementById('plusTxt'),

  roundOverlay: document.getElementById('roundOverlay'),
  rNum: document.getElementById('rNum'),
  roundScores: document.getElementById('roundScores'),
  roundWinner: document.getElementById('roundWinner'),
  nextRoundBtn: document.getElementById('nextRoundBtn'),
  closeRoundBtn: document.getElementById('closeRoundBtn'),

  finalOverlay: document.getElementById('finalOverlay'),
  finalScores: document.getElementById('finalScores'),
  finalWinner: document.getElementById('finalWinner'),
  playAgainBtn: document.getElementById('playAgainBtn'),
  closeFinalBtn: document.getElementById('closeFinalBtn'),

  rulesBtn: document.getElementById('rulesBtn'),
  rulesOverlay: document.getElementById('rulesOverlay'),
  closeRulesBtn: document.getElementById('closeRulesBtn'),

  aiOverlay: document.getElementById('aiOverlay'),
  aiIntro: document.getElementById('aiIntro'),
  aiSafe: document.getElementById('aiSafe'),
  aiRisk: document.getElementById('aiRisk'),
  aiStats: document.getElementById('aiStats'),
  aiLeader: document.getElementById('aiLeader'),
  aiAdvice: document.getElementById('aiAdvice'),
  aiCloseBtn: document.getElementById('aiCloseBtn'),

  miniOverlay: document.getElementById('miniOverlay'),
  miniTitle: document.getElementById('miniTitle'),
  miniIntro: document.getElementById('miniIntro'),
  miniArea: document.getElementById('miniArea'),
  miniButtons: document.getElementById('miniButtons'),

  newMatchBtn: document.getElementById('newMatchBtn'),
  testWheelBtn: document.getElementById('testWheelBtn'),
  testCasesBtn: document.getElementById('testCasesBtn'),
  testCardsBtn: document.getElementById('testCardsBtn')
};

/* =============================
   Helpers
============================= */

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function buildBoardValues(){
  const base = CONFIG.valuesSafe.slice();
  for(let i=0;i<CONFIG.bustsPerRound;i++) base.push(0);
  return shuffle(base);
}
function openOverlay(node){ node.classList.add('show'); }
function closeOverlay(node){ node.classList.remove('show'); }
function formatCash(n){ return Number(n).toFixed(2).replace(/\.00$/,''); }
function sum(arr){ return arr.reduce((s,v)=>s+v,0); }

/* =============================
   Render
============================= */

function renderHeader(){
  el.roundNum.textContent = state.round;
  el.roundsPlanned.textContent = CONFIG.roundsPlanned;
  el.roundPrize.textContent = formatCash(CONFIG.roundPrize);
  el.prizeBig.textContent = "$"+formatCash(CONFIG.roundPrize);
  el.roundLabel.textContent = `${state.round} of ${CONFIG.roundsPlanned}`;
}
function renderAskButton(){
  const left = Math.max(0, CONFIG.bradUsesPerTurn - state.bradUsedCount);
  el.askBtn.textContent = left>0 ? `Time Out (${left} left)` : `Time Out (0 left)`;
  const disable = (left<=0 || !state.started || state.locked || state.revealing);
  el.askBtn.disabled = disable;
  el.askBtn.style.opacity = disable ? 0.5 : 1;
}
function renderScores(){
  // Update scores container grid layout
  const scoresContainer = document.querySelector('.scores');
  if (scoresContainer) {
    scoresContainer.className = `scores teams-${CONFIG.playerCount}`;
  }
  
  for (let i=0;i<CONFIG.playerCount;i++){
    el.scoreLabels[i].textContent = state.thisRoundScores[i];
    el.winningsLabels[i].textContent = `Winnings: $${formatCash(state.cashWon[i])}`;
    el.teamCards[i].classList.toggle('active', i===state.currentTeam && state.started);
    el.teamCards[i].classList.toggle('startBadge', i===state.startingTeamIdx % CONFIG.playerCount);
    el.teamCards[i].style.display = 'flex'; // Show active teams
  }
  // Hide unused team cards
  for (let i=CONFIG.playerCount; i<4; i++){
    el.teamCards[i].style.display = 'none';
  }
  el.roundTotalCard.classList.toggle('active', state.started);
  el.subtotal.textContent = state.subtotal;
  el.casesLeft.textContent = state.remaining;

  // footer counts (low -> high, bust last)
  const remainingVals = state.cases.filter(c=>!c.opened).map(c=>c.value);
  const counts = {};
  remainingVals.forEach(v=> counts[v]=(counts[v]||0)+1 );
  const uniques = Object.keys(counts).map(Number).sort((a,b)=>a-b);
  el.counts.innerHTML = '';
  uniques.forEach(v=>{
    if (v===0) return; // add after
    const d = document.createElement('div');
    d.className='chip';
    d.textContent = `${counts[v]}× ${v}`;
    el.counts.appendChild(d);
  });
  if (counts[0]){
    const d = document.createElement('div');
    d.className='chip';
    d.textContent = `${counts[0]}× BUST`;
    el.counts.appendChild(d);
  }

  // mini hint
  const remainToMini = Math.max(0, CONFIG.miniEverySafe - (state.safeStreak||0));
  el.miniHint.textContent = `Mini-game in: ${remainToMini}`;

  renderAskButton();
}
function renderBoard(){
  el.cases.style.gridTemplateColumns = `repeat(${CONFIG.cols}, 1fr)`;
  el.cases.innerHTML = '';
  if (!state.started){
    const d = document.createElement('div');
    d.className = 'idle-msg';
    d.innerHTML = `
      <div style="margin-bottom: 16px;">Ready to start the round?</div>
      <button class="btn ok" id="startBtn">▶ Start Round</button>
    `;
    el.cases.appendChild(d);
    
    // Re-attach the event listener since we just created a new button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.addEventListener('click', ()=> { 
        ensureAudio(); 
        gameAudio.play('start');
        if (!state.started) { 
          startRoundPlay(); 
        } 
      });
    }
    
    renderAskButton();
    return renderScores();
  }
  state.cases.forEach((c,i)=>{
    const d = document.createElement('div');
    d.className = 'case' + (c.opened ? ' opened' : '');
    d.dataset.idx = i;
    d.innerHTML = `
      <div class="inner">
        <div class="face front"><div class="label">CHEST ${i+1}</div></div>
        <div class="face back"><div class="value">${c.value}</div></div>
      </div>`;
    d.addEventListener('click', ()=> onCase(i), {passive:true});
    el.cases.appendChild(d);
  });
  renderScores();
}

/* =============================
   Timer (starts only after first pick)
============================= */

function resetTimer(){
  stopTimer();
  state.timeLeft = CONFIG.timerSeconds;
  el.timer.textContent = state.timeLeft;
  el.timer.classList.remove('flash');
}
function startTimer(){
  stopTimer();
  if (!state.started) return;
  state.timer = setInterval(()=>{
    state.timeLeft--;
    if (state.timeLeft <= 5 && state.timeLeft > 0){
      el.timer.classList.add('flash');
      ensureAudio(); beep();
    }
    el.timer.textContent = state.timeLeft;
    if (state.timeLeft<=0){
      stopTimer();
      timeOutBust();
    }
  }, 1000);
}
function stopTimer(){ if (state.timer){ clearInterval(state.timer); state.timer=null; } }

/* =============================
   Flow
============================= */

function beginRoundIdle(){
  state.currentTeam = state.startingTeamIdx % CONFIG.playerCount;
  state.turnsTaken = 0;
  state.subtotal = 0;
  state.started = false;
  state.revealing = false;
  state.bradUsedCount = 0;
  state.safeStreak = 0;
  state.minisThisTurn = 0;
  resetTimer();
  renderHeader();
  renderScores();
  renderBoard();
}
function startRoundPlay(){
  state.started = true;
  prepareTurnBoard();
  renderBoard();
  resetTimer();     // wait for first pick to start
  renderAskButton(); // ensure Ask is enabled at round start
}
function prepareTurnBoard(){
  state.boardValues = buildBoardValues();
  state.cases = state.boardValues.map(v=>({value:Number(v), opened:false}));
  state.remaining = state.cases.length;
  state.subtotal = 0;
  state.bradUsedCount = 0;
  state.safeStreak = 0;
  state.minisThisTurn = 0;
  state.minisPlayedThisTurn = [];
}
function nextTurn(){
  state.turnsTaken++;
  stopTimer();
  if (state.turnsTaken >= CONFIG.playerCount){
    endRound();
  } else {
    state.currentTeam = (state.currentTeam + 1) % CONFIG.playerCount;
    prepareTurnBoard();
    renderBoard();
    resetTimer(); // waits for first pick
    renderAskButton();
  }
}
function endRound(){
  stopTimer();
  state.started = false;

  const prize = CONFIG.roundPrize;
  const max = Math.max(...state.thisRoundScores);
  const winners = CONFIG.couples.slice(0, CONFIG.playerCount).map((n,i)=>({n,i,sc:state.thisRoundScores[i]})).filter(o=>o.sc===max && max>0);

  if (winners.length>0){
    const split = prize / winners.length;
    winners.forEach(w=> state.cashWon[w.i] += split);
    el.roundWinner.textContent = winners.length===1
      ? `Round Winner: ${winners[0].n} (+$${formatCash(prize)})`
      : `Tie: ${winners.map(w=>w.n).join(' & ')} (split $${formatCash(split)} each)`;
  } else {
    el.roundWinner.textContent = `No winner — prize not awarded; an extra round has been added.`;
    CONFIG.roundsPlanned++; // auto-extend
  }

  renderScores();

  el.rNum.textContent = state.round;
  el.roundScores.innerHTML = CONFIG.couples.slice(0, CONFIG.playerCount).map((n,i)=> `${n}: <b>${state.thisRoundScores[i]}</b>`).join(' &nbsp;•&nbsp; ');
  openOverlay(el.roundOverlay);
  renderHeader();
  renderBoard();
}
function startNextRound(){
  closeOverlay(el.roundOverlay);
  state.round++;
  state.startingTeamIdx = (state.startingTeamIdx + 1) % CONFIG.playerCount;
  state.thisRoundScores = Array(CONFIG.playerCount).fill(0);
  
  // Check if game should end
  if (state.round > CONFIG.roundsPlanned) {
    endMatch();
  } else {
    beginRoundIdle();
  }
}
function endMatch(){
  const rows = CONFIG.couples.slice(0, CONFIG.playerCount).map((n,i)=> `${n}: $${formatCash(state.cashWon[i])}`).join(' &nbsp;•&nbsp; ');
  el.finalScores.innerHTML = rows;
  el.finalWinner.textContent = `Thanks for playing!`;
  openOverlay(el.finalOverlay);
}
function newMatch(){
  stopTimer();
  state.started = false;
  state.round = 1;
  state.startingTeamIdx = 0;
  state.currentTeam = 0;
  state.turnsTaken = 0;
  state.cashWon = Array(CONFIG.playerCount).fill(0);
  state.thisRoundScores = Array(CONFIG.playerCount).fill(0);
  state.subtotal = 0;
  state.boardValues = [];
  state.cases = [];
  state.remaining = 0;
  state.revealing = false;
  state.bradUsedCount = 0;
  state.safeStreak = 0;
  state.minisThisTurn = 0;
  // Don't reset roundsPlanned here - keep custom setting
  resetTimer();
  renderHeader();
  beginRoundIdle();
}

/* =============================
   Case interaction
============================= */

function onCase(idx){
  if (state.locked || state.revealing || !state.started) return;
  const c = state.cases[idx];
  if (!c || c.opened) return;

  // first click starts timer
  if (!state.timer) startTimer();

  state.locked = true;
  state.revealing = true;

  stopTimer(); // pause during reveal
  ensureAudio(); 
  gameAudio.play('chest');

  const node = el.cases.querySelector(`.case[data-idx="${idx}"]`);
  if (!node){ state.locked=false; state.revealing=false; return; }

  node.classList.add('revealing');

  setTimeout(()=>{
    node.classList.remove('revealing');
    node.classList.add('opened');
    const val = Number(c.value)||0;
    const valNode = node.querySelector('.value');
    valNode.textContent = val;

    if (val===0){
      state.subtotal = 0;
      renderScores();
      gameAudio.play('crowd_ah'); // Crowd disappointment for bust
      showBustThenNext();
    } else {
      c.opened = true;
      state.remaining--;
      state.subtotal += val;
      showPlus(val);
      ensureAudio();
      
      // Play appropriate sound based on value
      if (val >= 50) {
        gameAudio.play('cheer'); // Large amounts get cheer
      } else {
        gameAudio.play('points'); // Regular points sound
      }

      state.safeStreak++;

      // ⛔️ KEY FIX: only restart the timer if NO mini-game was opened
      const miniTriggered = maybeTriggerMini(); // returns true if a mini opened (and timer is stopped)
      if (!miniTriggered){
        resetTimer();
        startTimer();
      }

      // unlock and update UI
      state.locked = false;
      state.revealing = false;
      renderScores();

      if (state.remaining === 0){
        stopTimer();
        doBank(false);
      }
    }
  }, 650);
}

function showPlus(n, duration = 800){
  el.plusTxt.textContent = n >= 0 ? `+${Number(n)}` : `${Number(n)}`;
  openOverlay(el.plusOverlay);
  setTimeout(()=> closeOverlay(el.plusOverlay), duration);
}

function doBank(manual=true){
  if (state.locked || state.revealing || !state.started) return;
  stopTimer();
  if (state.subtotal > 0){
    state.thisRoundScores[state.currentTeam] += state.subtotal;
  }
  state.subtotal = 0;
  renderScores();
  if (manual) {
    ensureAudio();
    gameAudio.play('bank_points');
  }

  state.locked = true;
  setTimeout(()=>{ state.locked=false; nextTurn(); }, 350);
}

function timeOutBust(){
  ensureAudio(); 
  gameAudio.play('bust');
  state.subtotal = 0;
  renderScores();
  showBustThenNext();
}

function showBustThenNext(){
  openOverlay(el.bustOverlay);
  ensureAudio(); 
  gameAudio.play('bust');
  setTimeout(()=>{
    closeOverlay(el.bustOverlay);
    state.locked = false;
    state.revealing = false;
    nextTurn();
  }, 900);
}

/* =============================
   Time Out
============================= */

function openAI(){
  if (!state.started || state.locked || state.revealing) return;
  const left = Math.max(0, CONFIG.bradUsesPerTurn - state.bradUsedCount);
  if (left<=0) return;

  stopTimer(); // freeze time

  const couple = CONFIG.couples[state.currentTeam];

  el.aiIntro.textContent = ``;
  el.aiSafe.textContent = ``;
  el.aiRisk.textContent = ``;
  el.aiStats.textContent = ``;
  el.aiLeader.textContent = ``;
  el.aiAdvice.textContent = `Take your time to discuss strategy and plan your next moves.`;

  openOverlay(el.aiOverlay);
  state.bradUsedCount++;
  renderAskButton();
}
function closeAI(){
  closeOverlay(el.aiOverlay);
  renderAskButton(); // reflect remaining uses immediately
}

/* =============================
   Mini-games
============================= */

/* return true if a mini-game was opened (timer stays paused) */
function maybeTriggerMini(){
  if (state.minisThisTurn >= CONFIG.miniMaxPerTurn) return false;
  if (state.safeStreak > 0 && state.safeStreak % CONFIG.miniEverySafe === 0){
    // Stop timer & open one of the three minis (randomly, no repeats)
    stopTimer();
    
    const availableGames = ['wheel', 'chests', 'cards'].filter(game => 
      !state.minisPlayedThisTurn.includes(game)
    );
    
    if (availableGames.length === 0) {
      // If all games played, reset and allow any
      state.minisPlayedThisTurn = [];
      availableGames.push('wheel', 'chests', 'cards');
    }
    
    const selectedGame = availableGames[Math.floor(Math.random() * availableGames.length)];
    state.minisPlayedThisTurn.push(selectedGame);
    
    switch(selectedGame) {
      case 'wheel': openMiniWheel(); break;
      case 'chests': openMiniBonusCases(); break;
      case 'cards': openMiniAceyDeucey(); break;
    }
    
    state.safeStreak = 0; // reset counter after mini appears
    state.minisThisTurn++;
    return true;
  }
  return false;
}

function openMiniBonusCases(){
  stopTimer(); // ensure timer is stopped while modal is up
  const couple = CONFIG.couples[state.currentTeam];
  el.miniTitle.textContent = 'Mini-Game: Bonus Chests';
  el.miniIntro.textContent = `${couple}, pick one of four bonus chests!`;
  
  // Create randomized values for the 4 cases
  const possibleValues = [-20, -10, 0, 10, 20, 30, 40, 50, 60];
  const shuffledValues = shuffle([...possibleValues]).slice(0, 4);
  
  el.miniArea.innerHTML = `
    <div class="row">
      <button class="btn" data-bonus="${shuffledValues[0]}">CASE 1</button>
      <button class="btn" data-bonus="${shuffledValues[1]}">CASE 2</button>
      <button class="btn" data-bonus="${shuffledValues[2]}">CASE 3</button>
      <button class="btn" data-bonus="${shuffledValues[3]}">CASE 4</button>
    </div>`;
  el.miniButtons.innerHTML = '';
  el.miniArea.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click', ()=>{
      const val = Number(b.getAttribute('data-bonus'))||0;
      state.subtotal += val;
      showPlus(val);
      renderScores();
      
      // Play appropriate sound
      if (val > 0) {
        gameAudio.play('sweet_bell');
      } else if (val < 0) {
        gameAudio.play('bust');
      }
      
      closeOverlay(el.miniOverlay);
      resetTimer(); startTimer();
      renderAskButton();
    }, {once:true});
  });
  openOverlay(el.miniOverlay);
  renderAskButton();
}

function openMiniWheel(){
  stopTimer(); // pause while the mini-game is up
  const couple = CONFIG.couples[state.currentTeam];
  el.miniTitle.textContent = 'Mini-Game: Risk Wheel';
  el.miniIntro.textContent = `Spin for bonus points — or pass if you're not feeling lucky.`;

  // Clean wheel container without winner box
  el.miniArea.innerHTML = `
    <div class="slot-machine-container">
      <div class="wheel">
        <canvas id="wheelCanvas"></canvas>
      </div>
    </div>`;
  el.miniButtons.innerHTML = '';

  const canvas = document.getElementById('wheelCanvas');
  const size = Math.min(560, Math.floor(window.innerWidth*0.7));
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const wheelEl = el.miniArea.querySelector('.wheel');

  const segments = [
    {label:'0',   value:0},
    {label:'BUST',value:'BUST'},
    {label:'10',  value:10},
    {label:'20',  value:20},
    {label:'30',  value:30},
    {label:'40',  value:40},
    {label:'50',  value:50},
    {label:'60',  value:60},
    {label:'70',  value:70},
    {label:'80',  value:80}
  ];
  const totalSeg = segments.length;
  const segAngle = 2*Math.PI/totalSeg;

  // Draw the wheel at rotation `angle` with center window highlight
  function paint(angle){
    const w = canvas.width, r = w/2, cx = r, cy = r;
    ctx.clearRect(0,0,w,w);

    // Don't rotate the canvas - instead adjust the drawing angles
    let start = -Math.PI/2 + angle; // Start at 12 o'clock + rotation
    const baseColor = '#c0c0c0'; // Single silver color for all segments
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.font = `${Math.floor(w*0.06)}px sans-serif`;

    // Find which segment is in the center window
    const centerIdx = getCenterSegment(angle);

    for (let i=0;i<totalSeg;i++){
      const ang = segAngle;
      const mid = start + ang/2;
      const isInCenter = (i === centerIdx);

      // Wedge
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r,start,start+ang,false);
      ctx.closePath();
      
      // Highlight segment in center window
      if (isInCenter) {
        ctx.fillStyle = '#ffff00'; // Bright yellow highlight
        ctx.shadowColor = 'rgba(255,255,0,0.8)';
        ctx.shadowBlur = 20;
      } else {
        ctx.fillStyle = baseColor; // All other segments same silver color
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      ctx.fill();

      // Add border to segments
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx + Math.cos(mid)*r*0.65, cy + Math.sin(mid)*r*0.65);
      ctx.rotate(mid);
      ctx.fillStyle = isInCenter ? '#000' : '#000';
      ctx.font = `bold ${Math.floor(w*0.06)}px sans-serif`;
      ctx.fillText(segments[i].label, 0, 0);
      ctx.restore();

      start += ang;
    }
  }

  // Which segment is currently in the center window?
  function getCenterSegment(angle){
    // Normalize angle to positive range
    let normalizedAngle = ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    
    // Calculate how many segments we've rotated
    const segmentsPassed = normalizedAngle / segAngle;
    
    // The segment in the center is the one that has rotated to that position
    const segmentIndex = Math.floor(segmentsPassed) % totalSeg;
    
    return segmentIndex;
  }

  // Legacy function for compatibility
  function indexAtTop(angle){
    return getCenterSegment(angle);
  }

  // Initial paint
  paint(0);

  // Buttons
  const passBtn = document.createElement('button'); passBtn.className='btn'; passBtn.textContent='Pass';
  const spinBtn = document.createElement('button'); spinBtn.className='btn primary'; spinBtn.textContent='Spin';
  el.miniButtons.appendChild(passBtn); el.miniButtons.appendChild(spinBtn);

  let rafId = null;
  let pulseId = null;
  function cleanup(){
    if (rafId) cancelAnimationFrame(rafId), (rafId=null);
    if (pulseId) clearInterval(pulseId), (pulseId=null);
    canvas.style.transform = 'scale(1)';
  }
  function closeMiniAndResume(){
    closeOverlay(el.miniOverlay);
    cleanup();
    resetTimer(); startTimer();
    renderAskButton();
  }

  passBtn.addEventListener('click', closeMiniAndResume, {once:true});

  // REALISTIC WHEEL SPIN: More authentic wheel of fortune experience
  spinBtn.addEventListener('click', ()=>{
    spinBtn.disabled = true; passBtn.disabled = true;

    // More dramatic spin parameters for suspense
    const baseSpins = 5 + Math.random() * 3;  // 5-8 full rotations
    const randomOffset = Math.random() * 2*Math.PI;
    const finalAngle = baseSpins * 2*Math.PI + randomOffset;
    
    // Much longer, more suspenseful spin
    const dur = 7000 + Math.random() * 3000; // 7-10 seconds

    let t0 = null;
    let lastTickIdx = -1;
    let tickCount = 0;
    
    // Roulette-style easing - starts fast, gradually slows down
    const easeOutQuint = x => 1 - Math.pow(1 - x, 5);

    function animate(ts){
      if(!t0) t0 = ts;
      const p = Math.min(1,(ts - t0)/dur);
      
      // Roulette physics - starts at full speed, gradually decelerates
      const easedProgress = easeOutQuint(p);
      const angle = easedProgress * finalAngle;
      
      // Calculate current speed for sound (derivative of easing function)
      const currentSpeed = 1 - easedProgress;

      // Roulette-style tick sound - frequency matches wheel speed
      const liveIdx = getCenterSegment(angle);
      if (liveIdx !== lastTickIdx){
        lastTickIdx = liveIdx;
        tickCount++;
        
        // Sound frequency matches current wheel speed (high when fast, low when slow)
        const tickFreq = Math.max(200, 200 + (currentSpeed * 800));
        const volume = Math.max(0.1, currentSpeed * 0.25);
        try{ 
          ensureAudio(); 
          tone(tickFreq, 0.06, 'square', volume);
        }catch{}
      }

      paint(angle);

      if (p < 1){
        rafId = requestAnimationFrame(animate);
      } else {
        // Landed - go straight to pulse effect
        const landedIdx = getCenterSegment(finalAngle);
        paint(finalAngle); // Lock to final position immediately
        
        // Victory pulse effect
        let up = false;
        pulseId = setInterval(()=>{
          up = !up;
          canvas.style.transition = 'transform 200ms ease-in-out';
          canvas.style.transform = up ? 'scale(1.05)' : 'scale(1.00)';
        }, 200);

        // Final result - no wobble delay needed
        setTimeout(()=>{
          cleanup();
          const result = segments[landedIdx].value;
          console.log(`Wheel landed on index ${landedIdx}, value: ${result}, segment: ${segments[landedIdx].label}`);
          try{ ensureAudio(); fanfare(); }catch{}
          
          if (result === 'BUST'){
            closeOverlay(el.miniOverlay);
            showBustThenNext();
          } else if (result === 0 || result === '0') {
            // Zero points - crowd disappointment but no bust
            state.subtotal += 0;
            showPlus(0, 3000);
            renderScores();
            gameAudio.play('crowd_ah'); // Crowd disappointment for zero
            closeMiniAndResume();
          } else {
            state.subtotal += Number(result)||0;
            showPlus(result, 3000); // Show +XX for 3 seconds during cheer audio
            renderScores();
            gameAudio.play('cheer'); // Crowd cheer for wheel wins
            closeMiniAndResume();
          }
        }, 600);
      }
    }

    rafId = requestAnimationFrame(animate);
  }, {once:true});

  // Defensive: stop animations if modal is closed externally
  el.miniOverlay.addEventListener('transitionend', () => {
    if (!el.miniOverlay.classList.contains('show')) cleanup();
  });

  openOverlay(el.miniOverlay);
  renderAskButton();
}

function openMiniAceyDeucey(){
  stopTimer(); // pause while the mini-game is up
  const couple = CONFIG.couples[state.currentTeam];
  el.miniTitle.textContent = 'Mini-Game: Acey Deucey';
  el.miniIntro.textContent = `${couple}, wager whether the next card is within the spread!`;

  // Create shuffled deck
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];
  
  suits.forEach(suit => {
    ranks.forEach((rank, index) => {
      deck.push({
        rank: rank,
        suit: suit,
        value: index + 1 // Ace = 1, King = 13
      });
    });
  });
  
  // Shuffle deck
  shuffle(deck);
  
  // Deal two cards ensuring there's at least 1 card between them
  let leftCard, rightCard, middleCard;
  let attempts = 0;
  
  do {
    leftCard = deck[attempts];
    rightCard = deck[attempts + 1];
    middleCard = deck[attempts + 2];
    attempts++;
  } while (Math.abs(leftCard.value - rightCard.value) <= 1 && attempts < 50);
  
  // Ensure left card is lower than right card for display
  const [lowCard, highCard] = leftCard.value <= rightCard.value ? 
    [leftCard, rightCard] : [rightCard, leftCard];

  el.miniArea.innerHTML = `
    <div class="card-game">
      <div class="cards-row">
        <div class="card-slot">
          <div class="playing-card">
            <div class="card-rank">${lowCard.rank}</div>
            <div class="card-suit">${lowCard.suit}</div>
            ${lowCard.rank === 'A' ? '<div class="ace-indicator">LOW</div>' : ''}
          </div>
        </div>
        <div class="card-slot middle">
          <div class="playing-card face-down">?</div>
        </div>
        <div class="card-slot">
          <div class="playing-card">
            <div class="card-rank">${highCard.rank}</div>
            <div class="card-suit">${highCard.suit}</div>
            ${highCard.rank === 'A' ? '<div class="ace-indicator">LOW</div>' : ''}
          </div>
        </div>
      </div>
      <div class="spread-info">
        Winning Numbers: ${lowCard.value + 1} to ${highCard.value - 1}
        <br>Spread: ${highCard.value - lowCard.value - 1} cards
      </div>
      <div class="wager-section">
        <p>Current Points: <strong>${state.subtotal}</strong></p>
        <div class="wager-display">
          <p>Choose your wager:</p>
        </div>
        <div class="wager-input-section">
          <div class="quick-wager-buttons">
            <button class="btn quick-wager" data-percent="0">NONE</button>
            <button class="btn quick-wager" data-percent="10">10%</button>
            <button class="btn quick-wager" data-percent="25">25%</button>
            <button class="btn quick-wager" data-percent="50">50%</button>
            <button class="btn quick-wager" data-percent="75">75%</button>
            <button class="btn quick-wager" data-percent="100">ALL</button>
          </div>
        </div>
        <div class="deal-section" style="margin-top: 16px;">
          <button class="btn primary deal-btn" id="dealCardBtn" disabled>💳 Deal Card</button>
        </div>
      </div>
    </div>`;

  el.miniButtons.innerHTML = '';

  // Check if player has no points to wager
  if (state.subtotal <= 0) {
    // Replace wager section with message and continue button
    el.miniArea.querySelector('.wager-section').innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <p style="font-size: 18px; color: var(--red1); margin-bottom: 20px;">
          <strong>Sorry, you don't have anything to wager!</strong>
        </p>
        <button class="btn primary" id="continueNoWagerBtn">Continue</button>
      </div>`;
    
    document.getElementById('continueNoWagerBtn').addEventListener('click', () => {
      closeOverlay(el.miniOverlay);
      resetTimer(); 
      startTimer();
      renderAskButton();
    }, {once: true});
    
    openOverlay(el.miniOverlay);
    renderAskButton();
    return; // Exit early, don't set up wager logic
  }

  // Wager selection and deal button
  const dealBtn = el.miniArea.querySelector('#dealCardBtn');
  let selectedWagerAmount = undefined;
  
  // Quick wager buttons
  el.miniArea.querySelectorAll('.quick-wager').forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      el.miniArea.querySelectorAll('.quick-wager').forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');
      
      const percent = parseInt(btn.dataset.percent);
      selectedWagerAmount = Math.round(state.subtotal * percent / 100);
      
      // Update the wager display
      const wagerDisplay = el.miniArea.querySelector('.wager-display');
      if (selectedWagerAmount === 0) {
        wagerDisplay.innerHTML = '<p>Choose your wager: <strong>NONE (0 points)</strong></p>';
      } else {
        wagerDisplay.innerHTML = `<p>Choose your wager: <strong>${percent}% (${selectedWagerAmount} points)</strong></p>`;
      }
      
      dealBtn.disabled = false;
    });
  });

  // Deal card button
  dealBtn.addEventListener('click', () => {
    const wagerAmount = selectedWagerAmount;
    
    if (selectedWagerAmount === undefined || wagerAmount > state.subtotal) {
      alert('Please select a wager option first!');
      return;
    }
    
    // Disable controls
    dealBtn.disabled = true;
    el.miniArea.querySelectorAll('.quick-wager').forEach(b => b.disabled = true);
    
    // Play drumroll for suspense (except for NONE bets)
    if (wagerAmount > 0) {
      gameAudio.play('drumroll', 0.5);
    }
    
    // Reveal the middle card with suspense (longer delay for drumroll)
    setTimeout(() => {
        const middleSlot = el.miniArea.querySelector('.middle .playing-card');
        middleSlot.innerHTML = `
          <div class="card-rank">${middleCard.rank}</div>
          <div class="card-suit">${middleCard.suit}</div>
          ${middleCard.rank === 'A' ? '<div class="ace-indicator">LOW</div>' : ''}
        `;
        middleSlot.classList.remove('face-down');
        middleSlot.classList.add('revealed');
      
        // Determine outcome
        let result = '';
        let pointChange = 0;
        
        if (wagerAmount === 0) {
          // NONE option - just show what would have happened
          if (middleCard.value > lowCard.value && middleCard.value < highCard.value) {
            result = `🔍 NONE bet - Card ${middleCard.value} was between ${lowCard.value} and ${highCard.value}. You would have won!`;
          } else if (middleCard.value === lowCard.value || middleCard.value === highCard.value) {
            result = `🔍 NONE bet - Card ${middleCard.value} matched an end card. You would have lost 50 points!`;
          } else {
            result = `🔍 NONE bet - Card ${middleCard.value} was outside the range. You would have lost your wager!`;
          }
          pointChange = 0;
        } else if (middleCard.value > lowCard.value && middleCard.value < highCard.value) {
          // WIN - card is in between
          result = `🎉 WIN! Card ${middleCard.value} is between ${lowCard.value} and ${highCard.value}`;
          pointChange = wagerAmount;
        } else if (middleCard.value === lowCard.value || middleCard.value === highCard.value) {
          // MATCH - lose 50 points
          result = `💥 MATCH! Card ${middleCard.value} matches an end card. Lose 50 points!`;
          pointChange = -50;
        } else {
          // LOSE - card is outside range, lose wagered amount
          result = `💀 BUST! Card ${middleCard.value} is outside the range. Lose ${wagerAmount} points!`;
          pointChange = -wagerAmount;
        }
      
        // Show dramatic result overlay first
        setTimeout(() => {
          let overlayText = '';
          let overlayClass = '';
          
          if (wagerAmount === 0) {
            // NONE option - no dramatic overlay, just show result
            showCardResult();
          } else if (middleCard.value > lowCard.value && middleCard.value < highCard.value) {
            // WIN
            overlayText = 'YOU WIN!';
            overlayClass = 'card-win';
            gameAudio.play('sweet_bell');
            // Play cheer after sweet bell
            setTimeout(() => gameAudio.play('cheer'), 800);
            showCardOverlay(overlayText, overlayClass, () => showCardResult());
          } else {
            // BUST (both match and outside range)
            overlayText = 'BUST!';
            overlayClass = 'card-bust';
            gameAudio.play('cardbust');
            // Play crowd disappointment after cardbust
            setTimeout(() => gameAudio.play('crowd_ah'), 800);
            showCardOverlay(overlayText, overlayClass, () => showCardResult());
          }
        }, 2500);
        
        function showCardResult() {
          el.miniArea.querySelector('.spread-info').innerHTML = `
            <div class="result-text">${result}</div>
            <div class="point-change">Points: ${pointChange >= 0 ? '+' : ''}${pointChange}</div>
          `;
          
          // Apply point change
          state.subtotal = Math.max(0, state.subtotal + pointChange);
          showPlus(pointChange);
          renderScores();
          
          // Add continue button
          el.miniButtons.innerHTML = '<button class="btn primary" id="continueCardBtn">Continue</button>';
          document.getElementById('continueCardBtn').addEventListener('click', () => {
            closeOverlay(el.miniOverlay);
            resetTimer(); 
            startTimer();
            renderAskButton();
          }, {once: true});
        }
    }, 2000); // 2 seconds - better sync with drumroll audio
  }, {once: true});


  openOverlay(el.miniOverlay);
  renderAskButton();
}

function showCardOverlay(text, className, callback) {
  // Create overlay element if it doesn't exist
  let cardOverlay = document.getElementById('cardOverlay');
  if (!cardOverlay) {
    cardOverlay = document.createElement('div');
    cardOverlay.id = 'cardOverlay';
    cardOverlay.className = 'card-overlay';
    cardOverlay.innerHTML = '<div class="card-overlay-text"></div>';
    document.body.appendChild(cardOverlay);
  }
  
  const textElement = cardOverlay.querySelector('.card-overlay-text');
  textElement.textContent = text;
  textElement.className = `card-overlay-text ${className}`;
  
  // Show overlay
  cardOverlay.classList.add('show');
  
  // Hide after delay and run callback
  setTimeout(() => {
    cardOverlay.classList.remove('show');
    setTimeout(callback, 200); // Wait for fade out
  }, 1500);
}

/* =============================
   Intro Screen Logic
============================= */

function setupIntro(){
  // Player count selector
  const countBtns = document.querySelectorAll('.count-btn');
  const nameInputs = document.querySelectorAll('.name-input');
  
  countBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      countBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const count = parseInt(btn.dataset.count);
      CONFIG.playerCount = count;
      
      // Show/hide name inputs based on player count
      nameInputs.forEach((input, index) => {
        if (index < count) {
          input.style.display = 'block';
          input.required = true;
        } else {
          input.style.display = 'none';
          input.required = false;
        }
      });
    });
  });
  
  // Start game button
  el.startGameBtn.addEventListener('click', () => {
    // Get team names from inputs
    const names = [];
    for (let i = 0; i < CONFIG.playerCount; i++) {
      const input = nameInputs[i];
      const name = input.value.trim() || `Team ${i + 1}`;
      names.push(name);
    }
    
    // Get game settings
    const roundsInput = document.getElementById('roundsInput');
    const wagerInput = document.getElementById('wagerInput');
    
    const rounds = parseInt(roundsInput.value) || 16;
    const wager = parseInt(wagerInput.value) || 5;
    
    // Update CONFIG with custom settings
    CONFIG.couples = names;
    CONFIG.roundsPlanned = Math.max(1, Math.min(50, rounds));
    CONFIG.originalRoundsPlanned = CONFIG.roundsPlanned; // Store original setting
    CONFIG.roundPrize = Math.max(1, Math.min(1000, wager));
    
    // Update team name displays in the game
    for (let i = 0; i < CONFIG.playerCount; i++) {
      const nameEl = el.teamCards[i].querySelector('.name');
      if (nameEl) nameEl.textContent = CONFIG.couples[i];
    }
    
    // Hide intro screen and show game
    el.introScreen.style.display = 'none';
    el.gameWrap.style.display = 'flex';
    
    // Initialize the game
    newMatch();
    ensureAudio();
  });
  

  
  // Initialize with default player count (3)
  CONFIG.playerCount = 3;
  nameInputs.forEach((input, index) => {
    if (index < 3) {
      input.style.display = 'block';
      input.required = true;
    } else {
      input.style.display = 'none';
      input.required = false;
    }
  });
}

/* =============================
   Events
============================= */

el.bankBtn.addEventListener('click', ()=> doBank(true));
// Start button event listener is now handled dynamically in renderBoard()
el.nextRoundBtn.addEventListener('click', startNextRound);
el.closeRoundBtn.addEventListener('click', ()=> closeOverlay(el.roundOverlay));
el.playAgainBtn.addEventListener('click', ()=> { closeOverlay(el.finalOverlay); newMatch(); });
el.closeFinalBtn.addEventListener('click', ()=> closeOverlay(el.finalOverlay));
el.rulesBtn.addEventListener('click', ()=> openOverlay(el.rulesOverlay));
el.closeRulesBtn.addEventListener('click', ()=> closeOverlay(el.rulesOverlay));
el.newMatchBtn.addEventListener('click', ()=> { 
  if (confirm('Reset the entire game and return to setup?')) {
    // Reset all game state
    stopTimer();
    state.started = false;
    state.round = 1;
    state.startingTeamIdx = 0;
    state.currentTeam = 0;
    state.turnsTaken = 0;
    state.cashWon = [0,0,0,0];
    state.thisRoundScores = [0,0,0,0];
    state.subtotal = 0;
    state.boardValues = [];
    state.cases = [];
    state.remaining = 0;
    state.revealing = false;
    state.bradUsedCount = 0;
    state.safeStreak = 0;
    state.minisThisTurn = 0;
    
    // Close any open overlays
    closeOverlay(el.roundOverlay);
    closeOverlay(el.finalOverlay);
    closeOverlay(el.rulesOverlay);
    closeOverlay(el.aiOverlay);
    closeOverlay(el.miniOverlay);
    closeOverlay(el.bustOverlay);
    closeOverlay(el.plusOverlay);
    
    // Reset CONFIG to defaults
    CONFIG.couples = ["Team 1","Team 2","Team 3","Team 4"];
    CONFIG.playerCount = 3;
    CONFIG.roundsPlanned = 16;
    CONFIG.originalRoundsPlanned = 16;
    CONFIG.roundPrize = 5;
    
    // Show intro screen and hide game
    el.gameWrap.style.display = 'none';
    el.introScreen.style.display = 'flex';
    
    // Reset intro form to defaults
    const countBtns = document.querySelectorAll('.count-btn');
    countBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-count="3"]').classList.add('active');
    
    const nameInputs = document.querySelectorAll('.name-input');
    nameInputs.forEach((input, index) => {
      input.value = `Team ${index + 1}`;
      if (index < 3) {
        input.style.display = 'block';
        input.required = true;
      } else {
        input.style.display = 'none';
        input.required = false;
      }
    });
    
    document.getElementById('roundsInput').value = 16;
    document.getElementById('wagerInput').value = 5;
  }
});
el.askBtn.addEventListener('click', openAI);
el.aiCloseBtn.addEventListener('click', ()=> { closeAI(); });

// Temporary test buttons for mini-games
el.testWheelBtn.addEventListener('click', ()=> {
  if (!state.started) {
    alert('Please start a round first to test the wheel!');
    return;
  }
  ensureAudio();
  openMiniWheel();
});

el.testCasesBtn.addEventListener('click', ()=> {
  if (!state.started) {
    alert('Please start a round first to test bonus chests!');
    return;
  }
  ensureAudio();
  openMiniBonusCases();
});

el.testCardsBtn.addEventListener('click', ()=> {
  if (!state.started) {
    alert('Please start a round first to test Acey Deucey!');
    return;
  }
  ensureAudio();
  openMiniAceyDeucey();
});

/* =============================
   Init
============================= */

function init(){
  setupIntro(); // Setup intro screen first
  // Game will be initialized when user clicks "Start Game"
}
init();
