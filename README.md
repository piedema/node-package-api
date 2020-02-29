node-package-api
========================
*a nodejs module for loading nodejs/js packages or modules in a separate process* with full support for Linux, Mac and Windows.

**Security**
Do not expose this package to the web without any security to prevent unauthorised access to your system.

----

## contents

1. [Installation](#installation)
2. [Config](#config)
3. [Instantiate](#instantiate)
4. [Properties](#properties)
5. [Functions](#functions)
    1. [add](#add)
    2. [call](#call)
    3. [destroy](#destroy)
    4. [build](#build)
    5. [isKilled](#isKilled)
    6. [resetInactivity](#resetInactivity)
6. [Examples](#examples)

----

## Installation
```js
npm install node-package-api --save
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

## Properties
1. The success parameter returns true if package and function is found and executed, not if the function itself returns an error or response.
2. Only one space per node-package-api can be build.
3. Multiple packages can be initiated per space/node-package-api.
4. Packages must be installed on your system and in paths in module.paths or config.paths
5. Websockets can be used. On first callback call the result of the websocket is returned. Subsequent calls return the websocket data.
6. Nested functions can be called by using '.'.
7. Any place where you want to insert a callback in a functions parameters, just add 'callback' in de parameters array.
8. A space is the forked childprocess.

---

## Functions
The following methods are available

-------

## add
Adds specified package to the space (childprocess)

`npa.add(package, parameters, callback);`

```js
  npa.add('path', [], (req, status, res) => {
    console.log(req, status, res);
  });
```

|   variable   |  type    | default | required |documentation
|--------------|----------|---------|----------|---------------
| package      | String   |         | yes      | Name of package which should be added to space
| parameters   | Array    | []      | no       | Array where every index represents a parameter needed when instantiating the package.
| callback     | function | null    | no       | Callback function which will be called when the package is instantiated

---

## call
Calls a function on the specified package

`npa.get(package, function, parameters, promise, callback);`

```js
  npa.call('path', 'dirname', [__dirname], (req, status, res) => {
    console.log(req, status, res);
  });
```

|   variable   |  type    | default | required |documentation
|--------------|----------|---------|----------|---------------
| package      | String   |         | yes      | Timeout for destroying space after no request is recieved
| parameters   | Array    | []      | no       | Array where every index represents a parameter needed when calling a package's function
| promise      | Boolean  | false   | no       | Pass true if package's function returns a promise
| callback     | function | null    | no       | Callback function which will be called the functions result is returned from the space. This is not the callback for package's function itself.

If the packacge's function has callback(s), you need to insert them in the parameters array, like following example. The 'callback strings' are automatically converted to a callback with (error, response) as parameters.
```js
  let parameters = [
    'test_parameter_1',
    'test_parameter_2',
    'callback',
    'test_parameter_3',
    'callback'
  ]
```

---

## destroy
Destroys space and thus kills childprocess

`npa.destroy();`

```js
  let destroyed = npa.destroy();
  console.log(destroy);
```

---

## build
Creates new space and childprocess. Only when space is destroyed before

`npa.build();`

```js
  let build = npa.build();
  console.log(build);
```

---

## isKilled
See if space is killed

`npa.isKilled();`

```js
  let isKilled = npa.isKilled();
  console.log(isKilled);
```

---

## resetInactivity
Reset inactivity timer to prevent killing of space after inactivity

`npa.resetInactivity();`

```js
  let resetInactivity = npa.resetInactivity();
  console.log(resetInactivity);
```

---

## Examples
