export function isSimulatedPythonComplete(code) {
  const totalVariable = code.match(/^\s*([A-Za-z_]\w*)\s*=\s*hours_per_week\s*\*\s*weeks_per_year\s*$/m)?.[1]
  return Boolean(totalVariable && new RegExp(`print\\s*\\(\\s*${totalVariable}\\s*\\)`).test(code))
}
