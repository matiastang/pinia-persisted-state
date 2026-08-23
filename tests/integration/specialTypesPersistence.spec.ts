/*
 * @Description: 特殊类型持久化集成测试（T002/T003/T008 / FR-003、FR-004 / US1、US2）
 * 覆盖：matias-storage 0.3.0 升级后的旧格式数据向后兼容、
 * Date/Map/Set/BigInt/RegExp 无损往返、存储标签格式与循环引用健壮性。
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { defineStore } from 'pinia'
import { piniaPersistedState } from '../../src/plugin/index'
import { bootApp } from '../helpers/bootApp'

const bootPersistedApp = () => {
    bootApp(piniaPersistedState)
}

const readMainRecord = () => JSON.parse(localStorage.getItem('pinia-key')!)

beforeEach(() => {
    localStorage.clear()
    bootPersistedApp()
})

describe('旧格式数据向后兼容（FR-003 / US1）', () => {
    const useLegacyStore = defineStore('legacy', {
        state: () => ({
            name: 'init',
            createdAt: new Date('2024-01-01T00:00:00Z'),
            count: 0,
            tags: [] as string[],
        }),
    })

    it('0.2.0写入的纯JSON旧数据（特殊类型已失真）被正常恢复', () => {
        // 模拟 matias-storage 0.2.0 写入的主记录：Date 失真为 ISO 字符串
        localStorage.setItem(
            'pinia-key',
            JSON.stringify({
                legacy: {
                    name: 'old-name',
                    createdAt: '2023-05-05T08:00:00.000Z',
                    count: 7,
                    tags: ['a', 'b'],
                },
            })
        )
        bootPersistedApp()
        const store = useLegacyStore()

        expect(store.name).toBe('old-name')
        expect(store.count).toBe(7)
        expect(store.tags).toEqual(['a', 'b'])
        // 旧格式失真数据按普通值恢复：字符串覆盖内存中的 Date 初始值（既有差异合并语义）
        expect(store.createdAt).toBe('2023-05-05T08:00:00.000Z')
    })

    it('升级后新写入的特殊类型值以标签格式存储（状态单向迁移）', async () => {
        localStorage.setItem(
            'pinia-key',
            JSON.stringify({
                legacy: {
                    name: 'old-name',
                    createdAt: '2023-05-05T08:00:00.000Z',
                    count: 7,
                    tags: ['a', 'b'],
                },
            })
        )
        bootPersistedApp()
        const store = useLegacyStore()

        // 应用重新赋予真正的 Date 后，下次持久化即按新格式存储
        store.createdAt = new Date('2024-06-01T12:30:00Z')
        await nextTick()

        const raw = localStorage.getItem('pinia-key')!
        expect(raw).toContain('"__matias_tag__":"Date"')
        expect(readMainRecord().legacy.name).toBe('old-name')
    })
})

describe('特殊类型无损往返（FR-004 / US2）', () => {
    const useSpecialStore = defineStore('special', {
        state: () => ({
            plain: 'text',
            createdAt: new Date(0),
            tags: new Map<string, number>(),
            flags: new Set<string>(),
            big: 0n,
            pattern: /init/,
        }),
    })

    const assignValues = (store: ReturnType<typeof useSpecialStore>) => {
        store.plain = 'updated'
        store.createdAt = new Date('2024-06-01T12:00:00Z')
        store.tags = new Map([
            ['a', 1],
            ['b', 2],
        ])
        store.flags = new Set(['x', 'y'])
        store.big = 9007199254740993n
        store.pattern = /ab+c/gi
    }

    it('Date/Map/Set/BigInt/RegExp 持久化后重启恢复，类型保持、值相等', async () => {
        const store = useSpecialStore()
        assignValues(store)
        await nextTick()

        // 存储格式：特殊类型带内部标签，普通字段保持普通 JSON
        const raw = localStorage.getItem('pinia-key')!
        expect(raw).toContain('"__matias_tag__":"Date"')
        expect(raw).toContain('"__matias_tag__":"Map"')
        expect(raw).toContain('"__matias_tag__":"Set"')
        expect(raw).toContain('"__matias_tag__":"BigInt"')
        expect(raw).toContain('"__matias_tag__":"RegExp"')
        expect(readMainRecord().special.plain).toBe('updated')

        // 模拟重启：保留 localStorage，全新 pinia
        bootPersistedApp()
        const restored = useSpecialStore()

        expect(restored.createdAt instanceof Date).toBe(true)
        expect(restored.createdAt.getTime()).toBe(
            new Date('2024-06-01T12:00:00Z').getTime()
        )
        expect(restored.tags instanceof Map).toBe(true)
        expect(restored.tags.get('a')).toBe(1)
        expect(restored.tags.get('b')).toBe(2)
        expect(restored.tags.size).toBe(2)
        expect(restored.flags instanceof Set).toBe(true)
        expect(restored.flags.has('x')).toBe(true)
        expect(restored.flags.has('y')).toBe(true)
        expect(typeof restored.big).toBe('bigint')
        expect(restored.big).toBe(9007199254740993n)
        expect(restored.pattern instanceof RegExp).toBe(true)
        expect(restored.pattern.source).toBe('ab+c')
        expect(restored.pattern.flags).toBe('gi')
        expect(restored.plain).toBe('updated')
    })

    it('普通值存储格式与旧版本一致（无标签污染）', async () => {
        const usePlainStore = defineStore('plain-store', {
            state: () => ({
                name: 'name',
                age: 18,
                active: true,
                nest: { deep: [1, 2, 3] },
            }),
        })
        const store = usePlainStore()
        store.name = 'matias'
        await nextTick()

        // 普通对象/字符串/数字/布尔/数组不带任何标签（pinia-custom-key 为插件
        // 订阅写入时附加的空 custom properties 子键，与存储库版本无关）
        expect(readMainRecord()).toEqual({
            'plain-store': { name: 'matias', age: 18, active: true, nest: { deep: [1, 2, 3] } },
            'pinia-custom-key': {},
        })
        expect(localStorage.getItem('pinia-key')).not.toContain('__matias_tag__')
    })
})

describe('不可序列化值的健壮性（Edge Cases）', () => {
    it('state含循环引用时写入不抛异常，插件与既有数据不受影响', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const useCycleStore = defineStore('cycle', {
            state: () => ({
                data: 'd',
                self: null as unknown as Record<string, unknown> | null,
            }),
        })
        const store = useCycleStore()
        expect(readMainRecord().cycle).toEqual({ data: 'd', self: null })

        // 构造循环引用并触发持久化：存储层应拒绝写入并告警，而非抛出异常
        expect(() => {
            store.self = store.$state
        }).not.toThrow()
        await nextTick()

        // 写入被存储层拒绝：主记录保留循环引用出现前的最后有效数据
        expect(readMainRecord().cycle).toEqual({ data: 'd', self: null })
        warnSpy.mockRestore()
    })
})
