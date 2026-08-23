/*
 * @Author: your name
 * @Date: 2021-10-15 17:10:16
 * @LastEditTime: 2022-11-17 10:24:06
 * @LastEditors: matiastang
 * @Description: In User Settings Edit
 * @FilePath: /pinia-persisted-state/src/main.ts
 */
import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
// pinia状态管理
import { createPinia } from 'pinia'
import '@/pinia/customProperties'
import '@/pinia/stateProperties'
import { myPiniaPlugin } from '@/pinia/plugin'
import { createPersistedState, piniaPersistedState, persistedConfig } from '@/plugin/index'
// import { createPersistedState } from 'pinia-persisted-state'

const app = createApp(App)

// pinia
const pinia = createPinia()

// 便捷使用
pinia.use(piniaPersistedState)
// 带配置使用
// pinia.use(
//     createPersistedState({
//         key: 'pinia-key',
//     })
// )
// 查看配置、
console.log(persistedConfig)
pinia.use(myPiniaPlugin)

app.use(pinia)

// 路由
app.use(router)
// 挂载
app.mount('#app')
console.info(`当前Vue版本为${app.version}`)
