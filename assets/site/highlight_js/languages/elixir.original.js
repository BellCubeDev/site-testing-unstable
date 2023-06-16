function elixir(hljs) {
    const regex = hljs.regex;
    const ELIXIR_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_.]*(!|\\?)?';
    const ELIXIR_METHOD_RE = '[a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?';
    const KEYWORDS = [
        "after",
        "alias",
        "and",
        "case",
        "catch",
        "cond",
        "defstruct",
        "defguard",
        "do",
        "else",
        "end",
        "fn",
        "for",
        "if",
        "import",
        "in",
        "not",
        "or",
        "quote",
        "raise",
        "receive",
        "require",
        "reraise",
        "rescue",
        "try",
        "unless",
        "unquote",
        "unquote_splicing",
        "use",
        "when",
        "with|0"
    ];
    const LITERALS = [
        "false",
        "nil",
        "true"
    ];
    const KWS = {
        $pattern: ELIXIR_IDENT_RE,
        keyword: KEYWORDS,
        literal: LITERALS
    };
    const SUBST = {
        className: 'subst',
        begin: /#\{/,
        end: /\}/,
        keywords: KWS
    };
    const NUMBER = {
        className: 'number',
        begin: '(\\b0o[0-7_]+)|(\\b0b[01_]+)|(\\b0x[0-9a-fA-F_]+)|(-?\\b[0-9][0-9_]*(\\.[0-9_]+([eE][-+]?[0-9]+)?)?)',
        relevance: 0
    };
    const ESCAPES_RE = /\\[\s\S]/;
    const BACKSLASH_ESCAPE = {
        match: ESCAPES_RE,
        scope: "char.escape",
        relevance: 0
    };
    const SIGIL_DELIMITERS = '[/|([{<"\']';
    const SIGIL_DELIMITER_MODES = [
        {
            begin: /"/,
            end: /"/
        },
        {
            begin: /'/,
            end: /'/
        },
        {
            begin: /\//,
            end: /\//
        },
        {
            begin: /\|/,
            end: /\|/
        },
        {
            begin: /\(/,
            end: /\)/
        },
        {
            begin: /\[/,
            end: /\]/
        },
        {
            begin: /\{/,
            end: /\}/
        },
        {
            begin: /</,
            end: />/
        }
    ];
    const escapeSigilEnd = (end) => {
        return {
            scope: "char.escape",
            begin: regex.concat(/\\/, end),
            relevance: 0
        };
    };
    const LOWERCASE_SIGIL = {
        className: 'string',
        begin: '~[a-z]' + '(?=' + SIGIL_DELIMITERS + ')',
        contains: SIGIL_DELIMITER_MODES.map(x => hljs.inherit(x, { contains: [
                escapeSigilEnd(x.end),
                BACKSLASH_ESCAPE,
                SUBST
            ] }))
    };
    const UPCASE_SIGIL = {
        className: 'string',
        begin: '~[A-Z]' + '(?=' + SIGIL_DELIMITERS + ')',
        contains: SIGIL_DELIMITER_MODES.map(x => hljs.inherit(x, { contains: [escapeSigilEnd(x.end)] }))
    };
    const REGEX_SIGIL = {
        className: 'regex',
        variants: [
            {
                begin: '~r' + '(?=' + SIGIL_DELIMITERS + ')',
                contains: SIGIL_DELIMITER_MODES.map(x => hljs.inherit(x, {
                    end: regex.concat(x.end, /[uismxfU]{0,7}/),
                    contains: [
                        escapeSigilEnd(x.end),
                        BACKSLASH_ESCAPE,
                        SUBST
                    ]
                }))
            },
            {
                begin: '~R' + '(?=' + SIGIL_DELIMITERS + ')',
                contains: SIGIL_DELIMITER_MODES.map(x => hljs.inherit(x, {
                    end: regex.concat(x.end, /[uismxfU]{0,7}/),
                    contains: [escapeSigilEnd(x.end)]
                }))
            }
        ]
    };
    const STRING = {
        className: 'string',
        contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
        ],
        variants: [
            {
                begin: /"""/,
                end: /"""/
            },
            {
                begin: /'''/,
                end: /'''/
            },
            {
                begin: /~S"""/,
                end: /"""/,
                contains: []
            },
            {
                begin: /~S"/,
                end: /"/,
                contains: []
            },
            {
                begin: /~S'''/,
                end: /'''/,
                contains: []
            },
            {
                begin: /~S'/,
                end: /'/,
                contains: []
            },
            {
                begin: /'/,
                end: /'/
            },
            {
                begin: /"/,
                end: /"/
            }
        ]
    };
    const FUNCTION = {
        className: 'function',
        beginKeywords: 'def defp defmacro defmacrop',
        end: /\B\b/,
        contains: [
            hljs.inherit(hljs.TITLE_MODE, {
                begin: ELIXIR_IDENT_RE,
                endsParent: true
            })
        ]
    };
    const CLASS = hljs.inherit(FUNCTION, {
        className: 'class',
        beginKeywords: 'defimpl defmodule defprotocol defrecord',
        end: /\bdo\b|$|;/
    });
    const ELIXIR_DEFAULT_CONTAINS = [
        STRING,
        REGEX_SIGIL,
        UPCASE_SIGIL,
        LOWERCASE_SIGIL,
        hljs.HASH_COMMENT_MODE,
        CLASS,
        FUNCTION,
        { begin: '::' },
        {
            className: 'symbol',
            begin: ':(?![\\s:])',
            contains: [
                STRING,
                { begin: ELIXIR_METHOD_RE }
            ],
            relevance: 0
        },
        {
            className: 'symbol',
            begin: ELIXIR_IDENT_RE + ':(?!:)',
            relevance: 0
        },
        {
            className: 'title.class',
            begin: /(\b[A-Z][a-zA-Z0-9_]+)/,
            relevance: 0
        },
        NUMBER,
        {
            className: 'variable',
            begin: '(\\$\\W)|((\\$|@@?)(\\w+))'
        }
    ];
    SUBST.contains = ELIXIR_DEFAULT_CONTAINS;
    return {
        name: 'Elixir',
        aliases: [
            'ex',
            'exs'
        ],
        keywords: KWS,
        contains: ELIXIR_DEFAULT_CONTAINS
    };
}
export { elixir as default };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxpeGlyLmpzIiwic291cmNlUm9vdCI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9CZWxsQ3ViZURldi9zaXRlLXRlc3RpbmcvZGVwbG95bWVudC8iLCJzb3VyY2VzIjpbImFzc2V0cy9zaXRlL2hpZ2hsaWdodF9qcy9sYW5ndWFnZXMvZWxpeGlyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLFNBQVMsTUFBTSxDQUFDLElBQUk7SUFDbEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN6QixNQUFNLGVBQWUsR0FBRyxpQ0FBaUMsQ0FBQztJQUMxRCxNQUFNLGdCQUFnQixHQUFHLGtGQUFrRixDQUFDO0lBQzVHLE1BQU0sUUFBUSxHQUFHO1FBQ2YsT0FBTztRQUNQLE9BQU87UUFDUCxLQUFLO1FBQ0wsTUFBTTtRQUNOLE9BQU87UUFDUCxNQUFNO1FBQ04sV0FBVztRQUNYLFVBQVU7UUFDVixJQUFJO1FBQ0osTUFBTTtRQUNOLEtBQUs7UUFDTCxJQUFJO1FBQ0osS0FBSztRQUNMLElBQUk7UUFDSixRQUFRO1FBQ1IsSUFBSTtRQUNKLEtBQUs7UUFDTCxJQUFJO1FBQ0osT0FBTztRQUNQLE9BQU87UUFDUCxTQUFTO1FBQ1QsU0FBUztRQUNULFNBQVM7UUFDVCxRQUFRO1FBQ1IsS0FBSztRQUNMLFFBQVE7UUFDUixTQUFTO1FBQ1Qsa0JBQWtCO1FBQ2xCLEtBQUs7UUFDTCxNQUFNO1FBQ04sUUFBUTtLQUNULENBQUM7SUFDRixNQUFNLFFBQVEsR0FBRztRQUNmLE9BQU87UUFDUCxLQUFLO1FBQ0wsTUFBTTtLQUNQLENBQUM7SUFDRixNQUFNLEdBQUcsR0FBRztRQUNWLFFBQVEsRUFBRSxlQUFlO1FBQ3pCLE9BQU8sRUFBRSxRQUFRO1FBQ2pCLE9BQU8sRUFBRSxRQUFRO0tBQ2xCLENBQUM7SUFDRixNQUFNLEtBQUssR0FBRztRQUNaLFNBQVMsRUFBRSxPQUFPO1FBQ2xCLEtBQUssRUFBRSxLQUFLO1FBQ1osR0FB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U0FDcEM7S0FFRixDQUFDO0lBQ0YsS0FBSyxDQUFDLFFBQVEsR0FBRyx1QkFBdUIsQ0FBQztJQUV6QyxPQUFPO1FBQ0wsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUU7WUFDUCxJQUFJO1lBQ0osS0FBSztTQUNOO1FBQ0QsUUFBUSxFQUFFLEdBQUc7UUFDYixRQUFRLEVBQUUsdUJBQXVCO0tBQ2xDLENBQUM7QUFDSixDQUFDO0FBRUQsT0FBTyxFQUFFLE1BQU0sSUFBSSxPQUFPLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5MYW5ndWFnZTogRWxpeGlyXG5BdXRob3I6IEpvc2ggQWRhbXMgPGpvc2hAaXNvdG9wZTExLmNvbT5cbkRlc2NyaXB0aW9uOiBsYW5ndWFnZSBkZWZpbml0aW9uIGZvciBFbGl4aXIgc291cmNlIGNvZGUgZmlsZXMgKC5leCBhbmQgLmV4cykuICBCYXNlZCBvbiBydWJ5IGxhbmd1YWdlIHN1cHBvcnQuXG5DYXRlZ29yeTogZnVuY3Rpb25hbFxuV2Vic2l0ZTogaHR0cHM6Ly9lbGl4aXItbGFuZy5vcmdcbiovXG5cbi8qKiBAdHlwZSBMYW5ndWFnZUZuICovXG5mdW5jdGlvbiBlbGl4aXIoaGxqcykge1xuICBjb25zdCByZWdleCA9IGhsanMucmVnZXg7XG4gIGNvbnN0IEVMSVhJUl9JREVOVF9SRSA9ICdbYS16QS1aX11bYS16QS1aMC05Xy5dKighfFxcXFw/KT8nO1xuICBjb25zdCBFTElYSVJfTUVUSE9EX1JFID0gJ1thLXpBLVpfXVxcXFx3KlshPz1dP3xbLSt+XUB8PDx8Pj58PX58PT09P3w8PT58Wzw+XT0/fFxcXFwqXFxcXCp8Wy0vKyVeJip+YHxdfFxcXFxbXFxcXF09Pyc7XG4gIGNvbnN0IEtFWVdPUkRTID0gW1xuICAgIFwiYWZ0ZXJcIixcbiAgICBcImFsaWFzXCIsXG4gICAgXCJhbmRcIixcbiAgICBcImNhc2VcIixcbiAgICBcImNhdGNoXCIsXG4gICAgXCJjb25kXCIsXG4gICAgXCJkZWZzdHJ1Y3RcIixcbiAgICBcImRlZmd1YXJkXCIsXG4gICAgXCJkb1wiLFxuICAgIFwiZWxzZVwiLFxuICAgIFwiZW5kXCIsXG4gICAgXCJmblwiLFxuICAgIFwiZm9yXCIsXG4gICAgXCJpZlwiLFxuICAgIFwiaW1wb3J0XCIsXG4gICAgXCJpblwiLFxuICAgIFwibm90XCIsXG4gICAgXCJvclwiLFxuICAgIFwicXVvdGVcIixcbiAgICBcInJhaXNlXCIsXG4gICAgXCJyZWNlaXZlXCIsXG4gICAgXCJyZXF1aXJlXCIsXG4gICAgXCJyZXJhaXNlXCIsXG4gICAgXCJyZXNjdWVcIixcbiAgICBcInRyeVwiLFxuICAgIFwidW5sZXNzXCIsXG4gICAgXCJ1bnF1b3RlXCIsXG4gICAgXCJ1bnF1b3RlX3NwbGljaW5nXCIsXG4gICAgXCJ1c2VcIixcbiAgICBcIndoZW5cIixcbiAgICBcIndpdGh8MFwiXG4gIF07XG4gIGNvbnN0IExJVEVSQUxTID0gW1xuICAgIFwiZmFsc2VcIixcbiAgICBcIm5pbFwiLFxuICAgIFwidHJ1ZVwiXG4gIF07XG4gIGNvbnN0IEtXUyA9IHtcbiAgICAkcGF0dGVybjogRUxJWElSX0lERU5UX1JFLFxuICAgIGtleXdvcmQ6IEtFWVdPUkRTLFxuICAgIGxpdGVyYWw6IExJVEVSQUxTXG4gIH07XG4gIGNvbnN0IFNVQlNUID0ge1xuICAgIGNsYXNzTmFtZTogJ3N1YnN0JyxcbiAgICBiZWdpbjogLyNcXHsvLFxuICAgIGVuZDogL1xcfS8sXG4gICAga2V5d29yZHM6IEtXU1xuICB9O1xuICBjb25zdCBOVU1CRVIgPSB7XG4gICAgY2xhc3NOYW1lOiAnbnVtYmVyJyxcbiAgICBiZWdpbjogJyhcXFxcYjBvWzAtN19dKyl8KFxcXFxiMGJbMDFfXSspfChcXFxcYjB4WzAtOWEtZkEtRl9dKyl8KC0/XFxcXGJbMC05XVswLTlfXSooXFxcXC5bMC05X10rKFtlRV1bLStdP1swLTldKyk/KT8pJyxcbiAgICByZWxldmFuY2U6IDBcbiAgfTtcbiAgLy8gVE9ETzogY291bGQgYmUgdGlnaHRlbmVkXG4gIC8vIGh0dHBzOi8vZWxpeGlyLWxhbmcucmVhZHRoZWRvY3MuaW8vZW4vbGF0ZXN0L2ludHJvLzE4Lmh0bWxcbiAgLy8gYnV0IHlvdSBhbHNvIG5lZWQgdG8gaW5jbHVkZSBjbG9zaW5nIGRlbGVtZXRlcnMgaW4gdGhlIGVzY2FwZSBsaXN0IHBlclxuICAvLyBpbmRpdmlkdWFsIHNpZ2lsIG1vZGUgZnJvbSB3aGF0IEkgY2FuIHRlbGwsXG4gIC8vIGllOiBcXH0gbWlnaHQgb3IgbWlnaHQgbm90IGJlIGFuIGVzY2FwZSBkZXBlbmRpbmcgb24gdGhlIHNpZ2lsIHVzZWRcbiAgY29uc3QgRVNDQVBFU19SRSA9IC9cXFxcW1xcc1xcU10vO1xuICAvLyBjb25zdCBFU0NBUEVTX1JFID0gL1xcXFxbXCInXFxcXGFiZGVmbnJzdHYwXS87XG4gIGNvbnN0IEJBQ0tTTEFTSF9FU0NBUEUgPSB7XG4gICAgbWF0Y2g6IEVTQ0FQRVNfUkUsXG4gICAgc2NvcGU6IFwiY2hhci5lc2NhcGVcIixcbiAgICByZWxldmFuY2U6IDBcbiAgfTtcbiAgY29uc3QgU0lHSUxfREVMSU1JVEVSUyA9ICdbL3woW3s8XCJcXCddJztcbiAgY29uc3QgU0lHSUxfREVMSU1JVEVSX01PREVTID0gW1xuICAgIHtcbiAgICAgIGJlZ2luOiAvXCIvLFxuICAgICAgZW5kOiAvXCIvXG4gICAgfSxcbiAgICB7XG4gICAgICBiZWdpbjogLycvLFxuICAgICAgZW5kOiAvJy9cbiAgICB9LFxuICAgIHtcbiAgICAgIGJlZ2luOiAvXFwvLyxcbiAgICAgIGVuZDogL1xcLy9cbiAgICB9LFxuICAgIHtcbiAgICAgIGJlZ2luOiAvXFx8LyxcbiAgICAgIGVuZDogL1xcfC9cbiAgICB9LFxuICAgIHtcbiAgICAgIGJlZ2luOiAvXFwoLyxcbiAgICAgIGVuZDogL1xcKS9cbiAgICB9LFxuICAgIHtcbiAgICAgIGJlZ2luOiAvXFxbLyxcbiAgICAgIGVuZDogL1xcXS9cbiAgICB9LFxuICAgIHtcbiAgICAgIGJlZ2luOiAvXFx7LyxcbiAgICAgIGVuZDogL1xcfS9cbiAgICB9LFxuICAgIHtcbiAgICAgIGJlZ2luOiAvPC8sXG4gICAgICBlbmQ6IC8+L1xuICAgIH1cbiAgXTtcbiAgY29uc3QgZXNjYXBlU2lnaWxFbmQgPSAoZW5kKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjb3BlOiBcImNoYXIuZXNjYXBlXCIsXG4gICAgICBiZWdpbjogcmVnZXguY29uY2F0KC9cXFxcLywgZW5kKSxcbiAgICAgIHJlbGV2YW5jZTogMFxuICAgIH07XG4gIH07XG4gIGNvbnN0IExPV0VSQ0FTRV9TSUdJTCA9IHtcbiAgICBjbGFzc05hbWU6ICdzdHJpbmcnLFxuICAgIGJlZ2luOiAnflthLXpdJyArICcoPz0nICsgU0lHSUxfREVMSU1JVEVSUyArICcpJyxcbiAgICBjb250YWluczogU0lHSUxfREVMSU1JVEVSX01PREVTLm1hcCh4ID0+IGhsanMuaW5oZXJpdCh4LFxuICAgICAgeyBjb250YWluczogW1xuICAgICAgICBlc2NhcGVTaWdpbEVuZCh4LmVuZCksXG4gICAgICAgIEJBQ0tTTEFTSF9FU0NBUEUsXG4gICAgICAgIFNVQlNUXG4gICAgICBdIH1cbiAgICApKVxuICB9O1xuXG4gIGNvbnN0IFVQQ0FTRV9TSUdJTCA9IHtcbiAgICBjbGFzc05hbWU6ICdzdHJpbmcnLFxuICAgIGJlZ2luOiAnfltBLVpdJyArICcoPz0nICsgU0lHSUxfREVMSU1JVEVSUyArICcpJyxcbiAgICBjb250YWluczogU0lHSUxfREVMSU1JVEVSX01PREVTLm1hcCh4ID0+IGhsanMuaW5oZXJpdCh4LFxuICAgICAgeyBjb250YWluczogWyBlc2NhcGVTaWdpbEVuZCh4LmVuZCkgXSB9XG4gICAgKSlcbiAgfTtcblxuICBjb25zdCBSRUdFWF9TSUdJTCA9IHtcbiAgICBjbGFzc05hbWU6ICdyZWdleCcsXG4gICAgdmFyaWFudHM6IFtcbiAgICAgIHtcbiAgICAgICAgYmVnaW46ICd+cicgKyAnKD89JyArIFNJR0lMX0RFTElNSVRFUlMgKyAnKScsXG4gICAgICAgIGNvbnRhaW5zOiBTSUdJTF9ERUxJTUlURVJfTU9ERVMubWFwKHggPT4gaGxqcy5pbmhlcml0KHgsXG4gICAgICAgICAge1xuICAgICAgICAgICAgZW5kOiByZWdleC5jb25jYXQoeC5lbmQsIC9bdWlzbXhmVV17MCw3fS8pLFxuICAgICAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICAgICAgZXNjYXBlU2lnaWxFbmQoeC5lbmQpLFxuICAgICAgICAgICAgICBCQUNLU0xBU0hfRVNDQVBFLFxuICAgICAgICAgICAgICBTVUJTVFxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgKSlcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAnflInICsgJyg/PScgKyBTSUdJTF9ERUxJTUlURVJTICsgJyknLFxuICAgICAgICBjb250YWluczogU0lHSUxfREVMSU1JVEVSX01PREVTLm1hcCh4ID0+IGhsanMuaW5oZXJpdCh4LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGVuZDogcmVnZXguY29uY2F0KHguZW5kLCAvW3Vpc214ZlVdezAsN30vKSxcbiAgICAgICAgICAgIGNvbnRhaW5zOiBbIGVzY2FwZVNpZ2lsRW5kKHguZW5kKSBdXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIF1cbiAgfTtcblxuICBjb25zdCBTVFJJTkcgPSB7XG4gICAgY2xhc3NOYW1lOiAnc3RyaW5nJyxcbiAgICBjb250YWluczogW1xuICAgICAgaGxqcy5CQUNLU0xBU0hfRVNDQVBFLFxuICAgICAgU1VCU1RcbiAgICBdLFxuICAgIHZhcmlhbnRzOiBbXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAvXCJcIlwiLyxcbiAgICAgICAgZW5kOiAvXCJcIlwiL1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgYmVnaW46IC8nJycvLFxuICAgICAgICBlbmQ6IC8nJycvXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBiZWdpbjogL35TXCJcIlwiLyxcbiAgICAgICAgZW5kOiAvXCJcIlwiLyxcbiAgICAgICAgY29udGFpbnM6IFtdIC8vIG92ZXJyaWRlIGRlZmF1bHRcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAvflNcIi8sXG4gICAgICAgIGVuZDogL1wiLyxcbiAgICAgICAgY29udGFpbnM6IFtdIC8vIG92ZXJyaWRlIGRlZmF1bHRcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAvflMnJycvLFxuICAgICAgICBlbmQ6IC8nJycvLFxuICAgICAgICBjb250YWluczogW10gLy8gb3ZlcnJpZGUgZGVmYXVsdFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgYmVnaW46IC9+UycvLFxuICAgICAgICBlbmQ6IC8nLyxcbiAgICAgICAgY29udGFpbnM6IFtdIC8vIG92ZXJyaWRlIGRlZmF1bHRcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAvJy8sXG4gICAgICAgIGVuZDogLycvXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBiZWdpbjogL1wiLyxcbiAgICAgICAgZW5kOiAvXCIvXG4gICAgICB9XG4gICAgXVxuICB9O1xuICBjb25zdCBGVU5DVElPTiA9IHtcbiAgICBjbGFzc05hbWU6ICdmdW5jdGlvbicsXG4gICAgYmVnaW5LZXl3b3JkczogJ2RlZiBkZWZwIGRlZm1hY3JvIGRlZm1hY3JvcCcsXG4gICAgZW5kOiAvXFxCXFxiLywgLy8gdGhlIG1vZGUgaXMgZW5kZWQgYnkgdGhlIHRpdGxlXG4gICAgY29udGFpbnM6IFtcbiAgICAgIGhsanMuaW5oZXJpdChobGpzLlRJVExFX01PREUsIHtcbiAgICAgICAgYmVnaW46IEVMSVhJUl9JREVOVF9SRSxcbiAgICAgICAgZW5kc1BhcmVudDogdHJ1ZVxuICAgICAgfSlcbiAgICBdXG4gIH07XG4gIGNvbnN0IENMQVNTID0gaGxqcy5pbmhlcml0KEZVTkNUSU9OLCB7XG4gICAgY2xhc3NOYW1lOiAnY2xhc3MnLFxuICAgIGJlZ2luS2V5d29yZHM6ICdkZWZpbXBsIGRlZm1vZHVsZSBkZWZwcm90b2NvbCBkZWZyZWNvcmQnLFxuICAgIGVuZDogL1xcYmRvXFxifCR8Oy9cbiAgfSk7XG4gIGNvbnN0IEVMSVhJUl9ERUZBVUxUX0NPTlRBSU5TID0gW1xuICAgIFNUUklORyxcbiAgICBSRUdFWF9TSUdJTCxcbiAgICBVUENBU0VfU0lHSUwsXG4gICAgTE9XRVJDQVNFX1NJR0lMLFxuICAgIGhsanMuSEFTSF9DT01NRU5UX01PREUsXG4gICAgQ0xBU1MsXG4gICAgRlVOQ1RJT04sXG4gICAgeyBiZWdpbjogJzo6JyB9LFxuICAgIHtcbiAgICAgIGNsYXNzTmFtZTogJ3N5bWJvbCcsXG4gICAgICBiZWdpbjogJzooPyFbXFxcXHM6XSknLFxuICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgU1RSSU5HLFxuICAgICAgICB7IGJlZ2luOiBFTElYSVJfTUVUSE9EX1JFIH1cbiAgICAgIF0sXG4gICAgICByZWxldmFuY2U6IDBcbiAgICB9LFxuICAgIHtcbiAgICAgIGNsYXNzTmFtZTogJ3N5bWJvbCcsXG4gICAgICBiZWdpbjogRUxJWElSX0lERU5UX1JFICsgJzooPyE6KScsXG4gICAgICByZWxldmFuY2U6IDBcbiAgICB9LFxuICAgIHsgLy8gVXNhZ2Ugb2YgYSBtb2R1bGUsIHN0cnVjdCwgZXRjLlxuICAgICAgY2xhc3NOYW1lOiAndGl0bGUuY2xhc3MnLFxuICAgICAgYmVnaW46IC8oXFxiW0EtWl1bYS16QS1aMC05X10rKS8sXG4gICAgICByZWxldmFuY2U6IDBcbiAgICB9LFxuICAgIE5VTUJFUixcbiAgICB7XG4gICAgICBjbGFzc05hbWU6ICd2YXJpYWJsZScsXG4gICAgICBiZWdpbjogJyhcXFxcJFxcXFxXKXwoKFxcXFwkfEBAPykoXFxcXHcrKSknXG4gICAgfVxuICAgIC8vIC0+IGhhcyBiZWVuIHJlbW92ZWQsIGNhcG5wcm90byBhbHdheXMgdXNlcyB0aGlzIGdyYW1tYXIgY29uc3RydWN0XG4gIF07XG4gIFNVQlNULmNvbnRhaW5zID0gRUxJWElSX0RFRkFVTFRfQ09OVEFJTlM7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnRWxpeGlyJyxcbiAgICBhbGlhc2VzOiBbXG4gICAgICAnZXgnLFxuICAgICAgJ2V4cydcbiAgICBdLFxuICAgIGtleXdvcmRzOiBLV1MsXG4gICAgY29udGFpbnM6IEVMSVhJUl9ERUZBVUxUX0NPTlRBSU5TXG4gIH07XG59XG5cbmV4cG9ydCB7IGVsaXhpciBhcyBkZWZhdWx0IH07XG4iXX0=