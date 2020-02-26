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

### Load package/module in node-package-api
i: Example
```js
npa.new('path', [], (req, status, res) => {
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
npa.get('path', 'dirname', [__dirname], false, (req, status, res) => {
  console.log(req, status, res)
})
```

ii: Parameters
```
package: name of the package to load
function: name of the function to execute. nested function are separated bij a '.', ie websockets.miniTicker
parameters: parameters to pass to the function on execution, must bearray, with parameters separated bij ','. For a callback, put 'callback' in the parameters
promise: true if called package function returns promise
cb: callback to execute if package is loaded
```

### destroy

### isSpaceDestroyed

### resetIdle
