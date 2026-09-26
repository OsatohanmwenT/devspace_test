// A deliberately small Python runner for beginner code-editor exercises.
//
// It covers what the early lessons actually teach — assignments (and += etc),
// numbers, strings, f-strings, arithmetic, comparisons, print() and a handful
// of built-ins — and reports errors the way Python would (NameError,
// TypeError, ZeroDivisionError, SyntaxError, IndentationError) with a line
// number, so Devy can explain them. Anything beyond that (loops, functions,
// imports…) fails with a clear "not supported yet" message rather than a
// wrong result. It never touches the page: no eval, no network.

export class PythonError extends Error {
  constructor(type, message, line) {
    super(message)
    this.type = type
    this.line = line
  }
}

// ---------- values ----------
const int = (v) => ({ t: 'int', v })
const float = (v) => ({ t: 'float', v })
const str = (v) => ({ t: 'str', v })
const bool = (v) => ({ t: 'bool', v })
const NONE = { t: 'none' }

const TYPE_NAME = { int: 'int', float: 'float', str: 'str', bool: 'bool', none: 'NoneType', func: 'builtin_function_or_method' }

function formatFloat(v) {
  if (Number.isNaN(v)) return 'nan'
  if (!Number.isFinite(v)) return v > 0 ? 'inf' : '-inf'
  if (Number.isInteger(v) && Math.abs(v) < 1e16) return `${v}.0`
  const text = String(v)
  return text.replace(/e\+?/, 'e+').replace('e+-', 'e-')
}

export function toStr(value) {
  switch (value.t) {
    case 'int': return String(value.v)
    case 'float': return formatFloat(value.v)
    case 'str': return value.v
    case 'bool': return value.v ? 'True' : 'False'
    case 'none': return 'None'
    default: return `<built-in function ${value.name}>`
  }
}

function toRepr(value) {
  if (value.t !== 'str') return toStr(value)
  const quote = value.v.includes("'") && !value.v.includes('"') ? '"' : "'"
  return quote + value.v.replace(/\\/g, '\\\\').replace(/\n/g, '\\n') + quote
}

const isNumeric = (value) => value.t === 'int' || value.t === 'float' || value.t === 'bool'
const numeric = (value) => (value.t === 'bool' ? (value.v ? 1 : 0) : value.v)
const truthy = (value) => {
  if (value.t === 'none') return false
  if (value.t === 'str') return value.v.length > 0
  return Boolean(numeric(value))
}

// ---------- tokenizer ----------
const OPERATORS = ['**=', '//=', '**', '//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '+', '-', '*', '/', '%', '<', '>', '=', '(', ')', ',', '[', ']', ':', '.']
const KEYWORDS = new Set(['True', 'False', 'None', 'and', 'or', 'not'])
const UNSUPPORTED = new Set(['if', 'elif', 'else', 'for', 'while', 'def', 'class', 'import', 'from', 'return', 'try', 'except', 'with', 'lambda', 'yield', 'global', 'del', 'pass', 'break', 'continue', 'raise', 'assert', 'in', 'is'])

function tokenizeLine(text, line) {
  const tokens = []
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === ' ' || ch === '\t') { i += 1; continue }
    if (ch === '#') break
    // strings, including f-strings
    const prefix = /^[fF]['"]/.test(text.slice(i, i + 2)) ? text[i] : ''
    if (ch === '"' || ch === "'" || prefix) {
      const start = i
      if (prefix) i += 1
      const quote = text[i]
      i += 1
      let value = ''
      while (i < text.length && text[i] !== quote) {
        if (text[i] === '\\' && i + 1 < text.length) {
          const next = text[i + 1]
          value += next === 'n' ? '\n' : next === 't' ? '\t' : next
          i += 2
        } else {
          value += text[i]
          i += 1
        }
      }
      if (i >= text.length) throw new PythonError('SyntaxError', 'unterminated string literal', line)
      i += 1
      tokens.push({ type: prefix ? 'fstring' : 'string', value, col: start })
      continue
    }
    const number = /^(\d+\.\d*|\.\d+|\d+)([eE][-+]?\d+)?/.exec(text.slice(i))
    if (number && /[\d.]/.test(ch)) {
      const raw = number[0]
      tokens.push({ type: 'number', value: raw, isFloat: /[.eE]/.test(raw), col: i })
      i += raw.length
      continue
    }
    const name = /^[A-Za-z_]\w*/.exec(text.slice(i))
    if (name) {
      const word = name[0]
      if (UNSUPPORTED.has(word)) {
        throw new PythonError('NotSupported', `the practice runner doesn't support \`${word}\` yet`, line)
      }
      tokens.push({ type: KEYWORDS.has(word) ? 'keyword' : 'name', value: word, col: i })
      i += word.length
      continue
    }
    const op = OPERATORS.find((candidate) => text.startsWith(candidate, i))
    if (op) {
      tokens.push({ type: 'op', value: op, col: i })
      i += op.length
      continue
    }
    throw new PythonError('SyntaxError', `invalid character '${ch}'`, line)
  }
  tokens.push({ type: 'end', col: text.length })
  return tokens
}

