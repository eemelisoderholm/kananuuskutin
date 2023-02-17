import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy'
import { minify } from 'rollup-plugin-esbuild'

export default [
  {
    input: 'src/inject.ts',
    output: {
      file: 'dist/inject.js',
      format: 'cjs'
    },
    plugins: [
      typescript(),
      minify(),
      copy({
        targets: [
          { src: 'src/style.css', dest: 'dist/' },
        ]
      })
    ]
  },
  {
    input: 'src/worker.ts',
    output: {
      file: 'dist/worker.js',
      format: 'cjs'
    },
    plugins: [
      typescript(),
      minify()
    ]
  }
];
