<template>
  <div class="screen bg-kawaii">
    <div class="top-bar">
      <button class="back-btn" @click="$router.back()">←</button>
      <h2>🏆 Achievements</h2>
      <span class="count-chip">{{ unlockedCount }}/{{ total }}</span>
    </div>

    <div class="ach-content">
      <div class="xp-bar"><div class="xp-bar-fill" :style="{ width: pct + '%' }"></div></div>
      <p class="progress-text">{{ unlockedCount }} of {{ total }} achievements unlocked ✨</p>

      <div class="ach-section-label">Unlocked 🔓</div>
      <div v-for="a in unlocked" :key="a.id" class="ach-row unlocked">
        <div class="ach-icon">{{ a.emoji }}</div>
        <div class="ach-body">
          <div class="ach-title">{{ a.title }}</div>
          <div class="ach-desc">{{ a.desc }}</div>
        </div>
        <div class="ach-xp">✨<br>+{{ a.xp }}<br><small>XP</small></div>
      </div>

      <div class="ach-section-label" v-if="locked.length">Locked 🔒</div>
      <div v-for="a in locked" :key="a.id" class="ach-row locked">
        <div class="ach-icon">🔒</div>
        <div class="ach-body">
          <div class="ach-title locked-title">{{ a.title }}</div>
          <div class="ach-desc">{{ a.desc }}</div>
        </div>
        <div class="ach-xp muted">✨<br>+{{ a.xp }}<br><small>XP</small></div>
      </div>

      <div style="height:20px"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProfileStore } from '@/stores/profile.js'

const store         = useProfileStore()
const all           = computed(() => store.achievements)
const unlocked      = computed(() => all.value.filter(a => a.unlocked))
const locked        = computed(() => all.value.filter(a => !a.unlocked))
const unlockedCount = computed(() => unlocked.value.length)
const total         = computed(() => all.value.length)
const pct           = computed(() => Math.round(unlockedCount.value / total.value * 100))
</script>

<style scoped>
.top-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
.back-btn   { background: none; border: none; color: white; font-size: 22px; cursor: pointer; }
h2          { font-size: 18px; font-weight: 800; }
.count-chip { background: var(--surface); border: 1px solid rgba(255,215,0,0.4); border-radius: 99px; padding: 4px 10px; font-size: 13px; color: var(--gold); font-weight: 700; }

.ach-content { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; max-width: 480px; margin: 0 auto; }
.progress-text { font-size: 12px; color: var(--text-dim); }

.ach-section-label { font-size: 13px; font-weight: 600; color: var(--text-dim); margin-top: 4px; }

.ach-row { display: flex; align-items: center; gap: 14px; border-radius: 16px; padding: 14px; border: 1px solid; }
.ach-row.unlocked { background: linear-gradient(135deg, rgba(255,215,0,0.1), var(--surface)); border-color: rgba(255,215,0,0.35); }
.ach-row.locked   { background: var(--surface); border-color: rgba(255,255,255,0.08); }

.ach-icon  { width: 52px; height: 52px; border-radius: 14px; background: radial-gradient(circle, rgba(255,215,0,0.3), var(--surface)); display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
.ach-row.locked .ach-icon { background: radial-gradient(circle, rgba(128,128,128,0.2), var(--surface)); }

.ach-body  { flex: 1; }
.ach-title { font-size: 14px; font-weight: 800; color: var(--gold); }
.locked-title { color: rgba(255,255,255,0.4); }
.ach-desc  { font-size: 12px; color: var(--text-dim); }

.ach-xp    { text-align: center; font-size: 13px; font-weight: 700; color: var(--pink); line-height: 1.3; }
.ach-xp.muted { color: var(--text-dim); }
.ach-xp small { font-size: 10px; }
</style>
