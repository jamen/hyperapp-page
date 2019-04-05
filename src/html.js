const { h } = require('hyperapp')
const { renderToStream } = require('@hyperapp/render')

module.exports = function html (options) {
    let { site, css, js } = options

    if (!css) css = 'app.css'
    if (!js) js = 'app.js'

    const actions = site.actions
    const state = site.state
    let routes = state.routes

    // Add routes to state (like calling main.routeInit on server)
    if (routes == null) {
        routes = state.routes = {}
        const pages = site.pages

        for (const pageName in pages) {
            const page = pages[pageName]
            routes[page.route] = page
        }
    }

    // Create page head
    const head = site.head(state, actions)

    head.children.push(
        h('link', { rel: 'stylesheet', href: css })
    )

    if (state.page && routes && routes[state.page]) {
        const page = routes[state.page]
        const pageHead = page.head(state)

        Object.assign(head.attributes, pageHead.attributes)

        for (const pageMeta of pageHead.children) {
            for (const meta of head.children) {
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
            if (head.children.indexOf(pageMeta) === -1) {
                head.children.push(pageMeta)
            }
        }
    }

    const doc =
        h('html', null, [
            head,
            h('body', null, [
                h(site.view),
                h('script', { src: js })
            ])
        ])

    return renderToStream(doc, state, actions)
}