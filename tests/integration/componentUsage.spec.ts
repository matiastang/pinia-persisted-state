/*
 * @Description: 组件级Use Case测试（T016 / FR-002）—— 用户输入 → store state → localStorage 全链路
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { piniaPersistedState } from '../../src/plugin/index'
// 直接使用演示工程的真实视图，覆盖真实用户路径
import IndexView from '@/views/index.vue'

const bootAndMount = (): VueWrapper<any> => {
    const pinia = createPinia()
    pinia.use(piniaPersistedState)
    setActivePinia(pinia)
    return mount(IndexView, {
        global: {
            plugins: [pinia],
        },
    })
}

const readMainRecord = () => JSON.parse(localStorage.getItem('pinia-key')!)

beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
})

describe('用户输入到持久化的全链路（Use Case）', () => {
    it('页面输入修改testStore.data并同步到localStorage', async () => {
        const wrapper = bootAndMount()
        const inputs = wrapper.findAll('input')
        await inputs[0].setValue('hello-e2e-value')
        await nextTick()
        await nextTick()

        expect(readMainRecord().test.data).toBe('hello-e2e-value')
        wrapper.unmount()
    })

    it('页面输入修改userStore.name并同步到localStorage', async () => {
        const wrapper = bootAndMount()
        const inputs = wrapper.findAll('input')
        await inputs[1].setValue('matias')
        await nextTick()
        await nextTick()

        expect(readMainRecord().user.name).toBe('matias')
        wrapper.unmount()
    })

    it('重新挂载（模拟刷新）后输入框恢复为已保存值', async () => {
        const first = bootAndMount()
        await first.findAll('input')[0].setValue('persisted-value')
        await nextTick()
        await nextTick()
        first.unmount()

        // 模拟刷新：新pinia + 新组件实例，localStorage保留
        const second = bootAndMount()
        const restoredInput = second.findAll('input')[0]
        expect((restoredInput.element as HTMLInputElement).value).toBe(
            'persisted-value'
        )
        second.unmount()
    })
})
