import { endent } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import { execaCommand } from 'execa'
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
    await fs.outputFile(
      '.babelrc.json',
      JSON.stringify({
        extends: '@dword-design/babel-config',
        // presets: ['@babel/preset-env'],
      }),
    )
    await fs.outputFile('package.json', JSON.stringify({ type: 'module' }))
    await fs.outputFile('inner.js', 'export default 1')
    await fs.outputFile(
      'index.js',
      endent`
        import jiti from 'jiti'

        import self from '../src/index.js'

        jiti(undefined, { interopDefault: true, esmResolve: true, transform: self })('./inner.js')
      `,
    )
    await execaCommand('node index.js')
  },
}
