/*
 * @Author: matiastang
 * @Date: 2022-02-09 17:17:20
 * @LastEditors: matiastang
 * @LastEditTime: 2024-07-16 18:28:21
 * @FilePath: /matias-pinia-persisted-state/src/plugin/index.ts
 * @Description: pinia状态本地存储插件
 */
import type { PiniaPluginContext, PiniaCustomStateProperties, StateTree } from 'pinia'
import { localStorageRead, localStorageWrite } from 'matias-storage'

const NPMLINK = 'https://www.npmjs.com/package/matias-pinia-persisted-state'
const PINIA_STORAGE_KEY = 'pinia-key'
const PINIA_STORAGE_CUSTOM_KEY = 'pinia-custom-key'

/**
 * 需要对MapStoresCustomization类型进行扩展，不然将报错
 * Property 'suffix' does not exist on type 'MapStoresCustomization'.
 * [Id in `${Ids}${MapStoresCustomization extends Record<'suffix', string> ? MapStoresCustomization['suffix'] : 'Store'}`]: () => Store<Id extends `${infer RealId}${MapStoresCustomization extends Record<'suffix', string> ? MapStoresCustomization['suffix'] : 'Store'}` ? RealId : string, State, Getters, Actions>;
 */
declare module 'pinia' {
    export interface MapStoresCustomization {
        suffix: string
    }
}

/**
 * 状态持久化config类型
 */
interface PersistedStateConfig {
    /**
     * 保存pinia的key
     */
    key?: string
    /**
     * 保存pinia custom properties的key
     */
    customKey?: string
    /**
     * 获取custom properties key 的过滤函数
     */
    customFilterKey?: (key: string) => boolean
}

/**
 * custom properties 类型
 */
type CustomPropertiesType = {
    [key: string]: StateTree & PiniaCustomStateProperties<StateTree>
}

/**
 * 状态持久化config
 */
export let persistedConfig: PersistedStateConfig = {
    key: PINIA_STORAGE_KEY,
    customKey: PINIA_STORAGE_CUSTOM_KEY,
    customFilterKey: (key: string) => {
        return !key.startsWith('$') && !key.startsWith('_') && !key.startsWith('set')
    },
}

/**
 * 本地存储数据差异化检测，更新
 * @param state
 * @param key
 * @returns
 */
const _localStateDiff = (
    state: StateTree & PiniaCustomStateProperties<StateTree>,
    stateKey: string
) => {
    const persistedKey = persistedConfig.key
    const localState = localStorageRead<StateTree & PiniaCustomStateProperties<StateTree>>(
        persistedKey
    )
    if (localState === null) {
        // 初始化保存
        localStorageWrite(persistedKey, {
            [stateKey]: state,
        })
        return
    }
    const localNameState = localState[stateKey]
    if (localNameState === undefined) {
        localState[stateKey] = state
        // 差异保存
        localStorageWrite(persistedKey, localState)
        return
    }
    // 差异查找更新
    for (const key in state) {
        if (Object.prototype.hasOwnProperty.call(state, key)) {
            const element = state[key]
            if (Object.prototype.hasOwnProperty.call(localNameState, key)) {
                const localElement = localNameState[key]
                if (element !== localElement) {
                    state[key] = localElement
                }
            }
        }
    }
    localState[stateKey] = state
    // 差异保存
    localStorageWrite(persistedKey, localState)
}

/**
 * 获取custom properties
 * @param context
 * @returns
 */
const _contextCustomProperties = (context: PiniaPluginContext) => {
    const store = context.store
    const stateKeys = Object.keys(store.$state)
    const customKeys = Object.keys(store).filter((key) => {
        return persistedConfig.customFilterKey(key)
    })
    let customProperties = {} as CustomPropertiesType
    for (let i = 0; i < customKeys.length; i++) {
        const item = customKeys[i]
        if (!stateKeys.includes(item)) {
            if (Object.keys(customProperties).length <= 0) {
                customProperties = {
                    [item]: store[item],
                }
            } else {
                customProperties[item] = store[item]
            }
        }
    }
    return customProperties
}

/**
 * pinia state 本地存储
 * @param context pinia context
 */
export function piniaPersistedState(context: PiniaPluginContext) {
    /**
     * FIXME: - 不能检测到customProperties和stateProperties，在调用customProperties和stateProperties之前
     */
    const persistedKey = persistedConfig.key
    const customKey = persistedConfig.customKey
    const state = context.store.$state
    const stateKey = context.store.$id
    if (stateKey.trim() === '') {
        console.error('store id 不能为空，详情查看：', NPMLINK)
        return
    }
    // 初始化检测更新
    _localStateDiff(state, stateKey)
    context.store.$subscribe(
        () => {
            console.log('subscribe', stateKey)
            debugger
            const customProperties = _contextCustomProperties(context)
            const localState = localStorageRead<StateTree & PiniaCustomStateProperties<StateTree>>(
                persistedKey
            )
            if (localState === null) {
                // 初始化保存
                if (Object.keys(customProperties).length > 0) {
                    localStorageWrite(persistedKey, {
                        [customKey]: {
                            ...customProperties,
                        },
                        [stateKey]: state,
                    })
                } else {
                    localStorageWrite(persistedKey, {
                        [stateKey]: state,
                    })
                }
                return
            }
            const localCustom = localState[customKey]
            if (localCustom) {
                localState[customKey] = {
                    ...localCustom,
                    ...customProperties,
                }
            } else {
                localState[customKey] = {
                    ...customProperties,
                }
            }
            localState[stateKey] = state
            // 直接更新存储状态
            // FIXME: - 非状态更新也会调用，可能会有性能问题
            localStorageWrite(persistedKey, localState)
        },
        {
            detached: true,
        }
    )
}

/**
 * 带配置创建pinia state 本地存储
 * @param config
 * @returns
 */
export function createPersistedState(config?: PersistedStateConfig) {
    if (config) {
        persistedConfig = {
            ...persistedConfig,
            ...config,
        }
    }
    return piniaPersistedState
}

export default piniaPersistedState
