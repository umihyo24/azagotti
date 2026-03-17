const state = {
  hunger: 62,
  happiness: 58,
  stamina: 70,
  bond: 40,
  behavior: 'walking',
  showClock: true,
  soundVolume: 60,
};

const seal = document.getElementById('seal');
const playArea = document.getElementById('playArea');
const behaviorText = document.getElementById('behaviorText');
const reaction = document.getElementById('reaction');
const clock = document.getElementById('clock');
const toggleClockBtn = document.getElementById('toggleClockBtn');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

document.getElementById('closeModal').addEventListener('click', () => modal.classList.add('hidden'));
document.getElementById('foodBtn').addEventListener('click', openFood);
document.getElementById('trainingBtn').addEventListener('click', openTraining);
document.getElementById('settingsBtn').addEventListener('click', openSettings);

seal.addEventListener('click', () => {
  state.happiness = clamp(state.happiness + 3);
  state.bond = clamp(state.bond + 2);
  reaction.classList.remove('show');
  void reaction.offsetWidth;
  reaction.textContent = ['♪', '！', '♥'][Math.floor(Math.random() * 3)];
  reaction.classList.add('show');
  render();
});

toggleClockBtn.addEventListener('click', () => {
  state.showClock = !state.showClock;
  render();
});

const FOODS = [
  { name: 'さかな', effects: { hunger: +22, happiness: +6, stamina: +3, bond: +2 } },
  { name: 'えび', effects: { hunger: +16, happiness: +10, stamina: +2, bond: +3 } },
  { name: 'ごほうびアイス', effects: { hunger: +8, happiness: +16, stamina: -3, bond: +4 } },
];

function openFood() {
  modalTitle.textContent = 'ごはん';
  modal.classList.remove('hidden');
  modalBody.innerHTML = `<div class="card-list">${FOODS.map((f, i) => `
    <div class="card">
      <div>
        <strong>${f.name}</strong>
        <div class="small">空腹 +${f.effects.hunger} / 幸福 +${f.effects.happiness} / 絆 +${f.effects.bond}</div>
      </div>
      <button class="chip-button" data-food-index="${i}">あげる</button>
    </div>`).join('')}</div>`;

  modalBody.querySelectorAll('[data-food-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-food-index'));
      feed(FOODS[idx]);
    });
  });
}

function feed(food) {
  applyEffects(food.effects);
  state.behavior = 'sitting';
  reaction.textContent = 'もぐもぐ';
  reaction.classList.remove('show');
  void reaction.offsetWidth;
  reaction.classList.add('show');
  render();
}

function openTraining() {
  modalTitle.textContent = 'トレーニング';
  modal.classList.remove('hidden');
  modalBody.innerHTML = `
    <div class="card-list">
      <div class="card">
        <div>
          <strong>ボールキャッチ（ミニゲーム）</strong>
          <div class="small">10秒以内にボタンを8回押すと成功</div>
        </div>
        <button id="startMiniGame" class="chip-button">開始</button>
      </div>
      <div class="card"><div id="miniGameArea" class="small">開始ボタンでチャレンジ！</div></div>
    </div>`;

  document.getElementById('startMiniGame').addEventListener('click', startMiniGame);
}

function startMiniGame() {
  const area = document.getElementById('miniGameArea');
  let count = 0;
  let remaining = 10;
  area.innerHTML = `<div>残り時間: <span id="timer">10</span>秒</div><button id="tapBtn" class="main-btn" style="margin-top:8px;">キャッチ！(0/8)</button>`;
  const timerEl = document.getElementById('timer');
  const tapBtn = document.getElementById('tapBtn');

  const interval = setInterval(() => {
    remaining -= 1;
    timerEl.textContent = String(remaining);
    if (remaining <= 0) {
      clearInterval(interval);
      tapBtn.disabled = true;
      if (count >= 8) {
        area.innerHTML += '<p>成功！スタミナ+8 / 絆+6</p>';
        applyEffects({ stamina: +8, bond: +6, happiness: +4, hunger: -6 });
      } else {
        area.innerHTML += '<p>失敗…でもがんばった！スタミナ+2</p>';
        applyEffects({ stamina: +2, hunger: -4 });
      }
      render();
    }
  }, 1000);

  tapBtn.addEventListener('click', () => {
    count += 1;
    tapBtn.textContent = `キャッチ！(${count}/8)`;
  });
}

