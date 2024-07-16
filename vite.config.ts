/*
 * @Author: your name
 * @Date: 2021-10-15 16:57:39
 * @LastEditTime: 2024-07-16 17:48:57
 * @LastEditors: matiastang
 * @Description: In User Settings Edit
 * @FilePath: /matias-pinia-persisted-state/vite.config.ts
 */
// vite配置文件vite.config.js

// node路径
import path from 'path'
// vite
import { defineConfig } from 'vite'
// 解析.vue文件
import vue from '@vitejs/plugin-vue'
// 开启GZIP压缩
import compressPlugin from 'vite-plugin-compression'

export default defineConfig({
    // 共享配置
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
        alias: [
            { find: '@', replacement: path.resolve(__dirname, './src') },
        ],
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
        },
        // CSS 预处理器的选项
        preprocessorOptions: {
            less: {},
            scss: {
                // additionalData: `
                //     @use "@/common/css/element-variables.scss" as * ;
                //     @use "@/common/css/index.scss" as * ;
                // `,
            },
            sass: {},
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
        // proxy: {
        //     // 选项写法
        //     [config.VITE_APP_BASE_API]: {
        //         target: config.VITE_APP_BASE_HOST, // 所要代理的目标地址
        //         rewrite: (path) => path.replace(/^\/dev-api/, ''), // 重写传过来的path路径，比如 `/api/index/1?id=10&name=zs`（注意:path路径最前面有斜杠（/），因此，正则匹配的时候不要忘了是斜杠（/）开头的；选项的 key 也是斜杠（/）开头的）
        //         changeOrigin: true, // true/false, Default: false - changes the origin of the host header to the target URL
        //     },
        // },
    },
    // 构建配置
    build: {
        outDir: './build',
        assetsInlineLimit: 10240,
    },
})
/*
@rollup/plugin-node-resolve：rollup 路径解析插件，告诉 Rollup 如何查找外部模块
@types/jest：jest 的 TS 模块
@types/mockjs：mockjs 的 TS 模块
@types/node：关于 nodejs 的类型定义，用于 nodejs 中使用 TS
@typescript-eslint/eslint-plugin：eslint 插件，包含了各类定义好的检测 TS 代码的规范
@typescript-eslint/parser：eslint 的解析器，用于解析 TS，从而检查和规范 TS
@vitejs/plugin-vue：vite 解析 Vue 的插件
@vue/compiler-sfc：解析 SFC(Single File Components) 组件
@vue/test-utils：Vue 单元测试
autoprefixer：浏览器前缀工具
del：用于删除文件夹和文件
eslint：JS 代码检测工具
eslint-config-airbnb-base：eslint 的 airbnb 编码规则
eslint-config-prettier：处理 eslint 中的样式规范和 prettier 中样式规范的冲突
eslint-plugin-import：验证正确的导入的 eslint 插件
eslint-plugin-jest：解析 jest 的 eslint 插件
eslint-plugin-prettier：将 prettier 作为 eslint 规范来使用
eslint-plugin-vue：解析 Vue 的 eslint 插件
gulp：自动化构建工具
gulp-autoprefixer：自动获取浏览器厂商前缀，如 -webkit-
gulp-cssmin：css 压缩
gulp-less：解析 CSS 预编译器 LESS
gulp-postcss：转换前缀工具，和 gulp-autoprefixer 搭配使用
jest：单元测试
less：CSS 预编译器
markdown-it-container：Markdown 解析器
postcss-pxtorem：可选 转换 rem 单位
prettier：格式化规范
rollup：自动化打包工具
rollup-plugin-terser：rollup 压缩
rollup-plugin-typescript2：rollup 解析 TS
rollup-plugin-vue：rollup 解析 Vue
ts-jest：单元测试解析 TS
typescript：JS 类型的超集，强类型
vite：自动化构建工具
vite-plugin-vuedoc：Vite 解析 Markdown
vue-jest：单元测试解析 Vue
vue-tsc：Vue 文件生成 .d.ts 类型文件
*/