// ---------- parser (Pratt) ----------
const BINARY = {
  or: 1, and: 2,
  '==': 4, '!=': 4, '<': 4, '>': 4, '<=': 4, '>=': 4,
  '+': 5, '-': 5,
  '*': 6, '/': 6, '//': 6, '%': 6,
  '**': 8,
}

function parseLine(tokens, line) {
  let pos = 0
  const peek = () => tokens[pos]
  const next = () => tokens[pos++]
  const expectOp = (value) => {
    const token = next()
    if (token.type !== 'op' || token.value !== value) {
      throw new PythonError('SyntaxError', value === ')' ? "'(' was never closed" : 'invalid syntax', line)
    }
  }

  function parsePrimary() {
    const token = next()
    if (token.type === 'number') return { k: 'num', token }
    if (token.type === 'string') return { k: 'str', value: token.value }
    if (token.type === 'fstring') return { k: 'fstr', value: token.value }
    if (token.type === 'keyword') {
      if (token.value === 'True') return { k: 'const', value: bool(true) }
      if (token.value === 'False') return { k: 'const', value: bool(false) }
      if (token.value === 'None') return { k: 'const', value: NONE }
      if (token.value === 'not') return { k: 'not', operand: parseExpr(3) }
    }
    if (token.type === 'name') {
      let node = { k: 'name', name: token.value }
      while (peek().type === 'op' && peek().value === '(') {
        next()
        const args = []
        const kwargs = {}
        while (!(peek().type === 'op' && peek().value === ')')) {
          if (peek().type === 'end') throw new PythonError('SyntaxError', "'(' was never closed", line)
          if (peek().type === 'name' && tokens[pos + 1]?.value === '=' && tokens[pos + 1]?.type === 'op') {
            const key = next().value
            next()
            kwargs[key] = parseExpr(0)
          } else {
            args.push(parseExpr(0))
          }
          if (peek().type === 'op' && peek().value === ',') next()
          else if (!(peek().type === 'op' && peek().value === ')')) throw new PythonError('SyntaxError', 'invalid syntax. Perhaps you forgot a comma?', line)
        }
        next()
        node = { k: 'call', callee: node, args, kwargs }
      }
      return node
    }
    if (token.type === 'op' && token.value === '(') {
      const inner = parseExpr(0)
      expectOp(')')
      return inner
    }
    if (token.type === 'op' && (token.value === '-' || token.value === '+')) {
      return { k: 'unary', op: token.value, operand: parseExpr(7) }
    }
    if (token.type === 'end') throw new PythonError('SyntaxError', 'invalid syntax — the line ends too early', line)
    throw new PythonError('SyntaxError', 'invalid syntax', line)
  }

  function parseExpr(minPrec) {
    let left = parsePrimary()
    for (;;) {
      const token = peek()
      const op = token.type === 'op' || token.type === 'keyword' ? token.value : null
      const prec = op ? BINARY[op] : undefined
      if (prec === undefined || prec < minPrec) break
      next()
      // ** is right-associative
      const right = parseExpr(op === '**' ? prec : prec + 1)
      left = { k: 'bin', op, left, right }
    }
    return left
  }

  const first = tokens[0]
  if (first.type === 'end') return null
  // assignment: name (=|+=|...) expr
  const assignOp = tokens[1]
  if (first.type === 'name' && assignOp?.type === 'op' && ['=', '+=', '-=', '*=', '/=', '//=', '%=', '**='].includes(assignOp.value)) {
    pos = 2
    const value = parseExpr(0)
    if (peek().type !== 'end') throw new PythonError('SyntaxError', 'invalid syntax', line)
    return { k: 'assign', name: first.value, op: assignOp.value, value }
  }
  const expr = parseExpr(0)
  if (peek().type !== 'end') {
    const extra = peek()
    if (extra.type === 'op' && extra.value === '=') throw new PythonError('SyntaxError', "cannot assign to expression here. Maybe you meant '==' instead of '='?", line)
    throw new PythonError('SyntaxError', 'invalid syntax', line)
  }
  return { k: 'expr', expr }
}

