import { transformSync } from '@babel/core'

export default opts => {
  try {
    return {
      code: transformSync(opts.source, { presets: ['@babel/preset-env'], filename: opts.filename }).code,
    }
  } catch (error) {
    return {
      code: `exports.__JITI_ERROR__ = ${JSON.stringify({
        code: error.code
          ?.replace('BABEL_', '')
          .replace('PARSE_ERROR', 'ParseError'),
        column: error.loc?.column || 0,
        filename: opts.filename,
        line: error.loc?.line || 0,
        message: error.message?.replace('/: ', '').replace(/\(.+\)\s*$/, ''),
      })}`,
      error,
    }
  }
}
