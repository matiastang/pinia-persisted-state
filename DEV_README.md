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
    "ts:build": "tsc --build src/plugin/tsconfig.json",
    "build": "vite --config vite.build.config.ts build --mode production",
    "cp:types": "cp -r src/plugin/types dist/",
    "cp:type": "cp src/plugin/types/index.d.ts dist",
    "plugin:build": "pnpm run ts:build && pnpm run build && pnpm run cp:types",
    "push:npm:package": "npm version patch && npm publish",
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
* `typescript`使用`ts`
* `@vitejs/plugin-vue`解析`.vue`文件
* `vite-plugin-compression`使用`GZIP`压缩
* `rollup-plugin-terser`代码压缩，依赖`rollup`
* `tslib`、`@types/node`
