// Quick-and-dirty SQL highlighter — same approach as pythonHighlight.js, just
// enough tokenizing so query snippets in Practice don't read as plaintext.
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'GROUP', 'BY', 'ORDER', 'HAVING', 'JOIN', 'INNER',
  'LEFT', 'RIGHT', 'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
  'IS', 'NULL', 'LIMIT', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'TABLE', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ASC', 'DESC',
]

const SQL_TOKEN_PATTERN = new RegExp(
  `(--[^\\n]*)|('(?:[^'\\\\]|\\\\.)*')|\\b(${SQL_KEYWORDS.join('|')})\\b|\\b(\\d+\\.?\\d*)\\b|([A-Za-z_]\\w*)(?=\\()`,
  'gi',
)

export function tokenizeSql(code) {
  const tokens = []
  let lastIndex = 0
  let match

  SQL_TOKEN_PATTERN.lastIndex = 0
  while ((match = SQL_TOKEN_PATTERN.exec(code))) {
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
