import type { EngineInterface, Register, ToolCallResult } from 'claude-code'

const AL_FILE = /\.al$/i
const GITHUB_ROOT = 'https://raw.githubusercontent.com/microsoft/BCQuality/main'

// AL files changed since the turn began; the first one gets the full ask.
let changed = new Set<string>()
let root: { path: string; isLocal: boolean } | undefined
let configured = ''

async function resolveRoot($: EngineInterface) {
  if (root !== undefined) return root
  const home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME'))
  const local = configured !== '' ? configured : home !== undefined ? `${home}/BCQuality` : ''
  const isLocal = local !== '' && (await $.fs.exists(`${local}/skills/entry.md`))
  if (!isLocal && configured !== '') {
    $.ui.toast(`BCQuality not found at ${configured}; using the GitHub copy.`)
  }
  root = isLocal ? { path: local.replace(/\\/g, '/'), isLocal } : { path: GITHUB_ROOT, isLocal }
  return root
}

async function reviewNote($: EngineInterface, file: string): Promise<string | undefined> {
  if (changed.has(file)) return undefined
  changed.add(file)
  $.ui.status(`BCQuality: ${changed.size} AL file${changed.size === 1 ? '' : 's'} to review`)
  if (changed.size > 1) {
    return `BCQuality: also include ${file} in the BCQuality review at the end of this task.`
  }
  const { path, isLocal } = await resolveRoot($)
  const how = isLocal ? 'Read and follow' : 'Fetch (WebFetch) and follow'
  return [
    `BCQuality: you changed Business Central AL code (${file}).`,
    'When you have finished editing AL files for this task, and before reporting back,',
    `review every AL file you changed with BCQuality. ${how} ${path}/skills/al-code-review/SKILL.md`,
    `(it routes through ${path}/skills/entry.md), with the goal "review the AL changes just made",`,
    'technologies [al], and the changed files as file-path inputs.',
    'Fix confirmed defects; report the rest with the knowledge-file references BCQuality cites.',
  ].join(' ')
}

async function withNote($: EngineInterface, file: string, ran: ToolCallResult): Promise<ToolCallResult> {
  if (ran.deny !== undefined || ran.isError === true || !AL_FILE.test(file)) return ran
  const note = await reviewNote($, file)
  return note === undefined ? ran : { ...ran, context: [...(ran.context ?? []), note] }
}

export const register: Register = (on, options) => {
  configured = String(options.path ?? '').trim()
  root = undefined

  on('turn.start', ($, e, next) => {
    changed = new Set()
    $.ui.status(undefined)
    return next(e)
  })

  on('tool.call', { tool: 'Edit' }, async ($, e, next) => withNote($, e.file_path, await next(e)))
  on('tool.call', { tool: 'Write' }, async ($, e, next) => withNote($, e.file_path, await next(e)))
}
