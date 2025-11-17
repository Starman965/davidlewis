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
  bradUsesPerTurn: 5
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
  minisThisTurn: 0
};

/* =============================
   Audio
============================= */

let AC=null;
function ensureAudio(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch{} } }
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

  newMatchBtn: document.getElementById('newMatchBtn')
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
  el.askBtn.textContent = left>0 ? `Ask BradGPT (${left} left)` : `Ask BradGPT (0 left)`;
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
        <div class="face front"><div class="label">CASE ${i+1}</div></div>
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
  ensureAudio(); whoosh();

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
      showBustThenNext();
    } else {
      c.opened = true;
      state.remaining--;
      state.subtotal += val;
      showPlus(val);
      ensureAudio(); ding();
      if (val >= 70) setTimeout(fanfare, 140);

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

function showPlus(n){
  el.plusTxt.textContent = n >= 0 ? `+${Number(n)}` : `${Number(n)}`;
  openOverlay(el.plusOverlay);
  setTimeout(()=> closeOverlay(el.plusOverlay), 800);
}

function doBank(manual=true){
  if (state.locked || state.revealing || !state.started) return;
  stopTimer();
  if (state.subtotal > 0){
    state.thisRoundScores[state.currentTeam] += state.subtotal;
  }
  state.subtotal = 0;
  renderScores();
  if (manual) ensureAudio(), ding();

  state.locked = true;
  setTimeout(()=>{ state.locked=false; nextTurn(); }, 350);
}

function timeOutBust(){
  ensureAudio(); buzzer();
  state.subtotal = 0;
  renderScores();
  showBustThenNext();
}

function showBustThenNext(){
  openOverlay(el.bustOverlay);
  ensureAudio(); buzzer();
  setTimeout(()=>{
    closeOverlay(el.bustOverlay);
    state.locked = false;
    state.revealing = false;
    nextTurn();
  }, 900);
}

/* =============================
   BradGPT
============================= */

function openAI(){
  if (!state.started || state.locked || state.revealing) return;
  const left = Math.max(0, CONFIG.bradUsesPerTurn - state.bradUsedCount);
  if (left<=0) return;

  stopTimer(); // freeze time

  const couple = CONFIG.couples[state.currentTeam];
  const remaining = state.cases.filter(c=>!c.opened);
  const remainingBusts = remaining.filter(c=>c.value===0).length;
  const remainingCases = remaining.length;

  // safe odds: never show 100% while a bust remains
  let safeOdds = remainingCases>0 ? (remainingCases - remainingBusts)/remainingCases : 0;
  if (remainingBusts>0) safeOdds = Math.min(safeOdds, 0.99);

  const positives = remaining.filter(c=>c.value>0).map(c=>c.value);
  const expected = positives.length ? Math.round(sum(positives)/positives.length) : 0;
  const highest = positives.length ? Math.max(...positives) : 0;

  const leaderScore = Math.max(...state.thisRoundScores);
  const leaderIdxs = state.thisRoundScores.map((v,i)=>v===leaderScore?i:-1).filter(i=>i>=0);
  const leaderNames = leaderScore>0 ? leaderIdxs.map(i=>CONFIG.couples[i]).join(' & ') : 'No one';

  el.aiIntro.textContent = `${couple} Couple — you're at ${state.subtotal} points.`;
  el.aiSafe.textContent = `Safe: ${(safeOdds*100).toFixed(0)}%`;
  el.aiRisk.textContent = `(Bust: ${((1-safeOdds)*100).toFixed(0)}%)`;
  el.aiStats.textContent = `Expected next pick: +${expected} • Highest remaining: ${highest}`;
  el.aiLeader.textContent = leaderScore>0 ? `Leaders: ${leaderNames} at ${leaderScore}.` : `No current leader.`;

  let advice = '';
  if (safeOdds >= 0.9) advice = 'Odds are excellent — take another pick.';
  else if (safeOdds >= 0.75) advice = 'Odds are strong — going for one more is reasonable.';
  else if (safeOdds >= 0.6) advice = 'Borderline: consider banking soon unless you feel lucky.';
  else advice = 'Risky: banking now is sensible.';
  el.aiAdvice.textContent = `Advice (Balanced): ${advice}`;

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
    // Stop timer & open one of the two minis
    stopTimer();
    Math.random() < 0.5 ? openMiniBonusCases() : openMiniWheel();
    state.safeStreak = 0; // reset counter after mini appears
    state.minisThisTurn++;
    return true;
  }
  return false;
}

