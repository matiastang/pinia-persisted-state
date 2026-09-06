**[English](./README.md)** | [中文](./README.zh-CN.md)

# pinia-persisted-state

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Introduction

Local persistence for `pinia` state.

## Install

* `pnpm`
```sh
$ pnpm add pinia-persisted-state
```
* `yarn`
```sh
$ yarn add pinia-persisted-state
```
* `npm`
```sh
$ npm install pinia-persisted-state
```

## Setup

* Quick setup in `main.ts`:
```ts
// pinia state management
import { createPinia } from 'pinia'
import { createPersistedState, persistedConfig } from 'pinia-persisted-state'

const app = createApp(App)

// pinia
const pinia = createPinia()

// Quick usage
pinia.use(createPersistedState)
// View default config
console.log(persistedConfig)

app.use(pinia)
```

* Setup with custom config in `main.ts`:
```ts
// pinia state management
import { createPinia } from 'pinia'
import { createPersistedState, persistedConfig } from 'pinia-persisted-state'

const app = createApp(App)

// pinia
const pinia = createPinia()

// Usage with config
pinia.use(
    createPersistedState({
        key: 'pinia-key',
    })
)
// View config
console.log(persistedConfig)

app.use(pinia)
```
* `persistedConfig` is the config of `pinia-persisted-state`.
* `persistedConfig.key` is the localStorage key for state persistence, default value is `pinia-key`.
* `persistedConfig.customKey` is the localStorage key for `custom properties` persistence, default value is `pinia-custom-key`.
* `persistedConfig.customFilterKey` is the filter function that decides which store members are cached as custom properties (by default, keys prefixed with `$`, `_` or `set` are excluded).

## Usage

Once set up, all pinia states and their updates are saved to `storage`.
**Note**: `custom properties` and `state properties` are only synced to `storage` when they are assigned.

* Declare an `authUser Store` with initial values.
```ts
import { defineStore } from 'pinia'

interface State {
    name: string
    age: string
}

export const useAuthUserStore = defineStore('user', {
    state: (): State => ({
        name: 'name',
        age: 'age',
    }),
    actions: {
        setName(name: string) {
            this.name = name
        },
    },
})
```
* Declare `custom properties`
```ts
import 'pinia'
import { Ref } from 'vue'

declare module 'pinia' {
    export interface PiniaCustomProperties {
        // by using a setter we can allow both strings and refs
        set userId(value: string | Ref<string>)
        get userId(): string

        // you can define simpler values too
        simpleNumber: number
    }
}
```
* Declare `state properties`
```ts
import 'pinia'
import { Ref } from 'vue'

declare module 'pinia' {
    export interface PiniaCustomStateProperties<S> {
        set hello(value: string | Ref<string>)
        get hello(): string
    }
}
```
* Use and inspect the state
```ts
import { useAuthUserStore } from '@/pinia/useAuthUserStore'
import { useTestStore } from '@/pinia/useTest'

const userStore = useAuthUserStore()
const testStore = useTestStore()
// output
console.log(
    userStore.simpleNumber,
    userStore.userId,
    userStore.$state.hello,
    testStore.simpleNumber,
    testStore.userId,
    testStore.$state.hello
)
```
* Inspect the `pinia-key` data saved in `storage` **(or the key you configured)**
```json
{
    test: {data: "data"}
    user: {name: "name", age: "age"}
}
```
**Note**: `custom properties` and `state properties` are only declarations. Data appears after assignment.
```ts
userStore.userId = '001'
userStore.simpleNumber = 99
userStore.$state.hello = 'hello user'

testStore.userId = '002'
testStore.simpleNumber = 100
testStore.$state.hello = 'hello test'
```
```json
{
    pinia-custom-key: {userId: "001", simpleNumber: 99}
    test: {data: "data", hello: "hello test"}
    user: {name: "name", age: "age", hello: "hello user"}
}
```
* As you can see, `custom properties` like `userId` and `simpleNumber` are updated identically through both `userStore` and `testStore` — they act as pinia global variables. Shared `state properties` like `hello` are controlled by each store itself. Since both stores share the same `hello` ref injected by a plugin, updating `context.store.$state.hello` updates it everywhere. Therefore you can write your own plugin placed after `pinia-persisted-state` to initialize or update `state properties` globally.
```ts
const userID = ref('000001')
const hello = ref('hello pinia')
// Custom base plugin, updates state
export function myPiniaPlugin(context: PiniaPluginContext) {
    // custom properties can also be handled inside plugins
    context.store.userId = userID
    // assign
    context.store.$state.hello = hello
}
```
```ts
// pinia state management
import { createPinia } from 'pinia'
import { myPiniaPlugin } from '@/pinia/plugin'
import { createPersistedState, persistedConfig } from 'pinia-persisted-state'

const app = createApp(App)

// pinia
const pinia = createPinia()

// Quick usage
pinia.use(createPersistedState)
// View default config
console.log(persistedConfig)
// Plugin with state updates
pinia.use(myPiniaPlugin)

app.use(pinia)
```
The data in `storage` will be updated.
```json
{
    pinia-custom-key: {userId: "002", simpleNumber: 99}
    test: {data: "data", hello: "hello pinia"}
    user: {name: "name", age: "age", hello: "hello pinia"}
}
```
In short: `pinia-persisted-state` persists the data inside your pinia stores.

## Testing

```sh
$ pnpm run typecheck        # type check
$ pnpm test                 # unit / integration tests
$ pnpm run test:coverage    # coverage report
$ pnpm run test:e2e         # e2e tests (starts the demo app automatically)
```

See [specs/001-test-suite/quickstart.md](./specs/001-test-suite/quickstart.md) for details.

## Versions

See [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT](./LICENSE) © matiastang
