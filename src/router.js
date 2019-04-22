import { h } from 'hyperapp'

export const RoutePage = data => state => {
    const page = data.pages[state.page] || data.lost
    return page ? page.view : data.lost
}

export const Link = (data, children) => (_state, actions) =>
    h('a', {
        ...data,
        onclick (event) {
            event.preventDefault()
            actions.route(event.target.href)
        }
    }, children)

export const route = data => state => {
    // Hash and history routing
    let page
    if (!window.history) {
        location.hash = data || ''
        page = location.hash.slice(1) || '/'
    } else if (location.origin === 'file://') {
        history.pushState(null, '', data ? '#' + data : '')
        page = location.hash.slice(1) || '/'
    } else {
        history.pushState(null, '', data)
        page = location.pathname
    }

    // Decode search params
    const query = {}
    if (location.search) {
        const parts = location.search.search.slice(1).split('&')
        for (let i = 0; i < parts.length; i++) {
            const pair = parts[i].split('=')
            query[pair[0]] = pair[1]
        }
    }

    // Patch head
    const view = state.routes[page]
    if (view && view.head) {
        patchHead(view.head(state))
    }

    // Reset scroll position
    window.scrollTo(0, 0)

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
            if (testKeys(node, el)) {
                Object.assign(el, node.attributes)
            } else if (node.nodeName === 'title' && el.nodeName === 'TITLE') {
                document.title = node.children[0]
            }
        }
    }
}

const headKeys = [ 'name', 'property', 'itemprop', 'http-equiv', 'rel' ]

const testKeys = (node1, node2) => {
    for (const key of headKeys) {
        if (node1[key] && node2[key] && node1[key] === node2[key]) {
            return true
        }
    }
}