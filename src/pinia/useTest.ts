/*
 * @Author: matiastang
 * @Date: 2022-03-18 17:27:11
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-28 22:00:48
 * @FilePath: /pinia-persisted-state/src/pinia/useTest.ts
 * @Description:
 */
import { defineStore } from 'pinia'

interface State {
    data: string
}

export const useTestStore = defineStore('test', {
    state: (): State => ({
        data: 'data',
    }),
    actions: {
        setData(data: string) {
            this.data = data
        },
    },
})
