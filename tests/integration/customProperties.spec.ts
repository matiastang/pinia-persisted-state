/*
 * @Description: custom properties缓存与自定义键集成测试（T013、T014 / FR-001、FR-004 / B5、B8）
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { defineStore, type PiniaPluginContext } from 'pinia'
import {
    piniaPersistedState,
    createPersistedState,
    persistedConfig,
} from '../../src/plugin/index'
import { bootApp } from '../helpers/bootApp'

const DEFAULT_KEY = 'pinia-key'
const DEFAULT_CUSTOM_KEY = 'pinia-custom-key'

const useUserStore = defineStore('user', {
    state: () => ({ name: 'name' }),
})

/**
 * 注入custom properties的第三方插件（模拟演示工程myPiniaPlugin）
 */
function injectorPlugin(context: PiniaPluginContext) {
    context.store.userId = '000001'
    context.store.simpleNumber = 100
    context.store._private = 'filtered'
    context.store.setUtil = () => 1
}

/**
 * 模拟一次应用启动（完整安装路径，插件才会注册生效）
 */
const bootAppWith = (...plugins: Array<(c: PiniaPluginContext) => void>) => {
    bootApp(...plugins)
}

const readRecord = (key: string) => JSON.parse(localStorage.getItem(key)!)

afterEach(() => {
    // 还原默认配置，避免污染其他测试文件外的本文件用例
    createPersistedState({
        key: DEFAULT_KEY,
        customKey: DEFAULT_CUSTOM_KEY,
    })
})

beforeEach(() => {
    localStorage.clear()
})

describe('custom properties缓存（B5 / FR-004）', () => {
    it('状态更新后custom properties写入独立子键', async () => {
        bootAppWith(piniaPersistedState, injectorPlugin)
        const store = useUserStore()
        store.name = 'changed'
        await nextTick()

        const record = readRecord(DEFAULT_KEY)
        expect(record[DEFAULT_CUSTOM_KEY]).toEqual({
            userId: '000001',
            simpleNumber: 100,
        })
    })

    it('主记录被清空后变更重建时custom properties一并写入', async () => {
        bootAppWith(piniaPersistedState, injectorPlugin)
        const store = useUserStore()
        localStorage.removeItem(DEFAULT_KEY)
        store.name = 'rebuilt'
        await nextTick()

        const record = readRecord(DEFAULT_KEY)
        expect(record.user.name).toBe('rebuilt')
        expect(record[DEFAULT_CUSTOM_KEY]).toEqual({
            userId: '000001',
            simpleNumber: 100,
        })
    })

    it('仅修改custom properties不触发写入，随下一次state变更一并写入', async () => {
        bootAppWith(piniaPersistedState, injectorPlugin)
        const store = useUserStore()
        // 只改custom property：不触发$subscribe，存储不更新
        store.userId = 'changed-only'
        await nextTick()
        expect(readRecord(DEFAULT_KEY)[DEFAULT_CUSTOM_KEY]).toBeUndefined()

        // 任意state变更后，custom properties最新值被一并写入
        store.name = 'state-change'
        await nextTick()
        expect(readRecord(DEFAULT_KEY)[DEFAULT_CUSTOM_KEY]).toEqual({
            userId: 'changed-only',
            simpleNumber: 100,
        })
    })

    it('默认过滤规则排除$/_/set前缀的属性', async () => {
        bootAppWith(piniaPersistedState, injectorPlugin)
        const store = useUserStore()
        store.name = 'changed'
        await nextTick()

        const custom = readRecord(DEFAULT_KEY)[DEFAULT_CUSTOM_KEY]
        expect(custom).not.toHaveProperty('_private')
        expect(custom).not.toHaveProperty('setUtil')
        expect(Object.keys(custom)).toEqual(['userId', 'simpleNumber'])
    })

    it('custom properties是跨store全局共享的', async () => {
        const useOtherStore = defineStore('other', {
            state: () => ({ data: 'data' }),
        })
        bootAppWith(piniaPersistedState, injectorPlugin)
        useUserStore()
        const other = useOtherStore()
        other.data = 'd2'
        await nextTick()

        // 两个store触发写入的都是同一份custom数据
        const custom = readRecord(DEFAULT_KEY)[DEFAULT_CUSTOM_KEY]
        expect(custom.userId).toBe('000001')
        expect(custom.simpleNumber).toBe(100)
    })

    it('custom properties更新后合并到已缓存数据', async () => {
        // 预置旧缓存
        localStorage.setItem(
            DEFAULT_KEY,
            JSON.stringify({
                [DEFAULT_CUSTOM_KEY]: { userId: '000001', legacy: 'keep' },
                user: { name: 'name' },
            })
        )
        bootAppWith(piniaPersistedState, injectorPlugin)
        const store = useUserStore()
        store.name = 'changed'
        await nextTick()

        const custom = readRecord(DEFAULT_KEY)[DEFAULT_CUSTOM_KEY]
        expect(custom.userId).toBe('000001')
        expect(custom.simpleNumber).toBe(100)
        expect(custom.legacy).toBe('keep')
    })
})

describe('自定义配置键（B8）', () => {
    it('自定义key与customKey时读写都使用新键', async () => {
        bootAppWith(
            createPersistedState({ key: 'my-state', customKey: 'my-custom' }),
            injectorPlugin
        )
        const store = useUserStore()
        store.name = 'changed'
        await nextTick()

        expect(localStorage.getItem(DEFAULT_KEY)).toBeNull()
        const record = readRecord('my-state')
        expect(record.user.name).toBe('changed')
        expect(record['my-custom']).toEqual({ userId: '000001', simpleNumber: 100 })
    })

    it('重启恢复同样使用自定义key', async () => {
        bootAppWith(
            createPersistedState({ key: 'my-state', customKey: 'my-custom' }),
            injectorPlugin
        )
        const store = useUserStore()
        store.name = 'saved'
        await nextTick()

        bootAppWith(
            createPersistedState({ key: 'my-state', customKey: 'my-custom' }),
            injectorPlugin
        )
        expect(useUserStore().name).toBe('saved')
    })

    it('自定义customFilterKey按规则过滤', async () => {
        bootAppWith(
            createPersistedState({
                customFilterKey: (key: string) => key === 'simpleNumber',
            }),
            injectorPlugin
        )
        const store = useUserStore()
        store.name = 'changed'
        await nextTick()

        expect(readRecord(DEFAULT_KEY)[DEFAULT_CUSTOM_KEY]).toEqual({
            simpleNumber: 100,
        })
    })

    it('persistedConfig导出反映生效配置', () => {
        createPersistedState({ key: 'cfg-key' })
        expect(persistedConfig.key).toBe('cfg-key')
    })
})
