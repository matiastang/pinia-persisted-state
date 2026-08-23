/*
 * @Author: matiastang
 * @Date: 2022-01-04 17:38:54
 * @LastEditors: matiastang
 * @LastEditTime: 2022-04-06 19:40:15
 * @FilePath: /pinia-persisted-state/shims-vue.d.ts
 * @Description: vue全局类型声明
 */
/* eslint-disable */
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}
