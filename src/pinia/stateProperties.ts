/*
 * @Author: matiastang
 * @Date: 2022-02-09 16:34:56
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-16 16:50:48
 * @FilePath: /pinia-persisted-state/src/pinia/stateProperties.ts
 * @Description: 所有store都有的状态，公用状态，每个store都可以访问, authStore.$state.hello
 */
import 'pinia'
import { Ref } from 'vue'

declare module 'pinia' {
    export interface PiniaCustomStateProperties<S> {
        set hello(value: string | Ref<string>)
        get hello(): string
    }
}
