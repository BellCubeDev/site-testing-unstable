function Ln(e){return new RegExp(e.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&"),"m")}function Pe(e){return e?"string"==typeof e?e:e.source:null}function Ce(e){return ze("(?=",e,")")}function ze(...e){return e.map(e=>Pe(e)).join("")}function Ke(...e){const n=function(e){const n=e[e.length-1];return"object"==typeof n&&n.constructor===Object?(e.splice(e.length-1,1),n):{}}(e);return"("+(n.capture?"":"?:")+e.map(e=>Pe(e)).join("|")+")"}function yi(e){const n={scope:"keyword",match:/\b(yield|return|let|do|match|use)!/},t=["bool","byte","sbyte","int8","int16","int32","uint8","uint16","uint32","int","uint","int64","uint64","nativeint","unativeint","decimal","float","double","float32","single","char","string","unit","bigint","option","voption","list","array","seq","byref","exn","inref","nativeptr","obj","outref","voidptr","Result"],i={keyword:["abstract","and","as","assert","base","begin","class","default","delegate","do","done","downcast","downto","elif","else","end","exception","extern","finally","fixed","for","fun","function","global","if","in","inherit","inline","interface","internal","lazy","let","match","member","module","mutable","namespace","new","of","open","or","override","private","public","rec","return","static","struct","then","to","try","type","upcast","use","val","void","when","while","with","yield"],literal:["true","false","null","Some","None","Ok","Error","infinity","infinityf","nan","nanf"],built_in:["not","ref","raise","reraise","dict","readOnlyDict","set","get","enum","sizeof","typeof","typedefof","nameof","nullArg","invalidArg","invalidOp","id","fst","snd","ignore","lock","using","box","unbox","tryUnbox","printf","printfn","sprintf","eprintf","eprintfn","fprintf","fprintfn","failwith","failwithf"],"variable.constant":["__LINE__","__SOURCE_DIRECTORY__","__SOURCE_FILE__"]},a={variants:[e.COMMENT(/\(\*(?!\))/,/\*\)/,{contains:["self"]}),e.C_LINE_COMMENT_MODE]},o={scope:"variable",begin:/``/,end:/``/},r=/\B('|\^)/,s={scope:"symbol",variants:[{match:ze(r,/``.*?``/)},{match:ze(r,e.UNDERSCORE_IDENT_RE)}],relevance:0},c=function({includeEqual:e}){let n;n=e?"!%&*+-/<=>@^|~?":"!%&*+-/<>@^|~?";const t=ze("[",...Array.from(n).map(Ln),"]"),i=Ke(t,/\./),a=ze(i,Ce(i)),o=Ke(ze(a,i,"*"),ze(t,"+"));return{scope:"operator",match:Ke(o,/:\?>/,/:\?/,/:>/,/:=/,/::?/,/\$/),relevance:0}},l=c({includeEqual:!0}),u=c({includeEqual:!1}),f=function(n,r){return{begin:ze(n,Ce(ze(/\s*/,Ke(/\w/,/'/,/\^/,/#/,/``/,/\(/,/{\|/)))),beginScope:r,end:Ce(Ke(/\n/,/=/)),relevance:0,keywords:e.inherit(i,{type:t}),contains:[a,s,e.inherit(o,{scope:null}),u]}},p=f(/:/,"operator"),d=f(/\bof\b/,"keyword"),b={begin:[/(^|\s+)/,/type/,/\s+/,/[a-zA-Z_](\w|')*/],beginScope:{2:"keyword",4:"title.class"},end:Ce(/\(|=|$/),keywords:i,contains:[a,e.inherit(o,{scope:null}),s,{scope:"operator",match:/<|>/},p]},g={scope:"computation-expression",match:/\b[_a-z]\w*(?=\s*\{)/},m={begin:[/^\s*/,ze(/#/,Ke("if","else","endif","line","nowarn","light","r","i","I","load","time","help","quit")),/\b/],beginScope:{2:"meta"},end:Ce(/\s|$/)},h={variants:[e.BINARY_NUMBER_MODE,e.C_NUMBER_MODE]},y={scope:"string",begin:/"/,end:/"/,contains:[e.BACKSLASH_ESCAPE]},E={scope:"string",begin:/@"/,end:/"/,contains:[{match:/""/},e.BACKSLASH_ESCAPE]},_={scope:"string",begin:/"""/,end:/"""/,relevance:2},v={scope:"subst",begin:/\{/,end:/\}/,keywords:i},w={scope:"string",begin:/\$"/,end:/"/,contains:[{match:/\{\{/},{match:/\}\}/},e.BACKSLASH_ESCAPE,v]},A={scope:"string",begin:/(\$@|@\$)"/,end:/"/,contains:[{match:/\{\{/},{match:/\}\}/},{match:/""/},e.BACKSLASH_ESCAPE,v]},S={scope:"string",begin:/\$"""/,end:/"""/,contains:[{match:/\{\{/},{match:/\}\}/},v],relevance:2},C={scope:"string",match:ze(/'/,Ke(/[^\\']/,/\\(?:.|\d{3}|x[a-fA-F\d]{2}|u[a-fA-F\d]{4}|U[a-fA-F\d]{8})/),/'/)};return v.contains=[A,w,E,y,C,n,a,o,p,g,m,h,s,l],{name:"F#",aliases:["fs","f#"],keywords:i,illegal:/\/\*/,classNameAliases:{"computation-expression":"keyword"},contains:[n,{variants:[S,A,w,_,E,y,C]},a,o,b,{scope:"meta",begin:/\[</,end:/>\]/,relevance:2,contains:[o,_,E,y,C,h]},d,p,g,m,h,s,l]}}export{yi as default};
//# sourceMappingURL=https://raw.githubusercontent.com/BellCubeDev/site-testing-unstable/deployment/assets/site/highlight_js/languages/fsharp.js.map