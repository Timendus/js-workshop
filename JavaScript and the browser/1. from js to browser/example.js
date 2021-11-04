// The browser doesn't really add anything new to the JavaScript language.

// You can do purely JavaScript type thingies in the browser too

[ 1, 2, 3, 4, 5 ].filter(v => v > 2)
                 .map(v => v * 2)
                 .sort((a, b) => a < b ? 1 : -1);

// But, you get a shit-ton of extra APIs.

window.*
navigator.*
document.*

// Some of those APIs are available in the global scope too, because:

this === window // true

// So
setInterval() // is really
window.setInterval()

// And a shit-ton of available classes

WebAssembly
WebSocket
WebGL
MediaDevices
Credential
Gamepad
// ...

// See also: https://developer.mozilla.org/en-US/docs/Web/API
