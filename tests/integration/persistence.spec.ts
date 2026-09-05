/*
 * @Description: 持久化生命周期集成测试（T011 / FR-002、FR-003 / B1、B2、B3）
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { defineStore } from 'pinia'
import { piniaPersistedState } from '../../src/plugin/index'
import { bootApp } from '../helpers/bootApp'

const useUserStore = defineStore('user', {
    state: () => ({
        name: 'name',
        age: 'age',
        tel: '18380449615',
    }),
})

/**
 * 模拟一次"应用启动"（安装完整Vue app路径）
 */
const bootPersistedApp = () => {
    bootApp(piniaPersistedState)
}

const readMainRecord = () => JSON.parse(localStorage.getItem('pinia-key')!)

beforeEach(() => {
    localStorage.clear()
    bootPersistedApp()
})

describe('首次保存（B1）', () => {
    it('创建store后主记录立即以store id为子键写入初始state', () => {
        const store = useUserStore()
        expect(store.name).toBe('name')
        expect(readMainRecord()).toEqual({
            user: { name: 'name', age: 'age', tel: '18380449615' },
        })
    })
})

describe('变更同步（B3）', () => {
    it('修改state后主记录同步为新值', async () => {
        const store = useUserStore()
        store.name = 'matias'
        store.age = '18'
        await nextTick()

        const saved = readMainRecord()
        expect(saved.user.name).toBe('matias')
        expect(saved.user.age).toBe('18')
        expect(saved.user.tel).toBe('18380449615')
    })

    it('通过action修改state同样同步', async () => {
        const useActionStore = defineStore('action-store', {
            state: () => ({ data: 'data' }),
            actions: {
                setData(data: string) {
                    this.data = data
                },
            },
        })
        const store = useActionStore()
        store.setData('new-data')
        await nextTick()
        expect(readMainRecord()['action-store']).toEqual({ data: 'new-data' })
    })

    it('store.$patch批量修改后同步', async () => {
        const store = useUserStore()
        store.$patch({ name: 'patched' })
        await nextTick()
        expect(readMainRecord().user.name).toBe('patched')
    })

    it('主记录在运行期间被清空后，下次变更时自动重建', async () => {
        const store = useUserStore()
        localStorage.removeItem('pinia-key')
        store.name = 'rebuilt'
        await nextTick()
        expect(readMainRecord()).toEqual({
            user: { name: 'rebuilt', age: 'age', tel: '18380449615' },
        })
    })
})

describe('重启恢复（B2）', () => {
    it('本地已有数据时重启以本地值为准恢复', async () => {
        // 第一次会话：修改并保存
        const store = useUserStore()
        store.name = 'saved-name'
        await nextTick()
        expect(readMainRecord().user.name).toBe('saved-name')

        // 模拟重启：保留localStorage，全新pinia
        bootPersistedApp()
        const restored = useUserStore()
        expect(restored.name).toBe('saved-name')
        expect(restored.age).toBe('age')
    })
})

describe('向后兼容恢复（FR-003）', () => {
    it('本地旧数据缺少新字段时，新字段保留代码默认值', () => {
        // 模拟旧版本只保存了name
        localStorage.setItem(
            'pinia-key',
            JSON.stringify({ user: { name: 'old-name' } })
        )
        bootPersistedApp()
        const store = useUserStore()
        expect(store.name).toBe('old-name') // 旧字段被本地值恢复
        expect(store.age).toBe('age') // 新字段保持代码默认值
        expect(store.tel).toBe('18380449615')
    })

    it('本地数据含代码中已删除的字段时，重启后被清理且不进入内存', () => {
        localStorage.setItem(
            'pinia-key',
            JSON.stringify({ user: { name: 'old-name', removed: 'legacy' } })
        )
        bootPersistedApp()
        const store = useUserStore()
        expect((store.$state as Record<string, unknown>).removed).toBeUndefined()
        expect(readMainRecord().user.removed).toBeUndefined()
    })
})
