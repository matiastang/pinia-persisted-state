<!--
 * @Author: matiastang
 * @Date: 2022-03-31 15:28:39
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-17 10:23:49
 * @FilePath: /matias-pinia-persisted-state/src/views/index.vue
 * @Description: 框架测试
-->
<template>
    <div>{{ `testInputText=${testInputText}` }}</div>
    <input v-model="testInputText" @change="inputChange" />
    <div>{{ `inputText=${userInputText}` }}</div>
    <input v-model="userInputText" @change="inputChange" />
</template>
<script setup lang="ts">
import { watch, ref } from 'vue'
import { useAuthUserStore } from '@/pinia/useAuthUserStore'
import { useTestStore } from '@/pinia/useTest'

const userStore = useAuthUserStore()
const testStore = useTestStore()
console.log(
    userStore.simpleNumber,
    userStore.userId,
    userStore.$state.hello,
    testStore.simpleNumber,
    testStore.userId,
    testStore.$state.hello
)

userStore.userId = '001'
userStore.simpleNumber = 99
// userStore.$state.hello = 'hello user'

testStore.userId = '002'
testStore.simpleNumber = 100
// testStore.$state.hello = 'hello test'

const testInputText = ref(testStore.$state.data)
watch(
    () => testInputText.value,
    (newValue, oldValue) => {
        console.log(newValue)
        testStore.$state.data = newValue
    }
)

const userInputText = ref(userStore.$state.name)
watch(
    () => userInputText.value,
    (newValue, oldValue) => {
        console.log(newValue)
        userStore.$state.name = newValue
    }
)
const inputChange = (payload: Event) => {
    console.log(payload)
}
</script>
