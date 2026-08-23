<!--
 * @Author: matiastang
 * @Date: 2022-03-31 15:28:39
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23
 * @FilePath: /pinia-persisted-state/src/views/index.vue
 * @Description: 插件功能演示页面
-->
<template>
    <div class="demo-page">
        <h1>matias-pinia-persisted-state 演示</h1>
        <p class="tip">
            修改任意数据后，可在浏览器 DevTools → Application → Local Storage 中查看
            <code>{{ persistedConfig.key }}</code> 的实时变化；<b>刷新页面（F5）可验证数据恢复</b>。
        </p>

        <!-- State 修改测试 -->
        <section class="card">
            <h2>1. State 持久化</h2>
            <p class="desc">普通 state 的修改会实时写入本地存储，刷新页面后恢复。</p>
            <div class="row">
                <label>test.data</label>
                <input data-testid="input-test-data" v-model="testData" @change="refreshStorage" />
            </div>
            <div class="row">
                <label>user.name</label>
                <input data-testid="input-user-name" v-model="userName" @change="refreshStorage" />
            </div>
            <div class="row">
                <label>user.age</label>
                <input data-testid="input-user-age" v-model="userAge" @change="refreshStorage" />
            </div>
            <div class="row buttons">
                <button data-testid="btn-setname" @click="onSetName">
                    action: setName('matias-action')
                </button>
                <button data-testid="btn-patch" @click="onPatch">$patch 批量修改</button>
                <button data-testid="btn-reset" @click="onReset">user.$reset() 重置</button>
            </div>
        </section>

        <!-- Custom properties 测试 -->
        <section class="card">
            <h2>2. Custom Properties 缓存</h2>
            <p class="desc">
                通过插件注入的自定义属性（非 state 成员）缓存于
                <code>{{ persistedConfig.customKey }}</code> 子键，跨 store 全局共享。
                （默认过滤 <code>$</code>/<code>_</code>/<code>set</code> 前缀属性）
            </p>
            <p class="desc warn">
                注意：custom properties 的修改<b>不直接触发存储写入</b>（pinia 订阅只监听
                state 变化），将在<b>下一次任意 state 变更</b>时一并写入——修改后可到第 1
                面板随便改一个 state，再到第 5 面板观察存储更新。
            </p>
            <div class="row">
                <label>userId（全局）</label>
                <input data-testid="input-user-id" v-model="userId" @change="onUserIdChange" />
            </div>
            <div class="row">
                <label>simpleNumber（全局）= {{ userStore.simpleNumber }}</label>
                <button data-testid="btn-simple-number" @click="onSimpleNumberIncrease">
                    simpleNumber + 1
                </button>
            </div>
            <p class="desc">
                userStore.userId = <code>{{ userStore.userId }}</code> ·
                testStore.userId = <code>{{ testStore.userId }}</code>（两 store 同值）
            </p>
        </section>

        <!-- 共有 state properties 测试 -->
        <section class="card">
            <h2>3. State Properties（共有属性）</h2>
            <p class="desc">
                <code>hello</code> 由自定义插件以同一个 ref 注入所有 store，一处修改处处同步。
            </p>
            <div class="row">
                <label>hello</label>
                <input data-testid="input-hello" v-model="hello" @change="refreshStorage" />
            </div>
            <p class="desc">
                userStore.hello = <code>{{ userStore.$state.hello }}</code> ·
                testStore.hello = <code>{{ testStore.$state.hello }}</code>
            </p>
        </section>

        <!-- Store 状态实时视图 -->
        <section class="card">
            <h2>4. Store 状态实时视图</h2>
            <div class="columns">
                <pre data-testid="user-state-view">user: {{ JSON.stringify(userStore.$state, null, 2) }}</pre>
                <pre data-testid="test-state-view">test: {{ JSON.stringify(testStore.$state, null, 2) }}</pre>
            </div>
        </section>

        <!-- 存储数据查看与边界操作 -->
        <section class="card">
            <h2>5. 本地存储实况与边界测试</h2>
            <pre data-testid="storage-view" class="storage">{{ storageText }}</pre>
            <div class="row buttons">
                <button data-testid="btn-clear-storage" @click="onClearStorage">
                    清空存储（下次变更时重建）
                </button>
                <button data-testid="btn-corrupt-storage" @click="onCorruptStorage">
                    写入非法 JSON（刷新后自愈）
                </button>
                <button data-testid="btn-refresh-view" @click="refreshStorage">刷新视图</button>
            </div>
            <p v-if="message" data-testid="action-message" class="message">{{ message }}</p>
        </section>
    </div>
