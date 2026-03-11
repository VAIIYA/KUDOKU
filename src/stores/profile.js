import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ACHIEVEMENTS, AVATARS, WORLDS, LEVELS, levelFromXp, xpProgressInLevel, calculateScore, xpForLevel } from '@/game/gameData.js'

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

export const useProfileStore = defineStore('profile', () => {

  // ── State ───────────────────────────────────────────────────────────────────
  const profile = ref(load('kudoku.profile', {
    name: 'Kawaii Player', avatarId: 0, totalPoints: 0,
    xp: 0, level: 1, totalSolved: 0, totalTime: 0,
    currentStreak: 0, bestStreak: 0, lastPlayed: '',
    unlockedAvatars: [0], selectedTheme: 0, perfectPuzzles: 0
  }))

  const levelProgress = ref(load('kudoku.progress', { 1: { isUnlocked: true, isCompleted: false, stars: 0, bestTime: 0, bestPoints: 0 } }))
  const unlockedAchs  = ref(new Set(load('kudoku.achievements', [])))

  // ── Computed ─────────────────────────────────────────────────────────────────
  const xpProgress    = computed(() => xpProgressInLevel(profile.value.xp))
  const avatarEmoji   = computed(() => AVATARS.find(a => a.id === profile.value.avatarId)?.emoji ?? '🐱')
  const currentTheme  = computed(() => WORLDS[profile.value.selectedTheme] ?? WORLDS[0])
  const achievements  = computed(() => ACHIEVEMENTS.map(a => ({ ...a, unlocked: unlockedAchs.value.has(a.id) })))

  function getProgress(levelId) {
    return levelProgress.value[levelId] ?? { isUnlocked: false, isCompleted: false, stars: 0, bestTime: 0, bestPoints: 0 }
  }

  // ── Actions ──────────────────────────────────────────────────────────────────
  function persist() {
    save('kudoku.profile', profile.value)
    save('kudoku.progress', levelProgress.value)
    save('kudoku.achievements', [...unlockedAchs.value])
  }

  function completePuzzle(level, timeSeconds, mistakes, hintsUsed) {
    const { points, xp, stars } = calculateScore(level, timeSeconds, mistakes, hintsUsed)
    const prev = getProgress(level.id)

    // Level progress
    levelProgress.value[level.id] = {
      isUnlocked:  true,
      isCompleted: true,
      stars:       Math.max(prev.stars ?? 0, stars),
      bestTime:    prev.isCompleted ? Math.min(prev.bestTime, timeSeconds) : timeSeconds,
      bestPoints:  Math.max(prev.bestPoints ?? 0, points),
    }
    // Unlock next
    if (level.id < 50) levelProgress.value[level.id + 1] = { ...(levelProgress.value[level.id + 1] ?? {}), isUnlocked: true }

    // Profile
    const p = profile.value
    const oldLevel = p.level
    p.totalPoints  += points
    p.xp           += xp
    p.level         = levelFromXp(p.xp)
    p.totalSolved  += 1
    p.totalTime    += timeSeconds
    if (mistakes === 0 && hintsUsed === 0) p.perfectPuzzles += 1

    // Streak
    const today = new Date().toISOString().slice(0, 10)
    if (p.lastPlayed) {
      const diff = Math.round((new Date(today) - new Date(p.lastPlayed)) / 86400000)
      p.currentStreak = diff === 1 ? p.currentStreak + 1 : diff === 0 ? p.currentStreak : 1
    } else { p.currentStreak = 1 }
    p.bestStreak = Math.max(p.bestStreak, p.currentStreak)
    p.lastPlayed = today

    // Avatar unlocks
    const ua = new Set(p.unlockedAvatars)
    if (p.level >= 5)  ua.add(1); if (p.totalSolved >= 10)    ua.add(2)
    if (p.level >= 10) ua.add(3); if (p.level >= 15)           ua.add(5)
    if (p.level >= 20) ua.add(8); if (p.perfectPuzzles >= 3)  ua.add(6)
    if (p.totalSolved >= 25) ua.add(7)
    p.unlockedAvatars = [...ua]

    // Achievements
    const newAchs = checkAchievements({ points, timeSeconds, mistakes, hintsUsed })

    persist()
    return { points, xp, stars, timeBonus: timeSeconds <= level.timeBonusThreshold ? level.timeBonus : 0, perfectBonus: mistakes === 0 && hintsUsed === 0 ? 50 : 0, leveledUp: p.level > oldLevel, newLevel: p.level, newAchs }
  }

  function checkAchievements({ points, timeSeconds, mistakes, hintsUsed }) {
    const p = profile.value
    const newly = []
    const tryUnlock = id => {
      if (unlockedAchs.value.has(id)) return
      const def = ACHIEVEMENTS.find(a => a.id === id)
      if (!def) return
      unlockedAchs.value.add(id)
      p.xp += def.xp
      newly.push(def)
    }
    if (p.totalSolved >= 1)         tryUnlock('first_solve')
    if (timeSeconds <= 120)         tryUnlock('speed_demon')
    if (p.perfectPuzzles >= 10)     tryUnlock('perfect_10')
    if (hintsUsed === 0)            tryUnlock('no_hints')
    if (p.level >= 10)              tryUnlock('level_10')
    if (p.level >= 20)              tryUnlock('level_20')
    if (p.currentStreak >= 3)       tryUnlock('streak_3')
    if (p.currentStreak >= 7)       tryUnlock('streak_7')
    if (p.perfectPuzzles >= 1)      tryUnlock('three_stars')
    if (p.perfectPuzzles >= 5)      tryUnlock('five_perfect')
    if (p.totalPoints >= 1000)      tryUnlock('points_1000')
    if (p.totalPoints >= 5000)      tryUnlock('points_5000')
    const completed = Object.values(levelProgress.value).filter(lp => lp.isCompleted).length
    if (completed >= 10)  tryUnlock('world_1')
    if (completed >= 20)  tryUnlock('world_2')
    if (completed >= 30)  tryUnlock('world_3')
    if (completed >= 40)  tryUnlock('world_4')
    if (completed >= 50)  { tryUnlock('world_5'); tryUnlock('all_levels') }
    if (p.unlockedAvatars.length >= 5) tryUnlock('collector')
    return newly
  }

  function updateName(name)    { profile.value.name = name; persist() }
  function selectAvatar(id)    { profile.value.avatarId = id; persist() }
  function selectTheme(id)     { profile.value.selectedTheme = id; persist() }

  return { profile, levelProgress, unlockedAchs, xpProgress, avatarEmoji, currentTheme, achievements, getProgress, completePuzzle, updateName, selectAvatar, selectTheme }
})
