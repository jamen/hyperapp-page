import { h } from 'hyperapp'

export const RoutePage = () => state =>
    state.routes[state.page] ? state.routes[state.page].view : state.routes[false].view

export const Link = data => (_state, actions) =>
    h('a', {
        ...data,
        onclick (event) {
            event.preventDefault()
            actions.route(event.target.href)
        }
    })

export const route = data => state => {
    let page

    // Route page (hash routing for local sites, Electron, or history router unsupported)
    if (!window.history || location.origin === 'file://') {
        page = location.hash = location.hash.slice(1) || '/'
    } else {
        page = location.pathname
        history.pushState(null, '', data)
        window.scrollTo(0, 0)
    }

    const search = location.search
    const query = {}
    const view = state.routes[page]

    // 404 page
    if (view === null || view === undefined) {
        return route(false)
    }

    // Decode search params
    if (search) {
        const parts = search.slice(1).split('&')

        for (let i = 0; i < parts.length; i++) {
            const pair = parts[i].split('=')
            query[pair[0]] = pair[1]
        }
    }

    // Patch head
    const head = view.head && view.head(state)

    if (head) {
        patchHead(head)
    }

    return { page, query }
}

export const routeInit = pages => (_state, actions) => {
    const routes = {}

    for (const pageName in pages) {
        const page = pages[pageName]
        routes[page.route] = page
    }

    window.addEventListener('popstate', () => actions.route())

    const { page, query } = route()({ routes })

    return { routes, page, query }
}

export const patchHead = head => {
    for (const el of document.head.childNodes) {
        for (const node of head.children) {
            const attr = node.attributes
            if (
                node.nodeName === el.nodeName.toLowerCase() &&
                (
                    attr.name === el.getAttribute('name') ||
                    attr.property === el.getAttribute('property') ||
                    attr.itemprop === el.getAttribute('itemprop') ||
                    attr['http-equiv'] === el.getAttribute('http-equiv') ||
                    attr.rel === el.getAttribute('rel')
                )
            ) {
                Object.assign(el, attr)
            } else if (el.tagName === 'TITLE' && node.nodeName === 'title') {
                document.title = node.children[0]
                Object.assign(el, attr)
            }
        }
    }
}
