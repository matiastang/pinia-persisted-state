/*
 * @Description: 演示工程端到端测试（T020 / FR-006 / SC-003）—— 修改 → 持久化 → 刷新 → 恢复
 */
import { test, expect } from '@playwright/test'

test.describe('演示页面持久化旅程', () => {
    test.beforeEach(async ({ page }) => {
        // 每个用例使用干净的存储环境
        await page.goto('/')
        await page.evaluate(() => localStorage.clear())
        await page.reload()
    })

    test('输入框修改后localStorage同步更新', async ({ page }) => {
        const testInput = page.locator('input').first()
        await testInput.fill('e2e-test-value')
        await testInput.blur()

        const saved = await page.evaluate(() => localStorage.getItem('pinia-key'))
        expect(saved).toBeTruthy()
        expect(JSON.parse(saved!).test.data).toBe('e2e-test-value')
    })

    test('刷新页面后输入框恢复为修改后的值', async ({ page }) => {
        const testInput = page.locator('input').first()
        await testInput.fill('persist-across-reload')
        await testInput.blur()

        await page.reload()

        const restored = page.locator('input').first()
        await expect(restored).toHaveValue('persist-across-reload')
    })

    test('两个store的输入框独立持久化与恢复', async ({ page }) => {
        const inputs = page.locator('input')
        await inputs.nth(0).fill('test-store-value')
        await inputs.nth(1).fill('user-store-value')
        await inputs.nth(0).blur()
        await inputs.nth(1).blur()

        const saved = await page.evaluate(() => localStorage.getItem('pinia-key'))
        const record = JSON.parse(saved!)
        expect(record.test.data).toBe('test-store-value')
        expect(record.user.name).toBe('user-store-value')

        await page.reload()
        await expect(page.locator('input').nth(0)).toHaveValue('test-store-value')
        await expect(page.locator('input').nth(1)).toHaveValue('user-store-value')
    })
})