// ---------- evaluation ----------
function arithmetic(op, a, b, line) {
  if (op === '+' && a.t === 'str' && b.t === 'str') return str(a.v + b.v)
  if (op === '*' && a.t === 'str' && (b.t === 'int' || b.t === 'bool')) return str(a.v.repeat(Math.max(0, numeric(b))))
  if (op === '*' && b.t === 'str' && (a.t === 'int' || a.t === 'bool')) return str(b.v.repeat(Math.max(0, numeric(a))))
  if (!isNumeric(a) || !isNumeric(b)) {
    if (op === '+' && a.t === 'str') throw new PythonError('TypeError', `can only concatenate str (not "${TYPE_NAME[b.t]}") to str`, line)
    throw new PythonError('TypeError', `unsupported operand type(s) for ${op}: '${TYPE_NAME[a.t]}' and '${TYPE_NAME[b.t]}'`, line)
  }
  const x = numeric(a)
  const y = numeric(b)
  const bothInt = a.t !== 'float' && b.t !== 'float'
  switch (op) {
    case '+': return bothInt ? int(x + y) : float(x + y)
    case '-': return bothInt ? int(x - y) : float(x - y)
    case '*': return bothInt ? int(x * y) : float(x * y)
    case '/':
      if (y === 0) throw new PythonError('ZeroDivisionError', 'division by zero', line)
      return float(x / y)
    case '//':
      if (y === 0) throw new PythonError('ZeroDivisionError', 'integer division or modulo by zero', line)
      return bothInt ? int(Math.floor(x / y)) : float(Math.floor(x / y))
    case '%':
      if (y === 0) throw new PythonError('ZeroDivisionError', 'integer modulo by zero', line)
      return bothInt ? int(((x % y) + y) % y) : float(((x % y) + y) % y)
    case '**': {
      const result = x ** y
      return bothInt && y >= 0 ? int(result) : float(result)
    }
    default: throw new PythonError('SyntaxError', 'invalid syntax', line)
  }
}

function compare(op, a, b, line) {
  if (isNumeric(a) && isNumeric(b)) {
    const x = numeric(a)
    const y = numeric(b)
    return bool({ '==': x === y, '!=': x !== y, '<': x < y, '>': x > y, '<=': x <= y, '>=': x >= y }[op])
  }
  if (op === '==' || op === '!=') {
    const same = a.t === b.t && (a.t === 'none' || a.v === b.v)
    return bool(op === '==' ? same : !same)
  }
  if (a.t === 'str' && b.t === 'str') return bool({ '<': a.v < b.v, '>': a.v > b.v, '<=': a.v <= b.v, '>=': a.v >= b.v }[op])
  throw new PythonError('TypeError', `'${op}' not supported between instances of '${TYPE_NAME[a.t]}' and '${TYPE_NAME[b.t]}'`, line)
}

function makeBuiltins(out) {
  const fn = (name, impl) => ({ t: 'func', name, impl })
  return {
    print: fn('print', (args, kwargs) => {
      const sep = kwargs.sep ? toStr(kwargs.sep) : ' '
      const end = kwargs.end ? toStr(kwargs.end) : '\n'
      out.push(args.map(toStr).join(sep) + end)
      return NONE
    }),
    str: fn('str', ([value = str('')]) => str(toStr(value))),
    int: fn('int', ([value = int(0)], _, line) => {
      if (isNumeric(value)) return int(Math.trunc(numeric(value)))
      if (value.t === 'str' && /^\s*[-+]?\d+\s*$/.test(value.v)) return int(parseInt(value.v, 10))
      throw new PythonError('ValueError', `invalid literal for int() with base 10: ${toRepr(value)}`, line)
    }),
    float: fn('float', ([value = float(0)], _, line) => {
      if (isNumeric(value)) return float(numeric(value))
      if (value.t === 'str' && value.v.trim() !== '' && !Number.isNaN(Number(value.v))) return float(Number(value.v))
      throw new PythonError('ValueError', `could not convert string to float: ${toRepr(value)}`, line)
    }),
    len: fn('len', ([value], _, line) => {
      if (value?.t === 'str') return int(value.v.length)
      throw new PythonError('TypeError', `object of type '${TYPE_NAME[value?.t ?? 'none']}' has no len()`, line)
    }),
    abs: fn('abs', ([value]) => (value.t === 'float' ? float(Math.abs(value.v)) : int(Math.abs(numeric(value))))),
    round: fn('round', ([value, digits]) => {
      if (!digits) return int(Math.round(numeric(value)))
      const factor = 10 ** numeric(digits)
      return float(Math.round(numeric(value) * factor) / factor)
    }),
    max: fn('max', (args) => args.reduce((best, value) => (numeric(value) > numeric(best) ? value : best))),
    min: fn('min', (args) => args.reduce((best, value) => (numeric(value) < numeric(best) ? value : best))),
    type: fn('type', ([value]) => str(`<class '${TYPE_NAME[value.t]}'>`)),
  }
}