function openMiniBonusCases(){
  stopTimer(); // ensure timer is stopped while modal is up
  const couple = CONFIG.couples[state.currentTeam];
  el.miniTitle.textContent = 'Mini-Game: Bonus Cases';
  el.miniIntro.textContent = `BradGPT™: ${couple} Team, pick one of 4 bonus cases!`;
  
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
  el.miniIntro.textContent = `BradGPT™: ${couple} Couple, spin for a bonus — or pass if you're not feeling lucky.`;

  // Fresh wheel container (no pointer, no highlight)
  el.miniArea.innerHTML = `
    <div class="wheel">
      <canvas id="wheelCanvas"></canvas>
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

  // Draw the wheel at rotation `angle` (NO highlight)
  function paint(angle){
    const w = canvas.width, r = w/2, cx = r, cy = r;
    ctx.clearRect(0,0,w,w);

    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(angle);
    ctx.translate(-cx,-cy);

    let start = -Math.PI/2; // 12 o'clock
    const baseColors = ['#ffd166','#a0e7e5','#b9fbc0','#ffadad','#cdb4db',
                        '#90dbf4','#ffc8dd','#bde0fe','#caffbf','#ffafcc'];
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.font = `${Math.floor(w*0.06)}px sans-serif`;

    for (let i=0;i<totalSeg;i++){
      const ang = segAngle;
      const mid = start + ang/2;

      // Wedge
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r,start,start+ang,false);
      ctx.closePath();
      ctx.fillStyle = baseColors[i%baseColors.length];
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.fill();

      // Label
      ctx.save();
      ctx.translate(cx + Math.cos(mid)*r*0.65, cy + Math.sin(mid)*r*0.65);
      ctx.rotate(mid);
      ctx.fillStyle = '#003';
      ctx.fillText(segments[i].label, 0, 0);
      ctx.restore();

      start += ang;
    }
    ctx.restore();

    // IMPORTANT: do NOT draw an outer stroke; CSS border on .wheel is the ring.
  }

  // Which slice is under 12 o'clock at rotation `angle`?
  function indexAtTop(angle){
    const segProgress = angle/segAngle - 0.5;
    let idx = Math.floor(segProgress);
    idx = ((idx % totalSeg) + totalSeg) % totalSeg; // safe modulo
    return idx;
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

  // BLIND MODE: spin to a random final angle; result is whatever ends up at 12 o'clock.
  spinBtn.addEventListener('click', ()=>{
    spinBtn.disabled = true; passBtn.disabled = true;

    const spins = 4 + Math.floor(Math.random()*3);       // 4–6 turns
    const dur   = 5000 + Math.floor(Math.random()*3000); // 5–8s
    const randomOffset = Math.random() * 2*Math.PI;      // anywhere
    const finalAngle = spins*2*Math.PI + randomOffset;

    let t0 = null;
    let lastTickIdx = -1;
    const easeOutCubic = x => 1 - Math.pow(1 - x, 3);

    function animate(ts){
      if(!t0) t0 = ts;
      const p = Math.min(1,(ts - t0)/dur);
      const angle = easeOutCubic(p) * finalAngle;

      // Tick per new wedge passing 12 o'clock
      const liveIdx = indexAtTop(angle);
      if (liveIdx !== lastTickIdx){
        lastTickIdx = liveIdx;
        try{ ensureAudio(); beep(); }catch{}
      }

      paint(angle);

      if (p < 1){
        rafId = requestAnimationFrame(animate);
      } else {
        // Landed
        const landedIdx = indexAtTop(finalAngle);

        // Pulse the whole wheel (not a wedge) for 2 seconds
        let up = false;
        pulseId = setInterval(()=>{
          up = !up;
          canvas.style.transition = 'transform 140ms ease-in-out';
          canvas.style.transform = up ? 'scale(1.03)' : 'scale(1.00)';
        }, 160);

        setTimeout(()=>{
          cleanup();
          const result = segments[landedIdx].value;
          if (result === 'BUST'){
            closeOverlay(el.miniOverlay);
            showBustThenNext();
          } else {
            state.subtotal += Number(result)||0;
            showPlus(result);
            renderScores();
            closeMiniAndResume();
          }
        }, 2000);
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

/* =============================
   Init
============================= */

function init(){
  setupIntro(); // Setup intro screen first
  // Game will be initialized when user clicks "Start Game"
}
init();
