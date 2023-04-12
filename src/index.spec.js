import packageName from 'depcheck-package-name'
import fs from 'fs-extra'
import jiti from 'jiti'
import withLocalTmpDir from 'with-local-tmp-dir'

import self from './index.js'

export default {
  async afterEach() {
    await this.resetWithLocalTmpDir()
  },
  babelrc: async () => {
    await fs.outputFile(
      '.babelrc.json',
      JSON.stringify({ extends: '@dword-design/babel-config' }),
    )
    await fs.outputFile('inner.js', '[1, 2] |> x => x * 2')
    jiti(undefined, { transform: self })('./inner.js')
  },
  async beforeEach() {
    this.resetWithLocalTmpDir = await withLocalTmpDir()
  },
  export: async () => {
    await fs.outputFile('package.json', JSON.stringify({ type: 'module' }))
    await fs.outputFile('inner.js', 'export default 1')
    jiti(undefined, {
      esmResolve: true,
      interopDefault: true,
      transform: self,
    })('./inner.js')
  },
  'inline config': async () => {
    await fs.outputFile('package.json', JSON.stringify({ type: 'module' }))
    await fs.outputFile('inner.js', "export default '1'")
    expect(
      jiti(undefined, {
        esmResolve: true,
        interopDefault: true,
        transform: self,
        transformOptions: {
          babel: {
            plugins: [
              [
                packageName`babel-plugin-search-and-replace`,
                { rules: [{ replace: '2', search: '1' }] },
              ],
            ],
          },
        },
      })('./inner.js'),
    ).toEqual('2')
  },
}
