import { expect, test } from 'claude-code/testing'

const OPTIONS = { options: { path: 'C:/nowhere/BCQuality' } }

const edit = (file_path: string) => ({ tool: 'Edit' as const, file_path, old_string: 'a', new_string: 'b' })

test('an .al edit asks for one BCQuality review per turn', OPTIONS, async ($, on) => {
  on('tool.call', () => ({ result: { filePath: 'x' }, text: 'ok' }) as never)
  on('turn.start', (_$, e) => ({ turnId: e.turnId }))
  on('env.get', () => ({ value: 'C:/Users/someone' }))
  on('fs.exists', () => ({ value: false }))
  on('ui.status', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))

  await $.turn.start({ text: 'fix posting', turnId: 't1' })

  const first = await $.tool.call(edit('C:/app/src/SalesPost.Codeunit.al'))
  expect(first.context?.[0]).toMatch(/BCQuality: you changed Business Central AL code/)
  expect(first.context?.[0]).toMatch(/raw\.githubusercontent\.com\/microsoft\/BCQuality/)

  const again = await $.tool.call(edit('C:/app/src/SalesPost.Codeunit.al'))
  expect(again.context).toBeUndefined()

  const second = await $.tool.call(edit('C:/app/src/Customer.Table.al'))
  expect(second.context?.[0]).toMatch(/also include C:\/app\/src\/Customer\.Table\.al/)

  await $.turn.start({ text: 'next', turnId: 't2' })
  const nextTurn = await $.tool.call(edit('C:/app/src/SalesPost.Codeunit.al'))
  expect(nextTurn.context?.[0]).toMatch(/you changed Business Central AL code/)
})

test('non-AL edits and failed edits add nothing', OPTIONS, async ($, on) => {
  on('tool.call', (_$, e) =>
    (e.tool === 'Edit' && e.file_path.endsWith('bad.al')
      ? { isError: true, result: 'no match', text: 'no match' }
      : { result: { filePath: 'x' }, text: 'ok' }) as never,
  )

  expect((await $.tool.call(edit('C:/app/README.md'))).context).toBeUndefined()
  expect((await $.tool.call(edit('C:/app/bad.al'))).context).toBeUndefined()
})
