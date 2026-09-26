import { runPython } from '../../lib/miniPython.js'

// Runs a code-editor exercise and works out what Devy should say about it.
//
// Each task in the lesson data declares its own check:
//   { pattern: '<regex over the code>' }  — the code has to contain this
//   { output: '2080' }                     — the printed output has to match
// plus an optional `nudge`, which is what Devy says while that task is the
// first one still unmet. The exercise passes when the program runs cleanly
// and every task's check holds.

function taskDone(task, code, output) {
  const check = task.check ?? {}
  if (check.pattern && !new RegExp(check.pattern, 'm').test(code)) return false
  if (check.output != null && output.trim() !== String(check.output).trim()) return false
  return true
}

// Classic edit distance, for "did you mean…?" on a misspelt name.
function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1))
      previous = current
    }
  }
  return row[b.length]
}

function closestName(name, candidates) {
  let best = null
  for (const candidate of candidates) {
    const d = distance(name.toLowerCase(), candidate.toLowerCase())
    if (d <= Math.max(2, Math.floor(name.length / 3)) && (!best || d < best.d)) best = { candidate, d }
  }
  return best?.candidate ?? null
}

// Every name the code creates with `name =`, even ones on lines that never ran.
function assignedNames(code) {
  return [...code.matchAll(/^\s*([A-Za-z_]\w*)\s*[-+*/%]?=(?!=)/gm)].map((match) => match[1])
}

// Devy's plain-English take on a Python error — what went wrong, on which
// line, and the smallest thing to try — never a lecture on the traceback.
export function explainError(error, code) {
  const at = `Line ${error.line}`
  switch (error.type) {
    case 'NameError': {
      const suggestion = closestName(error.name ?? '', [...new Set(assignedNames(code))].filter((name) => name !== error.name))
      return suggestion
        ? `${at} uses \`${error.name}\`, but nothing by that name exists yet. Did you mean \`${suggestion}\`?`
        : `${at} uses \`${error.name}\` before it's been created. Give it a value with \`${error.name} = …\` first — or check the spelling.`
    }
    case 'TypeError':
      if (/concatenate str/.test(error.message)) {
        return `${at} joins text and a number with \`+\`. Python won't mix them — wrap the number in \`str()\`, or use an f-string like \`f"Total: {total}"\`.`
      }
      return `${at} mixes types Python can't combine (${error.message}). Check what each side of the operator holds.`
    case 'ZeroDivisionError':
      return `${at} divides by zero — Python can't do that. Check the number after the \`/\`.`
    case 'IndentationError':
      return `${at} starts with spaces. Everything in this exercise sits at the left edge — delete the space at the start of the line.`
    case 'SyntaxError':
      if (/never closed/.test(error.message)) return `${at} opens a bracket that never closes. Add the matching \`)\`.`
      if (/unterminated string/.test(error.message)) return `${at} starts some text with a quote but never closes it. Add the matching quote.`
      if (/forgot a comma/.test(error.message)) return `${at} has two values side by side — it looks like a comma is missing between them.`
      if (/'=='/.test(error.message)) return `${at} has an \`=\` where Python didn't expect one. Assignments go \`name = value\`, with the name on the left.`
      return `Python couldn't read ${at.toLowerCase()}. Look for a missing bracket, quote or operator.`
    case 'NotSupported':
      return `${at}: ${error.message}. You won't need it for this one — the basics will do.`
    default:
      return `${at}: ${error.type}: ${error.message}`
  }
}

export function evaluateExercise(content, code) {
  const run = runPython(code)
  const tasks = (content.tasks ?? []).map((task, index) => ({
    id: task.id ?? `task-${index}`,
    title: task.title,
    description: task.description,
    done: !run.error && taskDone(task, code, run.output),
  }))
  const passed = !run.error && tasks.every((task) => task.done)

  let coach
  if (run.error) {
    coach = { mood: 'error', line: run.error.line, text: explainError(run.error, code) }
  } else if (passed) {
    coach = { mood: 'success', text: content.successMessage ?? 'That’s it — it runs and every task checks out. Nice work.' }
  } else {
    const firstOpen = (content.tasks ?? []).find((task, index) => !tasks[index].done)
    const printedNothing = run.output.trim() === ''
    coach = {
      mood: 'nudge',
      text: firstOpen?.nudge
        ?? (printedNothing ? 'It ran, but nothing was printed. Use `print()` to show the result.' : `Close — “${firstOpen?.title}” isn’t done yet.`),
    }
  }

  return { output: run.output, error: run.error, tasks, passed, coach }
}
