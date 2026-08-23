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
        const testInput = page.getByTestId('input-test-data')
        await testInput.fill('e2e-test-value')
        await testInput.blur()

        const saved = await page.evaluate(() => localStorage.getItem('pinia-key'))
        expect(saved).toBeTruthy()
        expect(JSON.parse(saved!).test.data).toBe('e2e-test-value')
    })

    test('刷新页面后输入框恢复为修改后的值', async ({ page }) => {
        const testInput = page.getByTestId('input-test-data')
        await testInput.fill('persist-across-reload')
        await testInput.blur()

        await page.reload()

        const restored = page.getByTestId('input-test-data')
        await expect(restored).toHaveValue('persist-across-reload')
    })

    test('两个store的输入框独立持久化与恢复', async ({ page }) => {
        const testInput = page.getByTestId('input-test-data')
        const userInput = page.getByTestId('input-user-name')
        await testInput.fill('test-store-value')
        await userInput.fill('user-store-value')
        await testInput.blur()
        await userInput.blur()

        const saved = await page.evaluate(() => localStorage.getItem('pinia-key'))
        const record = JSON.parse(saved!)
        expect(record.test.data).toBe('test-store-value')
        expect(record.user.name).toBe('user-store-value')

        await page.reload()
        await expect(page.getByTestId('input-test-data')).toHaveValue('test-store-value')
        await expect(page.getByTestId('input-user-name')).toHaveValue('user-store-value')
    })

    test('写入非法JSON后刷新页面自愈为初始值', async ({ page }) => {
        // 先制造已保存数据
        const testInput = page.getByTestId('input-test-data')
        await testInput.fill('before-corrupt')
        await testInput.blur()

        // 破坏存储后刷新，插件应以初始值重建（0.3.0修复的崩溃场景）
        await page.getByTestId('btn-corrupt-storage').click()
        await page.reload()

        await expect(page.getByTestId('storage-view')).not.toContainText('非法 JSON')
        const saved = await page.evaluate(() => localStorage.getItem('pinia-key'))
        const record = JSON.parse(saved!)
        expect(record.test.data).toBe('data')
        expect(record.user.name).toBe('name')
    })

    test('存储视图实时展示写入的数据', async ({ page }) => {
        await page.getByTestId('input-user-name').fill('view-check')
        await page.getByTestId('input-user-name').blur()
        await page.getByTestId('btn-refresh-view').click()

        await expect(page.getByTestId('storage-view')).toContainText('view-check')
    })
})
