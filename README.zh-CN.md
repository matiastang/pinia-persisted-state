[English](./README.md) | **[中文](./README.zh-CN.md)**

<!--
 * @Author: matiastang
 * @Date: 2021-12-13 10:12:56
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23
 * @FilePath: /pinia-persisted-state/README.zh-CN.md
 * @Description: 中文说明文档
-->
# matias-pinia-persisted-state

## 说明

`pinia`状态的本地持久化。

## 安装

* `pnpm`导入
```sh
$ pnpm add matias-pinia-persisted-state
```
* `yarn`导入
```sh
$ yarn add matias-pinia-persisted-state
```
* `npm`
```sh
$ npm install matias-pinia-persisted-state
```

## 配置

* 在`main.ts`中如下便捷导入`matias-pinia-persisted-state`：
```ts
// pinia状态管理
import { createPinia } from 'pinia'
import { createPersistedState, persistedConfig } from 'matias-pinia-persisted-state'

const app = createApp(App)

// pinia
const pinia = createPinia()

// 便捷使用
pinia.use(createPersistedState)
// 查看默认配置
console.log(persistedConfig)

app.use(pinia)
```

* 在`main.ts`中如下带配置导入`matias-pinia-persisted-state`：
```ts
// pinia状态管理
import { createPinia } from 'pinia'
import { createPersistedState, persistedConfig } from 'matias-pinia-persisted-state'

const app = createApp(App)

// pinia
const pinia = createPinia()

// 带配置使用
pinia.use(
    createPersistedState({
        key: 'pinia-key',
    })
)
// 查看配置
console.log(persistedConfig)

app.use(pinia)
```
* `persistedConfig`为`matias-pinia-persisted-state`的配置。
* `persistedConfig.key`是本地持久化`key`，默认值是`pinia-key`。
* `persistedConfig.customKey`是`custom properties`本地持久化`key`，默认值是`pinia-custom-key`。
* `persistedConfig.customFilterKey`是判定 store 成员是否缓存为`custom properties`的过滤函数，默认排除`$`、`_`、`set`前缀的属性。

## 使用

完成引入后，则`pinia`的所有状态及更新都将保存到`storage`中。
**注意**`custom properties`和`state properties`在赋值的时候才会同步到`storage`

* 声明`authUser Store`，带有初始化值。
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
* 声明`custom properties`
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
* 声明`state properties`
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
* 使用并查看状态
```ts
import { useAuthUserStore } from '@/pinia/useAuthUserStore'
import { useTestStore } from '@/pinia/useTest'

const userStore = useAuthUserStore()
const testStore = useTestStore()
// 输出
console.log(
    userStore.simpleNumber,
    userStore.userId,
    userStore.$state.hello,
    testStore.simpleNumber,
    testStore.userId,
    testStore.$state.hello
)
```
* 查看`storage`中保存的`pinia-key`数据**如果配置了key则是对应的数据**
```json
{
    test: {data: "data"}
    user: {name: "name", age: "age"}
}
```
**说明**`custom properties`和`state properties`中只是申明。所有需要赋值之后才能看到数据。
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
* 可以看到`userId`和`simpleNumber`这种`custom properties`使用`userStore`和`testStore`更新都是一样的，可以理解为`pinia`的全局变量。而`hello`这种共有`state properties`需要每个`store`自己控制。使用`context.store.$state.hello`可以修改所有`store`的`hello`熟悉。因此可以自己写一个插件放到`matias-pinia-persisted-state`该插件之后，全量初始或更新`state properties`中的数据。
```ts
const userID = ref('000001')
const hello = ref('hello pinia')
// 自定义基础插件，更新状态
export function myPiniaPlugin(context: PiniaPluginContext) {
    // 当然插件里面也可以处理custom properties
    context.store.userId = userID
    // 赋值
    context.store.$state.hello = hello
}
```
```ts
// pinia状态管理
import { createPinia } from 'pinia'
import { myPiniaPlugin } from '@/pinia/plugin'
import { createPersistedState, persistedConfig } from 'matias-pinia-persisted-state'

const app = createApp(App)

// pinia
const pinia = createPinia()

// 便捷使用
pinia.use(createPersistedState)
// 查看默认配置
console.log(persistedConfig)
// 有状态更新的插件
pinia.use(myPiniaPlugin)

app.use(pinia)
```
`storage`中的数据将更新。
```json
{
    pinia-custom-key: {userId: "002", simpleNumber: 99}
    test: {data: "data", hello: "hello pinia"}
    user: {name: "name", age: "age", hello: "hello pinia"}
}
```
有点儿说多了，只需要知道`matias-pinia-persisted-state`将持久化存储`pinia`中的数据就行。

## 测试

```sh
$ pnpm run typecheck        # 类型检查
$ pnpm test                 # 单元/集成测试
$ pnpm run test:coverage    # 覆盖率报告
$ pnpm run test:e2e         # 端到端测试（自动启动演示工程）
```

详细说明见 [specs/001-test-suite/quickstart.md](./specs/001-test-suite/quickstart.md)。

## 版本

版本更新记录见 [CHANGELOG.md](./CHANGELOG.md)。
