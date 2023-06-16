function n1ql(hljs) {
    const KEYWORDS = [
        "all",
        "alter",
        "analyze",
        "and",
        "any",
        "array",
        "as",
        "asc",
        "begin",
        "between",
        "binary",
        "boolean",
        "break",
        "bucket",
        "build",
        "by",
        "call",
        "case",
        "cast",
        "cluster",
        "collate",
        "collection",
        "commit",
        "connect",
        "continue",
        "correlate",
        "cover",
        "create",
        "database",
        "dataset",
        "datastore",
        "declare",
        "decrement",
        "delete",
        "derived",
        "desc",
        "describe",
        "distinct",
        "do",
        "drop",
        "each",
        "element",
        "else",
        "end",
        "every",
        "except",
        "exclude",
        "execute",
        "exists",
        "explain",
        "fetch",
        "first",
        "flatten",
        "for",
        "force",
        "from",
        "function",
        "grant",
        "group",
        "gsi",
        "having",
        "if",
        "ignore",
        "ilike",
        "in",
        "include",
        "increment",
        "index",
        "infer",
        "inline",
        "inner",
        "insert",
        "intersect",
        "into",
        "is",
        "join",
        "key",
        "keys",
        "keyspace",
        "known",
        "last",
        "left",
        "let",
        "letting",
        "like",
        "limit",
        "lsm",
        "map",
        "mapping",
        "matched",
        "materialized",
        "merge",
        "minus",
        "namespace",
        "nest",
        "not",
        "number",
        "object",
        "offset",
        "on",
        "option",
        "or",
        "order",
        "outer",
        "over",
        "parse",
        "partition",
        "password",
        "path",
        "pool",
        "prepare",
        "primary",
        "private",
        "privilege",
        "procedure",
        "public",
        "raw",
        "realm",
        "reduce",
        "rename",
        "return",
        "returning",
        "revoke",
        "right",
        "role",
        "rollback",
        "satisfies",
        "schema",
        "select",
        "self",
        "semi",
        "set",
        "show",
        "some",
        "start",
        "statistics",
        "string",
        "system",
        "then",
        "to",
        "transaction",
        "trigger",
        "truncate",
        "under",
        "union",
        "unique",
        "unknown",
        "unnest",
        "unset",
        "update",
        "upsert",
        "use",
        "user",
        "using",
        "validate",
        "value",
        "valued",
        "values",
        "via",
        "view",
        "when",
        "where",
        "while",
        "with",
        "within",
        "work",
        "xor"
    ];
    const LITERALS = [
        "true",
        "false",
        "null",
        "missing|5"
    ];
    const BUILT_INS = [
        "array_agg",
        "array_append",
        "array_concat",
        "array_contains",
        "array_count",
        "array_distinct",
        "array_ifnull",
        "array_length",
        "array_max",
        "array_min",
        "array_position",
        "array_prepend",
        "array_put",
        "array_range",
        "array_remove",
        "array_repeat",
        "array_replace",
        "array_reverse",
        "array_sort",
        "array_sum",
        "avg",
        "count",
        "max",
        "min",
        "sum",
        "greatest",
        "least",
        "ifmissing",
        "ifmissingornull",
        "ifnull",
        "missingif",
        "nullif",
        "ifinf",
        "ifnan",
        "ifnanorinf",
        "naninf",
        "neginfif",
        "posinfif",
        "clock_millis",
        "clock_str",
        "date_add_millis",
        "date_add_str",
        "date_diff_millis",
        "date_diff_str",
        "date_part_millis",
        "date_part_str",
        "date_trunc_millis",
        "date_trunc_str",
        "duration_to_str",
        "millis",
        "str_to_millis",
        "millis_to_str",
        "millis_to_utc",
        "millis_to_zone_name",
        "now_millis",
        "now_str",
        "str_to_duration",
        "str_to_utc",
        "str_to_zone_name",
        "decode_json",
        "encode_json",
        "encoded_size",
        "poly_length",
        "base64",
        "base64_encode",
        "base64_decode",
        "meta",
        "uuid",
        "abs",
        "acos",
        "asin",
        "atan",
        "atan2",
        "ceil",
        "cos",
        "degrees",
        "e",
        "exp",
        "ln",
        "log",
        "floor",
        "pi",
        "power",
        "radians",
        "random",
        "round",
        "sign",
        "sin",
        "sqrt",
        "tan",
        "trunc",
        "object_length",
        "object_names",
        "object_pairs",
        "object_inner_pairs",
        "object_values",
        "object_inner_values",
        "object_add",
        "object_put",
        "object_remove",
        "object_unwrap",
        "regexp_contains",
        "regexp_like",
        "regexp_position",
        "regexp_replace",
        "contains",
        "initcap",
        "length",
        "lower",
        "ltrim",
        "position",
        "repeat",
        "replace",
        "rtrim",
        "split",
        "substr",
        "title",
        "trim",
        "upper",
        "isarray",
        "isatom",
        "isboolean",
        "isnumber",
        "isobject",
        "isstring",
        "type",
        "toarray",
        "toatom",
        "toboolean",
        "tonumber",
        "toobject",
        "tostring"
    ];
    return {
        name: 'N1QL',
        case_insensitive: true,
        contains: [
            {
                beginKeywords: 'build create index delete drop explain infer|10 insert merge prepare select update upsert|10',
                end: /;/,
                keywords: {
                    keyword: KEYWORDS,
                    literal: LITERALS,
                    built_in: BUILT_INS
                },
                contains: [
                    {
                        className: 'string',
                        begin: '\'',
                        end: '\'',
                        contains: [hljs.BACKSLASH_ESCAPE]
                    },
                    {
                        className: 'string',
                        begin: '"',
                        end: '"',
                        contains: [hljs.BACKSLASH_ESCAPE]
                    },
                    {
                        className: 'symbol',
                        begin: '`',
                        end: '`',
                        contains: [hljs.BACKSLASH_ESCAPE]
                    },
                    hljs.C_NUMBER_MODE,
                    hljs.C_BLOCK_COMMENT_MODE
                ]
            },
            hljs.C_BLOCK_COMMENT_MODE
        ]
    };
}
export { n1ql as default };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibjFxbC5qcyIsInNvdXJjZVJvb3QiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vQmVsbEN1YmVEZXYvc2l0ZS10ZXN0aW5nL2RlcGxveW1lbnQvIiwic291cmNlcyI6WyJhc3NldHMvc2l0ZS9oaWdobGlnaHRfanMvbGFuZ3VhZ2VzL24xcWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsU0FBUyxJQUFJLENBQUMsSUFBSTtJQUVoQixNQUFNLFFBQVEsR0FBRztRQUNmLEtBQUs7UUFDTCxPQUFPO1FBQ1AsU0FBUztRQUNULEtBQUs7UUFDTCxLQUFLO1FBQ0wsT0FBTztRQUNQLElBQUk7UUFDSixLQUFLO1FBQ0wsT0FBTztRQUNQLFNBQVM7UUFDVCxRQUFRO1FBQ1IsU0FBUztRQUNULE9BQU87UUFDUCxRQUFRO1FBQ1IsT0FBTztRQUNQLElBQUk7UUFDSixNQUFNO1FBQ04sTUFBTTtRQUNOLE1BQU07UUFDTixTQUFTO1FBQ1QsU0FBUztRQUNULFlBQVk7UUFDWixRQUFRO1FBQ1IsU0FBUztRQUNULFVBQVU7UUFDVixXQUFXO1FBQ1gsT0FBTztRQUNQLFFBQVE7UUFDUixVQUFVO1FBQ1YsU0FBUztRQUNULFdBQVc7UUFDWCxTQUFTO1FBQ1QsV0FBVztRQUNYLFFBQVE7UUFDUixTQUFTO1FBQ1QsTUFBTTtRQUNOLFVBQVU7UUFDVixVQUFVO1FBQ1YsSUFBSTtRQUNKLE1BQU07UUFDTixNQUFNO1FBQ04sU0FBUztRQUNULE1BQU07UUFDTixLQUFLO1FBQ0wsT0FBTztRQUNQLFFBQVE7UUFDUixTQUFTO1FBQ1QsU0FBUztRQUNULFFBQVE7UUFDUixTQUFTO1FBQ1QsT0FBTztRQUNQLE9BQU87UUFDUCxTQUFTO1FBQ1QsS0FBSztRQUNMLE9BQU87UUFDUCxNQUFNO1FBQ04sVUFBVTtRQUNWLE9BQU87UUFDUCxPQUFPO1FBQ1AsS0FBSztRQUNMLFFBQVE7UUFDUixJQUFJO1FBQ0osUUFBUTtRQUNSLE9BQU87UUFDUCxJQUFJO1FBQ0osU0FB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cEI7Z0JBQ0QsUUFBUSxFQUFFO29CQUNSO3dCQUNFLFNBQVMsRUFBRSxRQUFRO3dCQUNuQixLQUFLLEVBQUUsSUFBSTt3QkFDWCxHQUFHLEVBQUUsSUFBSTt3QkFDVCxRQUFRLEVBQUUsQ0FBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUU7cUJBQ3BDO29CQUNEO3dCQUNFLFNBQVMsRUFBRSxRQUFRO3dCQUNuQixLQUFLLEVBQUUsR0FBRzt3QkFDVixHQUFHLEVBQUUsR0FBRzt3QkFDUixRQUFRLEVBQUUsQ0FBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUU7cUJBQ3BDO29CQUNEO3dCQUNFLFNBQVMsRUFBRSxRQUFRO3dCQUNuQixLQUFLLEVBQUUsR0FBRzt3QkFDVixHQUFHLEVBQUUsR0FBRzt3QkFDUixRQUFRLEVBQUUsQ0FBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUU7cUJBQ3BDO29CQUNELElBQUksQ0FBQyxhQUFhO29CQUNsQixJQUFJLENBQUMsb0JBQW9CO2lCQUMxQjthQUNGO1lBQ0QsSUFBSSxDQUFDLG9CQUFvQjtTQUMxQjtLQUNGLENBQUM7QUFDSixDQUFDO0FBRUQsT0FBTyxFQUFFLElBQUksSUFBSSxPQUFPLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gTGFuZ3VhZ2U6IE4xUUxcbiBBdXRob3I6IEFuZHJlcyBUw6RodCA8YW5kcmVzLnRhaHRAZ21haWwuY29tPlxuIENvbnRyaWJ1dG9yczogUmVuZSBTYWFyc29vIDxuZW5lQHRyaWluLm5ldD5cbiBEZXNjcmlwdGlvbjogQ291Y2hiYXNlIHF1ZXJ5IGxhbmd1YWdlXG4gV2Vic2l0ZTogaHR0cHM6Ly93d3cuY291Y2hiYXNlLmNvbS9wcm9kdWN0cy9uMXFsXG4gKi9cblxuZnVuY3Rpb24gbjFxbChobGpzKSB7XG4gIC8vIFRha2VuIGZyb20gaHR0cDovL2RldmVsb3Blci5jb3VjaGJhc2UuY29tL2RvY3VtZW50YXRpb24vc2VydmVyL2N1cnJlbnQvbjFxbC9uMXFsLWxhbmd1YWdlLXJlZmVyZW5jZS9yZXNlcnZlZHdvcmRzLmh0bWxcbiAgY29uc3QgS0VZV09SRFMgPSBbXG4gICAgXCJhbGxcIixcbiAgICBcImFsdGVyXCIsXG4gICAgXCJhbmFseXplXCIsXG4gICAgXCJhbmRcIixcbiAgICBcImFueVwiLFxuICAgIFwiYXJyYXlcIixcbiAgICBcImFzXCIsXG4gICAgXCJhc2NcIixcbiAgICBcImJlZ2luXCIsXG4gICAgXCJiZXR3ZWVuXCIsXG4gICAgXCJiaW5hcnlcIixcbiAgICBcImJvb2xlYW5cIixcbiAgICBcImJyZWFrXCIsXG4gICAgXCJidWNrZXRcIixcbiAgICBcImJ1aWxkXCIsXG4gICAgXCJieVwiLFxuICAgIFwiY2FsbFwiLFxuICAgIFwiY2FzZVwiLFxuICAgIFwiY2FzdFwiLFxuICAgIFwiY2x1c3RlclwiLFxuICAgIFwiY29sbGF0ZVwiLFxuICAgIFwiY29sbGVjdGlvblwiLFxuICAgIFwiY29tbWl0XCIsXG4gICAgXCJjb25uZWN0XCIsXG4gICAgXCJjb250aW51ZVwiLFxuICAgIFwiY29ycmVsYXRlXCIsXG4gICAgXCJjb3ZlclwiLFxuICAgIFwiY3JlYXRlXCIsXG4gICAgXCJkYXRhYmFzZVwiLFxuICAgIFwiZGF0YXNldFwiLFxuICAgIFwiZGF0YXN0b3JlXCIsXG4gICAgXCJkZWNsYXJlXCIsXG4gICAgXCJkZWNyZW1lbnRcIixcbiAgICBcImRlbGV0ZVwiLFxuICAgIFwiZGVyaXZlZFwiLFxuICAgIFwiZGVzY1wiLFxuICAgIFwiZGVzY3JpYmVcIixcbiAgICBcImRpc3RpbmN0XCIsXG4gICAgXCJkb1wiLFxuICAgIFwiZHJvcFwiLFxuICAgIFwiZWFjaFwiLFxuICAgIFwiZWxlbWVudFwiLFxuICAgIFwiZWxzZVwiLFxuICAgIFwiZW5kXCIsXG4gICAgXCJldmVyeVwiLFxuICAgIFwiZXhjZXB0XCIsXG4gICAgXCJleGNsdWRlXCIsXG4gICAgXCJleGVjdXRlXCIsXG4gICAgXCJleGlzdHNcIixcbiAgICBcImV4cGxhaW5cIixcbiAgICBcImZldGNoXCIsXG4gICAgXCJmaXJzdFwiLFxuICAgIFwiZmxhdHRlblwiLFxuICAgIFwiZm9yXCIsXG4gICAgXCJmb3JjZVwiLFxuICAgIFwiZnJvbVwiLFxuICAgIFwiZnVuY3Rpb25cIixcbiAgICBcImdyYW50XCIsXG4gICAgXCJncm91cFwiLFxuICAgIFwiZ3NpXCIsXG4gICAgXCJoYXZpbmdcIixcbiAgICBcImlmXCIsXG4gICAgXCJpZ25vcmVcIixcbiAgICBcImlsaWtlXCIsXG4gICAgXCJpblwiLFxuICAgIFwiaW5jbHVkZVwiLFxuICAgIFwiaW5jcmVtZW50XCIsXG4gICAgXCJpbmRleFwiLFxuICAgIFwiaW5mZXJcIixcbiAgICBcImlubGluZVwiLFxuICAgIFwiaW5uZXJcIixcbiAgICBcImluc2VydFwiLFxuICAgIFwiaW50ZXJzZWN0XCIsXG4gICAgXCJpbnRvXCIsXG4gICAgXCJpc1wiLFxuICAgIFwiam9pblwiLFxuICAgIFwia2V5XCIsXG4gICAgXCJrZXlzXCIsXG4gICAgXCJrZXlzcGFjZVwiLFxuICAgIFwia25vd25cIixcbiAgICBcImxhc3RcIixcbiAgICBcImxlZnRcIixcbiAgICBcImxldFwiLFxuICAgIFwibGV0dGluZ1wiLFxuICAgIFwibGlrZVwiLFxuICAgIFwibGltaXRcIixcbiAgICBcImxzbVwiLFxuICAgIFwibWFwXCIsXG4gICAgXCJtYXBwaW5nXCIsXG4gICAgXCJtYXRjaGVkXCIsXG4gICAgXCJtYXRlcmlhbGl6ZWRcIixcbiAgICBcIm1lcmdlXCIsXG4gICAgXCJtaW51c1wiLFxuICAgIFwibmFtZXNwYWNlXCIsXG4gICAgXCJuZXN0XCIsXG4gICAgXCJub3RcIixcbiAgICBcIm51bWJlclwiLFxuICAgIFwib2JqZWN0XCIsXG4gICAgXCJvZmZzZXRcIixcbiAgICBcIm9uXCIsXG4gICAgXCJvcHRpb25cIixcbiAgICBcIm9yXCIsXG4gICAgXCJvcmRlclwiLFxuICAgIFwib3V0ZXJcIixcbiAgICBcIm92ZXJcIixcbiAgICBcInBhcnNlXCIsXG4gICAgXCJwYXJ0aXRpb25cIixcbiAgICBcInBhc3N3b3JkXCIsXG4gICAgXCJwYXRoXCIsXG4gICAgXCJwb29sXCIsXG4gICAgXCJwcmVwYXJlXCIsXG4gICAgXCJwcmltYXJ5XCIsXG4gICAgXCJwcml2YXRlXCIsXG4gICAgXCJwcml2aWxlZ2VcIixcbiAgICBcInByb2NlZHVyZVwiLFxuICAgIFwicHVibGljXCIsXG4gICAgXCJyYXdcIixcbiAgICBcInJlYWxtXCIsXG4gICAgXCJyZWR1Y2VcIixcbiAgICBcInJlbmFtZVwiLFxuICAgIFwicmV0dXJuXCIsXG4gICAgXCJyZXR1cm5pbmdcIixcbiAgICBcInJldm9rZVwiLFxuICAgIFwicmlnaHRcIixcbiAgICBcInJvbGVcIixcbiAgICBcInJvbGxiYWNrXCIsXG4gICAgXCJzYXRpc2ZpZXNcIixcbiAgICBcInNjaGVtYVwiLFxuICAgIFwic2VsZWN0XCIsXG4gICAgXCJzZWxmXCIsXG4gICAgXCJzZW1pXCIsXG4gICAgXCJzZXRcIixcbiAgICBcInNob3dcIixcbiAgICBcInNvbWVcIixcbiAgICBcInN0YXJ0XCIsXG4gICAgXCJzdGF0aXN0aWNzXCIsXG4gICAgXCJzdHJpbmdcIixcbiAgICBcInN5c3RlbVwiLFxuICAgIFwidGhlblwiLFxuICAgIFwidG9cIixcbiAgICBcInRyYW5zYWN0aW9uXCIsXG4gICAgXCJ0cmlnZ2VyXCIsXG4gICAgXCJ0cnVuY2F0ZVwiLFxuICAgIFwidW5kZXJcIixcbiAgICBcInVuaW9uXCIsXG4gICAgXCJ1bmlxdWVcIixcbiAgICBcInVua25vd25cIixcbiAgICBcInVubmVzdFwiLFxuICAgIFwidW5zZXRcIixcbiAgICBcInVwZGF0ZVwiLFxuICAgIFwidXBzZXJ0XCIsXG4gICAgXCJ1c2VcIixcbiAgICBcInVzZXJcIixcbiAgICBcInVzaW5nXCIsXG4gICAgXCJ2YWxpZGF0ZVwiLFxuICAgIFwidmFsdWVcIixcbiAgICBcInZhbHVlZFwiLFxuICAgIFwidmFsdWVzXCIsXG4gICAgXCJ2aWFcIixcbiAgICBcInZpZXdcIixcbiAgICBcIndoZW5cIixcbiAgICBcIndoZXJlXCIsXG4gICAgXCJ3aGlsZVwiLFxuICAgIFwid2l0aFwiLFxuICAgIFwid2l0aGluXCIsXG4gICAgXCJ3b3JrXCIsXG4gICAgXCJ4b3JcIlxuICBdO1xuICAvLyBUYWtlbiBmcm9tIGh0dHA6Ly9kZXZlbG9wZXIuY291Y2hiYXNlLmNvbS9kb2N1bWVudGF0aW9uL3NlcnZlci80LjUvbjFxbC9uMXFsLWxhbmd1YWdlLXJlZmVyZW5jZS9saXRlcmFscy5odG1sXG4gIGNvbnN0IExJVEVSQUxTID0gW1xuICAgIFwidHJ1ZVwiLFxuICAgIFwiZmFsc2VcIixcbiAgICBcIm51bGxcIixcbiAgICBcIm1pc3Npbmd8NVwiXG4gIF07XG4gIC8vIFRha2VuIGZyb20gaHR0cDovL2RldmVsb3Blci5jb3VjaGJhc2UuY29tL2RvY3VtZW50YXRpb24vc2VydmVyLzQuNS9uMXFsL24xcWwtbGFuZ3VhZ2UtcmVmZXJlbmNlL2Z1bmN0aW9ucy5odG1sXG4gIGNvbnN0IEJVSUxUX0lOUyA9IFtcbiAgICBcImFycmF5X2FnZ1wiLFxuICAgIFwiYXJyYXlfYXBwZW5kXCIsXG4gICAgXCJhcnJheV9jb25jYXRcIixcbiAgICBcImFycmF5X2NvbnRhaW5zXCIsXG4gICAgXCJhcnJheV9jb3VudFwiLFxuICAgIFwiYXJyYXlfZGlzdGluY3RcIixcbiAgICBcImFycmF5X2lmbnVsbFwiLFxuICAgIFwiYXJyYXlfbGVuZ3RoXCIsXG4gICAgXCJhcnJheV9tYXhcIixcbiAgICBcImFycmF5X21pblwiLFxuICAgIFwiYXJyYXlfcG9zaXRpb25cIixcbiAgICBcImFycmF5X3ByZXBlbmRcIixcbiAgICBcImFycmF5X3B1dFwiLFxuICAgIFwiYXJyYXlfcmFuZ2VcIixcbiAgICBcImFycmF5X3JlbW92ZVwiLFxuICAgIFwiYXJyYXlfcmVwZWF0XCIsXG4gICAgXCJhcnJheV9yZXBsYWNlXCIsXG4gICAgXCJhcnJheV9yZXZlcnNlXCIsXG4gICAgXCJhcnJheV9zb3J0XCIsXG4gICAgXCJhcnJheV9zdW1cIixcbiAgICBcImF2Z1wiLFxuICAgIFwiY291bnRcIixcbiAgICBcIm1heFwiLFxuICAgIFwibWluXCIsXG4gICAgXCJzdW1cIixcbiAgICBcImdyZWF0ZXN0XCIsXG4gICAgXCJsZWFzdFwiLFxuICAgIFwiaWZtaXNzaW5nXCIsXG4gICAgXCJpZm1pc3Npbmdvcm51bGxcIixcbiAgICBcImlmbnVsbFwiLFxuICAgIFwibWlzc2luZ2lmXCIsXG4gICAgXCJudWxsaWZcIixcbiAgICBcImlmaW5mXCIsXG4gICAgXCJpZm5hblwiLFxuICAgIFwiaWZuYW5vcmluZlwiLFxuICAgIFwibmFuaW5mXCIsXG4gICAgXCJuZWdpbmZpZlwiLFxuICAgIFwicG9zaW5maWZcIixcbiAgICBcImNsb2NrX21pbGxpc1wiLFxuICAgIFwiY2xvY2tfc3RyXCIsXG4gICAgXCJkYXRlX2FkZF9taWxsaXNcIixcbiAgICBcImRhdGVfYWRkX3N0clwiLFxuICAgIFwiZGF0ZV9kaWZmX21pbGxpc1wiLFxuICAgIFwiZGF0ZV9kaWZmX3N0clwiLFxuICAgIFwiZGF0ZV9wYXJ0X21pbGxpc1wiLFxuICAgIFwiZGF0ZV9wYXJ0X3N0clwiLFxuICAgIFwiZGF0ZV90cnVuY19taWxsaXNcIixcbiAgICBcImRhdGVfdHJ1bmNfc3RyXCIsXG4gICAgXCJkdXJhdGlvbl90b19zdHJcIixcbiAgICBcIm1pbGxpc1wiLFxuICAgIFwic3RyX3RvX21pbGxpc1wiLFxuICAgIFwibWlsbGlzX3RvX3N0clwiLFxuICAgIFwibWlsbGlzX3RvX3V0Y1wiLFxuICAgIFwibWlsbGlzX3RvX3pvbmVfbmFtZVwiLFxuICAgIFwibm93X21pbGxpc1wiLFxuICAgIFwibm93X3N0clwiLFxuICAgIFwic3RyX3RvX2R1cmF0aW9uXCIsXG4gICAgXCJzdHJfdG9fdXRjXCIsXG4gICAgXCJzdHJfdG9fem9uZV9uYW1lXCIsXG4gICAgXCJkZWNvZGVfanNvblwiLFxuICAgIFwiZW5jb2RlX2pzb25cIixcbiAgICBcImVuY29kZWRfc2l6ZVwiLFxuICAgIFwicG9seV9sZW5ndGhcIixcbiAgICBcImJhc2U2NFwiLFxuICAgIFwiYmFzZTY0X2VuY29kZVwiLFxuICAgIFwiYmFzZTY0X2RlY29kZVwiLFxuICAgIFwibWV0YVwiLFxuICAgIFwidXVpZFwiLFxuICAgIFwiYWJzXCIsXG4gICAgXCJhY29zXCIsXG4gICAgXCJhc2luXCIsXG4gICAgXCJhdGFuXCIsXG4gICAgXCJhdGFuMlwiLFxuICAgIFwiY2VpbFwiLFxuICAgIFwiY29zXCIsXG4gICAgXCJkZWdyZWVzXCIsXG4gICAgXCJlXCIsXG4gICAgXCJleHBcIixcbiAgICBcImxuXCIsXG4gICAgXCJsb2dcIixcbiAgICBcImZsb29yXCIsXG4gICAgXCJwaVwiLFxuICAgIFwicG93ZXJcIixcbiAgICBcInJhZGlhbnNcIixcbiAgICBcInJhbmRvbVwiLFxuICAgIFwicm91bmRcIixcbiAgICBcInNpZ25cIixcbiAgICBcInNpblwiLFxuICAgIFwic3FydFwiLFxuICAgIFwidGFuXCIsXG4gICAgXCJ0cnVuY1wiLFxuICAgIFwib2JqZWN0X2xlbmd0aFwiLFxuICAgIFwib2JqZWN0X25hbWVzXCIsXG4gICAgXCJvYmplY3RfcGFpcnNcIixcbiAgICBcIm9iamVjdF9pbm5lcl9wYWlyc1wiLFxuICAgIFwib2JqZWN0X3ZhbHVlc1wiLFxuICAgIFwib2JqZWN0X2lubmVyX3ZhbHVlc1wiLFxuICAgIFwib2JqZWN0X2FkZFwiLFxuICAgIFwib2JqZWN0X3B1dFwiLFxuICAgIFwib2JqZWN0X3JlbW92ZVwiLFxuICAgIFwib2JqZWN0X3Vud3JhcFwiLFxuICAgIFwicmVnZXhwX2NvbnRhaW5zXCIsXG4gICAgXCJyZWdleHBfbGlrZVwiLFxuICAgIFwicmVnZXhwX3Bvc2l0aW9uXCIsXG4gICAgXCJyZWdleHBfcmVwbGFjZVwiLFxuICAgIFwiY29udGFpbnNcIixcbiAgICBcImluaXRjYXBcIixcbiAgICBcImxlbmd0aFwiLFxuICAgIFwibG93ZXJcIixcbiAgICBcImx0cmltXCIsXG4gICAgXCJwb3NpdGlvblwiLFxuICAgIFwicmVwZWF0XCIsXG4gICAgXCJyZXBsYWNlXCIsXG4gICAgXCJydHJpbVwiLFxuICAgIFwic3BsaXRcIixcbiAgICBcInN1YnN0clwiLFxuICAgIFwidGl0bGVcIixcbiAgICBcInRyaW1cIixcbiAgICBcInVwcGVyXCIsXG4gICAgXCJpc2FycmF5XCIsXG4gICAgXCJpc2F0b21cIixcbiAgICBcImlzYm9vbGVhblwiLFxuICAgIFwiaXNudW1iZXJcIixcbiAgICBcImlzb2JqZWN0XCIsXG4gICAgXCJpc3N0cmluZ1wiLFxuICAgIFwidHlwZVwiLFxuICAgIFwidG9hcnJheVwiLFxuICAgIFwidG9hdG9tXCIsXG4gICAgXCJ0b2Jvb2xlYW5cIixcbiAgICBcInRvbnVtYmVyXCIsXG4gICAgXCJ0b29iamVjdFwiLFxuICAgIFwidG9zdHJpbmdcIlxuICBdO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ04xUUwnLFxuICAgIGNhc2VfaW5zZW5zaXRpdmU6IHRydWUsXG4gICAgY29udGFpbnM6IFtcbiAgICAgIHtcbiAgICAgICAgYmVnaW5LZXl3b3JkczpcbiAgICAgICAgICAnYnVpbGQgY3JlYXRlIGluZGV4IGRlbGV0ZSBkcm9wIGV4cGxhaW4gaW5mZXJ8MTAgaW5zZXJ0IG1lcmdlIHByZXBhcmUgc2VsZWN0IHVwZGF0ZSB1cHNlcnR8MTAnLFxuICAgICAgICBlbmQ6IC87LyxcbiAgICAgICAga2V5d29yZHM6IHtcbiAgICAgICAgICBrZXl3b3JkOiBLRVlXT1JEUyxcbiAgICAgICAgICBsaXRlcmFsOiBMSVRFUkFMUyxcbiAgICAgICAgICBidWlsdF9pbjogQlVJTFRfSU5TXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRhaW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAnc3RyaW5nJyxcbiAgICAgICAgICAgIGJlZ2luOiAnXFwnJyxcbiAgICAgICAgICAgIGVuZDogJ1xcJycsXG4gICAgICAgICAgICBjb250YWluczogWyBobGpzLkJBQ0tTTEFTSF9FU0NBUEUgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAnc3RyaW5nJyxcbiAgICAgICAgICAgIGJlZ2luOiAnXCInLFxuICAgICAgICAgICAgZW5kOiAnXCInLFxuICAgICAgICAgICAgY29udGFpbnM6IFsgaGxqcy5CQUNLU0xBU0hfRVNDQVBFIF1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3N5bWJvbCcsXG4gICAgICAgICAgICBiZWdpbjogJ2AnLFxuICAgICAgICAgICAgZW5kOiAnYCcsXG4gICAgICAgICAgICBjb250YWluczogWyBobGpzLkJBQ0tTTEFTSF9FU0NBUEUgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAgaGxqcy5DX05VTUJFUl9NT0RFLFxuICAgICAgICAgIGhsanMuQ19CTE9DS19DT01NRU5UX01PREVcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIGhsanMuQ19CTE9DS19DT01NRU5UX01PREVcbiAgICBdXG4gIH07XG59XG5cbmV4cG9ydCB7IG4xcWwgYXMgZGVmYXVsdCB9O1xuIl19