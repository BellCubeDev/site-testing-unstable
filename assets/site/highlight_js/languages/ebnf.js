function Oa(a){const e=a.COMMENT(/\(\*/,/\*\)/);return{name:"Extended Backus-Naur Form",illegal:/\S/,contains:[e,{className:"attribute",begin:/^[ ]*[a-zA-Z]+([\s_-]+[a-zA-Z]+)*/},{begin:/=/,end:/[.;]/,contains:[e,{className:"meta",begin:/\?.*\?/},{className:"string",variants:[a.APOS_STRING_MODE,a.QUOTE_STRING_MODE,{begin:"`",end:"`"}]}]}]}}export{Oa as default};
//# sourceMappingURL=https://raw.githubusercontent.com/BellCubeDev/site-testing-unstable/deployment/assets/site/highlight_js/languages/ebnf.js.map