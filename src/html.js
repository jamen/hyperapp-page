import { h } from 'hyperapp'

export * from 'hyperapp-render'

export function html ({ prestate, view, head, pageHead, script }) {
    function resolveNode (node) {
        if (typeof node === 'function') {
            resolveNode(node(prestate, {}))
        } else {
            return node
        }
    }

    head = resolveNode(head) || h('head')
    pageHead = resolveNode(pageHead)

    if (pageHead) {
        mergeHead(head, pageHead)
    }

    const doc =
        h('html', null, [
            head,
            h('body', null, [view, script])
        ])

    if (prestate) {
        // NOTE: XSS vulnerable.
        head.children.push(
            h('script', { innerHTML: 'window.prestate=' + JSON.stringify(prestate) })
        )
    }

    return doc
}

export function mergeHead (siteHead, pageHead) {
    Object.assign(siteHead.attributes, pageHead.attributes)

    for (const pageMeta of pageHead.children) {
        for (const meta of siteHead.children) {
            if (
                (meta.nodeName === 'title' && pageMeta.nodeName === 'title') ||
                hasKey(meta, page)
            ) {
                Object.assign(meta.attributes, pageMeta.attributes)
                if (pageMeta.children.length) {
                    meta.children.push(...pageMeta.children)
                }
            }
        }
        if (siteHead.children.indexOf(pageMeta) === -1) {
            siteHead.children.push(pageMeta)
        }
    }
}

const headKeys = [ 'name', 'property', 'itemprop', 'http-equiv', 'rel' ]

function hasKey (node1, node2) {
    for (const key of headKeys) {
        if (node1[key] && node2[key] && node1[key] === node2[key]) {
            return true
        }
    }
}

module.exports = html