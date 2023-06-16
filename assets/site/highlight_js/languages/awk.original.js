function awk(hljs) {
    const VARIABLE = {
        className: 'variable',
        variants: [
            { begin: /\$[\w\d#@][\w\d_]*/ },
            { begin: /\$\{(.*?)\}/ }
        ]
    };
    const KEYWORDS = 'BEGIN END if else while do for in break continue delete next nextfile function func exit|10';
    const STRING = {
        className: 'string',
        contains: [hljs.BACKSLASH_ESCAPE],
        variants: [
            {
                begin: /(u|b)?r?'''/,
                end: /'''/,
                relevance: 10
            },
            {
                begin: /(u|b)?r?"""/,
                end: /"""/,
                relevance: 10
            },
            {
                begin: /(u|r|ur)'/,
                end: /'/,
                relevance: 10
            },
            {
                begin: /(u|r|ur)"/,
                end: /"/,
                relevance: 10
            },
            {
                begin: /(b|br)'/,
                end: /'/
            },
            {
                begin: /(b|br)"/,
                end: /"/
            },
            hljs.APOS_STRING_MODE,
            hljs.QUOTE_STRING_MODE
        ]
    };
    return {
        name: 'Awk',
        keywords: { keyword: KEYWORDS },
        contains: [
            VARIABLE,
            STRING,
            hljs.REGEXP_MODE,
            hljs.HASH_COMMENT_MODE,
            hljs.NUMBER_MODE
        ]
    };
}
export { awk as default };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdrLmpzIiwic291cmNlUm9vdCI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9CZWxsQ3ViZURldi9zaXRlLXRlc3RpbmcvZGVwbG95bWVudC8iLCJzb3VyY2VzIjpbImFzc2V0cy9zaXRlL2hpZ2hsaWdodF9qcy9sYW5ndWFnZXMvYXdrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLFNBQVMsR0FBRyxDQUFDLElBQUk7SUFDZixNQUFNLFFBQVEsR0FBRztRQUNmLFNBQVMsRUFBRSxVQUFVO1FBQ3JCLFFBQVEsRUFBRTtZQUNSLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixFQUFFO1lBQy9CLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRTtTQUN6QjtLQUNGLENBQUM7SUFDRixNQUFNLFFBQVEsR0FBRyw2RkFBNkYsQ0FBQztJQUMvRyxNQUFNLE1BQU0sR0FBRztRQUNiLFNBQVMsRUFBRSxRQUFRO1FBQ25CLFFBQVEsRUFBRSxDQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBRTtRQUNuQyxRQUFRLEVBQUU7WUFDUjtnQkFDRSxLQUFLLEVBQUUsYUFBYTtnQkFDcEIsR0FBRyxFQUFFLEtBQUs7Z0JBQ1YsU0FBUyxFQUFFLEVBQUU7YUFDZDtZQUNEO2dCQUNFLEtBQUssRUFBRSxhQUFhO2dCQUNwQixHQUFHLEVBQUUsS0FBSztnQkFDVixTQUFTLEVBQUUsRUFBRTthQUNkO1lBQ0Q7Z0JBQ0UsS0FBSyxFQUFFLFdBQVc7Z0JBQ2xCLEdBQUcsRUFBRSxHQUFHO2dCQUNSLFNBQVMsRUFBRSxFQUFFO2FBQ2Q7WUFDRDtnQkFDRSxLQUFLLEVBQUUsV0FBVztnQkFDbEIsR0FBRyxFQUFFLEdBQUc7Z0JBQ1IsU0FBUyxFQUFFLEVBQUU7YUFDZDtZQUNEO2dCQUNFLEtBQUssRUFBRSxTQUFTO2dCQUNoQixHQUFHLEVBQUUsR0FBRzthQUNUO1lBQ0Q7Z0JBQ0UsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLEdBQUcsRUFBRSxHQUFHO2FBQ1Q7WUFDRCxJQUFJLENBQUMsZ0JBQWdCO1lBQ3JCLElBQUksQ0FBQyxpQkFBaUI7U0FDdkI7S0FDRixDQUFDO0lBQ0YsT0FBTztRQUNMLElBQUksRUFBRSxLQUFLO1FBQ1gsUUFBUSxFQUFFLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRTtRQUMvQixRQUFRLEVBQUU7WUFDUixRQUFRO1lBQ1IsTUFBTTtZQUNOLElBQUksQ0FBQyxXQUFXO1lBQ2hCLElBQUksQ0FBQyxpQkFBaUI7WUFDdEIsSUFBSSxDQUFDLFdBQVc7U0FDakI7S0FDRixDQUFDO0FBQ0osQ0FBQztBQUVELE9BQU8sRUFBRSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuTGFuZ3VhZ2U6IEF3a1xuQXV0aG9yOiBNYXR0aGV3IERhbHkgPG1hdHRoZXdiZGFseUBnbWFpbC5jb20+XG5XZWJzaXRlOiBodHRwczovL3d3dy5nbnUub3JnL3NvZnR3YXJlL2dhd2svbWFudWFsL2dhd2suaHRtbFxuRGVzY3JpcHRpb246IGxhbmd1YWdlIGRlZmluaXRpb24gZm9yIEF3ayBzY3JpcHRzXG4qL1xuXG4vKiogQHR5cGUgTGFuZ3VhZ2VGbiAqL1xuZnVuY3Rpb24gYXdrKGhsanMpIHtcbiAgY29uc3QgVkFSSUFCTEUgPSB7XG4gICAgY2xhc3NOYW1lOiAndmFyaWFibGUnLFxuICAgIHZhcmlhbnRzOiBbXG4gICAgICB7IGJlZ2luOiAvXFwkW1xcd1xcZCNAXVtcXHdcXGRfXSovIH0sXG4gICAgICB7IGJlZ2luOiAvXFwkXFx7KC4qPylcXH0vIH1cbiAgICBdXG4gIH07XG4gIGNvbnN0IEtFWVdPUkRTID0gJ0JFR0lOIEVORCBpZiBlbHNlIHdoaWxlIGRvIGZvciBpbiBicmVhayBjb250aW51ZSBkZWxldGUgbmV4dCBuZXh0ZmlsZSBmdW5jdGlvbiBmdW5jIGV4aXR8MTAnO1xuICBjb25zdCBTVFJJTkcgPSB7XG4gICAgY2xhc3NOYW1lOiAnc3RyaW5nJyxcbiAgICBjb250YWluczogWyBobGpzLkJBQ0tTTEFTSF9FU0NBUEUgXSxcbiAgICB2YXJpYW50czogW1xuICAgICAge1xuICAgICAgICBiZWdpbjogLyh1fGIpP3I/JycnLyxcbiAgICAgICAgZW5kOiAvJycnLyxcbiAgICAgICAgcmVsZXZhbmNlOiAxMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgYmVnaW46IC8odXxiKT9yP1wiXCJcIi8sXG4gICAgICAgIGVuZDogL1wiXCJcIi8sXG4gICAgICAgIHJlbGV2YW5jZTogMTBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAvKHV8cnx1ciknLyxcbiAgICAgICAgZW5kOiAvJy8sXG4gICAgICAgIHJlbGV2YW5jZTogMTBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAvKHV8cnx1cilcIi8sXG4gICAgICAgIGVuZDogL1wiLyxcbiAgICAgICAgcmVsZXZhbmNlOiAxMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgYmVnaW46IC8oYnxiciknLyxcbiAgICAgICAgZW5kOiAvJy9cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAvKGJ8YnIpXCIvLFxuICAgICAgICBlbmQ6IC9cIi9cbiAgICAgIH0sXG4gICAgICBobGpzLkFQT1NfU1RSSU5HX01PREUsXG4gICAgICBobGpzLlFVT1RFX1NUUklOR19NT0RFXG4gICAgXVxuICB9O1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdBd2snLFxuICAgIGtleXdvcmRzOiB7IGtleXdvcmQ6IEtFWVdPUkRTIH0sXG4gICAgY29udGFpbnM6IFtcbiAgICAgIFZBUklBQkxFLFxuICAgICAgU1RSSU5HLFxuICAgICAgaGxqcy5SRUdFWFBfTU9ERSxcbiAgICAgIGhsanMuSEFTSF9DT01NRU5UX01PREUsXG4gICAgICBobGpzLk5VTUJFUl9NT0RFXG4gICAgXVxuICB9O1xufVxuXG5leHBvcnQgeyBhd2sgYXMgZGVmYXVsdCB9O1xuIl19