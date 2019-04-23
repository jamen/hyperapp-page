import { h } from 'hyperapp'
import { patchHead } from '@finepoint/hyperapp-head'

export const Link = (data, children) => (_state, actions) =>
    h('a', {
        ...data,
        onclick (event) {
            event.preventDefault()
            actions.route(event.target.href)
        }
    }, children)

export const route = data => (state, actions) => {
    window.scrollTo(0, 0)

    const path = nextRoute(data)
    const query = parseQuery()

    actions.update({ path, query })

    const page = getPage(path)

    if (page) {
        if (page.onroute) {
            // NOTE: onroute passed as `(state, actions) => { ... }`
            actions.update(page.onroute)
        }
        if (page.head) {
            patchHead(page.head(actions.state(), actions))
        }
    }
}

export const routeInit = routes => (_state, actions) => {
    window.addEventListener('popstate', () => actions.route())
    actions.update({ routes })
    actions.route()
}

// Hash + history router. Works with file:// and Electron B^)
const nextRoute = data => {
    if (!window.history) {
        location.hash = data || ''
        return location.hash.slice(1) || '/'
    } else if (location.origin === 'file://') {
        history.pushState(null, '', data ? '#' + data : '')
        return location.hash.slice(1) || '/'
    } else {
        history.pushState(null, '', data)
        return location.pathname
    }
}

const parseQuery = () => {
    if (location.search) {
        const parts = location.search.search.slice(1).split('&')
        for (let i = 0; i < parts.length; i++) {
            const pair = parts[i].split('=')
            query[pair[0]] = pair[1]
        }
    }
}

export const getPage = state => {
    return state.routes && (state.routes[state.path] || state.routes[false])
}

