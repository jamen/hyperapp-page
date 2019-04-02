const { h } = require('hyperapp')
const { renderToStream } = require('@hyperapp/render')

module.exports = function html (options) {
    let { head, page, state, css, js } = options

    const siteHead = head(state)
    const pageHead = page.head(state)

    Object.assign(pageHead.attributes, siteHead.attributes)

    for (const siteMeta of siteHead.children) {
        for (const pageMeta of pageHead.children) {
            if (
                pageMeta.nodeName === siteMeta.nodeName &&
                (
                    pageMeta.attributes.name === siteMeta.attributes.name ||
                    pageMeta.attributes.property === siteMeta.attributes.property ||
                    pageMeta.attributes.itemprop === siteMeta.attributes.itemprop ||
                    pageMeta.attributes['http-equiv'] === siteMeta.attributes['http-equiv'] ||
                    pageMeta.attributes.rel === siteMeta.attributes.rel
                )
            ) {
                Object.assign(pageMeta.attributes, pageMeta.attributes)
            } else if (pageMeta.nodeName === 'title' && pageHead.nodeName === 'title') {
                pageHead.children[0] = pageMeta.children[0]
                Object.assign(pageMeta.attributes, pageMeta.attributes)
            }
        }

        if (pageHead.children.indexOf(siteMeta) === -1) {
            pageHead.children.push(siteMeta)
        }
    }

    if (!css) css = 'app.css'
    if (!js) js = 'app.js'

    pageHead.children.push(h('link', { rel: 'stylesheet', href: css }))

    const doc = h('html', null, [
        pageHead,
        h('body', null, [
            h('div', { id: 'main' }, [
                page.main()
            ]),
            h('script', { src: js })
        ])
    ])

    return renderToStream(doc)
}