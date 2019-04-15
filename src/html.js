const { h } = require('hyperapp')
const { renderToStream } = require('@hyperapp/render')

module.exports = function html (config) {
    let { state, head, view, pages, css, js } = config

    if (!state) state = {}
    if (!css) css = 'app.css'
    if (!js) js = 'app.js'

    let routes = state.routes

    // Add routes to state (like calling main.routeInit on server)
    if (pages && !routes) {
        routes = state.routes = {}

        for (const pageName in pages) {
            const page = pages[pageName]
            routes[page.route] = page
        }
    }

    // Create page head
    const siteHead = head ? head(state) : h('head')

    siteHead.children.push(
        h('link', { rel: 'stylesheet', href: css })
    )

    if (state.page && routes && routes[state.page]) {
        const page = routes[state.page]
        const pageHead = page.head(state)

        Object.assign(siteHead.attributes, pageHead.attributes)

        for (const pageMeta of pageHead.children) {
            for (const meta of siteHead.children) {
                if (
                    meta.nodeName === pageMeta.nodeName &&
                    (
                        meta.attributes.name === pageMeta.attributes.name ||
                        meta.attributes.property === pageMeta.attributes.property ||
                        meta.attributes.itemprop === pageMeta.attributes.itemprop ||
                        meta.attributes['http-equiv'] === pageMeta.attributes['http-equiv'] ||
                        meta.attributes.rel === pageMeta.attributes.rel
                    )
                ) {
                    Object.assign(meta.attributes, pageMeta.attributes)
                } else if (meta.nodeName === 'title' && pageHead.nodeName === 'title') {
                    meta.children[0] = pageMeta.children[0]
                    Object.assign(meta.attributes, pageMeta.attributes)
                }
            }
            if (siteHead.children.indexOf(pageMeta) === -1) {
                siteHead.children.push(pageMeta)
            }
        }
    }

    const doc =
        h('html', null, [
            siteHead,
            h('body', null, [
                h(view),
                h('script', { src: js })
            ])
        ])

    return renderToStream(doc, state)
}