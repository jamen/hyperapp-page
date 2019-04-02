#!/usr/bin/env node

const { readFileSync } = require('fs')
const parseArgs = require('mri')
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

    if (!options.head) {
        throw new Error('Must provide a head file.')
    }

    if (!options.page) {
        throw new Error('Must provide a page file.')
    }

    const pageBundle = await rollup({
        input: options.page,
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

    const { output: [ { code: pageCode }] } = await pageBundle.generate({
        format: 'iife',
        name: 'interm'
    })

    let page = new Function(pageCode + '\n\nreturn interm')()

    if (typeof page === 'object') {
        const [ pageName ] = Object.keys(page)
        page = page[pageName]
    }

    const headBundle = await rollup({
        input: options.head,
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

    const { output: [ { code: headCode } ] } = await headBundle.generate({
        format: 'iife',
        name: 'interm'
    })

    let head = new Function(headCode + '\n\nreturn interm')()

    if (typeof page === 'object') {
        const [ headName ] = Object.keys(head)
        head = head[headName]
    }

    const state = options.state ? JSON.parse(readFileSync(options.state)) : {}

    const htmlStream = await html({ page, head, state })

    htmlStream.pipe(process.stdout)
}

main().catch(error => {
    console.error(error)
})