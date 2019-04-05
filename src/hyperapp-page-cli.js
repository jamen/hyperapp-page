#!/usr/bin/env node
const parseArgs = require('mri')
const { resolve } = require('path')
const { rollup } = require('rollup')
const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const html = require('./html.js')

async function main () {
    const options = parseArgs(
        process.argv.slice(2),
        {
            default: {},
            alias: {},
            boolean: []
        }
    )

    const input = options.input || options._[0] || resolve(process.cwd(), 'src/html.js')

    // IMPORTANT
    //
    // Improve this process by:
    //   1. Importing ES6 module if the Node.js version supports it. This skips the entire bundle
    //      process, because you recieve `site` variable, and you can use the `html({ site })`
    //      function seen below below.
    //   2. Compiling, hashing, and caching the ES6 modules to common.js using rollup, making them
    //      more suitable for servers.

    // The IIFE method below is easier and hackier, but not safe. I'm only prerendering from a
    // command for now so its okay.

    const bundle = await rollup({
        input,
        plugins: [
            nodeResolve(),
            babel({
                exclude: 'node_modules/**',
                babelrc: false,
                plugins: [
                    ['@babel/plugin-transform-react-jsx', { pragma: 'h' }]
                ]
            })
        ]
    })

    const { output: [ output ] } = await bundle.generate({ format: 'iife', name: 'site' })

    const site = new Function(output.code + '\n\nreturn site')()

    const htmlStream = await html({
        site,
        css: options.css,
        js: options.js
    })

    htmlStream.pipe(process.stdout)
}

main().catch(error => {
    console.error(error)
})