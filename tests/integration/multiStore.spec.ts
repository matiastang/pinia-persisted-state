/*
 * @Description: 多store隔离集成测试（T012 / FR-002 / B4）
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { defineStore } from 'pinia'
import { piniaPersistedState } from '../../src/plugin/index'
import { bootApp } from '../helpers/bootApp'

const useUserStore = defineStore('user', {
    state: () => ({ name: 'user-name' }),
})

const useTestStore = defineStore('test', {
    state: () => ({ data: 'test-data' }),
})

// 两个store使用同名字段，验证隔离
const useAlphaStore = defineStore('alpha', {
    state: () => ({ value: 'alpha' }),
})

const useBetaStore = defineStore('beta', {
    state: () => ({ value: 'beta' }),
})

const bootPersistedApp = () => {
    bootApp(piniaPersistedState)
}

const readMainRecord = () => JSON.parse(localStorage.getItem('pinia-key')!)

beforeEach(() => {
    localStorage.clear()
    bootPersistedApp()
})

describe('多store数据隔离（B4）', () => {
    it('不同store各自保存在同一主记录的独立子键下', async () => {
        const user = useUserStore()
        const test = useTestStore()
        await nextTick()

        expect(readMainRecord()).toEqual({
            user: { name: 'user-name' },
            test: { data: 'test-data' },
        })
    })

    it('修改一个store不影响其他store的数据', async () => {
        const user = useUserStore()
        const test = useTestStore()
        user.name = 'changed'
        await nextTick()

        const saved = readMainRecord()
        expect(saved.user.name).toBe('changed')
        expect(saved.test.data).toBe('test-data')
    })

    it('同名字段在不同store中互不干扰', async () => {
        const alpha = useAlphaStore()
        const beta = useBetaStore()
        alpha.value = 'alpha-2'
        await nextTick()

        const saved = readMainRecord()
        expect(saved.alpha.value).toBe('alpha-2')
        expect(saved.beta.value).toBe('beta')

        // 重启恢复也保持隔离
        bootPersistedApp()
        expect(useAlphaStore().value).toBe('alpha-2')
        expect(useBetaStore().value).toBe('beta')
    })

    it('重启后多个store同时恢复各自数据', async () => {
        const user = useUserStore()
        const test = useTestStore()
        user.name = 'u2'
        test.data = 't2'
        await nextTick()

        bootPersistedApp()
        expect(useUserStore().name).toBe('u2')
        expect(useTestStore().data).toBe('t2')
    })
})
