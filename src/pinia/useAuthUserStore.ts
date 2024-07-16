/*
 * @Author: matiastang
 * @Date: 2022-02-09 15:30:53
 * @LastEditors: matiastang
 * @LastEditTime: 2024-07-16 18:05:03
 * @FilePath: /matias-pinia-persisted-state/src/pinia/useAuthUserStore.ts
 * @Description: 用户权限store
 */
import { defineStore } from 'pinia'

interface State {
    name: string
    age: string
    tel: string
    a: string
}

export const useAuthUserStore = defineStore('user', {
    state: (): State => ({
        name: 'name',
        age: 'age',
        tel: '18380449615',
        a: '',
    }),
    actions: {
        setName(name: string) {
            this.name = name
        },
    },
})
