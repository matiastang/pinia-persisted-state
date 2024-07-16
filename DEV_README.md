<!--
 * @Author: matiastang
 * @Date: 2024-07-16 17:39:47
 * @LastEditors: matiastang
 * @LastEditTime: 2024-07-16 17:47:21
 * @FilePath: /matias-pinia-persisted-state/DEV_README.md
 * @Description: DEV_README
-->
# matias-pinia-persisted-state

`pinia`状态的本地持久化。

## 指令

```json
{
    "dev": "vite",
    "ts:build": "tsc --build src/storage/tsconfig.json",
    "build": "vite --config vite.build.config.ts build --mode production",
    "cp:types": "cp -r src/storage/types dist/",
    "cp:type": "cp src/storage/types/index.d.ts dist",
    "plugin:build": "pnpm run ts:build && pnpm run build && pnpm run cp:types",
    "push:npm:package": "gulp versionPatch && gulp npmPackagePush",
    "updata:package": "npm publish --registry https://registry.npmjs.org",
    "plugin:build:push:npm:package": "pnpm run plugin:build && pnpm run push:npm:package"
}
```

### 运行测试项目

```sh
$ pnpm run dev
```

### 使用符号链接调试

`node_modules`目录下执行链接
```sh
$ cd node_modules
$ ln -s ~/matias/MT/MTGithub/npm/mt-storage/dist matias-storage
```
**注意**`dist`的路径要更新为自己项目的路径，且`dist`要包含`package.json`文件。链接名称要和`package.json`中的一致。
**注意**如果使用`npm`或`yarn`则可以使用`npm link`或`yarn link`来调试。

### 发版/更新

#### 方式一

未设置二次验证，可如下发布：
```sh
$ pnpm run plugin:build:push:npm:package
```

#### 方式二

由于设置了二次验证，需要传入`TOTP`，所以不能使用上面的自动发布了。
* 打包
```sh
$ pnpm run plugin:build
```
* 切换到`npm`源。(如果就是`npm`源，则可以忽略)
```sh
$ nrm use npm
```
* 发布
```sh
$ npm publish --otp=******
```
* 切换回原来的源。(如果之前就是`npm`源，则可以忽略)
```sh
nrm use cnpmmirror
```

#### 方式三

打包流程是一样的，发布的时候使用如下命令发布，这样省去切换源的麻烦
```sh
$ npm publish --registry https://registry.npmjs.org --otp=******
```

## 依赖文件

### dependencies

* `pinia`全局状态
* `matias-storage`持久化

### devDependencies

* `vue`页面测试
* `vue-router`页面路由
* `vite`打包
* `less`、`less-loader`样式
* `typescript`使用`ts`
* `path`路径
* `@vitejs/plugin-vue`解析`.vue`文件
* `vite-plugin-compression`使用`GZIP`压缩
* `rollup-plugin-terser`代码压缩，依赖`rollup`
* `eslint`校验
* `@vue/eslint-config-prettier`、`eslint-plugin-prettier`、`@typescript-eslint/eslint-plugin`、`@typescript-eslint/parser`修复
* `ts-node`、`tslib`、`@types/node`


"@element-plus/icons": "^0.0.11",
        "@rollup/plugin-node-resolve": "^13.1.3",
        "@types/gulp": "^4.0.9",
        "@types/gulp-autoprefixer": "^0.0.33",
        "@types/gulp-bump": "^2.8.2",
        "@types/gulp-json-editor": "^2.2.33",
        "@types/gulp-sass": "^5.0.0",
        "@types/minimist": "^1.2.2",
        "@types/node": "^16.11.1",
        "@types/object-hash": "^2.2.1",
        "@types/sass": "^1.43.1",
        "@types/shelljs": "^0.8.10",
        "@typescript-eslint/eslint-plugin": "^5.0.0",
        "@typescript-eslint/parser": "^5.0.0",
        "@vitejs/plugin-vue": "^1.9.3",
        "@vitejs/plugin-vue-jsx": "^1.2.0",
        "@vue/cli-plugin-eslint": "^4.5.14",
        "@vue/cli-service": "^4.5.15",
        "@vue/compiler-sfc": "^3.2.26",
        "@vue/eslint-config-prettier": "^6.0.0",
        "@vue/eslint-config-typescript": "^8.0.0",
        "child_process": "^1.0.2",
        "del": "^6.0.0",
        "eslint": "^8.0.1",
        "eslint-plugin-prettier": "^4.0.0",
        "eslint-plugin-vue": "^7.19.1",
        "fast-glob": "^3.2.10",
        "fs": "^0.0.1-security",
        "gulp": "^4.0.2",
        "gulp-autoprefixer": "^8.0.0",
        "gulp-bump": "^3.2.0",
        "gulp-cssmin": "^0.2.0",
        "gulp-json-editor": "^2.5.6",
        "gulp-sass": "^5.1.0",
        "gulp-scss": "^1.4.0",
        "inquirer": "8.2.0",
        "less": "^4.1.2",
        "matias-pinia-persisted-state": "^0.1.7",
        "microbundle": "^0.14.2",
        "minimist": "^1.2.5",
        "object-hash": "^2.2.0",
        "ora": "5.4.0",
        "path": "^0.12.7",
        "prettier": "^2.4.1",
        "rollup": "^2.63.0",
        "rollup-plugin-terser": "^7.0.2",
        "rollup-plugin-typescript2": "^0.31.1",
        "rollup-plugin-vue": "^6.0.0",
        "sass": "^1.43.2",
        "sass-loader": "^12.2.0",
        "shelljs": "^0.8.4",
        "stylus": "^0.55.0",
        "swiper": "^7.2.0",
        "ts-md5": "^1.2.9",
        "ts-morph": "^13.0.2",
        "ts-node": "^10.4.0",
        "tslib": "^2.3.1",
        "typescript": "^4.5.4",
        "unplugin-element-plus": "^0.1.3",
        "unplugin-vue-components": "^0.17.2",
        "vite": "^2.6.7",
        "vite-plugin-compression": "^0.3.6",
        "vite-plugin-dts": "^0.9.7",
        "vite-plugin-imagemin": "^0.4.6",
        "vue": "^3.4.31",
        "vue-clipboard3": "^1.0.1",
        "vue-router": "^4.0.12",
        "vue-tsc": "^0.30.2",
        "vue3-json-view": "^1.3.2"