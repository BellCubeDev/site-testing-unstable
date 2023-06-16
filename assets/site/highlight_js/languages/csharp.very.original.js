function csharp(hljs) {
    const BUILT_IN_KEYWORDS = [
        'bool',
        'byte',
        'char',
        'decimal',
        'delegate',
        'double',
        'dynamic',
        'enum',
        'float',
        'int',
        'long',
        'nint',
        'nuint',
        'object',
        'sbyte',
        'short',
        'string',
        'ulong',
        'uint',
        'ushort'
    ];
    const FUNCTION_MODIFIERS = [
        'public',
        'private',
        'protected',
        'static',
        'internal',
        'protected',
        'abstract',
        'async',
        'extern',
        'override',
        'unsafe',
        'virtual',
        'new',
        'sealed',
        'partial'
    ];
    const LITERAL_KEYWORDS = [
        'default',
        'false',
        'null',
        'true'
    ];
    const NORMAL_KEYWORDS = [
        'abstract',
        'as',
        'base',
        'break',
        'case',
        'catch',
        'class',
        'const',
        'continue',
        'do',
        'else',
        'event',
        'explicit',
        'extern',
        'finally',
        'fixed',
        'for',
        'foreach',
        'goto',
        'if',
        'implicit',
        'in',
        'interface',
        'internal',
        'is',
        'lock',
        'namespace',
        'new',
        'operator',
        'out',
        'override',
        'params',
        'private',
        'protected',
        'public',
        'readonly',
        'record',
        'ref',
        'return',
        'scoped',
        'sealed',
        'sizeof',
        'stackalloc',
        'static',
        'struct',
        'switch',
        'this',
        'throw',
        'try',
        'typeof',
        'unchecked',
        'unsafe',
        'using',
        'virtual',
        'void',
        'volatile',
        'while'
    ];
    const CONTEXTUAL_KEYWORDS = [
        'add',
        'alias',
        'and',
        'ascending',
        'async',
        'await',
        'by',
        'descending',
        'equals',
        'from',
        'get',
        'global',
        'group',
        'init',
        'into',
        'join',
        'let',
        'nameof',
        'not',
        'notnull',
        'on',
        'or',
        'orderby',
        'partial',
        'remove',
        'select',
        'set',
        'unmanaged',
        'value|0',
        'var',
        'when',
        'where',
        'with',
        'yield'
    ];
    const KEYWORDS = {
        keyword: NORMAL_KEYWORDS.concat(CONTEXTUAL_KEYWORDS),
        built_in: BUILT_IN_KEYWORDS,
        literal: LITERAL_KEYWORDS
    };
    const TITLE_MODE = hljs.inherit(hljs.TITLE_MODE, { begin: '[a-zA-Z](\\.?\\w)*' });
    const NUMBERS = {
        className: 'number',
        variants: [
            { begin: '\\b(0b[01\']+)' },
            { begin: '(-?)\\b([\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)(u|U|l|L|ul|UL|f|F|b|B)' },
            { begin: '(-?)(\\b0[xX][a-fA-F0-9\']+|(\\b[\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)([eE][-+]?[\\d\']+)?)' }
        ],
        relevance: 0
    };
    const VERBATIM_STRING = {
        className: 'string',
        begin: '@"',
        end: '"',
        contains: [{ begin: '""' }]
    };
    const VERBATIM_STRING_NO_LF = hljs.inherit(VERBATIM_STRING, { illegal: /\n/ });
    const SUBST = {
        className: 'subst',
        begin: /\{/,
        end: /\}/,
        keywords: KEYWORDS
    };
    const SUBST_NO_LF = hljs.inherit(SUBST, { illegal: /\n/ });
    const INTERPOLATED_STRING = {
        className: 'string',
        begin: /\$"/,
        end: '"',
        illegal: /\n/,
        contains: [
            { begin: /\{\{/ },
            { begin: /\}\}/ },
            hljs.BACKSLASH_ESCAPE,
            SUBST_NO_LF
        ]
    };
    const INTERPOLATED_VERBATIM_STRING = {
        className: 'string',
        begin: /\$@"/,
        end: '"',
        contains: [
            { begin: /\{\{/ },
            { begin: /\}\}/ },
            { begin: '""' },
            SUBST
        ]
    };
    const INTERPOLATED_VERBATIM_STRING_NO_LF = hljs.inherit(INTERPOLATED_VERBATIM_STRING, {
        illegal: /\n/,
        contains: [
            { begin: /\{\{/ },
            { begin: /\}\}/ },
            { begin: '""' },
            SUBST_NO_LF
        ]
    });
    SUBST.contains = [
        INTERPOLATED_VERBATIM_STRING,
        INTERPOLATED_STRING,
        VERBATIM_STRING,
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE,
        NUMBERS,
        hljs.C_BLOCK_COMMENT_MODE
    ];
    SUBST_NO_LF.contains = [
        INTERPOLATED_VERBATIM_STRING_NO_LF,
        INTERPOLATED_STRING,
        VERBATIM_STRING_NO_LF,
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE,
        NUMBERS,
        hljs.inherit(hljs.C_BLOCK_COMMENT_MODE, { illegal: /\n/ })
    ];
    const STRING = { variants: [
            INTERPOLATED_VERBATIM_STRING,
            INTERPOLATED_STRING,
            VERBATIM_STRING,
            hljs.APOS_STRING_MODE,
            hljs.QUOTE_STRING_MODE
        ] };
    const GENERIC_MODIFIER = {
        begin: "<",
        end: ">",
        contains: [
            { beginKeywords: "in out" },
            TITLE_MODE
        ]
    };
    const TYPE_IDENT_RE = hljs.IDENT_RE + '(<' + hljs.IDENT_RE + '(\\s*,\\s*' + hljs.IDENT_RE + ')*>)?(\\[\\])?';
    const AT_IDENTIFIER = {
        begin: "@" + hljs.IDENT_RE,
        relevance: 0
    };
    return {
        name: 'C#',
        aliases: [
            'cs',
            'c#'
        ],
        keywords: KEYWORDS,
        illegal: /::/,
        contains: [
            hljs.COMMENT('///', '$', {
                returnBegin: true,
                contains: [
                    {
                        className: 'doctag',
                        variants: [
                            {
                                begin: '///',
                                relevance: 0
                            },
                            { begin: '<!--|-->' },
                            {
                                begin: '</?',
                                end: '>'
                            }
                        ]
                    }
                ]
            }),
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            {
                className: 'meta',
                begin: '#',
                end: '$',
                keywords: { keyword: 'if else elif endif define undef warning error line region endregion pragma checksum' }
            },
            STRING,
            NUMBERS,
            {
                beginKeywords: 'class interface',
                relevance: 0,
                end: /[{;=]/,
                illegal: /[^\s:,]/,
                contains: [
                    { beginKeywords: "where class" },
                    TITLE_MODE,
                    GENERIC_MODIFIER,
                    hljs.C_LINE_COMMENT_MODE,
                    hljs.C_BLOCK_COMMENT_MODE
                ]
            },
            {
                beginKeywords: 'namespace',
                relevance: 0,
                end: /[{;=]/,
                illegal: /[^\s:]/,
                contains: [
                    TITLE_MODE,
                    hljs.C_LINE_COMMENT_MODE,
                    hljs.C_BLOCK_COMMENT_MODE
                ]
            },
            {
                beginKeywords: 'record',
                relevance: 0,
                end: /[{;=]/,
                illegal: /[^\s:]/,
                contains: [
                    TITLE_MODE,
                    GENERIC_MODIFIER,
                    hljs.C_LINE_COMMENT_MODE,
                    hljs.C_BLOCK_COMMENT_MODE
                ]
            },
            {
                className: 'meta',
                begin: '^\\s*\\[(?=[\\w])',
                excludeBegin: true,
                end: '\\]',
                excludeEnd: true,
                contains: [
                    {
                        className: 'string',
                        begin: /"/,
                        end: /"/
                    }
                ]
            },
            {
                beginKeywords: 'new return throw await else',
                relevance: 0
            },
            {
                className: 'function',
                begin: '(' + TYPE_IDENT_RE + '\\s+)+' + hljs.IDENT_RE + '\\s*(<[^=]+>\\s*)?\\(',
                returnBegin: true,
                end: /\s*[{;=]/,
                excludeEnd: true,
                keywords: KEYWORDS,
                contains: [
                    {
                        beginKeywords: FUNCTION_MODIFIERS.join(" "),
                        relevance: 0
                    },
                    {
                        begin: hljs.IDENT_RE + '\\s*(<[^=]+>\\s*)?\\(',
                        returnBegin: true,
                        contains: [
                            hljs.TITLE_MODE,
                            GENERIC_MODIFIER
                        ],
                        relevance: 0
                    },
                    { match: /\(\)/ },
                    {
                        className: 'params',
                        begin: /\(/,
                        end: /\)/,
                        excludeBegin: true,
                        excludeEnd: true,
                        keywords: KEYWORDS,
                        relevance: 0,
                        contains: [
                            STRING,
                            NUMBERS,
                            hljs.C_BLOCK_COMMENT_MODE
                        ]
                    },
                    hljs.C_LINE_COMMENT_MODE,
                    hljs.C_BLOCK_COMMENT_MODE
                ]
            },
            AT_IDENTIFIER
        ]
    };
}
export { csharp as default };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NoYXJwLmpzIiwic291cmNlUm9vdCI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9CZWxsQ3ViZURldi9zaXRlLXRlc3RpbmcvZGVwbG95bWVudC8iLCJzb3VyY2VzIjpbImFzc2V0cy9zaXRlL2hpZ2hsaWdodF9qcy9sYW5ndWFnZXMvY3NoYXJwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLFNBQVMsTUFBTSxDQUFDLElBQUk7SUFDbEIsTUFBTSxpQkFBaUIsR0FBRztRQUN4QixNQUFNO1FBQ04sTUFBTTtRQUNOLE1BQU07UUFDTixTQUFTO1FBQ1QsVUFBVTtRQUNWLFFBQVE7UUFDUixTQUFTO1FBQ1QsTUFBTTtRQUNOLE9BQU87UUFDUCxLQUFLO1FBQ0wsTUFBTTtRQUNOLE1BQU07UUFDTixPQUFPO1FBQ1AsUUFBUTtRQUNSLE9BQU87UUFDUCxPQUFPO1FBQ1AsUUFBUTtRQUNSLE9BQU87UUFDUCxNQUFNO1FBQ04sUUFBUTtLQUNULENBQUM7SUFDRixNQUFNLGtCQUFrQixHQUFHO1FBQ3pCLFFBQVE7UUFDUixTQUFTO1FBQ1QsV0FBVztRQUNYLFFBQVE7UUFDUixVQUFVO1FBQ1YsV0FBVztRQUNYLFVBQVU7UUFDVixPQUFPO1FBQ1AsUUFBUTtRQUNSLFVBQVU7UUFDVixRQUFRO1FBQ1IsU0FBUztRQUNULEtBQUs7UUFDTCxRQUFRO1FBQ1IsU0FBUztLQUNWLENBQUM7SUFDRixNQUFNLGdCQUFnQixHQUFHO1FBQ3ZCLFNBQVM7UUFDVCxPQUFPO1FBQ1AsTUFBTTtRQUNOLE1BQU07S0FDUCxDQUFDO0lBQ0YsTUFBTSxlQUFlLEdBQUc7UUFDdEIsVUFBVTtRQUNWLElBQUk7UUFDSixNQUFNO1FBQ04sT0FBTztRQUNQLE1BQU07UUFDTixPQUFPO1FBQ1AsT0FBTztRQUNQLE9BQU87UUFDUCxVQUFVO1FBQ1YsSUFBSTtRQUNKLE1BQU07UUFDTixPQUFPO1FBQ1AsVUFBVTtRQUNWLFFBQVE7UUFDUixTQUFTO1FBQ1QsT0FBTztRQUNQ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QUFFLE1BQU0sSUFBSSxPQUFPLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5MYW5ndWFnZTogQyNcbkF1dGhvcjogSmFzb24gRGlhbW9uZCA8amFzb25AZGlhbW9uZC5uYW1lPlxuQ29udHJpYnV0b3I6IE5pY29sYXMgTExPQkVSQSA8bmxsb2JlcmFAZ21haWwuY29tPiwgUGlldGVyIFZhbnRvcnJlIDxwaWV0ZXJ2YW50b3JyZUBnbWFpbC5jb20+LCBEYXZpZCBQaW5lIDxkYXZpZC5waW5lQG1pY3Jvc29mdC5jb20+XG5XZWJzaXRlOiBodHRwczovL2RvY3MubWljcm9zb2Z0LmNvbS9kb3RuZXQvY3NoYXJwL1xuQ2F0ZWdvcnk6IGNvbW1vblxuKi9cblxuLyoqIEB0eXBlIExhbmd1YWdlRm4gKi9cbmZ1bmN0aW9uIGNzaGFycChobGpzKSB7XG4gIGNvbnN0IEJVSUxUX0lOX0tFWVdPUkRTID0gW1xuICAgICdib29sJyxcbiAgICAnYnl0ZScsXG4gICAgJ2NoYXInLFxuICAgICdkZWNpbWFsJyxcbiAgICAnZGVsZWdhdGUnLFxuICAgICdkb3VibGUnLFxuICAgICdkeW5hbWljJyxcbiAgICAnZW51bScsXG4gICAgJ2Zsb2F0JyxcbiAgICAnaW50JyxcbiAgICAnbG9uZycsXG4gICAgJ25pbnQnLFxuICAgICdudWludCcsXG4gICAgJ29iamVjdCcsXG4gICAgJ3NieXRlJyxcbiAgICAnc2hvcnQnLFxuICAgICdzdHJpbmcnLFxuICAgICd1bG9uZycsXG4gICAgJ3VpbnQnLFxuICAgICd1c2hvcnQnXG4gIF07XG4gIGNvbnN0IEZVTkNUSU9OX01PRElGSUVSUyA9IFtcbiAgICAncHVibGljJyxcbiAgICAncHJpdmF0ZScsXG4gICAgJ3Byb3RlY3RlZCcsXG4gICAgJ3N0YXRpYycsXG4gICAgJ2ludGVybmFsJyxcbiAgICAncHJvdGVjdGVkJyxcbiAgICAnYWJzdHJhY3QnLFxuICAgICdhc3luYycsXG4gICAgJ2V4dGVybicsXG4gICAgJ292ZXJyaWRlJyxcbiAgICAndW5zYWZlJyxcbiAgICAndmlydHVhbCcsXG4gICAgJ25ldycsXG4gICAgJ3NlYWxlZCcsXG4gICAgJ3BhcnRpYWwnXG4gIF07XG4gIGNvbnN0IExJVEVSQUxfS0VZV09SRFMgPSBbXG4gICAgJ2RlZmF1bHQnLFxuICAgICdmYWxzZScsXG4gICAgJ251bGwnLFxuICAgICd0cnVlJ1xuICBdO1xuICBjb25zdCBOT1JNQUxfS0VZV09SRFMgPSBbXG4gICAgJ2Fic3RyYWN0JyxcbiAgICAnYXMnLFxuICAgICdiYXNlJyxcbiAgICAnYnJlYWsnLFxuICAgICdjYXNlJyxcbiAgICAnY2F0Y2gnLFxuICAgICdjbGFzcycsXG4gICAgJ2NvbnN0JyxcbiAgICAnY29udGludWUnLFxuICAgICdkbycsXG4gICAgJ2Vsc2UnLFxuICAgICdldmVudCcsXG4gICAgJ2V4cGxpY2l0JyxcbiAgICAnZXh0ZXJuJyxcbiAgICAnZmluYWxseScsXG4gICAgJ2ZpeGVkJyxcbiAgICAnZm9yJyxcbiAgICAnZm9yZWFjaCcsXG4gICAgJ2dvdG8nLFxuICAgICdpZicsXG4gICAgJ2ltcGxpY2l0JyxcbiAgICAnaW4nLFxuICAgICdpbnRlcmZhY2UnLFxuICAgICdpbnRlcm5hbCcsXG4gICAgJ2lzJyxcbiAgICAnbG9jaycsXG4gICAgJ25hbWVzcGFjZScsXG4gICAgJ25ldycsXG4gICAgJ29wZXJhdG9yJyxcbiAgICAnb3V0JyxcbiAgICAnb3ZlcnJpZGUnLFxuICAgICdwYXJhbXMnLFxuICAgICdwcml2YXRlJyxcbiAgICAncHJvdGVjdGVkJyxcbiAgICAncHVibGljJyxcbiAgICAncmVhZG9ubHknLFxuICAgICdyZWNvcmQnLFxuICAgICdyZWYnLFxuICAgICdyZXR1cm4nLFxuICAgICdzY29wZWQnLFxuICAgICdzZWFsZWQnLFxuICAgICdzaXplb2YnLFxuICAgICdzdGFja2FsbG9jJyxcbiAgICAnc3RhdGljJyxcbiAgICAnc3RydWN0JyxcbiAgICAnc3dpdGNoJyxcbiAgICAndGhpcycsXG4gICAgJ3Rocm93JyxcbiAgICAndHJ5JyxcbiAgICAndHlwZW9mJyxcbiAgICAndW5jaGVja2VkJyxcbiAgICAndW5zYWZlJyxcbiAgICAndXNpbmcnLFxuICAgICd2aXJ0dWFsJyxcbiAgICAndm9pZCcsXG4gICAgJ3ZvbGF0aWxlJyxcbiAgICAnd2hpbGUnXG4gIF07XG4gIGNvbnN0IENPTlRFWFRVQUxfS0VZV09SRFMgPSBbXG4gICAgJ2FkZCcsXG4gICAgJ2FsaWFzJyxcbiAgICAnYW5kJyxcbiAgICAnYXNjZW5kaW5nJyxcbiAgICAnYXN5bmMnLFxuICAgICdhd2FpdCcsXG4gICAgJ2J5JyxcbiAgICAnZGVzY2VuZGluZycsXG4gICAgJ2VxdWFscycsXG4gICAgJ2Zyb20nLFxuICAgICdnZXQnLFxuICAgICdnbG9iYWwnLFxuICAgICdncm91cCcsXG4gICAgJ2luaXQnLFxuICAgICdpbnRvJyxcbiAgICAnam9pbicsXG4gICAgJ2xldCcsXG4gICAgJ25hbWVvZicsXG4gICAgJ25vdCcsXG4gICAgJ25vdG51bGwnLFxuICAgICdvbicsXG4gICAgJ29yJyxcbiAgICAnb3JkZXJieScsXG4gICAgJ3BhcnRpYWwnLFxuICAgICdyZW1vdmUnLFxuICAgICdzZWxlY3QnLFxuICAgICdzZXQnLFxuICAgICd1bm1hbmFnZWQnLFxuICAgICd2YWx1ZXwwJyxcbiAgICAndmFyJyxcbiAgICAnd2hlbicsXG4gICAgJ3doZXJlJyxcbiAgICAnd2l0aCcsXG4gICAgJ3lpZWxkJ1xuICBdO1xuXG4gIGNvbnN0IEtFWVdPUkRTID0ge1xuICAgIGtleXdvcmQ6IE5PUk1BTF9LRVlXT1JEUy5jb25jYXQoQ09OVEVYVFVBTF9LRVlXT1JEUyksXG4gICAgYnVpbHRfaW46IEJVSUxUX0lOX0tFWVdPUkRTLFxuICAgIGxpdGVyYWw6IExJVEVSQUxfS0VZV09SRFNcbiAgfTtcbiAgY29uc3QgVElUTEVfTU9ERSA9IGhsanMuaW5oZXJpdChobGpzLlRJVExFX01PREUsIHsgYmVnaW46ICdbYS16QS1aXShcXFxcLj9cXFxcdykqJyB9KTtcbiAgY29uc3QgTlVNQkVSUyA9IHtcbiAgICBjbGFzc05hbWU6ICdudW1iZXInLFxuICAgIHZhcmlhbnRzOiBbXG4gICAgICB7IGJlZ2luOiAnXFxcXGIoMGJbMDFcXCddKyknIH0sXG4gICAgICB7IGJlZ2luOiAnKC0/KVxcXFxiKFtcXFxcZFxcJ10rKFxcXFwuW1xcXFxkXFwnXSopP3xcXFxcLltcXFxcZFxcJ10rKSh1fFV8bHxMfHVsfFVMfGZ8RnxifEIpJyB9LFxuICAgICAgeyBiZWdpbjogJygtPykoXFxcXGIwW3hYXVthLWZBLUYwLTlcXCddK3woXFxcXGJbXFxcXGRcXCddKyhcXFxcLltcXFxcZFxcJ10qKT98XFxcXC5bXFxcXGRcXCddKykoW2VFXVstK10/W1xcXFxkXFwnXSspPyknIH1cbiAgICBdLFxuICAgIHJlbGV2YW5jZTogMFxuICB9O1xuICBjb25zdCBWRVJCQVRJTV9TVFJJTkcgPSB7XG4gICAgY2xhc3NOYW1lOiAnc3RyaW5nJyxcbiAgICBiZWdpbjogJ0BcIicsXG4gICAgZW5kOiAnXCInLFxuICAgIGNvbnRhaW5zOiBbIHsgYmVnaW46ICdcIlwiJyB9IF1cbiAgfTtcbiAgY29uc3QgVkVSQkFUSU1fU1RSSU5HX05PX0xGID0gaGxqcy5pbmhlcml0KFZFUkJBVElNX1NUUklORywgeyBpbGxlZ2FsOiAvXFxuLyB9KTtcbiAgY29uc3QgU1VCU1QgPSB7XG4gICAgY2xhc3NOYW1lOiAnc3Vic3QnLFxuICAgIGJlZ2luOiAvXFx7LyxcbiAgICBlbmQ6IC9cXH0vLFxuICAgIGtleXdvcmRzOiBLRVlXT1JEU1xuICB9O1xuICBjb25zdCBTVUJTVF9OT19MRiA9IGhsanMuaW5oZXJpdChTVUJTVCwgeyBpbGxlZ2FsOiAvXFxuLyB9KTtcbiAgY29uc3QgSU5URVJQT0xBVEVEX1NUUklORyA9IHtcbiAgICBjbGFzc05hbWU6ICdzdHJpbmcnLFxuICAgIGJlZ2luOiAvXFwkXCIvLFxuICAgIGVuZDogJ1wiJyxcbiAgICBpbGxlZ2FsOiAvXFxuLyxcbiAgICBjb250YWluczogW1xuICAgICAgeyBiZWdpbjogL1xce1xcey8gfSxcbiAgICAgIHsgYmVnaW46IC9cXH1cXH0vIH0sXG4gICAgICBobGpzLkJBQ0tTTEFTSF9FU0NBUEUsXG4gICAgICBTVUJTVF9OT19MRlxuICAgIF1cbiAgfTtcbiAgY29uc3QgSU5URVJQT0xBVEVEX1ZFUkJBVElNX1NUUklORyA9IHtcbiAgICBjbGFzc05hbWU6ICdzdHJpbmcnLFxuICAgIGJlZ2luOiAvXFwkQFwiLyxcbiAgICBlbmQ6ICdcIicsXG4gICAgY29udGFpbnM6IFtcbiAgICAgIHsgYmVnaW46IC9cXHtcXHsvIH0sXG4gICAgICB7IGJlZ2luOiAvXFx9XFx9LyB9LFxuICAgICAgeyBiZWdpbjogJ1wiXCInIH0sXG4gICAgICBTVUJTVFxuICAgIF1cbiAgfTtcbiAgY29uc3QgSU5URVJQT0xBVEVEX1ZFUkJBVElNX1NUUklOR19OT19MRiA9IGhsanMuaW5oZXJpdChJTlRFUlBPTEFURURfVkVSQkFUSU1fU1RSSU5HLCB7XG4gICAgaWxsZWdhbDogL1xcbi8sXG4gICAgY29udGFpbnM6IFtcbiAgICAgIHsgYmVnaW46IC9cXHtcXHsvIH0sXG4gICAgICB7IGJlZ2luOiAvXFx9XFx9LyB9LFxuICAgICAgeyBiZWdpbjogJ1wiXCInIH0sXG4gICAgICBTVUJTVF9OT19MRlxuICAgIF1cbiAgfSk7XG4gIFNVQlNULmNvbnRhaW5zID0gW1xuICAgIElOVEVSUE9MQVRFRF9WRVJCQVRJTV9TVFJJTkcsXG4gICAgSU5URVJQT0xBVEVEX1NUUklORyxcbiAgICBWRVJCQVRJTV9TVFJJTkcsXG4gICAgaGxqcy5BUE9TX1NUUklOR19NT0RFLFxuICAgIGhsanMuUVVPVEVfU1RSSU5HX01PREUsXG4gICAgTlVNQkVSUyxcbiAgICBobGpzLkNfQkxPQ0tfQ09NTUVOVF9NT0RFXG4gIF07XG4gIFNVQlNUX05PX0xGLmNvbnRhaW5zID0gW1xuICAgIElOVEVSUE9MQVRFRF9WRVJCQVRJTV9TVFJJTkdfTk9fTEYsXG4gICAgSU5URVJQT0xBVEVEX1NUUklORyxcbiAgICBWRVJCQVRJTV9TVFJJTkdfTk9fTEYsXG4gICAgaGxqcy5BUE9TX1NUUklOR19NT0RFLFxuICAgIGhsanMuUVVPVEVfU1RSSU5HX01PREUsXG4gICAgTlVNQkVSUyxcbiAgICBobGpzLmluaGVyaXQoaGxqcy5DX0JMT0NLX0NPTU1FTlRfTU9ERSwgeyBpbGxlZ2FsOiAvXFxuLyB9KVxuICBdO1xuICBjb25zdCBTVFJJTkcgPSB7IHZhcmlhbnRzOiBbXG4gICAgSU5URVJQT0xBVEVEX1ZFUkJBVElNX1NUUklORyxcbiAgICBJTlRFUlBPTEFURURfU1RSSU5HLFxuICAgIFZFUkJBVElNX1NUUklORyxcbiAgICBobGpzLkFQT1NfU1RSSU5HX01PREUsXG4gICAgaGxqcy5RVU9URV9TVFJJTkdfTU9ERVxuICBdIH07XG5cbiAgY29uc3QgR0VORVJJQ19NT0RJRklFUiA9IHtcbiAgICBiZWdpbjogXCI8XCIsXG4gICAgZW5kOiBcIj5cIixcbiAgICBjb250YWluczogW1xuICAgICAgeyBiZWdpbktleXdvcmRzOiBcImluIG91dFwiIH0sXG4gICAgICBUSVRMRV9NT0RFXG4gICAgXVxuICB9O1xuICBjb25zdCBUWVBFX0lERU5UX1JFID0gaGxqcy5JREVOVF9SRSArICcoPCcgKyBobGpzLklERU5UX1JFICsgJyhcXFxccyosXFxcXHMqJyArIGhsanMuSURFTlRfUkUgKyAnKSo+KT8oXFxcXFtcXFxcXSk/JztcbiAgY29uc3QgQVRfSURFTlRJRklFUiA9IHtcbiAgICAvLyBwcmV2ZW50cyBleHByZXNzaW9ucyBsaWtlIGBAY2xhc3NgIGZyb20gaW5jb3JyZWN0IGZsYWdnaW5nXG4gICAgLy8gYGNsYXNzYCBhcyBhIGtleXdvcmRcbiAgICBiZWdpbjogXCJAXCIgKyBobGpzLklERU5UX1JFLFxuICAgIHJlbGV2YW5jZTogMFxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ0MjJyxcbiAgICBhbGlhc2VzOiBbXG4gICAgICAnY3MnLFxuICAgICAgJ2MjJ1xuICAgIF0sXG4gICAga2V5d29yZHM6IEtFWVdPUkRTLFxuICAgIGlsbGVnYWw6IC86Oi8sXG4gICAgY29udGFpbnM6IFtcbiAgICAgIGhsanMuQ09NTUVOVChcbiAgICAgICAgJy8vLycsXG4gICAgICAgICckJyxcbiAgICAgICAge1xuICAgICAgICAgIHJldHVybkJlZ2luOiB0cnVlLFxuICAgICAgICAgIGNvbnRhaW5zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2RvY3RhZycsXG4gICAgICAgICAgICAgIHZhcmlhbnRzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgYmVnaW46ICcvLy8nLFxuICAgICAgICAgICAgICAgICAgcmVsZXZhbmNlOiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7IGJlZ2luOiAnPCEtLXwtLT4nIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgYmVnaW46ICc8Lz8nLFxuICAgICAgICAgICAgICAgICAgZW5kOiAnPidcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgICksXG4gICAgICBobGpzLkNfTElORV9DT01NRU5UX01PREUsXG4gICAgICBobGpzLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdtZXRhJyxcbiAgICAgICAgYmVnaW46ICcjJyxcbiAgICAgICAgZW5kOiAnJCcsXG4gICAgICAgIGtleXdvcmRzOiB7IGtleXdvcmQ6ICdpZiBlbHNlIGVsaWYgZW5kaWYgZGVmaW5lIHVuZGVmIHdhcm5pbmcgZXJyb3IgbGluZSByZWdpb24gZW5kcmVnaW9uIHByYWdtYSBjaGVja3N1bScgfVxuICAgICAgfSxcbiAgICAgIFNUUklORyxcbiAgICAgIE5VTUJFUlMsXG4gICAgICB7XG4gICAgICAgIGJlZ2luS2V5d29yZHM6ICdjbGFzcyBpbnRlcmZhY2UnLFxuICAgICAgICByZWxldmFuY2U6IDAsXG4gICAgICAgIGVuZDogL1t7Oz1dLyxcbiAgICAgICAgaWxsZWdhbDogL1teXFxzOixdLyxcbiAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICB7IGJlZ2luS2V5d29yZHM6IFwid2hlcmUgY2xhc3NcIiB9LFxuICAgICAgICAgIFRJVExFX01PREUsXG4gICAgICAgICAgR0VORVJJQ19NT0RJRklFUixcbiAgICAgICAgICBobGpzLkNfTElORV9DT01NRU5UX01PREUsXG4gICAgICAgICAgaGxqcy5DX0JMT0NLX0NPTU1FTlRfTU9ERVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBiZWdpbktleXdvcmRzOiAnbmFtZXNwYWNlJyxcbiAgICAgICAgcmVsZXZhbmNlOiAwLFxuICAgICAgICBlbmQ6IC9bezs9XS8sXG4gICAgICAgIGlsbGVnYWw6IC9bXlxcczpdLyxcbiAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICBUSVRMRV9NT0RFLFxuICAgICAgICAgIGhsanMuQ19MSU5FX0NPTU1FTlRfTU9ERSxcbiAgICAgICAgICBobGpzLkNfQkxPQ0tfQ09NTUVOVF9NT0RFXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZ2luS2V5d29yZHM6ICdyZWNvcmQnLFxuICAgICAgICByZWxldmFuY2U6IDAsXG4gICAgICAgIGVuZDogL1t7Oz1dLyxcbiAgICAgICAgaWxsZWdhbDogL1teXFxzOl0vLFxuICAgICAgICBjb250YWluczogW1xuICAgICAgICAgIFRJVExFX01PREUsXG4gICAgICAgICAgR0VORVJJQ19NT0RJRklFUixcbiAgICAgICAgICBobGpzLkNfTElORV9DT01NRU5UX01PREUsXG4gICAgICAgICAgaGxqcy5DX0JMT0NLX0NPTU1FTlRfTU9ERVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICAvLyBbQXR0cmlidXRlcyhcIlwiKV1cbiAgICAgICAgY2xhc3NOYW1lOiAnbWV0YScsXG4gICAgICAgIGJlZ2luOiAnXlxcXFxzKlxcXFxbKD89W1xcXFx3XSknLFxuICAgICAgICBleGNsdWRlQmVnaW46IHRydWUsXG4gICAgICAgIGVuZDogJ1xcXFxdJyxcbiAgICAgICAgZXhjbHVkZUVuZDogdHJ1ZSxcbiAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgYmVnaW46IC9cIi8sXG4gICAgICAgICAgICBlbmQ6IC9cIi9cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIC8vIEV4cHJlc3Npb24ga2V5d29yZHMgcHJldmVudCAna2V5d29yZCBOYW1lKC4uLiknIGZyb20gYmVpbmdcbiAgICAgICAgLy8gcmVjb2duaXplZCBhcyBhIGZ1bmN0aW9uIGRlZmluaXRpb25cbiAgICAgICAgYmVnaW5LZXl3b3JkczogJ25ldyByZXR1cm4gdGhyb3cgYXdhaXQgZWxzZScsXG4gICAgICAgIHJlbGV2YW5jZTogMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAnZnVuY3Rpb24nLFxuICAgICAgICBiZWdpbjogJygnICsgVFlQRV9JREVOVF9SRSArICdcXFxccyspKycgKyBobGpzLklERU5UX1JFICsgJ1xcXFxzKig8W149XSs+XFxcXHMqKT9cXFxcKCcsXG4gICAgICAgIHJldHVybkJlZ2luOiB0cnVlLFxuICAgICAgICBlbmQ6IC9cXHMqW3s7PV0vLFxuICAgICAgICBleGNsdWRlRW5kOiB0cnVlLFxuICAgICAgICBrZXl3b3JkczogS0VZV09SRFMsXG4gICAgICAgIGNvbnRhaW5zOiBbXG4gICAgICAgICAgLy8gcHJldmVudHMgdGhlc2UgZnJvbSBiZWluZyBoaWdobGlnaHRlZCBgdGl0bGVgXG4gICAgICAgICAge1xuICAgICAgICAgICAgYmVnaW5LZXl3b3JkczogRlVOQ1RJT05fTU9ESUZJRVJTLmpvaW4oXCIgXCIpLFxuICAgICAgICAgICAgcmVsZXZhbmNlOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBiZWdpbjogaGxqcy5JREVOVF9SRSArICdcXFxccyooPFtePV0rPlxcXFxzKik/XFxcXCgnLFxuICAgICAgICAgICAgcmV0dXJuQmVnaW46IHRydWUsXG4gICAgICAgICAgICBjb250YWluczogW1xuICAgICAgICAgICAgICBobGpzLlRJVExFX01PREUsXG4gICAgICAgICAgICAgIEdFTkVSSUNfTU9ESUZJRVJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICByZWxldmFuY2U6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIHsgbWF0Y2g6IC9cXChcXCkvIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAncGFyYW1zJyxcbiAgICAgICAgICAgIGJlZ2luOiAvXFwoLyxcbiAgICAgICAgICAgIGVuZDogL1xcKS8sXG4gICAgICAgICAgICBleGNsdWRlQmVnaW46IHRydWUsXG4gICAgICAgICAgICBleGNsdWRlRW5kOiB0cnVlLFxuICAgICAgICAgICAga2V5d29yZHM6IEtFWVdPUkRTLFxuICAgICAgICAgICAgcmVsZXZhbmNlOiAwLFxuICAgICAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICAgICAgU1RSSU5HLFxuICAgICAgICAgICAgICBOVU1CRVJTLFxuICAgICAgICAgICAgICBobGpzLkNfQkxPQ0tfQ09NTUVOVF9NT0RFXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfSxcbiAgICAgICAgICBobGpzLkNfTElORV9DT01NRU5UX01PREUsXG4gICAgICAgICAgaGxqcy5DX0JMT0NLX0NPTU1FTlRfTU9ERVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgQVRfSURFTlRJRklFUlxuICAgIF1cbiAgfTtcbn1cblxuZXhwb3J0IHsgY3NoYXJwIGFzIGRlZmF1bHQgfTtcbiJdfQ==