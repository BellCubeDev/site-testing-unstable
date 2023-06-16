const sr=["as","in","of","if","for","while","finally","var","new","function","do","return","void","else","break","catch","instanceof","with","throw","case","default","try","switch","continue","typeof","delete","let","yield","const","class","debugger","async","await","static","import","from","export","extends"],lr=["true","false","null","undefined","NaN","Infinity"],dr=[].concat(["setInterval","setTimeout","clearInterval","clearTimeout","require","exports","eval","isFinite","isNaN","parseFloat","parseInt","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","unescape"],["Object","Function","Boolean","Symbol","Math","Date","Number","BigInt","String","RegExp","Array","Float32Array","Float64Array","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Int32Array","Uint16Array","Uint32Array","BigInt64Array","BigUint64Array","Set","Map","WeakSet","WeakMap","ArrayBuffer","SharedArrayBuffer","Atomics","DataView","JSON","Promise","Generator","GeneratorFunction","AsyncFunction","Reflect","Proxy","Intl","WebAssembly"],["Error","EvalError","InternalError","RangeError","ReferenceError","SyntaxError","TypeError","URIError"]);function gr(e){const n={keyword:sr.concat(["then","unless","until","loop","by","when","and","or","is","isnt","not"]).filter((t=["var","const","let","function","static"],e=>!t.includes(e))),literal:lr.concat(["yes","no","on","off"]),built_in:dr.concat(["npm","print"])};var t;const r="[A-Za-z$_][0-9A-Za-z$_]*",a={className:"subst",begin:/#\{/,end:/\}/,keywords:n},i=[e.BINARY_NUMBER_MODE,e.inherit(e.C_NUMBER_MODE,{starts:{end:"(\\s*/)?",relevance:0}}),{className:"string",variants:[{begin:/'''/,end:/'''/,contains:[e.BACKSLASH_ESCAPE]},{begin:/'/,end:/'/,contains:[e.BACKSLASH_ESCAPE]},{begin:/"""/,end:/"""/,contains:[e.BACKSLASH_ESCAPE,a]},{begin:/"/,end:/"/,contains:[e.BACKSLASH_ESCAPE,a]}]},{className:"regexp",variants:[{begin:"///",end:"///",contains:[a,e.HASH_COMMENT_MODE]},{begin:"//[gim]{0,3}(?=\\W)",relevance:0},{begin:/\/(?![ *]).*?(?![\\]).\/[gim]{0,3}(?=\W)/}]},{begin:"@"+r},{subLanguage:"javascript",excludeBegin:!0,excludeEnd:!0,variants:[{begin:"```",end:"```"},{begin:"`",end:"`"}]}];a.contains=i;const s=e.inherit(e.TITLE_MODE,{begin:r}),o="(\\(.*\\)\\s*)?\\B[-=]>",c={className:"params",begin:"\\([^\\(]",returnBegin:!0,contains:[{begin:/\(/,end:/\)/,keywords:n,contains:["self"].concat(i)}]},l={variants:[{match:[/class\s+/,r,/\s+extends\s+/,r]},{match:[/class\s+/,r]}],scope:{2:"title.class",4:"title.class.inherited"},keywords:n};return{name:"CoffeeScript",aliases:["coffee","cson","iced"],keywords:n,illegal:/\/\*/,contains:[...i,e.COMMENT("###","###"),e.HASH_COMMENT_MODE,{className:"function",begin:"^\\s*"+r+"\\s*=\\s*"+o,end:"[-=]>",returnBegin:!0,contains:[s,c]},{begin:/[:\(,=]\s*/,relevance:0,contains:[{className:"function",begin:o,end:"[-=]>",returnBegin:!0,contains:[c]}]},l,{begin:r+":",end:":",returnBegin:!0,returnEnd:!0,relevance:0}]}}export{gr as default};
//# sourceMappingURL=https://raw.githubusercontent.com/BellCubeDev/site-testing-unstable/deployment/assets/site/highlight_js/languages/coffeescript.js.map