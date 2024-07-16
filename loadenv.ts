/*
 * @Author: matiastang
 * @Date: 2021-12-24 13:46:01
 * @LastEditors: matiastang
 * @LastEditTime: 2024-07-16 17:49:50
 * @FilePath: /matias-pinia-persisted-state/loadenv.ts
 * @Description: 读取配置文件
 */
import { existsSync, readFileSync } from 'fs'

/** 读取环境变量文件 */
function getEnvConfig() {
    process.env.VITE_APP_BUILD_TIME = `${Date.now()}`
    const path = existsSync('.env.local') ? '.env.local' : '.env' // 判断根目录中是否存在 local 文件并优先使用
    const content = readFileSync(path, 'utf-8')
    return parse(content)
}

/** 解析环境变量内容 */
function parse(string: string) {
    const obj: Record<string, string> = {}
    const regExp = '(\\S+)\\s*=\\s*(\\S+)' // 通过正则匹配符合 `A=b` 的结构。如果需要处理带引号的参数，可以优化正则为 `'(\\S+)\\s*=\\s*"(\\S+)"'` 适配双引号，单引号同理
    const list = string.match(new RegExp(regExp, 'g'))
    // 去除空格并组合为键值对
    list &&
        list.forEach((item) => {
            const data = item.match(new RegExp(regExp))
            const key = data ? data[1].trim() : undefined
            const value = data ? data[2].trim() : undefined
            key && (obj[key] = value || '')
        })
    return obj
}

export default getEnvConfig()
