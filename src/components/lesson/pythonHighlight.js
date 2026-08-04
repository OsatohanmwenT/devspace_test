// Quick-and-dirty Python highlighter — not a real parser, just enough tokenizing
// to stop code samples reading as unstyled plaintext.
const PY_KEYWORDS = ['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'import', 'from', 'as', 'class', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'print', 'lambda', 'try', 'except', 'finally', 'with', 'pass', 'break', 'continue', 'yield', 'global', 'assert', 'del', 'raise']

const PY_TOKEN_PATTERN = new RegExp(
  `(#[^\\n]*)|('(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*")|\\b(${PY_KEYWORDS.join('|')})\\b|\\b(\\d+\\.?\\d*)\\b|([A-Za-z_]\\w*)(?=\\()`,
  'g',
)

// The code surface stays dark in both app themes, so these need no light variant.
export const TOKEN_CLASSES = {
  comment: 'italic text-[#6a9955]',
  string: 'text-[#ce9178]',
  keyword: 'text-[#569cd6]',
  number: 'text-[#b5cea8]',
  function: 'text-[#dcdcaa]',
  plain: 'text-[#d4d4d4]',
}

export function tokenizePython(code) {
  const tokens = []
  let lastIndex = 0
  let match

  PY_TOKEN_PATTERN.lastIndex = 0
  while ((match = PY_TOKEN_PATTERN.exec(code))) {
    if (match.index > lastIndex) tokens.push({ type: 'plain', value: code.slice(lastIndex, match.index) })
    const [full, comment, string, keyword, number, fn] = match
    if (comment) tokens.push({ type: 'comment', value: comment })
    else if (string) tokens.push({ type: 'string', value: string })
    else if (keyword) tokens.push({ type: 'keyword', value: keyword })
    else if (number) tokens.push({ type: 'number', value: number })
    else if (fn) tokens.push({ type: 'function', value: fn })
    lastIndex = match.index + full.length
  }
  if (lastIndex < code.length) tokens.push({ type: 'plain', value: code.slice(lastIndex) })
  return tokens
}
