/*
 * @Author: matiastang
 * @Date: 2026-08-23 10:00:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 10:00:00
 * @FilePath: /pinia-persisted-state/playwright.config.ts
 * @Description: e2e测试配置（自动托管演示工程dev server）
 */
import { defineConfig } from '@playwright/test'

export default defineConfig({
    testDir: 'tests/e2e',
    timeout: 30_000,
    use: {
        baseURL: 'http://localhost:3002',
    },
    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:3002',
        reuseExistingServer: true,
        timeout: 60_000,
    },
})
