/*
 * @Author: matiastang
 * @Date: 2021-10-15 16:57:39
 * @LastEditors: matiastang
 * @LastEditTime: 2024-07-16 17:48:57
 * @FilePath: /pinia-persisted-state/vite.config.ts
 * @Description: 开发/测试项目vite配置
 */
// node路径
import path from 'path'
// vite
import { defineConfig } from 'vite'
// 解析.vue文件
import vue from '@vitejs/plugin-vue'
// 开启GZIP压缩
import compressPlugin from 'vite-plugin-compression'

export default defineConfig({
    plugins: [
        vue(),
        compressPlugin({
            ext: '.gz', //gz br
            algorithm: 'gzip', //brotliCompress gzip
            deleteOriginFile: false,
        }),
    ],
    resolve: {
        // 别名
        alias: [{ find: '@', replacement: path.resolve(__dirname, './src') }],
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
        },
    },
    // 开发服务配置
    server: {
        host: '0.0.0.0',
        port: 3002,
        strictPort: true,
        fs: {
            strict: false,
        },
    },
    // 构建配置
    build: {
        outDir: './build',
        assetsInlineLimit: 10240,
    },
})
