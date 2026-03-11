<template>
  <div class="board-wrap">
    <canvas ref="canvas"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @contextmenu.prevent
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { getHighlighted, getSameNumber, isConflicting, isGiven, cellValue } from '@/game/engine.js'

const props = defineProps({ gs: Object, errorCell: Array, accentColor: { type: String, default: '#FF6B9D' } })
const emit  = defineEmits(['tap', 'longpress'])

const canvas   = ref(null)
let   ctx      = null
let   longTimer = null
let   downPos  = null

// ── Drawing ───────────────────────────────────────────────────────────────────

function draw() {
  if (!ctx || !props.gs) return
  const c    = canvas.value
  const size = c.width
  const cell = size / 9
  const gs   = props.gs
  const sel  = [gs.selectedRow, gs.selectedCol]
  const hl   = sel[0] >= 0 ? getHighlighted(sel[0], sel[1]) : new Set()
  const sn   = sel[0] >= 0 ? getSameNumber(gs, sel[0], sel[1]) : new Set()

  ctx.clearRect(0, 0, size, size)

  // Cell backgrounds
  for (let r = 0; r < 9; r++) {
    for (let c2 = 0; c2 < 9; c2++) {
      const key   = `${r},${c2}`
      const isSel = r === sel[0] && c2 === sel[1]
      const isErr = (props.errorCell && props.errorCell[0] === r && props.errorCell[1] === c2) || isConflicting(gs, r, c2)
      let   bg    = null

      if (isSel)            bg = hexToRgba(props.accentColor, 0.45)
      else if (isErr)       bg = 'rgba(255,68,102,0.35)'
      else if (sn.has(key)) bg = hexToRgba(props.accentColor, 0.22)
      else if (hl.has(key)) bg = hexToRgba(props.accentColor, 0.10)
      else if (isGiven(gs, r, c2)) bg = 'rgba(255,255,255,0.07)'

      if (bg) {
        ctx.fillStyle = bg
        ctx.fillRect(c2 * cell, r * cell, cell, cell)
      }
    }
  }

  // Thin grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth   = 0.8
  for (let i = 1; i < 9; i++) {
    if (i % 3 === 0) continue
    ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, size); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(size, i * cell); ctx.stroke()
  }

  // Thick box lines (0, 3, 6, 9)
  ctx.strokeStyle = 'rgba(255,255,255,0.88)'
  ctx.lineWidth   = 2.5
  for (const i of [0, 3, 6, 9]) {
    const p = i * cell
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke()
  }

  // Numbers
  for (let r = 0; r < 9; r++) {
    for (let c2 = 0; c2 < 9; c2++) {
      const v     = cellValue(gs, r, c2)
      const given = isGiven(gs, r, c2)
      const err   = isConflicting(gs, r, c2)
      const isSel = r === sel[0] && c2 === sel[1]

      if (v !== 0) {
        ctx.font      = `${given ? 900 : 700} ${Math.round(cell * 0.45)}px Nunito, system-ui`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = err ? '#FF4466' : given ? '#FFFFFF' : isSel ? '#FFFFFF' : props.accentColor
        ctx.fillText(v, c2 * cell + cell / 2, r * cell + cell / 2)
      }
    }
  }
}

// ── Resize ────────────────────────────────────────────────────────────────────

function resize() {
  if (!canvas.value) return
  const wrap = canvas.value.parentElement
  const size = Math.min(wrap.clientWidth, wrap.clientHeight)
  const dpr  = window.devicePixelRatio || 1
  canvas.value.width  = size * dpr
  canvas.value.height = size * dpr
  canvas.value.style.width  = size + 'px'
  canvas.value.style.height = size + 'px'
  ctx.scale(dpr, dpr)
  draw()
}

const ro = new ResizeObserver(resize)

onMounted(async () => {
  await nextTick()
  ctx = canvas.value.getContext('2d')
  ro.observe(canvas.value.parentElement)
  resize()
})

onUnmounted(() => { ro.disconnect(); clearTimeout(longTimer) })

watch(() => props.gs, draw, { deep: true })
watch(() => props.errorCell, draw)
watch(() => props.accentColor, draw)

// ── Touch handling ────────────────────────────────────────────────────────────

function cellAt(e) {
  const rect = canvas.value.getBoundingClientRect()
  const x = (e.clientX - rect.left)  / rect.width
  const y = (e.clientY - rect.top)   / rect.height
  return [ Math.floor(y * 9), Math.floor(x * 9) ]
}

function onPointerDown(e) {
  downPos = [e.clientX, e.clientY]
  longTimer = setTimeout(() => {
    const [r, c] = cellAt(e)
    emit('longpress', r, c)
    longTimer = null
  }, 380)
}

function onPointerUp(e) {
  if (!longTimer) return   // was a long-press, skip tap
  clearTimeout(longTimer)
  longTimer = null
  const dx = Math.abs(e.clientX - downPos[0])
  const dy = Math.abs(e.clientY - downPos[1])
  if (dx < 10 && dy < 10) {
    const [r, c] = cellAt(e)
    emit('tap', r, c)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}
</script>

<style scoped>
.board-wrap {
  width: 100%; aspect-ratio: 1;
  padding: 0 8px;
}
canvas {
  display: block;
  border-radius: 16px;
  border: 2px solid v-bind('accentColor + "b3"');
  background: rgba(0,0,0,0.35);
  touch-action: none;
  cursor: pointer;
}
</style>
