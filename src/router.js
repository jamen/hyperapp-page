export const RoutePage = () => state =>
    state.routes[state.page] ? state.routes[state.page].view : state.routes[false].view

export const route = data => state => {
    if (data) {
        history.pushState(null, '', data)
        window.scrollTo(0, 0)
    }

    const page = location.pathname
    const search = location.search
    const query = {}
    const route = state.routes[page]
    const head = route ? route.head(state) : state.routes[false].head(state)

    if (head) {
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

    if (search) {
        const parts = search.slice(1).split('&')

        for (let i = 0; i < parts.length; i++) {
            const pair = parts[i].split('=')
            query[pair[0]] = pair[1]
        }
    }

    return { page, query }
}

export const routeInit = pages => (_state, actions) => {
    const routes = {}

    for (const pageName in pages) {
        const page = pages[pageName]
        routes[page.route] = page
    }

    actions.update({ routes })
    actions.route()

    window.addEventListener('click', event => {
        const target = event.target
        if (target.nodeName === 'A' && !/^([a-z\d]+:)?\/\//i.test(target.getAttribute('href'))) {
            event.preventDefault()
            actions.route(target.href)
        }
    })

    window.addEventListener('popstate', () => {
        actions.route()
    })
}