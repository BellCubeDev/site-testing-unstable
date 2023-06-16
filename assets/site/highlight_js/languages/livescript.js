const sr=["as","in","of","if","for","while","finally","var","new","function","do","return","void","else","break","catch","instanceof","with","throw","case","default","try","switch","continue","typeof","delete","let","yield","const","class","debugger","async","await","static","import","from","export","extends"],lr=["true","false","null","undefined","NaN","Infinity"],dr=[].concat(["setInterval","setTimeout","clearInterval","clearTimeout","require","exports","eval","isFinite","isNaN","parseFloat","parseInt","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","unescape"],["Object","Function","Boolean","Symbol","Math","Date","Number","BigInt","String","RegExp","Array","Float32Array","Float64Array","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Int32Array","Uint16Array","Uint32Array","BigInt64Array","BigUint64Array","Set","Map","WeakSet","WeakMap","ArrayBuffer","SharedArrayBuffer","Atomics","DataView","JSON","Promise","Generator","GeneratorFunction","AsyncFunction","Reflect","Proxy","Intl","WebAssembly"],["Error","EvalError","InternalError","RangeError","ReferenceError","SyntaxError","TypeError","URIError"]);function Ar(e){const n={keyword:sr.concat(["then","unless","until","loop","of","by","when","and","or","is","isnt","not","it","that","otherwise","from","to","til","fallthrough","case","enum","native","list","map","__hasProp","__extends","__slice","__bind","__indexOf"]),literal:lr.concat(["yes","no","on","off","it","that","void"]),built_in:dr.concat(["npm","print"])},a="[A-Za-z$_](?:-[0-9A-Za-z$_]|[0-9A-Za-z$_])*",t=e.inherit(e.TITLE_MODE,{begin:a}),r={className:"subst",begin:/#\{/,end:/\}/,keywords:n},s={className:"subst",begin:/#[A-Za-z$_]/,end:/(?:-[0-9A-Za-z$_]|[0-9A-Za-z$_])*/,keywords:n},i=[e.BINARY_NUMBER_MODE,{className:"number",begin:"(\\b0[xX][a-fA-F0-9_]+)|(\\b\\d(\\d|_\\d)*(\\.(\\d(\\d|_\\d)*)?)?(_*[eE]([-+]\\d(_\\d|\\d)*)?)?[_a-z]*)",relevance:0,starts:{end:"(\\s*/)?",relevance:0}},{className:"string",variants:[{begin:/'''/,end:/'''/,contains:[e.BACKSLASH_ESCAPE]},{begin:/'/,end:/'/,contains:[e.BACKSLASH_ESCAPE]},{begin:/"""/,end:/"""/,contains:[e.BACKSLASH_ESCAPE,r,s]},{begin:/"/,end:/"/,contains:[e.BACKSLASH_ESCAPE,r,s]},{begin:/\\/,end:/(\s|$)/,excludeEnd:!0}]},{className:"regexp",variants:[{begin:"//",end:"//[gim]*",contains:[r,e.HASH_COMMENT_MODE]},{begin:/\/(?![ *])(\\.|[^\\\n])*?\/[gim]*(?=\W)/}]},{begin:"@"+a},{begin:"``",end:"``",excludeBegin:!0,excludeEnd:!0,subLanguage:"javascript"}];r.contains=i;const o={className:"params",begin:"\\(",returnBegin:!0,contains:[{begin:/\(/,end:/\)/,keywords:n,contains:["self"].concat(i)}]},c={variants:[{match:[/class\s+/,a,/\s+extends\s+/,a]},{match:[/class\s+/,a]}],scope:{2:"title.class",4:"title.class.inherited"},keywords:n};return{name:"LiveScript",aliases:["ls"],keywords:n,illegal:/\/\*/,contains:i.concat([e.COMMENT("\\/\\*","\\*\\/"),e.HASH_COMMENT_MODE,{begin:"(#=>|=>|\\|>>|-?->|!->)"},{className:"function",contains:[t,o],returnBegin:!0,variants:[{begin:"("+a+"\\s*(?:=|:=)\\s*)?(\\(.*\\)\\s*)?\\B->\\*?",end:"->\\*?"},{begin:"("+a+"\\s*(?:=|:=)\\s*)?!?(\\(.*\\)\\s*)?\\B[-~]{1,2}>\\*?",end:"[-~]{1,2}>\\*?"},{begin:"("+a+"\\s*(?:=|:=)\\s*)?(\\(.*\\)\\s*)?\\B!?[-~]{1,2}>\\*?",end:"!?[-~]{1,2}>\\*?"}]},c,{begin:a+":",end:":",returnBegin:!0,returnEnd:!0,relevance:0}])}}export{Ar as default};
//# sourceMappingURL=https://raw.githubusercontent.com/BellCubeDev/site-testing-unstable/deployment/assets/site/highlight_js/languages/livescript.js.map