</template>
<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
import { useAuthUserStore } from '@/pinia/useAuthUserStore'
import { useTestStore } from '@/pinia/useTest'
import { persistedConfig } from '@/plugin/index'

const userStore = useAuthUserStore()
const testStore = useTestStore()

// 与store双向绑定的本地输入
const testData = ref(testStore.$state.data)
const userName = ref(userStore.$state.name)
const userAge = ref(userStore.$state.age)
const userId = ref(userStore.userId)
const hello = ref(userStore.$state.hello)

// 本地存储实时内容
const storageText = ref('')
// 操作提示信息
const message = ref('')

watch(testData, (value) => {
    testStore.$state.data = value
})
watch(userName, (value) => {
    userStore.$state.name = value
})
watch(userAge, (value) => {
    userStore.$state.age = value
})
watch(userId, (value) => {
    // custom properties跨store共享，改一个即全部生效
    userStore.userId = value
})
watch(hello, (value) => {
    userStore.$state.hello = value
})

// state变化后刷新存储视图
watch(
    () => [userStore.$state, testStore.$state],
    () => {
        refreshStorage()
    },
    { deep: true }
)

const onSetName = () => {
    userStore.setName('matias-action')
    userName.value = userStore.$state.name
    showMessage(`action setName 执行完成`)
}

const onPatch = () => {
    userStore.$patch({ name: 'patched-name', age: 'patched-age' })
    userName.value = userStore.$state.name
    userAge.value = userStore.$state.age
    showMessage('$patch 批量修改完成')
}

const onReset = () => {
    userStore.$reset()
    userName.value = userStore.$state.name
    userAge.value = userStore.$state.age
    showMessage('user store 已重置为初始 state')
}

const onUserIdChange = () => {
    showMessage('custom properties 已更新到 store（两 store 同步）；待下一次 state 变更时写入存储')
}

const onSimpleNumberIncrease = () => {
    userStore.simpleNumber += 1
    showMessage(
        `simpleNumber = ${userStore.simpleNumber}（store 已更新；待下一次 state 变更时写入存储）`
    )
}

const onClearStorage = () => {
    localStorage.removeItem(persistedConfig.key)
    refreshStorage()
    showMessage('存储已清空，修改任意 state 可观察自动重建')
}

const onCorruptStorage = () => {
    localStorage.setItem(persistedConfig.key, '{corrupted-json')
    refreshStorage()
    showMessage('已写入非法 JSON，刷新页面可观察插件自愈（以初始值重建）')
}

const showMessage = (text: string) => {
    message.value = text
    refreshStorage()
}

const refreshStorage = () => {
    const raw = localStorage.getItem(persistedConfig.key)
    if (raw === null) {
        storageText.value = '（空）'
        return
    }
    try {
        storageText.value = JSON.stringify(JSON.parse(raw), null, 2)
    } catch (error) {
        storageText.value = `（非法 JSON）${raw}`
    }
}

onMounted(() => {
    refreshStorage()
})
</script>
<style scoped>
.demo-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 16px;
    font-size: 14px;
}
.tip {
    color: #666;
}
.card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 16px;
    background: #fff;
}
.card h2 {
    font-size: 16px;
    margin: 0 0 8px;
}
.desc {
    color: #666;
    margin: 4px 0;
}
.row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0;
}
.row label {
    min-width: 180px;
    color: #333;
}
.row input {
    flex: 1;
    padding: 4px 8px;
}
.buttons button {
    margin-right: 8px;
    padding: 4px 12px;
    cursor: pointer;
}
.columns {
    display: flex;
    gap: 12px;
}
.columns pre {
    flex: 1;
    background: #f7f7f7;
    padding: 8px;
    border-radius: 4px;
    overflow: auto;
}
.storage {
    background: #f7f7f7;
    padding: 8px;
    border-radius: 4px;
    overflow: auto;
    max-height: 260px;
}
.message {
    color: #d65928;
    margin: 8px 0 0;
}
.warn {
    color: #b8860b;
}
code {
    background: #f0f0f0;
    padding: 1px 4px;
    border-radius: 3px;
}
</style>
