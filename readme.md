# @finepoint/hyperapp-page

A hyperapp router with prerendering and metadata support.

## Install

```
npm i @finepoint/hyperapp-page
```

## Usage

The module exports two actions, `routeInit(routes)` and `route(path)`. You call `routeInit` when the app is created, and you call `route` to change the page. There is a `Link` component that calls `route` for you. Finally, a `getPage(state)` gets the routed view.

Here is a small demo of all the pieces together:

```js
import { h, app } from 'hyperapp'
import { routeInit, route, Link, getPage } from '@finepoint/hyperapp-page'

const state = {
    sample: 'Hello'
}

const actions = {
    update: d => d,
    state: () => s => s,
    routeInit,
    route
}

const view = state => getPage(state)

const Home = () =>
    <div>
        Home page.
        <Link href='/foo'>Go to /foo</Link>
    </div>

const Foo = () =>
    <div>Foo page</div>

const Lost = () =>
    <div>
        404 page
        <Link href='/'>Return home.</Link>
    </div>

const routes = {
    '/': Home,
    '/foo': Foo,
    [false]: Lost
}

const main = app(state, actions, view, document.body)

main.routeInit(routes)
```

Note: The `update` and `state` actions are required for the imported actions.