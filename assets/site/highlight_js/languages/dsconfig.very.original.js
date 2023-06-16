function dsconfig(hljs) {
    const QUOTED_PROPERTY = {
        className: 'string',
        begin: /"/,
        end: /"/
    };
    const APOS_PROPERTY = {
        className: 'string',
        begin: /'/,
        end: /'/
    };
    const UNQUOTED_PROPERTY = {
        className: 'string',
        begin: /[\w\-?]+:\w+/,
        end: /\W/,
        relevance: 0
    };
    const VALUELESS_PROPERTY = {
        className: 'string',
        begin: /\w+(\-\w+)*/,
        end: /(?=\W)/,
        relevance: 0
    };
    return {
        keywords: 'dsconfig',
        contains: [
            {
                className: 'keyword',
                begin: '^dsconfig',
                end: /\s/,
                excludeEnd: true,
                relevance: 10
            },
            {
                className: 'built_in',
                begin: /(list|create|get|set|delete)-(\w+)/,
                end: /\s/,
                excludeEnd: true,
                illegal: '!@#$%^&*()',
                relevance: 10
            },
            {
                className: 'built_in',
                begin: /--(\w+)/,
                end: /\s/,
                excludeEnd: true
            },
            QUOTED_PROPERTY,
            APOS_PROPERTY,
            UNQUOTED_PROPERTY,
            VALUELESS_PROPERTY,
            hljs.HASH_COMMENT_MODE
        ]
    };
}
export { dsconfig as default };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHNjb25maWcuanMiLCJzb3VyY2VSb290IjoiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JlbGxDdWJlRGV2L3NpdGUtdGVzdGluZy9kZXBsb3ltZW50LyIsInNvdXJjZXMiOlsiYXNzZXRzL3NpdGUvaGlnaGxpZ2h0X2pzL2xhbmd1YWdlcy9kc2NvbmZpZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxTQUFTLFFBQVEsQ0FBQyxJQUFJO0lBQ3BCLE1BQU0sZUFBZSxHQUFHO1FBQ3RCLFNBQVMsRUFBRSxRQUFRO1FBQ25CLEtBQUssRUFBRSxHQUFHO1FBQ1YsR0FBRyxFQUFFLEdBQUc7S0FDVCxDQUFDO0lBQ0YsTUFBTSxhQUFhLEdBQUc7UUFDcEIsU0FBUyxFQUFFLFFBQVE7UUFDbkIsS0FBSyxFQUFFLEdBQUc7UUFDVixHQUFHLEVBQUUsR0FBRztLQUNULENBQUM7SUFDRixNQUFNLGlCQUFpQixHQUFHO1FBQ3hCLFNBQVMsRUFBRSxRQUFRO1FBQ25CLEtBQUssRUFBRSxjQUFjO1FBQ3JCLEdBQUcsRUFBRSxJQUFJO1FBQ1QsU0FBUyxFQUFFLENBQUM7S0FDYixDQUFDO0lBQ0YsTUFBTSxrQkFBa0IsR0FBRztRQUN6QixTQUFTLEVBQUUsUUFBUTtRQUNuQixLQUFLLEVBQUUsYUFBYTtRQUNwQixHQUFHLEVBQUUsUUFBUTtRQUNiLFNBQVMsRUFBRSxDQUFDO0tBQ2IsQ0FBQztJQUVGLE9BQU87UUFDTCxRQUFRLEVBQUUsVUFBVTtRQUNwQixRQUFRLEVBQUU7WUFDUjtnQkFDRSxTQUFTLEVBQUUsU0FBUztnQkFDcEIsS0FBSyxFQUFFLFdBQVc7Z0JBQ2xCLEdBQUcsRUFBRSxJQUFJO2dCQUNULFVBQVUsRUFBRSxJQUFJO2dCQUNoQixTQUFTLEVBQUUsRUFBRTthQUNkO1lBQ0Q7Z0JBQ0UsU0FBUyxFQUFFLFVBQVU7Z0JBQ3JCLEtBQUssRUFBRSxvQ0FBb0M7Z0JBQzNDLEdBQUcsRUFBRSxJQUFJO2dCQUNULFVBQVUsRUFBRSxJQUFJO2dCQUNoQixPQUFPLEVBQUUsWUFBWTtnQkFDckIsU0FBUyxFQUFFLEVBQUU7YUFDZDtZQUNEO2dCQUNFLFNBQVMsRUFBRSxVQUFVO2dCQUNyQixLQUFLLEVBQUUsU0FBUztnQkFDaEIsR0FBRyxFQUFFLElBQUk7Z0JBQ1QsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRCxlQUFlO1lBQ2YsYUFBYTtZQUNiLGlCQUFpQjtZQUNqQixrQkFBa0I7WUFDbEIsSUFBSSxDQUFDLGlCQUFpQjtTQUN2QjtLQUNGLENBQUM7QUFDSixDQUFDO0FBRUQsT0FBTyxFQUFFLFFBQVEsSUFBSSxPQUFPLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gTGFuZ3VhZ2U6IGRzY29uZmlnXG4gRGVzY3JpcHRpb246IGRzY29uZmlnIGJhdGNoIGNvbmZpZ3VyYXRpb24gbGFuZ3VhZ2UgZm9yIExEQVAgZGlyZWN0b3J5IHNlcnZlcnNcbiBDb250cmlidXRvcnM6IEphY29iIENoaWxkcmVzcyA8amFjb2JjQGdtYWlsLmNvbT5cbiBDYXRlZ29yeTogZW50ZXJwcmlzZSwgY29uZmlnXG4gKi9cblxuLyoqIEB0eXBlIExhbmd1YWdlRm4gKi9cbmZ1bmN0aW9uIGRzY29uZmlnKGhsanMpIHtcbiAgY29uc3QgUVVPVEVEX1BST1BFUlRZID0ge1xuICAgIGNsYXNzTmFtZTogJ3N0cmluZycsXG4gICAgYmVnaW46IC9cIi8sXG4gICAgZW5kOiAvXCIvXG4gIH07XG4gIGNvbnN0IEFQT1NfUFJPUEVSVFkgPSB7XG4gICAgY2xhc3NOYW1lOiAnc3RyaW5nJyxcbiAgICBiZWdpbjogLycvLFxuICAgIGVuZDogLycvXG4gIH07XG4gIGNvbnN0IFVOUVVPVEVEX1BST1BFUlRZID0ge1xuICAgIGNsYXNzTmFtZTogJ3N0cmluZycsXG4gICAgYmVnaW46IC9bXFx3XFwtP10rOlxcdysvLFxuICAgIGVuZDogL1xcVy8sXG4gICAgcmVsZXZhbmNlOiAwXG4gIH07XG4gIGNvbnN0IFZBTFVFTEVTU19QUk9QRVJUWSA9IHtcbiAgICBjbGFzc05hbWU6ICdzdHJpbmcnLFxuICAgIGJlZ2luOiAvXFx3KyhcXC1cXHcrKSovLFxuICAgIGVuZDogLyg/PVxcVykvLFxuICAgIHJlbGV2YW5jZTogMFxuICB9O1xuXG4gIHJldHVybiB7XG4gICAga2V5d29yZHM6ICdkc2NvbmZpZycsXG4gICAgY29udGFpbnM6IFtcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAna2V5d29yZCcsXG4gICAgICAgIGJlZ2luOiAnXmRzY29uZmlnJyxcbiAgICAgICAgZW5kOiAvXFxzLyxcbiAgICAgICAgZXhjbHVkZUVuZDogdHJ1ZSxcbiAgICAgICAgcmVsZXZhbmNlOiAxMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAnYnVpbHRfaW4nLFxuICAgICAgICBiZWdpbjogLyhsaXN0fGNyZWF0ZXxnZXR8c2V0fGRlbGV0ZSktKFxcdyspLyxcbiAgICAgICAgZW5kOiAvXFxzLyxcbiAgICAgICAgZXhjbHVkZUVuZDogdHJ1ZSxcbiAgICAgICAgaWxsZWdhbDogJyFAIyQlXiYqKCknLFxuICAgICAgICByZWxldmFuY2U6IDEwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdidWlsdF9pbicsXG4gICAgICAgIGJlZ2luOiAvLS0oXFx3KykvLFxuICAgICAgICBlbmQ6IC9cXHMvLFxuICAgICAgICBleGNsdWRlRW5kOiB0cnVlXG4gICAgICB9LFxuICAgICAgUVVPVEVEX1BST1BFUlRZLFxuICAgICAgQVBPU19QUk9QRVJUWSxcbiAgICAgIFVOUVVPVEVEX1BST1BFUlRZLFxuICAgICAgVkFMVUVMRVNTX1BST1BFUlRZLFxuICAgICAgaGxqcy5IQVNIX0NPTU1FTlRfTU9ERVxuICAgIF1cbiAgfTtcbn1cblxuZXhwb3J0IHsgZHNjb25maWcgYXMgZGVmYXVsdCB9O1xuIl19