<template>
  <div class="screen bg-kawaii">
    <div class="home-content">
      <!-- Hero -->
      <div class="hero">
        <div class="avatar-big pulse">{{ store.avatarEmoji }}</div>
        <h1 class="app-title">KUDOKU</h1>
        <p class="app-sub">Kawaii Sudoku Adventure</p>
      </div>

      <!-- Player Card -->
      <div class="card player-card" @click="$router.push('/profile')">
        <div class="player-left">
          <span class="player-avatar">{{ store.avatarEmoji }}</span>
          <div class="player-info">
            <div class="player-row">
              <span class="player-name">{{ store.profile.name }}</span>
              <span class="level-badge">{{ store.profile.level }}</span>
            </div>
            <div class="xp-bar"><div class="xp-bar-fill" :style="{ width: xpPct + '%' }"></div></div>
            <span class="xp-text">XP {{ store.xpProgress.cur }} / {{ store.xpProgress.needed }}</span>
          </div>
        </div>
        <div class="player-right">
          <span class="gold-num">⭐ {{ store.profile.totalPoints }}</span>
          <span v-if="store.profile.currentStreak > 0" class="streak">🔥 {{ store.profile.currentStreak }}</span>
        </div>
      </div>

      <!-- Daily nudge -->
      <div class="card daily-card">
        <span class="daily-icon">📅</span>
        <div>
          <div class="daily-title">Daily Challenge</div>
          <div class="daily-sub">Bonus XP for playing every day!</div>
        </div>
        <span class="daily-arrow">→</span>
      </div>

      <!-- Main play button -->
      <button class="btn btn-primary" @click="$router.push('/levels')">🎮 Play Kudoku!</button>

      <!-- Secondary -->
      <div class="btn-row">
        <button class="btn btn-dark" @click="$router.push('/profile')">👤 Profile</button>
        <button class="btn btn-gold" @click="$router.push('/achievements')">🏆 Trophies</button>
      </div>

      <!-- Quick stats -->
      <div class="stats-row">
        <div class="stat-mini" v-for="s in stats" :key="s.label">
          <span>{{ s.emoji }}</span>
          <strong>{{ s.value }}</strong>
          <small>{{ s.label }}</small>
        </div>
      </div>

      <!-- World previews -->
      <div class="card worlds-card">
        <div class="worlds-title">🗺️ Worlds</div>
        <div class="worlds-row">
          <div class="world-chip" v-for="(w, i) in WORLDS" :key="w.id">
            <div class="world-icon">{{ w.emoji }}</div>
            <span class="world-label">W{{ i + 1 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProfileStore } from '@/stores/profile.js'
import { WORLDS } from '@/game/gameData.js'

const store  = useProfileStore()
const xpPct  = computed(() => Math.round((store.xpProgress.cur / store.xpProgress.needed) * 100))
const stats  = computed(() => [
  { emoji: '🧩', value: store.profile.totalSolved, label: 'Solved' },
  { emoji: '💎', value: store.profile.perfectPuzzles, label: 'Perfect' },
  { emoji: '🌟', value: 50, label: 'Levels' },
])
</script>

<style scoped>
.home-content { padding: 20px 16px; display: flex; flex-direction: column; gap: 14px; max-width: 480px; margin: 0 auto; }
.hero { text-align: center; padding: 12px 0 4px; }
.avatar-big { font-size: 64px; display: block; margin-bottom: 8px; }
.pulse { animation: pulseAnim 1.5s ease-in-out infinite alternate; }
@keyframes pulseAnim { to { transform: scale(1.1); } }
.app-title { font-size: 36px; font-weight: 900; color: white; letter-spacing: 3px; }
.app-sub   { font-size: 13px; font-weight: 600; color: var(--pink); letter-spacing: 1px; }

.player-card { cursor: pointer; }
.player-left { display: flex; align-items: center; gap: 12px; flex: 1; }
.player-avatar { font-size: 40px; }
.player-info   { flex: 1; }
.player-row    { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.player-name   { font-weight: 800; font-size: 15px; color: var(--text); }
.level-badge   { background: radial-gradient(circle, var(--gold), var(--pink)); color: white; font-weight: 900; font-size: 12px; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.xp-text       { font-size: 10px; color: var(--text-dim); margin-top: 2px; display: block; }
.player-right  { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.gold-num      { font-size: 13px; font-weight: 700; color: var(--gold); }
.streak        { font-size: 12px; color: var(--amber); }
.player-card   { display: flex; align-items: center; justify-content: space-between; }

.daily-card    { display: flex; align-items: center; gap: 12px; border-color: rgba(255,215,0,0.4); }
.daily-icon    { font-size: 32px; }
.daily-title   { font-weight: 700; color: var(--gold); font-size: 14px; }
.daily-sub     { font-size: 12px; color: var(--text-dim); }
.daily-arrow   { font-size: 20px; color: var(--gold); margin-left: auto; }

.btn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
.stat-mini { background: var(--surface); border: 1px solid rgba(255,107,157,0.2); border-radius: 16px; padding: 12px 8px; display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 20px; }
.stat-mini strong { font-size: 18px; color: white; }
.stat-mini small  { font-size: 10px; color: var(--text-dim); }

.worlds-card  { }
.worlds-title { font-weight: 700; font-size: 15px; margin-bottom: 12px; }
.worlds-row   { display: flex; justify-content: space-around; }
.world-chip   { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.world-icon   { width: 44px; height: 44px; background: rgba(255,255,255,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.world-label  { font-size: 10px; color: var(--text-dim); }
</style>
