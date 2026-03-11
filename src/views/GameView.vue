<template>
  <div class="game-screen" :style="bgStyle">

    <!-- Top bar -->
    <div class="top-bar">
      <button class="back-btn" @click="$router.back()">←</button>
      <div class="level-info">
        <span class="level-name">{{ level?.emoji }} {{ level?.name }}</span>
        <span class="level-diff" :style="{ color: diffColor }">{{ diffLabel }}</span>
      </div>
      <div class="top-right">
        <span class="mistake-count">❌{{ gs?.mistakes ?? 0 }}</span>
        <span class="timer">{{ timeStr }}</span>
        <button class="icon-btn" @click="togglePause">⏸</button>
      </div>
    </div>

    <!-- Board -->
    <SudokuBoard v-if="gs" :gs="gs" :errorCell="errorCell" :accentColor="accent"
      @tap="onTap" @longpress="onLongPress" class="board-area" />

    <!-- Hint bar -->
    <div class="hint-bar-wrap">
      <button class="btn btn-hint hint-btn" :disabled="!gs || gs.hintsLeft === 0" @click="useHint">
        💡 Use Hint ({{ gs?.hintsLeft ?? 3 }} left)
      </button>
    </div>

    <p class="tip-text">Long-press a cell to enter a number</p>

    <!-- Number picker -->
    <Teleport to="body">
      <NumberPicker v-if="pickerCell"
        @pick="onPick" @erase="onErase" @dismiss="pickerCell = null" />
    </Teleport>

    <!-- Pause -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="paused" class="overlay">
          <div class="pause-card">
            <span class="pause-emoji">⏸️</span>
            <h2>Paused</h2>
            <p>Take a breather, cutie~ 🌸</p>
            <button class="btn btn-primary" @click="togglePause">▶️ Resume</button>
            <button class="quit-btn" @click="$router.back()">Quit Level</button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Completion -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="result" class="overlay">
          <div class="result-card">
            <span class="result-trophy">{{ result.stars === 3 ? '🏆' : result.stars === 2 ? '🎉' : '✨' }}</span>
            <h2 class="result-title" :class="`stars-${result.stars}`">
              {{ result.stars === 3 ? 'PERFECT!' : result.stars === 2 ? 'Great Job!' : 'Solved!' }}
            </h2>
            <div class="stars-row">
              <span v-for="i in 3" :key="i" class="star">{{ i <= result.stars ? '⭐' : '☆' }}</span>
            </div>
            <div class="result-stats">
              <div class="rstat"><span>⏱</span><strong>{{ timeStr }}</strong><small>Time</small></div>
              <div class="rstat"><span>❌</span><strong>{{ gs?.mistakes }}</strong><small>Mistakes</small></div>
              <div class="rstat"><span>💡</span><strong>{{ 3 - (gs?.hintsLeft ?? 3) }}</strong><small>Hints</small></div>
            </div>
            <div class="score-box">
              <div class="score-line"><span>Base Points</span><span>+{{ result.points - result.timeBonus - result.perfectBonus }}</span></div>
              <div v-if="result.timeBonus"     class="score-line green"><span>⚡ Speed Bonus</span><span>+{{ result.timeBonus }}</span></div>
              <div v-if="result.perfectBonus"  class="score-line gold" ><span>💎 Perfect Bonus</span><span>+{{ result.perfectBonus }}</span></div>
              <hr>
              <div class="score-line gold bold"><span>Total</span><span>+{{ result.points }} pts</span></div>
              <div class="score-line pink"     ><span>XP Gained</span><span>+{{ result.xp }} XP</span></div>
            </div>
            <div v-if="result.leveledUp" class="level-up-banner">
              🎊 LEVEL UP! Now Level {{ result.newLevel }}! 🎊
            </div>
            <div v-for="ach in result.newAchs" :key="ach.id" class="ach-row">
              <span>{{ ach.emoji }}</span>
              <div><strong>{{ ach.title }}</strong><br><small>{{ ach.desc }}</small></div>
            </div>
            <button class="btn btn-primary" @click="goNext">→ Continue</button>
            <button class="quit-btn" @click="replay">🔄 Play Again</button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile.js'
import { LEVELS, WORLDS } from '@/game/gameData.js'
import { createGameState, placeNumber, applyHint, isGiven } from '@/game/engine.js'
import SudokuBoard  from '@/components/SudokuBoard.vue'
import NumberPicker from '@/components/NumberPicker.vue'

const props  = defineProps({ id: String })
const router = useRouter()
const store  = useProfileStore()

const level  = computed(() => LEVELS.find(l => l.id === Number(props.id)))
const world  = computed(() => WORLDS[level.value?.world ?? 0])
const accent = computed(() => world.value?.accent ?? '#FF6B9D')

const gs         = ref(null)
const paused     = ref(false)
const pickerCell = ref(null)
const errorCell  = ref(null)
const result     = ref(null)
let   timerInterval = null

const bgStyle = computed(() => ({
  background: `linear-gradient(180deg, ${world.value.bgStart}44 0%, #1A0A2E 50%, ${world.value.bgEnd}33 100%)`
}))

