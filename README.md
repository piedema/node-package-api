node-package-api
========================
*a nodejs module for loading nodejs/js packages or modules in a separate process* with full support for Linux, Mac and Windows.

> **Security** Do not expose this package to the web without any security to prevent unauthorised access to your system.

----

## Contents

1. [Installation](#installation)
2. [Config](#config)
3. [Instantiate](#instantiate)
4. [Tips](#tips)
5. [Functions](#functions)
    1. [add](#add)
    2. [call](#call)
    3. [destroy](#destroy)
    4. [build](#build)
    5. [isKilled](#isKilled)
    6. [resetInactivity](#resetInactivity)

----

## Installation
```js
npm install node-package-api
```

---

## Config
```js
  {
    "inactivityTimeout"     :     3600000,
    "paths"                 :     false
  }
```

|   variable   |  type  | default value | documentation
|--------------|--------|---------------|---------------
| inactivityTimeout  | Number | 3600000       | Timeout for destroying space after no request is recieved
| paths        | Array  | module.paths  | Array with strings where to look for installed packages

---

## Instantiate
```js
const config = require('./config');
const npa = require('./node-package-api')(config);
```

---

## Tips
1. The success parameter returns true if package and function is found and executed, not if the function itself returns an error or response.
2. Only one space per node-package-api can be build.
3. Multiple packages can be loaded per space/node-package-api.
4. Packages must be installed on your system in a path specified in module.paths or config.paths.
5. Websockets in packages can be used. On first callback the result of opening the websocket is returned. Subsequent calls return the websocket data.
6. Nested functions can be called by using a dot, like "websockets.websocketfunction".
7. Any place where you want to insert a callback in a functions parameters, just add 'callback' in de parameters array, like ['param1', 'param2', 'callback', 'param3', 'callback'].
8. A space is the forked childprocess.
9. Communicating with the childprocess is async, so make sure to wait for the package to be added before calling functions on it.

---

## Functions

> **add** *adds specified package to the space (childprocess)*

`npa.add(package, parameters, callback);`

```js
npa.add('path', [], (req, status, res) => {
    console.log('request:', req);
    console.log('status: ', status);
    console.log('response:', res);
});
```

<details>
 <summary>View Response</summary>

```js 		 
request: { id: 472930,
  package: 'path',
  parameters: [],
  type: 'add',
  paths:
   [ 'E:\\Projects\\Coding\\GitHub\\node-package-api\\node_modules',
     'E:\\Projects\\Coding\\GitHub\\node_modules',
     'E:\\Projects\\Coding\\node_modules',
     'E:\\Projects\\node_modules',
     'E:\\node_modules' ] }
status:  true
response: Package is added to space
```
</details>

|   variable   |  type    | default | required |documentation
|--------------|----------|---------|----------|---------------
| package      | String   |         | yes      | Name of package which should be added to space
| parameters   | Array    | []      | no       | Array where every index represents a parameter needed when instantiating the package.
| callback     | function | null    | no       | Callback function which will be called when the package is instantiated
---

> **call** *calls a function on the specified package*

`npa.call(package, function, parameters, promise, callback);`

```js
npa.call('path', 'dirname', [__dirname], false, (req, status, res) => {
    console.log('request:', req);
    console.log('status: ', status);
    console.log('response:', res);
});
```

<details>
 <summary>View Response</summary>

```js 		 
request: { id: 238795,
  package: 'path',
  parameters: [ 'E:\\Projects\\Coding\\GitHub\\node-package-api' ],
  type: 'call',
  function: 'dirname',
  promise: false }
status:  true
response: E:\Projects\Coding\GitHub
```
</details>

|   variable   |  type    | default | required |documentation
|--------------|----------|---------|----------|---------------
| package      | String   |         | yes      | Package in space to call function on
| function     | String   |         | yes      | Function to call on specified package
| parameters   | Array    | []      | no       | Array where every index represents a parameter needed when calling a package's function
| promise      | Boolean  | false   | no       | Pass true if package's function returns a promise
| callback     | function | null    | no       | Callback function which will be called the functions result is returned from the space. This is not the callback for package's function itself.

If the packacge's function has callback(s), you need to insert them in the parameters array, like following example. The 'callback strings' are automatically converted to a callback with (error, response) as parameters.
```js

// EXAMPLE

  let parameters = [
    'parameter1',
    'parameter2',
    'callback'
  ]
  
  // OR

  let parameters = [
    'test_parameter_1',
    'test_parameter_2',
    'callback',
    'test_parameter_3',
    'callback'
  ]
```
---

> **destroy** *Destroys space/childprocess and thus all containing packages won't be available anymore*

`npa.destroy();`

```js
let destroyed = npa.destroy();
console.log(destroy);
```

<details>
 <summary>View Response</summary>

```js 		 
ChildProcess {
  _events:
   [Object: null prototype] { internalMessage: [Function], message: [Function] },
  _eventsCount: 2,
  _maxListeners: undefined,
  _closesNeeded: 2,
  _closesGot: 0,
  connected: true,
  signalCode: null,
  exitCode: null,
  killed: true,
  spawnfile: 'C:\\Program Files\\nodejs\\node.exe',
  _handle:
   Process { onexit: [Function], pid: 15440, [Symbol(owner)]: [Circular] },
  spawnargs: [ 'C:\\Program Files\\nodejs\\node.exe', './space.js' ],
  pid: 15440,
  stdin: null,
  stdout: null,
  stderr: null,
  stdio: [ null, null, null, null ],
  channel:
   Pipe {
     buffering: false,
     pendingHandle: null,
     onread: [Function],
     sockets: { got: {}, send: {} } },
  _channel: [Getter/Setter],
  _handleQueue: null,
  _pendingMessage: null,
  send: [Function],
  _send: [Function],
  disconnect: [Function],
  _disconnect: [Function] }
```
</details>

---

> **build** *creates new space/childprocess. Only when space is destroyed before (so there is no existing space yet)*

`npa.build();`

```js
let build = npa.build();
console.log(build);
```

<details>
 <summary>View Response</summary>

```js
ChildProcess {
_events:
 [Object: null prototype] { internalMessage: [Function], message: [Function] },
_eventsCount: 2,
_maxListeners: undefined,
_closesNeeded: 2,
_closesGot: 0,
connected: true,
signalCode: null,
exitCode: null,
killed: false,
spawnfile: 'C:\\Program Files\\nodejs\\node.exe',
_handle:
 Process { onexit: [Function], pid: 8388, [Symbol(owner)]: [Circular] },
spawnargs: [ 'C:\\Program Files\\nodejs\\node.exe', './space.js' ],
pid: 8388,
stdin: null,
stdout: null,
stderr: null,
stdio: [ null, null, null, null ],
channel:
 Pipe {
   buffering: false,
   pendingHandle: null,
   onread: [Function],
   sockets: { got: {}, send: {} } },
_channel: [Getter/Setter],
_handleQueue: null,
_pendingMessage: null,
send: [Function],
_send: [Function],
disconnect: [Function],
_disconnect: [Function] }
```
</details>

---

> **isKilled** *see if space is killed*

`npa.isKilled();`

```js
let isKilled = npa.isKilled();
console.log(isKilled);
```

<details>
 <summary>View Response</summary>

```js 		 
false
```
</details>

---

> **resetInactivity** *reset inactivity timer to prevent killing of space after inactivity*

`npa.resetInactivity();`

```js
let resetInactivity = npa.resetInactivity();
console.log(resetInactivity);
```

<details>
 <summary>View Response</summary>

```js
Timeout {
  _idleTimeout: 3600000,
  _idlePrev: [TimersList],
  _idleNext: [TimersList],
  _idleStart: 5081,
  _onTimeout: [Function],
  _timerArgs: undefined,
  _repeat: null,
  _destroyed: false,
  [Symbol(refed)]: true,
  [Symbol(asyncId)]: 30,
  [Symbol(triggerId)]: 10 }
```
</details>
