/*
 * @Description: 配置与createPersistedState单元测试（T010 / FR-001 / B8）
 */
import { describe, it, expect } from 'vitest'
import { persistedConfig, createPersistedState, piniaPersistedState } from '../../src/plugin/index'

describe('persistedConfig 默认配置', () => {
    it('默认key为pinia-key', () => {
        expect(persistedConfig.key).toBe('pinia-key')
    })

    it('默认customKey为pinia-custom-key', () => {
        expect(persistedConfig.customKey).toBe('pinia-custom-key')
    })

    it('默认customFilterKey排除$/_/set前缀的属性', () => {
        const filter = persistedConfig.customFilterKey!
        expect(filter('$state')).toBe(false)
        expect(filter('_internal')).toBe(false)
        expect(filter('setName')).toBe(false)
        expect(filter('userId')).toBe(true)
        expect(filter('simpleNumber')).toBe(true)
    })
})

describe('createPersistedState 配置合并', () => {
    it('无参调用返回默认插件函数且配置不变', () => {
        const plugin = createPersistedState()
        expect(plugin).toBe(piniaPersistedState)
        expect(persistedConfig.key).toBe('pinia-key')
    })

    it('部分覆盖只更新传入项，其余保持默认', () => {
        createPersistedState({ key: 'my-key' })
        expect(persistedConfig.key).toBe('my-key')
        expect(persistedConfig.customKey).toBe('pinia-custom-key')
        expect(typeof persistedConfig.customFilterKey).toBe('function')
    })

    it('全量覆盖所有配置项', () => {
        const customFilter = (key: string) => key === 'userId'
        createPersistedState({
            key: 'k1',
            customKey: 'k2',
            customFilterKey: customFilter,
        })
        expect(persistedConfig.key).toBe('k1')
        expect(persistedConfig.customKey).toBe('k2')
        expect(persistedConfig.customFilterKey).toBe(customFilter)
        expect(customFilter('userId')).toBe(true)
        expect(customFilter('simpleNumber')).toBe(false)
    })
})