function openSettings() {
  modalTitle.textContent = '設定';
  modal.classList.remove('hidden');
  modalBody.innerHTML = `
    <div class="card-list">
      <div class="card">
        <div><strong>音量</strong><div class="small">効果音のボリューム</div></div>
        <input id="volumeRange" type="range" min="0" max="100" value="${state.soundVolume}" />
      </div>
      <div class="card">
        <div><strong>時刻表示</strong><div class="small">ヘッダーに現在時刻を表示</div></div>
        <button id="clockToggleModal" class="chip-button">${state.showClock ? 'ON' : 'OFF'}</button>
      </div>
      <div class="card">
        <div><strong>セーブリセット</strong><div class="small">全ステータスを初期化</div></div>
        <button id="resetBtn" class="chip-button">リセット</button>
      </div>
    </div>`;

  document.getElementById('volumeRange').addEventListener('input', (e) => {
    state.soundVolume = Number(e.target.value);
  });
  document.getElementById('clockToggleModal').addEventListener('click', () => {
    state.showClock = !state.showClock;
    openSettings();
    render();
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('本当にセーブをリセットしますか？')) {
      Object.assign(state, { hunger: 62, happiness: 58, stamina: 70, bond: 40 });
      render();
    }
  });
}

function applyEffects({ hunger = 0, happiness = 0, stamina = 0, bond = 0 }) {
  state.hunger = clamp(state.hunger + hunger);
  state.happiness = clamp(state.happiness + happiness);
  state.stamina = clamp(state.stamina + stamina);
  state.bond = clamp(state.bond + bond);
}

function clamp(v) { return Math.max(0, Math.min(100, v)); }

function renderBars() {
  document.getElementById('hungerBar').style.width = `${state.hunger}%`;
  document.getElementById('happinessBar').style.width = `${state.happiness}%`;
  document.getElementById('staminaBar').style.width = `${state.stamina}%`;
  document.getElementById('bondBar').style.width = `${state.bond}%`;
}

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

function chooseBehavior() {
  const tiredWeight = state.stamina < 35 ? 0.5 : 0.2;
  const happyWeight = state.happiness > 70 ? 0.45 : 0.25;
  const pool = [
    { name: 'walking', w: 0.35 + happyWeight },
    { name: 'sitting', w: 0.25 },
    { name: 'sleeping', w: tiredWeight },
    { name: 'looking', w: 0.2 },
  ];
  const total = pool.reduce((a, b) => a + b.w, 0);
  let r = Math.random() * total;
  const selected = pool.find((p) => (r -= p.w) <= 0) || pool[0];
  state.behavior = selected.name;
  behaviorText.textContent = `行動: ${toLabel(selected.name)}`;
  seal.className = `seal ${selected.name}`;
}

function toLabel(name) {
  return {
    walking: 'うろうろ',
    sitting: 'おすわり',
    sleeping: 'すやすや',
    looking: 'こちらを見る',
  }[name] || name;
}

let x = 0;
let y = 0;
function moveSeal() {
  const rect = playArea.getBoundingClientRect();
  const maxX = rect.width - 140;
  const maxY = rect.height - 120;

  const hungerSlow = state.hunger < 30 ? 0.35 : 0;
  const happyBoost = state.happiness > 70 ? 0.45 : 0;
  const tiredSlow = state.stamina < 25 ? 0.3 : 0;
  let speed = 0.8 + happyBoost - hungerSlow - tiredSlow;
  if (state.behavior === 'sleeping' || state.behavior === 'sitting') speed *= 0.2;

  x += (Math.random() - 0.5) * 18 * speed;
  y += (Math.random() - 0.5) * 14 * speed;
  x = Math.max(10, Math.min(maxX, x));
  y = Math.max(40, Math.min(maxY, y));

  seal.style.left = `${x}px`;
  seal.style.top = `${y}px`;
}

function tickStats() {
  state.hunger = clamp(state.hunger - 0.8);
  state.happiness = clamp(state.happiness - 0.35);
  state.stamina = clamp(state.stamina - (state.behavior === 'sleeping' ? -0.4 : 0.45));
  if (state.behavior === 'looking') state.bond = clamp(state.bond + 0.08);
  if (state.hunger < 25) state.happiness = clamp(state.happiness - 0.3);
}

function render() {
  renderBars();
  clock.style.display = state.showClock ? 'inline-block' : 'none';
  toggleClockBtn.textContent = `時刻表示: ${state.showClock ? 'ON' : 'OFF'}`;
}

setInterval(() => {
  tickStats();
  moveSeal();
  render();
}, 1000);

setInterval(() => {
  chooseBehavior();
}, 4200);

updateClock();
setInterval(updateClock, 1000);
chooseBehavior();
moveSeal();
render();
