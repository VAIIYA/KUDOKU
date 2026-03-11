<template>
  <div class="screen bg-kawaii">
    <div class="top-bar">
      <button class="back-btn" @click="$router.back()">←</button>
      <h2>Choose Level</h2>
      <span>🗺️</span>
    </div>

    <!-- World tabs -->
    <div class="world-tabs">
      <button v-for="w in WORLDS" :key="w.id" class="world-tab"
        :class="{ active: selectedWorld === w.id }"
        @click="selectedWorld = w.id">
        {{ w.emoji }}
      </button>
    </div>

    <!-- World banner -->
    <div class="world-banner" :style="bannerStyle">
      <span class="banner-emoji">{{ world.emoji }}</span>
      <div>
        <div class="banner-name">{{ world.name }}</div>
        <div class="banner-desc">{{ world.desc }}</div>
        <div class="xp-bar" style="margin-top:6px"><div class="xp-bar-fill" :style="{ width: completedPct + '%' }"></div></div>
        <div class="banner-progress">{{ completedInWorld }} / {{ worldLevels.length }} completed</div>
      </div>
    </div>

    <!-- Level grid -->
    <div class="level-grid">
      <div v-for="level in worldLevels" :key="level.id"
        class="level-cell"
        :class="{ unlocked: isUnlocked(level.id), completed: isCompleted(level.id) }"
        @click="openLevel(level)">
        <div class="cell-inner">
          <span v-if="!isUnlocked(level.id)">🔒</span>
          <template v-else>
            <span class="cell-emoji">{{ level.emoji }}</span>
            <span class="cell-num">{{ level.id }}</span>
          </template>
        </div>
        <div class="cell-stars">
          <span v-for="i in 3" :key="i">{{ i <= getStars(level.id) ? '⭐' : '·' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile.js'
import { WORLDS, LEVELS } from '@/game/gameData.js'

const router = useRouter()
const store  = useProfileStore()
const selectedWorld = ref(0)

const world      = computed(() => WORLDS[selectedWorld.value])
const worldLevels = computed(() => LEVELS.filter(l => l.world === selectedWorld.value))

function isUnlocked(id) { return id === 1 || (store.getProgress(id)?.isUnlocked ?? false) }
function isCompleted(id){ return store.getProgress(id)?.isCompleted ?? false }
function getStars(id)   { return store.getProgress(id)?.stars ?? 0 }

const completedInWorld = computed(() => worldLevels.value.filter(l => isCompleted(l.id)).length)
const completedPct     = computed(() => Math.round(completedInWorld.value / worldLevels.value.length * 100))

const bannerStyle = computed(() => ({
  background: `linear-gradient(135deg, ${world.value.bgStart}99, ${world.value.bgEnd}66)`
}))

function openLevel(level) {
  if (!isUnlocked(level.id)) return
  router.push(`/game/${level.id}`)
}
</script>

<style scoped>
.top-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
.back-btn { background: none; border: none; color: white; font-size: 22px; cursor: pointer; padding: 4px 8px; }
h2 { font-size: 18px; font-weight: 800; }

.world-tabs { display: flex; gap: 10px; padding: 0 16px 10px; overflow-x: auto; }
.world-tab  { background: var(--surface); border: 1px solid rgba(255,255,255,0.15); border-radius: 50%; width: 46px; height: 46px; font-size: 22px; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.world-tab.active { background: linear-gradient(135deg, var(--pink), var(--purple)); border-color: var(--pink); transform: scale(1.08); }

.world-banner { margin: 0 16px 12px; border-radius: 16px; padding: 14px; display: flex; gap: 14px; align-items: flex-start; }
.banner-emoji { font-size: 32px; flex-shrink: 0; }
.banner-name  { font-weight: 800; color: white; font-size: 15px; }
.banner-desc  { font-size: 11px; color: rgba(255,255,255,0.8); }
.banner-progress { font-size: 11px; color: rgba(255,255,255,0.9); margin-top: 2px; }

.level-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; padding: 0 16px 24px; }

.level-cell  { display: flex; flex-direction: column; align-items: center; gap: 2px; opacity: 0.4; cursor: default; }
.level-cell.unlocked  { opacity: 1; cursor: pointer; }
.level-cell.completed .cell-inner { background: linear-gradient(135deg, rgba(76,175,80,0.5), rgba(46,125,50,0.3)); border-color: rgba(76,175,80,0.7); }

.cell-inner { width: 54px; height: 54px; border-radius: 14px; background: var(--surface); border: 1px solid rgba(255,255,255,0.15); display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.15s; }
.level-cell.unlocked .cell-inner:hover { transform: scale(1.08); }
.cell-emoji { font-size: 18px; }
.cell-num   { font-size: 11px; font-weight: 800; color: white; }
.cell-stars { font-size: 8px; height: 12px; }
</style>
