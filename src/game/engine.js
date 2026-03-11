// Flat-array Sudoku engine (index = row*9+col)
// Returns new state objects — no mutation.

export function createGameState(level) {
  const board    = level.puzzle.split('').map(Number)
  const solution = level.solution.split('').map(Number)
  const given    = level.puzzle.split('').map(c => c !== '0')
  return { levelId: level.id, board, solution, given, selectedRow: -1, selectedCol: -1, mistakes: 0, hintsLeft: 3, elapsed: 0, isComplete: false }
}

export function placeNumber(state, row, col, num) {
  const idx = row * 9 + col
  if (state.given[idx]) return state

  const board = [...state.board]
  board[idx] = num

  const isCorrect = num === 0 || num === state.solution[idx]
  const mistakes  = isCorrect ? state.mistakes : state.mistakes + 1
  const isComplete = board.every((v, i) => v === state.solution[i])

  return { ...state, board, mistakes, isComplete }
}

export function applyHint(state) {
  if (state.hintsLeft <= 0) return state
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const idx = r * 9 + c
      if (!state.given[idx] && state.board[idx] !== state.solution[idx]) {
        return placeNumber({ ...state, hintsLeft: state.hintsLeft - 1 }, r, c, state.solution[idx])
      }
    }
  }
  return state
}

export function getHighlighted(row, col) {
  const cells = new Set()
  for (let i = 0; i < 9; i++) { cells.add(`${row},${i}`); cells.add(`${i},${col}`) }
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3
  for (let r = br; r < br + 3; r++) for (let c = bc; c < bc + 3; c++) cells.add(`${r},${c}`)
  return cells
}

export function getSameNumber(state, row, col) {
  const num = state.board[row * 9 + col]
  if (!num) return new Set()
  const cells = new Set()
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++)
    if (state.board[r * 9 + c] === num) cells.add(`${r},${c}`)
  return cells
}

export function isConflicting(state, row, col) {
  const v = state.board[row * 9 + col]
  return v !== 0 && v !== state.solution[row * 9 + col]
}

export function cellValue(state, row, col) { return state.board[row * 9 + col] }
export function isGiven(state, row, col)   { return state.given[row * 9 + col] }
