### 前端架构之babel(一)之基础认识


#### babel是一个javascript编译器。通过babel你可以使用下一代的Javascript，以及下一代的Javascript工具。

babel可以为你做的以下的事情：

- 语法转换：babel通过语法转换器来支持新版本的Javascript语法。

- 增加垫片：通过polyfill方式在目标环境中添加缺失的特性（通过[@babel/polyfill](https://babeljs.io/docs/en/babel-polyfill)）

- js代码转换

  

#### 一、安装babel

```bash
npm install --save-dev @babel/core @babel/cli @babel/preset-env
npm install --save @babel/polyfill
```

[@babel/core](https://babeljs.io/docs/en/babel-core): babel的核心模块，可以在js代码里直接引用，以编程的方式使用babel。

[@babel/cli](https://babeljs.io/docs/en/babel-cli)：babel的CLI，在命令行中运行babel。

[@babel/preset-env](https://www.babeljs.cn/docs/babel-preset-env)： 一个智能的预设（plugin的集合）允许你用最新的j s语法并且不需要开发者自己管理目标环境的语法转换。

[@babel/polyfill](https://babeljs.io/docs/en/babel-polyfill)：运行时代码填充，这样开发者就可以使用Promise、WeakMap、Array.from、Object.assign等。@babel/polyfill需要结合[@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env)和[useBuiltIns options](https://babeljs.io/docs/en/babel-preset-env#usebuiltins)一起使用。



#### 二、[babel配置](https://babeljs.io/docs/en/configuration)

babel有两种文件配置方式，可以一起使用也可以单独配置。

- 项目范围的配置（**官方推荐使用**）
  
  - **babel.config.***
- 文件关联的配置
  - **.babelrc.***
  
  - **package.json**设置key值**babel**
  
    

babel可以配置的信息如下：

- [plugins](https://babeljs.io/docs/en/plugins) - 插件
- [presets](https://babeljs.io/docs/en/presets) - 预设（也就是一组插件）

> plugins或presets的执行顺序很重要。
>
> - plugin在preset之前执行
> - plugin的执行顺序是从前往后（从左往右）
> - preset的执行顺序是从后往前（从右往左）

```json
{
  plugins: []
  presets: []
}
```

Babel也可以基于环境来配置。

```json
{
  "env": {
    "development": {
      plugins: [],
      presets:[]
    },
    "production": {
      plugins: [],
      presets: []
    }
  }
}
```



#### 三、执行babel生成的代码

​	babel配置了plugins、presets几乎可以编译所有的新的Javascript语法，但这还不算完。一些APIs不是所有Javascript环境都支持，比如：Array.from、Promise等。

​	为了解决这个问题，我们使用[polyfill（代码填充、兼容性布丁）](https://remysharp.com/2010/10/08/what-is-a-polyfill)。polyfill就是在当前运行环境中用来复制尚不存在的原生api的代码。能够提前使用还不存在的APIs。

##### 怎么使用polyfill？

> 🚨 As of Babel 7.4.0, this package has been deprecated in favor of directly including `core-js/stable` (to polyfill ECMAScript features) and `regenerator-runtime/runtime` (needed to use transpiled generator functions):

在前面基础上需要额外安装：

```shell
npm install core-js@3 --save
```

.babelrc

```json
{
    "presets": [
        ["@babel/preset-env", {
            "corejs": 3,
          	/**
          	* usage：自动代码填充，按需引入API
          	* entry： 需要手动引入"core-js/stable"、"regenerator-runtime/runtime"
          	* false：不代码填充
          	**/
            "useBuiltIns": "usage" 
        }]
    ]
}
```

#### 四、自定义预设（preset）

手动指定插件？插件选项？环境特定设置？所有这些配置都会在你的项目里产生大量重复工作。

可以自定义符合你需求的预设，减少重复的工作。

##### 1、发布到npm上

首先，创建一个package.json。

```json
{
	"name": "babel-preset-my-preset",
  "version": "1.0.0",
  "author": "Candice",
  "dependencies": {
    "core-js": "^3.6.5",
    "@babel/preset-env": "^7.11.5",
    "@babel/plugin-transform-runtime": "^7.11.5",
  }
}
```

然后创建index.js 文件用于导出.babelrc的内容，使用对应的require调用来替换plugins/presets字符串。

```javascript
module.exports = {
  {
    "presets": [
        ["@babel/preset-env", {
            "corejs": 3,
            "useBuiltIns": "usage"
        }]
    ],
    "plugins": [
        "@babel/transform-runtime"
    ]
	}
}
```

然后发布npm，发布成功之后就可以像其他预设一样来使用你的预设了。

##### 2、以文件夹形式自定义预设

首先，创建一个presets文件夹，新增index.js文件。

```javascript
module.exports = function (api) {
    const presets = [ 
        ["@babel/preset-env", {
            "corejs": 3,
            "useBuiltIns": "usage"
        }]
     ];
    const plugins = [
        "@babel/transform-runtime"
    ];
    return {
      presets,
      plugins
    };
}
```

然后，.babelr以文件引入的方式来使用你的预设。

```javascript
{
    "presets": [
        "./presets/index.js"
    ]
}
```



#### 五、自定义插件（plugin）

我们在之前eslint的课程中，[写过一个例子](https://blog.csdn.net/sinat_34798463/article/details/107962489)，修改变量值“XXX”为“Candice”。

自定义插件需要有一些抽象语法树（AST）的相关知识，通过[ESTree](https://github.com/estree/estree)查看节点定义、[AST Explorer](https://astexplorer.net/)对语法树有个认识。现有了这些基础知识，我们再来写一个插件吧。

首先，新建一个plugins/index.js

```javascript
module.exports = function({types}) {
    return {
        visitor: {
            /**
             * 
             * @param {*} path 是表示节点之间连接的对象
             * @param {*} state 状态，可以获取path、ast、metadata、code、opts、scope
             */
            StringLiteral(path, state) {
                if(path.node.value === 'XXX') {
                    path.replaceWith(types.stringLiteral(state.opts.name));
                }
            }
        }
    }
}
```

.babelrc

```json
{
  "plugins": [
        ["./plugins/index.js",
         {
            "name": "Candice"
         }
        ]
        
    ]
}
```

新建一个待编译的文件 /src/index.js

```javascript
let name = 'XXX'
```

然后执行

```shell
npx babel ./src/index.js --out-file ./dist/compiled.js
```

打开dist目录的compiled.js看一看 "XXX"是不是改为"Candice"咯！

最后的最后，babel相关代码见[babel-project](https://github.com/Candice0718/babel-project)。

