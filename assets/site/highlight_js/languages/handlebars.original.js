function handlebars(hljs) {
    const regex = hljs.regex;
    const BUILT_INS = {
        $pattern: /[\w.\/]+/,
        built_in: [
            'action',
            'bindattr',
            'collection',
            'component',
            'concat',
            'debugger',
            'each',
            'each-in',
            'get',
            'hash',
            'if',
            'in',
            'input',
            'link-to',
            'loc',
            'log',
            'lookup',
            'mut',
            'outlet',
            'partial',
            'query-params',
            'render',
            'template',
            'textarea',
            'unbound',
            'unless',
            'view',
            'with',
            'yield'
        ]
    };
    const LITERALS = {
        $pattern: /[\w.\/]+/,
        literal: [
            'true',
            'false',
            'undefined',
            'null'
        ]
    };
    const DOUBLE_QUOTED_ID_REGEX = /""|"[^"]+"/;
    const SINGLE_QUOTED_ID_REGEX = /''|'[^']+'/;
    const BRACKET_QUOTED_ID_REGEX = /\[\]|\[[^\]]+\]/;
    const PLAIN_ID_REGEX = /[^\s!"#%&'()*+,.\/;<=>@\[\\\]^`{|}~]+/;
    const PATH_DELIMITER_REGEX = /(\.|\/)/;
    const ANY_ID = regex.either(DOUBLE_QUOTED_ID_REGEX, SINGLE_QUOTED_ID_REGEX, BRACKET_QUOTED_ID_REGEX, PLAIN_ID_REGEX);
    const IDENTIFIER_REGEX = regex.concat(regex.optional(/\.|\.\/|\//), ANY_ID, regex.anyNumberOfTimes(regex.concat(PATH_DELIMITER_REGEX, ANY_ID)));
    const HASH_PARAM_REGEX = regex.concat('(', BRACKET_QUOTED_ID_REGEX, '|', PLAIN_ID_REGEX, ')(?==)');
    const HELPER_NAME_OR_PATH_EXPRESSION = { begin: IDENTIFIER_REGEX };
    const HELPER_PARAMETER = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, { keywords: LITERALS });
    const SUB_EXPRESSION = {
        begin: /\(/,
        end: /\)/
    };
    const HASH = {
        className: 'attr',
        begin: HASH_PARAM_REGEX,
        relevance: 0,
        starts: {
            begin: /=/,
            end: /=/,
            starts: { contains: [
                    hljs.NUMBER_MODE,
                    hljs.QUOTE_STRING_MODE,
                    hljs.APOS_STRING_MODE,
                    HELPER_PARAMETER,
                    SUB_EXPRESSION
                ] }
        }
    };
    const BLOCK_PARAMS = {
        begin: /as\s+\|/,
        keywords: { keyword: 'as' },
        end: /\|/,
        contains: [
            {
                begin: /\w+/
            }
        ]
    };
    const HELPER_PARAMETERS = {
        contains: [
            hljs.NUMBER_MODE,
            hljs.QUOTE_STRING_MODE,
            hljs.APOS_STRING_MODE,
            BLOCK_PARAMS,
            HASH,
            HELPER_PARAMETER,
            SUB_EXPRESSION
        ],
        returnEnd: true
    };
    const SUB_EXPRESSION_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
        className: 'name',
        keywords: BUILT_INS,
        starts: hljs.inherit(HELPER_PARAMETERS, { end: /\)/ })
    });
    SUB_EXPRESSION.contains = [SUB_EXPRESSION_CONTENTS];
    const OPENING_BLOCK_MUSTACHE_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
        keywords: BUILT_INS,
        className: 'name',
        starts: hljs.inherit(HELPER_PARAMETERS, { end: /\}\}/ })
    });
    const CLOSING_BLOCK_MUSTACHE_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
        keywords: BUILT_INS,
        className: 'name'
    });
    const BASIC_MUSTACHE_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
        className: 'name',
        keywords: BUILT_INS,
        starts: hljs.inherit(HELPER_PARAMETERS, { end: /\}\}/ })
    });
    const ESCAPE_MUSTACHE_WITH_PRECEEDING_BACKSLASH = {
        begin: /\\\{\{/,
        skip: true
    };
    const PREVENT_ESCAPE_WITH_ANOTHER_PRECEEDING_BACKSLASH = {
        begin: /\\\\(?=\{\{)/,
        skip: true
    };
    return {
        name: 'Handlebars',
        aliases: [
            'hbs',
            'html.hbs',
            'html.handlebars',
            'htmlbars'
        ],
        case_insensitive: true,
        subLanguage: 'xml',
        contains: [
            ESCAPE_MUSTACHE_WITH_PRECEEDING_BACKSLASH,
            PREVENT_ESCAPE_WITH_ANOTHER_PRECEEDING_BACKSLASH,
            hljs.COMMENT(/\{\{!--/, /--\}\}/),
            hljs.COMMENT(/\{\{!/, /\}\}/),
            {
                className: 'template-tag',
                begin: /\{\{\{\{(?!\/)/,
                end: /\}\}\}\}/,
                contains: [OPENING_BLOCK_MUSTACHE_CONTENTS],
                starts: {
                    end: /\{\{\{\{\//,
                    returnEnd: true,
                    subLanguage: 'xml'
                }
            },
            {
                className: 'template-tag',
                begin: /\{\{\{\{\//,
                end: /\}\}\}\}/,
                contains: [CLOSING_BLOCK_MUSTACHE_CONTENTS]
            },
            {
                className: 'template-tag',
                begin: /\{\{#/,
                end: /\}\}/,
                contains: [OPENING_BLOCK_MUSTACHE_CONTENTS]
            },
            {
                className: 'template-tag',
                begin: /\{\{(?=else\}\})/,
                end: /\}\}/,
                keywords: 'else'
            },
            {
                className: 'template-tag',
                begin: /\{\{(?=else if)/,
                end: /\}\}/,
                keywords: 'else if'
            },
            {
                className: 'template-tag',
                begin: /\{\{\//,
                end: /\}\}/,
                contains: [CLOSING_BLOCK_MUSTACHE_CONTENTS]
            },
            {
                className: 'template-variable',
                begin: /\{\{\{/,
                end: /\}\}\}/,
                contains: [BASIC_MUSTACHE_CONTENTS]
            },
            {
                className: 'template-variable',
                begin: /\{\{/,
                end: /\}\}/,
                contains: [BASIC_MUSTACHE_CONTENTS]
            }
        ]
    };
}
export { handlebars as default };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlYmFycy5qcyIsInNvdXJjZVJvb3QiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vQmVsbEN1YmVEZXYvc2l0ZS10ZXN0aW5nL2RlcGxveW1lbnQvIiwic291cmNlcyI6WyJhc3NldHMvc2l0ZS9oaWdobGlnaHRfanMvbGFuZ3VhZ2VzL2hhbmRsZWJhcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBU0EsU0FBUyxVQUFVLENBQUMsSUFBSTtJQUN0QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3pCLE1BQU0sU0FBUyxHQUFHO1FBQ2hCLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLFFBQVEsRUFBRTtZQUNSLFFBQVE7WUFDUixVQUFVO1lBQ1YsWUFBWTtZQUNaLFdBQVc7WUFDWCxRQUFRO1lBQ1IsVUFBVTtZQUNWLE1BQU07WUFDTixTQUFTO1lBQ1QsS0FBSztZQUNMLE1BQU07WUFDTixJQUFJO1lBQ0osSUFBSTtZQUNKLE9BQU87WUFDUCxTQUFTO1lBQ1QsS0FBSztZQUNMLEtBQUs7WUFDTCxRQUFRO1lBQ1IsS0FBSztZQUNMLFFBQVE7WUFDUixTQUFTO1lBQ1QsY0FBYztZQUNkLFFBQVE7WUFDUixVQUFVO1lBQ1YsVUFBVTtZQUNWLFNBQVM7WUFDVCxRQUFRO1lBQ1IsTUFBTTtZQUNOLE1BQU07WUFDTixPQUFPO1NBQ1I7S0FDRixDQUFDO0lBRUYsTUFBTSxRQUFRLEdBQUc7UUFDZixRQUFRLEVBQUUsVUFBVTtRQUNwQixPQUFPLEVBQUU7WUFDUCxNQUFNO1lBQ04sT0FBTztZQUNQLFdBQVc7WUFDWCxNQUFNO1NBQ1A7S0FDRixDQUFDO0lBTUYsTUFBTSxzQkFBc0IsR0FBRyxZQUFZLENBQUM7SUFDNUMsTUFBTSxzQkFBc0IsR0FBRyxZQUFZLENBQUM7SUFDNUMsTUFBTSx1QkFBdUIsR0FBRyxpQkFBaUIsQ0FBQztJQUNsRCxNQUFNLGNBQWMsR0FBRyx1Q0FBdUMsQ0FBQztJQUMvRCxNQUFNLG9CQUFvQixH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RUUsU0FBUyxFQUFFLGNBQWM7Z0JBQ3pCLEtBQUssRUFBRSxPQUFPO2dCQUNkLEdBQUcsRUFBRSxNQUFNO2dCQUNYLFFBQVEsRUFBRSxDQUFFLCtCQUErQixDQUFFO2FBQzlDO1lBQ0Q7Z0JBQ0UsU0FBUyxFQUFFLGNBQWM7Z0JBQ3pCLEtBQUssRUFBRSxrQkFBa0I7Z0JBQ3pCLEdBQUcsRUFBRSxNQUFNO2dCQUNYLFFBQVEsRUFBRSxNQUFNO2FBQ2pCO1lBQ0Q7Z0JBQ0UsU0FBUyxFQUFFLGNBQWM7Z0JBQ3pCLEtBQUssRUFBRSxpQkFBaUI7Z0JBQ3hCLEdBQUcsRUFBRSxNQUFNO2dCQUNYLFFBQVEsRUFBRSxTQUFTO2FBQ3BCO1lBQ0Q7Z0JBRUUsU0FBUyxFQUFFLGNBQWM7Z0JBQ3pCLEtBQUssRUFBRSxRQUFRO2dCQUNmLEdBQUcsRUFBRSxNQUFNO2dCQUNYLFFBQVEsRUFBRSxDQUFFLCtCQUErQixDQUFFO2FBQzlDO1lBQ0Q7Z0JBRUUsU0FBUyxFQUFFLG1CQUFtQjtnQkFDOUIsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsR0FBRyxFQUFFLFFBQVE7Z0JBQ2IsUUFBUSxFQUFFLENBQUUsdUJBQXVCLENBQUU7YUFDdEM7WUFDRDtnQkFFRSxTQUFTLEVBQUUsbUJBQW1CO2dCQUM5QixLQUFLLEVBQUUsTUFBTTtnQkFDYixHQUFHLEVBQUUsTUFBTTtnQkFDWCxRQUFRLEVBQUUsQ0FBRSx1QkFBdUIsQ0FBRTthQUN0QztTQUNGO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUFFRCxPQUFPLEVBQUUsVUFBVSxJQUFJLE9BQU8sRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkxhbmd1YWdlOiBIYW5kbGViYXJzXG5SZXF1aXJlczogeG1sLmpzXG5BdXRob3I6IFJvYmluIFdhcmQgPHJvYmluLndhcmRAZ21haWwuY29tPlxuRGVzY3JpcHRpb246IE1hdGNoZXIgZm9yIEhhbmRsZWJhcnMgYXMgd2VsbCBhcyBFbWJlckpTIGFkZGl0aW9ucy5cbldlYnNpdGU6IGh0dHBzOi8vaGFuZGxlYmFyc2pzLmNvbVxuQ2F0ZWdvcnk6IHRlbXBsYXRlXG4qL1xuXG5mdW5jdGlvbiBoYW5kbGViYXJzKGhsanMpIHtcbiAgY29uc3QgcmVnZXggPSBobGpzLnJlZ2V4O1xuICBjb25zdCBCVUlMVF9JTlMgPSB7XG4gICAgJHBhdHRlcm46IC9bXFx3LlxcL10rLyxcbiAgICBidWlsdF9pbjogW1xuICAgICAgJ2FjdGlvbicsXG4gICAgICAnYmluZGF0dHInLFxuICAgICAgJ2NvbGxlY3Rpb24nLFxuICAgICAgJ2NvbXBvbmVudCcsXG4gICAgICAnY29uY2F0JyxcbiAgICAgICdkZWJ1Z2dlcicsXG4gICAgICAnZWFjaCcsXG4gICAgICAnZWFjaC1pbicsXG4gICAgICAnZ2V0JyxcbiAgICAgICdoYXNoJyxcbiAgICAgICdpZicsXG4gICAgICAnaW4nLFxuICAgICAgJ2lucHV0JyxcbiAgICAgICdsaW5rLXRvJyxcbiAgICAgICdsb2MnLFxuICAgICAgJ2xvZycsXG4gICAgICAnbG9va3VwJyxcbiAgICAgICdtdXQnLFxuICAgICAgJ291dGxldCcsXG4gICAgICAncGFydGlhbCcsXG4gICAgICAncXVlcnktcGFyYW1zJyxcbiAgICAgICdyZW5kZXInLFxuICAgICAgJ3RlbXBsYXRlJyxcbiAgICAgICd0ZXh0YXJlYScsXG4gICAgICAndW5ib3VuZCcsXG4gICAgICAndW5sZXNzJyxcbiAgICAgICd2aWV3JyxcbiAgICAgICd3aXRoJyxcbiAgICAgICd5aWVsZCdcbiAgICBdXG4gIH07XG5cbiAgY29uc3QgTElURVJBTFMgPSB7XG4gICAgJHBhdHRlcm46IC9bXFx3LlxcL10rLyxcbiAgICBsaXRlcmFsOiBbXG4gICAgICAndHJ1ZScsXG4gICAgICAnZmFsc2UnLFxuICAgICAgJ3VuZGVmaW5lZCcsXG4gICAgICAnbnVsbCdcbiAgICBdXG4gIH07XG5cbiAgLy8gYXMgZGVmaW5lZCBpbiBodHRwczovL2hhbmRsZWJhcnNqcy5jb20vZ3VpZGUvZXhwcmVzc2lvbnMuaHRtbCNsaXRlcmFsLXNlZ21lbnRzXG4gIC8vIHRoaXMgcmVnZXggbWF0Y2hlcyBsaXRlcmFsIHNlZ21lbnRzIGxpa2UgJyBhYmMgJyBvciBbIGFiYyBdIGFzIHdlbGwgYXMgaGVscGVycyBhbmQgcGF0aHNcbiAgLy8gbGlrZSBhL2IsIC4vYWJjL2NkZSwgYW5kIGFiYy5iY2RcblxuICBjb25zdCBET1VCTEVfUVVPVEVEX0lEX1JFR0VYID0gL1wiXCJ8XCJbXlwiXStcIi87XG4gIGNvbnN0IFNJTkdMRV9RVU9URURfSURfUkVHRVggPSAvJyd8J1teJ10rJy87XG4gIGNvbnN0IEJSQUNLRVRfUVVPVEVEX0lEX1JFR0VYID0gL1xcW1xcXXxcXFtbXlxcXV0rXFxdLztcbiAgY29uc3QgUExBSU5fSURfUkVHRVggPSAvW15cXHMhXCIjJSYnKCkqKywuXFwvOzw9PkBcXFtcXFxcXFxdXmB7fH1+XSsvO1xuICBjb25zdCBQQVRIX0RFTElNSVRFUl9SRUdFWCA9IC8oXFwufFxcLykvO1xuICBjb25zdCBBTllfSUQgPSByZWdleC5laXRoZXIoXG4gICAgRE9VQkxFX1FVT1RFRF9JRF9SRUdFWCxcbiAgICBTSU5HTEVfUVVPVEVEX0lEX1JFR0VYLFxuICAgIEJSQUNLRVRfUVVPVEVEX0lEX1JFR0VYLFxuICAgIFBMQUlOX0lEX1JFR0VYXG4gICk7XG5cbiAgY29uc3QgSURFTlRJRklFUl9SRUdFWCA9IHJlZ2V4LmNvbmNhdChcbiAgICByZWdleC5vcHRpb25hbCgvXFwufFxcLlxcL3xcXC8vKSwgLy8gcmVsYXRpdmUgb3IgYWJzb2x1dGUgcGF0aFxuICAgIEFOWV9JRCxcbiAgICByZWdleC5hbnlOdW1iZXJPZlRpbWVzKHJlZ2V4LmNvbmNhdChcbiAgICAgIFBBVEhfREVMSU1JVEVSX1JFR0VYLFxuICAgICAgQU5ZX0lEXG4gICAgKSlcbiAgKTtcblxuICAvLyBpZGVudGlmaWVyIGZvbGxvd2VkIGJ5IGEgZXF1YWwtc2lnbiAod2l0aG91dCB0aGUgZXF1YWwgc2lnbilcbiAgY29uc3QgSEFTSF9QQVJBTV9SRUdFWCA9IHJlZ2V4LmNvbmNhdChcbiAgICAnKCcsXG4gICAgQlJBQ0tFVF9RVU9URURfSURfUkVHRVgsICd8JyxcbiAgICBQTEFJTl9JRF9SRUdFWCxcbiAgICAnKSg/PT0pJ1xuICApO1xuXG4gIGNvbnN0IEhFTFBFUl9OQU1FX09SX1BBVEhfRVhQUkVTU0lPTiA9IHsgYmVnaW46IElERU5USUZJRVJfUkVHRVggfTtcblxuICBjb25zdCBIRUxQRVJfUEFSQU1FVEVSID0gaGxqcy5pbmhlcml0KEhFTFBFUl9OQU1FX09SX1BBVEhfRVhQUkVTU0lPTiwgeyBrZXl3b3JkczogTElURVJBTFMgfSk7XG5cbiAgY29uc3QgU1VCX0VYUFJFU1NJT04gPSB7XG4gICAgYmVnaW46IC9cXCgvLFxuICAgIGVuZDogL1xcKS9cbiAgICAvLyB0aGUgXCJjb250YWluc1wiIGlzIGFkZGVkIGJlbG93IHdoZW4gYWxsIG5lY2Vzc2FyeSBzdWItbW9kZXMgYXJlIGRlZmluZWRcbiAgfTtcblxuICBjb25zdCBIQVNIID0ge1xuICAgIC8vIGZrYSBcImF0dHJpYnV0ZS1hc3NpZ25tZW50XCIsIHBhcmFtZXRlcnMgb2YgdGhlIGZvcm0gJ2tleT12YWx1ZSdcbiAgICBjbGFzc05hbWU6ICdhdHRyJyxcbiAgICBiZWdpbjogSEFTSF9QQVJBTV9SRUdFWCxcbiAgICByZWxldmFuY2U6IDAsXG4gICAgc3RhcnRzOiB7XG4gICAgICBiZWdpbjogLz0vLFxuICAgICAgZW5kOiAvPS8sXG4gICAgICBzdGFydHM6IHsgY29udGFpbnM6IFtcbiAgICAgICAgaGxqcy5OVU1CRVJfTU9ERSxcbiAgICAgICAgaGxqcy5RVU9URV9TVFJJTkdfTU9ERSxcbiAgICAgICAgaGxqcy5BUE9TX1NUUklOR19NT0RFLFxuICAgICAgICBIRUxQRVJfUEFSQU1FVEVSLFxuICAgICAgICBTVUJfRVhQUkVTU0lPTlxuICAgICAgXSB9XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IEJMT0NLX1BBUkFNUyA9IHtcbiAgICAvLyBwYXJhbWV0ZXJzIG9mIHRoZSBmb3JtICd7eyN3aXRoIHggYXMgfCB5IHx9fS4uLnt7L3dpdGh9fSdcbiAgICBiZWdpbjogL2FzXFxzK1xcfC8sXG4gICAga2V5d29yZHM6IHsga2V5d29yZDogJ2FzJyB9LFxuICAgIGVuZDogL1xcfC8sXG4gICAgY29udGFpbnM6IFtcbiAgICAgIHtcbiAgICAgICAgLy8gZGVmaW5lIHN1Yi1tb2RlIGluIG9yZGVyIHRvIHByZXZlbnQgaGlnaGxpZ2h0aW5nIG9mIGJsb2NrLXBhcmFtZXRlciBuYW1lZCBcImFzXCJcbiAgICAgICAgYmVnaW46IC9cXHcrLyB9XG4gICAgXVxuICB9O1xuXG4gIGNvbnN0IEhFTFBFUl9QQVJBTUVURVJTID0ge1xuICAgIGNvbnRhaW5zOiBbXG4gICAgICBobGpzLk5VTUJFUl9NT0RFLFxuICAgICAgaGxqcy5RVU9URV9TVFJJTkdfTU9ERSxcbiAgICAgIGhsanMuQVBPU19TVFJJTkdfTU9ERSxcbiAgICAgIEJMT0NLX1BBUkFNUyxcbiAgICAgIEhBU0gsXG4gICAgICBIRUxQRVJfUEFSQU1FVEVSLFxuICAgICAgU1VCX0VYUFJFU1NJT05cbiAgICBdLFxuICAgIHJldHVybkVuZDogdHJ1ZVxuICAgIC8vIHRoZSBwcm9wZXJ0eSBcImVuZFwiIGlzIGRlZmluZWQgdGhyb3VnaCBpbmhlcml0YW5jZSB3aGVuIHRoZSBtb2RlIGlzIHVzZWQuIElmIGRlcGVuZHNcbiAgICAvLyBvbiB0aGUgc3Vycm91bmRpbmcgbW9kZSwgYnV0IFwiZW5kc1dpdGhQYXJlbnRcIiBkb2VzIG5vdCB3b3JrIGhlcmUgKGkuZS4gaXQgaW5jbHVkZXMgdGhlXG4gICAgLy8gZW5kLXRva2VuIG9mIHRoZSBzdXJyb3VuZGluZyBtb2RlKVxuICB9O1xuXG4gIGNvbnN0IFNVQl9FWFBSRVNTSU9OX0NPTlRFTlRTID0gaGxqcy5pbmhlcml0KEhFTFBFUl9OQU1FX09SX1BBVEhfRVhQUkVTU0lPTiwge1xuICAgIGNsYXNzTmFtZTogJ25hbWUnLFxuICAgIGtleXdvcmRzOiBCVUlMVF9JTlMsXG4gICAgc3RhcnRzOiBobGpzLmluaGVyaXQoSEVMUEVSX1BBUkFNRVRFUlMsIHsgZW5kOiAvXFwpLyB9KVxuICB9KTtcblxuICBTVUJfRVhQUkVTU0lPTi5jb250YWlucyA9IFsgU1VCX0VYUFJFU1NJT05fQ09OVEVOVFMgXTtcblxuICBjb25zdCBPUEVOSU5HX0JMT0NLX01VU1RBQ0hFX0NPTlRFTlRTID0gaGxqcy5pbmhlcml0KEhFTFBFUl9OQU1FX09SX1BBVEhfRVhQUkVTU0lPTiwge1xuICAgIGtleXdvcmRzOiBCVUlMVF9JTlMsXG4gICAgY2xhc3NOYW1lOiAnbmFtZScsXG4gICAgc3RhcnRzOiBobGpzLmluaGVyaXQoSEVMUEVSX1BBUkFNRVRFUlMsIHsgZW5kOiAvXFx9XFx9LyB9KVxuICB9KTtcblxuICBjb25zdCBDTE9TSU5HX0JMT0NLX01VU1RBQ0hFX0NPTlRFTlRTID0gaGxqcy5pbmhlcml0KEhFTFBFUl9OQU1FX09SX1BBVEhfRVhQUkVTU0lPTiwge1xuICAgIGtleXdvcmRzOiBCVUlMVF9JTlMsXG4gICAgY2xhc3NOYW1lOiAnbmFtZSdcbiAgfSk7XG5cbiAgY29uc3QgQkFTSUNfTVVTVEFDSEVfQ09OVEVOVFMgPSBobGpzLmluaGVyaXQoSEVMUEVSX05BTUVfT1JfUEFUSF9FWFBSRVNTSU9OLCB7XG4gICAgY2xhc3NOYW1lOiAnbmFtZScsXG4gICAga2V5d29yZHM6IEJVSUxUX0lOUyxcbiAgICBzdGFydHM6IGhsanMuaW5oZXJpdChIRUxQRVJfUEFSQU1FVEVSUywgeyBlbmQ6IC9cXH1cXH0vIH0pXG4gIH0pO1xuXG4gIGNvbnN0IEVTQ0FQRV9NVVNUQUNIRV9XSVRIX1BSRUNFRURJTkdfQkFDS1NMQVNIID0ge1xuICAgIGJlZ2luOiAvXFxcXFxce1xcey8sXG4gICAgc2tpcDogdHJ1ZVxuICB9O1xuICBjb25zdCBQUkVWRU5UX0VTQ0FQRV9XSVRIX0FOT1RIRVJfUFJFQ0VFRElOR19CQUNLU0xBU0ggPSB7XG4gICAgYmVnaW46IC9cXFxcXFxcXCg/PVxce1xceykvLFxuICAgIHNraXA6IHRydWVcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdIYW5kbGViYXJzJyxcbiAgICBhbGlhc2VzOiBbXG4gICAgICAnaGJzJyxcbiAgICAgICdodG1sLmhicycsXG4gICAgICAnaHRtbC5oYW5kbGViYXJzJyxcbiAgICAgICdodG1sYmFycydcbiAgICBdLFxuICAgIGNhc2VfaW5zZW5zaXRpdmU6IHRydWUsXG4gICAgc3ViTGFuZ3VhZ2U6ICd4bWwnLFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICBFU0NBUEVfTVVTVEFDSEVfV0lUSF9QUkVDRUVESU5HX0JBQ0tTTEFTSCxcbiAgICAgIFBSRVZFTlRfRVNDQVBFX1dJVEhfQU5PVEhFUl9QUkVDRUVESU5HX0JBQ0tTTEFTSCxcbiAgICAgIGhsanMuQ09NTUVOVCgvXFx7XFx7IS0tLywgLy0tXFx9XFx9LyksXG4gICAgICBobGpzLkNPTU1FTlQoL1xce1xceyEvLCAvXFx9XFx9LyksXG4gICAgICB7XG4gICAgICAgIC8vIG9wZW4gcmF3IGJsb2NrIFwie3t7e3Jhd319fX0gY29udGVudCBub3QgZXZhbHVhdGVkIHt7e3svcmF3fX19fVwiXG4gICAgICAgIGNsYXNzTmFtZTogJ3RlbXBsYXRlLXRhZycsXG4gICAgICAgIGJlZ2luOiAvXFx7XFx7XFx7XFx7KD8hXFwvKS8sXG4gICAgICAgIGVuZDogL1xcfVxcfVxcfVxcfS8sXG4gICAgICAgIGNvbnRhaW5zOiBbIE9QRU5JTkdfQkxPQ0tfTVVTVEFDSEVfQ09OVEVOVFMgXSxcbiAgICAgICAgc3RhcnRzOiB7XG4gICAgICAgICAgZW5kOiAvXFx7XFx7XFx7XFx7XFwvLyxcbiAgICAgICAgICByZXR1cm5FbmQ6IHRydWUsXG4gICAgICAgICAgc3ViTGFuZ3VhZ2U6ICd4bWwnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIC8vIGNsb3NlIHJhdyBibG9ja1xuICAgICAgICBjbGFzc05hbWU6ICd0ZW1wbGF0ZS10YWcnLFxuICAgICAgICBiZWdpbjogL1xce1xce1xce1xce1xcLy8sXG4gICAgICAgIGVuZDogL1xcfVxcfVxcfVxcfS8sXG4gICAgICAgIGNvbnRhaW5zOiBbIENMT1NJTkdfQkxPQ0tfTVVTVEFDSEVfQ09OVEVOVFMgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgLy8gb3BlbiBibG9jayBzdGF0ZW1lbnRcbiAgICAgICAgY2xhc3NOYW1lOiAndGVtcGxhdGUtdGFnJyxcbiAgICAgICAgYmVnaW46IC9cXHtcXHsjLyxcbiAgICAgICAgZW5kOiAvXFx9XFx9LyxcbiAgICAgICAgY29udGFpbnM6IFsgT1BFTklOR19CTE9DS19NVVNUQUNIRV9DT05URU5UUyBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICd0ZW1wbGF0ZS10YWcnLFxuICAgICAgICBiZWdpbjogL1xce1xceyg/PWVsc2VcXH1cXH0pLyxcbiAgICAgICAgZW5kOiAvXFx9XFx9LyxcbiAgICAgICAga2V5d29yZHM6ICdlbHNlJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGVtcGxhdGUtdGFnJyxcbiAgICAgICAgYmVnaW46IC9cXHtcXHsoPz1lbHNlIGlmKS8sXG4gICAgICAgIGVuZDogL1xcfVxcfS8sXG4gICAgICAgIGtleXdvcmRzOiAnZWxzZSBpZidcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIC8vIGNsb3NpbmcgYmxvY2sgc3RhdGVtZW50XG4gICAgICAgIGNsYXNzTmFtZTogJ3RlbXBsYXRlLXRhZycsXG4gICAgICAgIGJlZ2luOiAvXFx7XFx7XFwvLyxcbiAgICAgICAgZW5kOiAvXFx9XFx9LyxcbiAgICAgICAgY29udGFpbnM6IFsgQ0xPU0lOR19CTE9DS19NVVNUQUNIRV9DT05URU5UUyBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICAvLyB0ZW1wbGF0ZSB2YXJpYWJsZSBvciBoZWxwZXItY2FsbCB0aGF0IGlzIE5PVCBodG1sLWVzY2FwZWRcbiAgICAgICAgY2xhc3NOYW1lOiAndGVtcGxhdGUtdmFyaWFibGUnLFxuICAgICAgICBiZWdpbjogL1xce1xce1xcey8sXG4gICAgICAgIGVuZDogL1xcfVxcfVxcfS8sXG4gICAgICAgIGNvbnRhaW5zOiBbIEJBU0lDX01VU1RBQ0hFX0NPTlRFTlRTIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIC8vIHRlbXBsYXRlIHZhcmlhYmxlIG9yIGhlbHBlci1jYWxsIHRoYXQgaXMgaHRtbC1lc2NhcGVkXG4gICAgICAgIGNsYXNzTmFtZTogJ3RlbXBsYXRlLXZhcmlhYmxlJyxcbiAgICAgICAgYmVnaW46IC9cXHtcXHsvLFxuICAgICAgICBlbmQ6IC9cXH1cXH0vLFxuICAgICAgICBjb250YWluczogWyBCQVNJQ19NVVNUQUNIRV9DT05URU5UUyBdXG4gICAgICB9XG4gICAgXVxuICB9O1xufVxuXG5leHBvcnQgeyBoYW5kbGViYXJzIGFzIGRlZmF1bHQgfTtcbiJdfQ==