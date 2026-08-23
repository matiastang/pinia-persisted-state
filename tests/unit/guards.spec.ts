/*
 * @Description: 守卫与边界场景单元测试（T015 / FR-005 / B6、B7）
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { defineStore } from 'pinia'
import { piniaPersistedState } from '../../src/plugin/index'
import { bootApp } from '../helpers/bootApp'

/**
 * 创建挂载了被测插件的pinia（完整应用安装路径）
 */
const createPersistedPinia = () => bootApp(piniaPersistedState)

beforeEach(() => {
    localStorage.clear()
})

describe('空 store id 守卫（B6）', () => {
    it('store id为空字符串时输出错误提示且不写存储、不订阅', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const subscribe = vi.fn()
        const context = {
            store: {
                $id: ' ',
                $state: {},
                $subscribe: subscribe,
            },
        } as unknown as Parameters<typeof piniaPersistedState>[0]

        piniaPersistedState(context)

        expect(errorSpy).toHaveBeenCalledTimes(1)
        expect(errorSpy.mock.calls[0][0]).toContain('store id')
        expect(subscribe).not.toHaveBeenCalled()
        expect(localStorage.getItem('pinia-key')).toBeNull()
        errorSpy.mockRestore()
    })

    it('空id的store不影响其他store正常持久化', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        // 真实pinia中先用最小context触发守卫
        piniaPersistedState({
            store: { $id: '', $state: {}, $subscribe: vi.fn() },
        } as unknown as Parameters<typeof piniaPersistedState>[0])
        // 再走正常store
        const useNormal = defineStore('normal', {
            state: () => ({ value: 'v' }),
        })
        const pinia = createPersistedPinia()
        const store = useNormal()
        expect(store.value).toBe('v')
        expect(JSON.parse(localStorage.getItem('pinia-key')!)).toEqual({
            normal: { value: 'v' },
        })
        errorSpy.mockRestore()
    })
})

describe('损坏的本地数据自愈（B7）', () => {
    it('主记录为非法JSON时以初始值重建，不抛异常', () => {
        localStorage.setItem('pinia-key', '{invalid json')
        const useUser = defineStore('user', {
            state: () => ({ name: 'name' }),
        })
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        createPersistedPinia()
        const store = useUser()

        expect(store.name).toBe('name')
        expect(JSON.parse(localStorage.getItem('pinia-key')!)).toEqual({
            user: { name: 'name' },
        })
        warnSpy.mockRestore()
    })

    it('主记录为非对象JSON时同样自愈', () => {
        localStorage.setItem('pinia-key', '"just a string"')
        const useUser = defineStore('user', {
            state: () => ({ name: 'name' }),
        })

        createPersistedPinia()
        const store = useUser()

        expect(store.name).toBe('name')
        // 字符串主记录没有store子键，被当作无该store数据追加重建
        expect(JSON.parse(localStorage.getItem('pinia-key')!)).toEqual({
            user: { name: 'name' },
        })
    })
})

describe('空 state 与不可序列化值', () => {
    it('state为空对象时持久化与恢复正常', async () => {
        const useEmpty = defineStore('empty', {
            state: () => ({}),
        })
        const pinia = createPersistedPinia()
        void pinia
        const store = useEmpty()
        expect(JSON.parse(localStorage.getItem('pinia-key')!)).toEqual({ empty: {} })

        // 模拟重启：新pinia + 保留localStorage
        bootApp(piniaPersistedState)
        const store2 = useEmpty()
        expect(store2.$state).toEqual({})
    })

    it('state包含函数字段时序列化不崩溃，函数字段被JSON丢弃', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const useFn = defineStore('fnstore', {
            state: () => ({
                data: 'd',
                handler: () => 1,
            }),
        })
        createPersistedPinia()
        const store = useFn()
        store.data = 'changed'
        await nextTick()

        const saved = JSON.parse(localStorage.getItem('pinia-key')!)
        expect(saved.fnstore).toEqual({ data: 'changed' })
        warnSpy.mockRestore()
    })
})
