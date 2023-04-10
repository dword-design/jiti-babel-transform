import { endent } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import { execaCommand } from 'execa'
import fs from 'fs-extra'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  async afterEach() {
    await this.resetWithLocalTmpDir()
  },
  async beforeEach() {
    this.resetWithLocalTmpDir = await withLocalTmpDir()
  },
  works: async () => {
    await fs.outputFile(
      '.babelrc.json',
      JSON.stringify({ extends: '@dword-design/babel-config' }),
    )
    await fs.outputFile('inner.js', '[1, 2] |> x => x * 2')
    await fs.outputFile(
      'index.js',
      endent`
        #!/usr/bin/env node

        import jiti from '${packageName`jiti`}'

        import self from '../src/index.js'

        jiti(undefined, { transform: self })('./inner.js')
      `,
      { mode: '755' },
    )
    await execaCommand('./index.js')
  },
}
