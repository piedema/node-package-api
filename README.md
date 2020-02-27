node-package-api
========================
*a nodejs module for loading nodejs/js packages or modules in a separate process* with full support for Linux, Mac and Windows.

**Security**
Do not expose this package to the web without any security to prevent unauthorised access to your system.

----
#### Contents

1. [Installation](#installation)
2. [Config](#config)
3. [Instantiate](#instantiate)
4. [node-package-api properties](#properties)
5. [Functions](#functions)
  1. [new](#new)
  2. [get](#get)
  3. [destroy](#destroy)
  4. [isSpaceDestroyed](#isSpaceDestroyed)
  5. [resetIdle](#resetIdle)
6. [Examples](#examples)

----
#### Installation
```js
npm install node-ipc --save
```

#### Config
```json
{
  "idleTimeout":3600000,
  "paths":false
}
```

#### Instantiate
```js
const config = require('./config');
const npa = require('./node-package-api')(config);
```

#### node-package-api properties
1. The success parameter returns true if package and function is found






























































### node-package-api
node-package-api lets you cerate separate processes and run packages inside them.

### Supports
NPM packages which export objects and functions and use callbacks, returns and promises.
Also support your custom packages/modules.
Supports packages containing websockets. The first callback contains the data returned from
opening the websocket, following callbacks contain websocket data.

### Installation
```
npm install node-package-api --save
```

### Getting started
If config is omitted default values will be used
```js
const config = require('./config')
const npa = require('node-package-api')();
```

### Config

```json
{
  "idleTimeout":3600000,
  "paths":false
}
```

### Load package/module in node-package-api
1: Example
```js
npa.new('path', [], (req, status, res) => {
  console.log(req, status, res)
})

npa.new('node-binance-api', [], (req, status, res) => {
  console.log(req, status, res)
})
```

ii: Parameters
```
package: name of the package to load
parameters: parameters to pass to the package on instantiation if package is function
callback: callback to execute if package is loaded
```

### Call function in package
i: Example
```js
// normal function example
npa.get('path', 'dirname', [__dirname], false, (req, status, res) => {
  console.log(req, status, res)
})

// nested websocket example
npa.get('node-binance-api', 'websockets.miniTicker', ['callback'], false, (req, status, res) => {
  console.log(req, status, res)
})
```

ii: Parameters
```
package: name of the package to load
function: name of the function to execute. nested function are separated by a '.', ie websockets.miniTicker
parameters: parameters to pass to the function on execution, must be array, with parameters separated by ','. For a callback, put 'callback' in the parameters
promise: true if called package function returns promise
cb: callback to execute if package is loaded
```

### destroy

### isSpaceDestroyed

### resetIdle
