<template>
  <div class="screen bg-kawaii">
    <div class="top-bar">
      <button class="back-btn" @click="$router.back()">←</button>
      <h2>👤 My Profile</h2>
      <button class="edit-btn" @click="showEdit = true">✏️</button>
    </div>

    <div class="profile-content">
      <!-- Hero card -->
      <div class="card hero-card">
        <div class="avatar-circle">{{ store.avatarEmoji }}</div>
        <div class="hero-name">{{ store.profile.name }}</div>
        <div class="hero-level"><span class="level-badge">{{ store.profile.level }}</span> Level {{ store.profile.level }}</div>
        <div class="xp-bar"><div class="xp-bar-fill" :style="{ width: xpPct + '%' }"></div></div>
        <div class="xp-text">XP: {{ store.xpProgress.cur }} / {{ store.xpProgress.needed }}</div>
      </div>

      <!-- Stats -->
      <div class="section-header">📊 Stats</div>
      <div class="stats-grid">
        <div class="stat-card" v-for="s in stats" :key="s.label">
          <span>{{ s.emoji }}</span><strong>{{ s.value }}</strong><small>{{ s.label }}</small>
        </div>
      </div>

      <!-- Avatars -->
      <div class="section-header">🎭 Avatars</div>
      <div class="card">
        <div class="avatar-grid">
          <div v-for="av in AVATARS" :key="av.id"
            class="av-cell"
            :class="{ selected: av.id === store.profile.avatarId, locked: !isUnlocked(av.id) }"
            @click="selectAvatar(av)">
            <span>{{ isUnlocked(av.id) ? av.emoji : '🔒' }}</span>
          </div>
        </div>
        <p class="hint-text">💡 Unlock avatars by leveling up!</p>
      </div>

      <!-- Themes -->
      <div class="section-header">🎨 Themes</div>
      <div class="card">
        <div class="theme-row">
          <div v-for="w in WORLDS" :key="w.id"
            class="theme-chip"
            :class="{ selected: w.id === store.profile.selectedTheme }"
            :style="{ background: `linear-gradient(135deg, ${w.bgStart}99, ${w.bgEnd}66)` }"
            @click="store.selectTheme(w.id)">
            {{ w.emoji }}
          </div>
        </div>
      </div>

      <div style="height:24px"></div>
    </div>

    <!-- Edit name -->
    <div v-if="showEdit" class="overlay" @click.self="showEdit = false">
      <div class="edit-card">
        <h3>✏️ Change Name</h3>
        <input v-model="newName" class="name-input" maxlength="20" placeholder="Your cute name..." />
        <button class="btn btn-primary" @click="saveName">Save 💾</button>
        <button class="cancel-btn" @click="showEdit = false">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProfileStore } from '@/stores/profile.js'
import { AVATARS, WORLDS } from '@/game/gameData.js'

const store    = useProfileStore()
const showEdit = ref(false)
const newName  = ref(store.profile.name)
const xpPct    = computed(() => Math.round(store.xpProgress.cur / store.xpProgress.needed * 100))

const avg = computed(() => store.profile.totalSolved > 0 ? Math.round(store.profile.totalTime / store.profile.totalSolved) : 0)

const stats = computed(() => [
  { emoji: '🧩', value: store.profile.totalSolved,    label: 'Solved' },
  { emoji: '⭐', value: store.profile.totalPoints,    label: 'Points' },
  { emoji: '💎', value: store.profile.perfectPuzzles, label: 'Perfect' },
  { emoji: '⏱', value: `${Math.floor(avg.value/60)}m${avg.value%60}s`, label: 'Avg Time' },
  { emoji: '🔥', value: store.profile.currentStreak,  label: 'Streak' },
  { emoji: '🏆', value: store.profile.bestStreak,     label: 'Best' },
])

function isUnlocked(id) { return store.profile.unlockedAvatars.includes(id) }
function selectAvatar(av) { if (isUnlocked(av.id)) store.selectAvatar(av.id) }
function saveName() { if (newName.value.trim()) { store.updateName(newName.value.trim()); showEdit.value = false } }
</script>

<style scoped>
.top-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
.back-btn { background: none; border: none; color: white; font-size: 22px; cursor: pointer; }
.edit-btn { background: none; border: none; color: var(--pink); font-size: 20px; cursor: pointer; }
h2 { font-size: 18px; font-weight: 800; }

.profile-content { padding: 0 16px; display: flex; flex-direction: column; gap: 12px; max-width: 480px; margin: 0 auto; }

.hero-card { display: flex; flex-direction: column; align-items: center; gap: 8px; border-color: rgba(255,107,157,0.55); }
.avatar-circle { width: 90px; height: 90px; border-radius: 50%; background: radial-gradient(circle, rgba(255,107,157,0.4), var(--surface)); border: 2px solid var(--pink); display: flex; align-items: center; justify-content: center; font-size: 48px; }
.hero-name  { font-size: 22px; font-weight: 900; color: white; }
.hero-level { display: flex; align-items: center; gap: 8px; color: var(--gold); font-weight: 700; }
.level-badge { background: radial-gradient(circle, var(--gold), var(--pink)); color: white; font-weight: 900; font-size: 12px; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.xp-text { font-size: 11px; color: var(--text-dim); }

.section-header { font-size: 16px; font-weight: 800; display: flex; align-items: center; gap: 6px; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.stat-card  { background: var(--surface); border: 1px solid rgba(255,107,157,0.2); border-radius: 16px; padding: 12px 8px; display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 20px; }
.stat-card strong { font-size: 17px; color: white; }
.stat-card small  { font-size: 10px; color: var(--text-dim); }

.avatar-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px; }
.av-cell     { width: 56px; height: 56px; border-radius: 14px; background: var(--bg); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 26px; cursor: pointer; transition: all 0.2s; }
.av-cell.selected { border: 2px solid var(--pink); background: rgba(255,107,157,0.25); }
.av-cell.locked   { opacity: 0.55; cursor: default; }
.hint-text { font-size: 11px; color: var(--text-dim); }

.theme-row { display: flex; gap: 10px; }
.theme-chip { flex: 1; aspect-ratio: 1; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; cursor: pointer; border: 1px solid rgba(255,255,255,0.15); transition: border 0.2s; }
.theme-chip.selected { border: 2px solid white; }

.edit-card { background: var(--surface); border-radius: 20px; padding: 24px; max-width: 320px; width: 100%; display: flex; flex-direction: column; gap: 14px; align-items: center; border: 1px solid rgba(255,107,157,0.4); }
.edit-card h3 { font-size: 18px; font-weight: 800; }
.name-input { width: 100%; padding: 12px 16px; background: var(--bg); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; color: white; font-family: inherit; font-size: 16px; outline: none; }
.name-input:focus { border-color: var(--pink); }
.cancel-btn { background: none; border: none; color: var(--text-dim); font-family: inherit; cursor: pointer; font-size: 14px; }
</style>
