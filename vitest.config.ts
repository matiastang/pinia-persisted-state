/*
 * @Author: matiastang
 * @Date: 2026-08-23 10:00:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 10:00:00
 * @FilePath: /pinia-persisted-state/vitest.config.ts
 * @Description: 单元/集成测试配置（jsdom提供localStorage）
 */
import path from 'path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        // 与vite.config.ts保持一致，测试可直接引用演示工程的视图组件
        alias: {
            '@': path.resolve('src'),
        },
    },
    test: {
        environment: 'jsdom',
        include: ['tests/unit/**/*.spec.ts', 'tests/integration/**/*.spec.ts'],
        coverage: {
            // 只统计库本身的覆盖率（SC-001），演示工程与配置文件不计入
            exclude: [
                'node_modules/**',
                'dist/**',
                'build/**',
                'coverage/**',
                'tests/**',
                '.specify/**',
                '**/*.config.ts',
                'loadenv.ts',
                'src/main.ts',
                'src/App.vue',
                'src/pinia/**',
                'src/router/**',
                'src/views/**',
                'src/plugin/buildJs/**',
                'src/plugin/types/**',
            ],
            thresholds: {
                statements: 95,
                branches: 90,
                functions: 100,
                lines: 95,
            },
        },
    },
})