const DIFF_MAP = { easy: { label: 'Easy ✨', color: '#4FC3F7' }, medium: { label: 'Medium 🌸', color: '#FFB74D' }, hard: { label: 'Hard 💎', color: '#EF5350' }, expert: { label: 'Expert 🔥', color: '#7E57C2' } }
const diffLabel = computed(() => DIFF_MAP[level.value?.diff]?.label ?? '')
const diffColor = computed(() => DIFF_MAP[level.value?.diff]?.color ?? '#fff')
const timeStr   = computed(() => { const s = gs.value?.elapsed ?? 0; return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}` })

function startTimer() {
  clearInterval(timerInterval)
  timerInterval = setInterval(() => { if (!paused.value && gs.value && !gs.value.isComplete) gs.value.elapsed++ }, 1000)
}

function init() {
  if (!level.value) return
  gs.value = createGameState(level.value)
  result.value = null
  pickerCell.value = null
  paused.value = false
  startTimer()
}

onMounted(init)
onUnmounted(() => clearInterval(timerInterval))

function togglePause() { paused.value = !paused.value }

function onTap(row, col)       { if (gs.value) { gs.value = { ...gs.value, selectedRow: row, selectedCol: col } } }
function onLongPress(row, col) { onTap(row, col); if (gs.value && !isGiven(gs.value, row, col)) pickerCell.value = [row, col] }

function onPick(num) {
  if (!gs.value || !pickerCell.value) return
  const [row, col] = pickerCell.value
  const prev = gs.value.mistakes
  gs.value = placeNumber(gs.value, row, col, num)
  if (gs.value.mistakes > prev) {
    errorCell.value = [row, col]
    setTimeout(() => errorCell.value = null, 600)
  }
  pickerCell.value = null
  if (gs.value.isComplete) onComplete()
}

function onErase() {
  if (!gs.value || !pickerCell.value) return
  const [row, col] = pickerCell.value
  gs.value = placeNumber(gs.value, row, col, 0)
  pickerCell.value = null
}

function useHint() {
  if (!gs.value || gs.value.hintsLeft <= 0) return
  gs.value = applyHint(gs.value)
  if (gs.value.isComplete) onComplete()
}

function onComplete() {
  clearInterval(timerInterval)
  const g = gs.value
  result.value = store.completePuzzle(level.value, g.elapsed, g.mistakes, 3 - g.hintsLeft)
}

function goNext()  { result.value = null; router.replace('/levels') }
function replay()  { result.value = null; init() }
</script>

<style scoped>
.game-screen { height: 100dvh; display: flex; flex-direction: column; overflow: hidden; }
.top-bar { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px 6px; }
.back-btn { background: none; border: none; color: white; font-size: 22px; cursor: pointer; }
.level-info { display: flex; flex-direction: column; align-items: center; }
.level-name { font-weight: 800; font-size: 15px; color: white; }
.level-diff { font-size: 11px; }
.top-right  { display: flex; align-items: center; gap: 8px; }
.mistake-count { font-size: 13px; font-weight: 700; color: var(--red); }
.timer      { font-size: 13px; font-weight: 600; color: var(--text-dim); font-variant-numeric: tabular-nums; }
.icon-btn   { background: none; border: none; font-size: 18px; cursor: pointer; }
.board-area { flex: 0 0 auto; }
.hint-bar-wrap { padding: 12px 16px 0; }
.hint-btn   { font-size: 15px; font-weight: 700; border-radius: 16px; padding: 15px; }
.tip-text   { text-align: center; font-size: 12px; color: var(--text-dim); padding: 10px 0 4px; }

/* Pause card */
.pause-card { background: var(--surface); border: 1px solid rgba(255,107,157,0.4); border-radius: 24px; padding: 32px 28px; max-width: 340px; width: 100%; text-align: center; display: flex; flex-direction: column; gap: 14px; align-items: center; }
.pause-emoji { font-size: 52px; }
.pause-card h2 { font-size: 28px; font-weight: 900; }
.pause-card p  { color: var(--text-dim); }
.quit-btn { background: none; border: none; color: var(--red); font-family: inherit; font-size: 15px; cursor: pointer; }

/* Result card */
.result-card { background: var(--surface); border: 2px solid rgba(255,215,0,0.6); border-radius: 24px; padding: 24px 20px; max-width: 360px; width: 100%; max-height: 90dvh; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; align-items: center; }
.result-trophy { font-size: 60px; }
.result-title  { font-size: 26px; font-weight: 900; }
.stars-3 { color: var(--gold); } .stars-2 { color: #FFB74D; } .stars-1 { color: var(--text-dim); }
.stars-row { display: flex; gap: 4px; font-size: 28px; }
.star { }
.result-stats { display: flex; justify-content: space-around; width: 100%; }
.rstat { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 18px; }
.rstat strong { font-size: 17px; color: white; }
.rstat small   { font-size: 11px; color: var(--text-dim); }
.score-box { background: rgba(255,255,255,0.05); border-radius: 14px; padding: 12px 14px; width: 100%; display: flex; flex-direction: column; gap: 4px; }
.score-line { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-dim); }
.score-line.green { color: var(--green); } .score-line.gold { color: var(--gold); } .score-line.pink { color: var(--pink); } .score-line.bold { font-weight: 800; }
.score-box hr { border-color: rgba(255,255,255,0.1); }
.level-up-banner { background: linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,107,157,0.25)); border-radius: 14px; padding: 12px; font-weight: 800; color: var(--gold); text-align: center; width: 100%; }
.ach-row { display: flex; align-items: center; gap: 10px; background: rgba(255,215,0,0.1); border-radius: 12px; padding: 8px 12px; width: 100%; font-size: 20px; }
.ach-row strong { font-size: 13px; color: var(--gold); }
.ach-row small  { font-size: 11px; color: var(--text-dim); }
</style>