// Returns { output, error, variables } — `error` is null on success, or
// { type, message, line } for the first line that failed. Output printed
// before the failure is kept, like a real run.
export function runPython(source, { maxLines = 400 } = {}) {
  const out = []
  const scope = {}
  const builtins = makeBuiltins(out)
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  if (lines.length > maxLines) {
    return { output: '', error: { type: 'NotSupported', message: `programs here are capped at ${maxLines} lines`, line: maxLines }, variables: {} }
  }

  const evaluate = (node, line) => {
    switch (node.k) {
      case 'num': return node.token.isFloat ? float(Number(node.token.value)) : int(Number(node.token.value))
      case 'str': return str(node.value)
      case 'const': return node.value
      case 'fstr':
        return str(node.value.replace(/\{([^{}]+)\}/g, (_, inner) => {
          const statement = parseLine(tokenizeLine(inner, line), line)
          if (!statement || statement.k !== 'expr') throw new PythonError('SyntaxError', 'f-string: invalid expression', line)
          return toStr(evaluate(statement.expr, line))
        }))
      case 'name': {
        if (node.name in scope) return scope[node.name]
        if (node.name in builtins) return builtins[node.name]
        const error = new PythonError('NameError', `name '${node.name}' is not defined`, line)
        error.name_ = node.name
        throw error
      }
      case 'unary': {
        const value = evaluate(node.operand, line)
        if (!isNumeric(value)) throw new PythonError('TypeError', `bad operand type for unary ${node.op}: '${TYPE_NAME[value.t]}'`, line)
        const v = node.op === '-' ? -numeric(value) : numeric(value)
        return value.t === 'float' ? float(v) : int(v)
      }
      case 'not': return bool(!truthy(evaluate(node.operand, line)))
      case 'bin': {
        if (node.op === 'and') {
          const left = evaluate(node.left, line)
          return truthy(left) ? evaluate(node.right, line) : left
        }
        if (node.op === 'or') {
          const left = evaluate(node.left, line)
          return truthy(left) ? left : evaluate(node.right, line)
        }
        const left = evaluate(node.left, line)
        const right = evaluate(node.right, line)
        if (['==', '!=', '<', '>', '<=', '>='].includes(node.op)) return compare(node.op, left, right, line)
        return arithmetic(node.op, left, right, line)
      }
      case 'call': {
        const callee = evaluate(node.callee, line)
        if (callee.t !== 'func') throw new PythonError('TypeError', `'${TYPE_NAME[callee.t]}' object is not callable`, line)
        const args = node.args.map((arg) => evaluate(arg, line))
        const kwargs = Object.fromEntries(Object.entries(node.kwargs).map(([key, value]) => [key, evaluate(value, line)]))
        return callee.impl(args, kwargs, line)
      }
      default: throw new PythonError('SyntaxError', 'invalid syntax', line)
    }
  }

  try {
    lines.forEach((text, index) => {
      const line = index + 1
      if (!text.trim() || text.trim().startsWith('#')) return
      if (/^\s+\S/.test(text)) throw new PythonError('IndentationError', 'unexpected indent', line)
      const statement = parseLine(tokenizeLine(text, line), line)
      if (!statement) return
      if (statement.k === 'assign') {
        const value = evaluate(statement.value, line)
        if (statement.op === '=') {
          scope[statement.name] = value
        } else {
          if (!(statement.name in scope)) throw new PythonError('NameError', `name '${statement.name}' is not defined`, line)
          scope[statement.name] = arithmetic(statement.op.slice(0, -1), scope[statement.name], value, line)
        }
      } else {
        evaluate(statement.expr, line)
      }
    })
    return { output: out.join(''), error: null, variables: scope }
  } catch (error) {
    if (error instanceof PythonError) {
      return { output: out.join(''), error: { type: error.type, message: error.message, line: error.line, name: error.name_ }, variables: scope }
    }
    throw error
  }
}

export function formatPythonError(error) {
  if (!error) return ''
  if (error.type === 'NotSupported') return `Line ${error.line}: ${error.message}.`
  return `Traceback (most recent call last):\n  line ${error.line}\n${error.type}: ${error.message}`
}
