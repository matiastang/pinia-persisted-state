/*
 * @Author: matiastang
 * @Date: 2021-12-28 19:31:46
 * @LastEditors: matiastang
 * @LastEditTime: 2024-07-16 17:52:43
 * @FilePath: /pinia-persisted-state/src/router/index.ts
 * @Description: 路由
 */
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
// web
import Index from '@/views/index.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'index',
        component: Index,
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        redirect: '/',
    },
]
/**
 * 创建Router
 */
const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
