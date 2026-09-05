/*
 * @Author: matiastang
 * @Date: 2022-02-09 16:28:32
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-16 16:50:07
 * @FilePath: /pinia-persisted-state/src/pinia/customProperties.ts
 * @Description: store的状态，使用authStore.userId直接访问
 */
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
