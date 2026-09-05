/*
 * @Description: 测试启动helper——模拟一次应用启动
 */
import { createApp, defineComponent } from 'vue'
import { createPinia, setActivePinia, type Pinia, type PiniaPluginContext } from 'pinia'

/**
 * 创建挂载了指定插件的pinia并安装到最小Vue app。
 *
 * 注意：pinia 2.1.7中`pinia.use()`在未安装app时（`!pinia._a`）插件只会进入
 * `toBeInstalled`延迟队列，必须经过`app.use(pinia)`（install）才会真正注册、
 * 在store创建时被调用。因此测试必须模拟完整的应用安装路径，与生产环境一致。
 */
export function bootApp(
    ...plugins: Array<(context: PiniaPluginContext) => void>
): Pinia {
    const pinia = createPinia()
    plugins.forEach((plugin) => pinia.use(plugin))
    const app = createApp(defineComponent({ render: () => null }))
    app.use(pinia)
    setActivePinia(pinia)
    return pinia
}
