function stan(hljs) {
    const regex = hljs.regex;
    const BLOCKS = [
        'functions',
        'model',
        'data',
        'parameters',
        'quantities',
        'transformed',
        'generated'
    ];
    const STATEMENTS = [
        'for',
        'in',
        'if',
        'else',
        'while',
        'break',
        'continue',
        'return'
    ];
    const TYPES = [
        'array',
        'complex',
        'int',
        'real',
        'vector',
        'ordered',
        'positive_ordered',
        'simplex',
        'unit_vector',
        'row_vector',
        'matrix',
        'cholesky_factor_corr|10',
        'cholesky_factor_cov|10',
        'corr_matrix|10',
        'cov_matrix|10',
        'void'
    ];
    const FUNCTIONS = [
        'Phi',
        'Phi_approx',
        'abs',
        'acos',
        'acosh',
        'add_diag',
        'algebra_solver',
        'algebra_solver_newton',
        'append_array',
        'append_col',
        'append_row',
        'asin',
        'asinh',
        'atan',
        'atan2',
        'atanh',
        'bessel_first_kind',
        'bessel_second_kind',
        'binary_log_loss',
        'binomial_coefficient_log',
        'block',
        'cbrt',
        'ceil',
        'chol2inv',
        'cholesky_decompose',
        'choose',
        'col',
        'cols',
        'columns_dot_product',
        'columns_dot_self',
        'conj',
        'cos',
        'cosh',
        'cov_exp_quad',
        'crossprod',
        'csr_extract_u',
        'csr_extract_v',
        'csr_extract_w',
        'csr_matrix_times_vector',
        'csr_to_dense_matrix',
        'cumulative_sum',
        'determinant',
        'diag_matrix',
        'diag_post_multiply',
        'diag_pre_multiply',
        'diagonal',
        'digamma',
        'dims',
        'distance',
        'dot_product',
        'dot_self',
        'eigenvalues_sym',
        'eigenvectors_sym',
        'erf',
        'erfc',
        'exp',
        'exp2',
        'expm1',
        'fabs',
        'falling_factorial',
        'fdim',
        'floor',
        'fma',
        'fmax',
        'fmin',
        'fmod',
        'gamma_p',
        'gamma_q',
        'generalized_inverse',
        'get_imag',
        'get_lp',
        'get_real',
        'head',
        'hmm_hidden_state_prob',
        'hmm_marginal',
        'hypot',
        'identity_matrix',
        'inc_beta',
        'int_step',
        'integrate_1d',
        'integrate_ode',
        'integrate_ode_adams',
        'integrate_ode_bdf',
        'integrate_ode_rk45',
        'inv',
        'inv_Phi',
        'inv_cloglog',
        'inv_logit',
        'inv_sqrt',
        'inv_square',
        'inverse',
        'inverse_spd',
        'is_inf',
        'is_nan',
        'lambert_w0',
        'lambert_wm1',
        'lbeta',
        'lchoose',
        'ldexp',
        'lgamma',
        'linspaced_array',
        'linspaced_int_array',
        'linspaced_row_vector',
        'linspaced_vector',
        'lmgamma',
        'lmultiply',
        'log',
        'log1m',
        'log1m_exp',
        'log1m_inv_logit',
        'log1p',
        'log1p_exp',
        'log_determinant',
        'log_diff_exp',
        'log_falling_factorial',
        'log_inv_logit',
        'log_inv_logit_diff',
        'log_mix',
        'log_modified_bessel_first_kind',
        'log_rising_factorial',
        'log_softmax',
        'log_sum_exp',
        'logit',
        'machine_precision',
        'map_rect',
        'matrix_exp',
        'matrix_exp_multiply',
        'matrix_power',
        'max',
        'mdivide_left_spd',
        'mdivide_left_tri_low',
        'mdivide_right_spd',
        'mdivide_right_tri_low',
        'mean',
        'min',
        'modified_bessel_first_kind',
        'modified_bessel_second_kind',
        'multiply_log',
        'multiply_lower_tri_self_transpose',
        'negative_infinity',
        'norm',
        'not_a_number',
        'num_elements',
        'ode_adams',
        'ode_adams_tol',
        'ode_adjoint_tol_ctl',
        'ode_bdf',
        'ode_bdf_tol',
        'ode_ckrk',
        'ode_ckrk_tol',
        'ode_rk45',
        'ode_rk45_tol',
        'one_hot_array',
        'one_hot_int_array',
        'one_hot_row_vector',
        'one_hot_vector',
        'ones_array',
        'ones_int_array',
        'ones_row_vector',
        'ones_vector',
        'owens_t',
        'polar',
        'positive_infinity',
        'pow',
        'print',
        'prod',
        'proj',
        'qr_Q',
        'qr_R',
        'qr_thin_Q',
        'qr_thin_R',
        'quad_form',
        'quad_form_diag',
        'quad_form_sym',
        'quantile',
        'rank',
        'reduce_sum',
        'reject',
        'rep_array',
        'rep_matrix',
        'rep_row_vector',
        'rep_vector',
        'reverse',
        'rising_factorial',
        'round',
        'row',
        'rows',
        'rows_dot_product',
        'rows_dot_self',
        'scale_matrix_exp_multiply',
        'sd',
        'segment',
        'sin',
        'singular_values',
        'sinh',
        'size',
        'softmax',
        'sort_asc',
        'sort_desc',
        'sort_indices_asc',
        'sort_indices_desc',
        'sqrt',
        'square',
        'squared_distance',
        'step',
        'sub_col',
        'sub_row',
        'sum',
        'svd_U',
        'svd_V',
        'symmetrize_from_lower_tri',
        'tail',
        'tan',
        'tanh',
        'target',
        'tcrossprod',
        'tgamma',
        'to_array_1d',
        'to_array_2d',
        'to_complex',
        'to_matrix',
        'to_row_vector',
        'to_vector',
        'trace',
        'trace_gen_quad_form',
        'trace_quad_form',
        'trigamma',
        'trunc',
        'uniform_simplex',
        'variance',
        'zeros_array',
        'zeros_int_array',
        'zeros_row_vector'
    ];
    const DISTRIBUTIONS = [
        'bernoulli',
        'bernoulli_logit',
        'bernoulli_logit_glm',
        'beta',
        'beta_binomial',
        'beta_proportion',
        'binomial',
        'binomial_logit',
        'categorical',
        'categorical_logit',
        'categorical_logit_glm',
        'cauchy',
        'chi_square',
        'dirichlet',
        'discrete_range',
        'double_exponential',
        'exp_mod_normal',
        'exponential',
        'frechet',
        'gamma',
        'gaussian_dlm_obs',
        'gumbel',
        'hmm_latent',
        'hypergeometric',
        'inv_chi_square',
        'inv_gamma',
        'inv_wishart',
        'lkj_corr',
        'lkj_corr_cholesky',
        'logistic',
        'lognormal',
        'multi_gp',
        'multi_gp_cholesky',
        'multi_normal',
        'multi_normal_cholesky',
        'multi_normal_prec',
        'multi_student_t',
        'multinomial',
        'multinomial_logit',
        'neg_binomial',
        'neg_binomial_2',
        'neg_binomial_2_log',
        'neg_binomial_2_log_glm',
        'normal',
        'normal_id_glm',
        'ordered_logistic',
        'ordered_logistic_glm',
        'ordered_probit',
        'pareto',
        'pareto_type_2',
        'poisson',
        'poisson_log',
        'poisson_log_glm',
        'rayleigh',
        'scaled_inv_chi_square',
        'skew_double_exponential',
        'skew_normal',
        'std_normal',
        'student_t',
        'uniform',
        'von_mises',
        'weibull',
        'wiener',
        'wishart'
    ];
    const BLOCK_COMMENT = hljs.COMMENT(/\/\*/, /\*\//, {
        relevance: 0,
        contains: [
            {
                scope: 'doctag',
                match: /@(return|param)/
            }
        ]
    });
    const INCLUDE = {
        scope: 'meta',
        begin: /#include\b/,
        end: /$/,
        contains: [
            {
                match: /[a-z][a-z-._]+/,
                scope: 'string'
            },
            hljs.C_LINE_COMMENT_MODE
        ]
    };
    const RANGE_CONSTRAINTS = [
        "lower",
        "upper",
        "offset",
        "multiplier"
    ];
    return {
        name: 'Stan',
        aliases: ['stanfuncs'],
        keywords: {
            $pattern: hljs.IDENT_RE,
            title: BLOCKS,
            type: TYPES,
            keyword: STATEMENTS,
            built_in: FUNCTIONS
        },
        contains: [
            hljs.C_LINE_COMMENT_MODE,
            INCLUDE,
            hljs.HASH_COMMENT_MODE,
            BLOCK_COMMENT,
            {
                scope: 'built_in',
                match: /\s(pi|e|sqrt2|log2|log10)(?=\()/,
                relevance: 0
            },
            {
                match: regex.concat(/[<,]\s*/, regex.either(...RANGE_CONSTRAINTS), /\s*=/),
                keywords: RANGE_CONSTRAINTS
            },
            {
                scope: 'keyword',
                match: /\btarget(?=\s*\+=)/,
            },
            {
                match: [
                    /~\s*/,
                    regex.either(...DISTRIBUTIONS),
                    /(?:\(\))/,
                    /\s*T(?=\s*\[)/
                ],
                scope: {
                    2: "built_in",
                    4: "keyword"
                }
            },
            {
                scope: 'built_in',
                keywords: DISTRIBUTIONS,
                begin: regex.concat(/\w*/, regex.either(...DISTRIBUTIONS), /(_lpdf|_lupdf|_lpmf|_cdf|_lcdf|_lccdf|_qf)(?=\s*[\(.*\)])/)
            },
            {
                begin: [
                    /~/,
                    /\s*/,
                    regex.concat(regex.either(...DISTRIBUTIONS), /(?=\s*[\(.*\)])/)
                ],
                scope: { 3: "built_in" }
            },
            {
                begin: [
                    /~/,
                    /\s*\w+(?=\s*[\(.*\)])/,
                    '(?!.*/\b(' + regex.either(...DISTRIBUTIONS) + ')\b)'
                ],
                scope: { 2: "title.function" }
            },
            {
                scope: 'title.function',
                begin: /\w*(_lpdf|_lupdf|_lpmf|_cdf|_lcdf|_lccdf|_qf)(?=\s*[\(.*\)])/
            },
            {
                scope: 'number',
                match: regex.concat(/(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)/, /(?:[eE][+-]?\d+(?:_\d+)*)?i?(?!\w)/),
                relevance: 0
            },
            {
                scope: 'string',
                begin: /"/,
                end: /"/
            }
        ]
    };
}
export { stan as default };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Rhbi5qcyIsInNvdXJjZVJvb3QiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vQmVsbEN1YmVEZXYvc2l0ZS10ZXN0aW5nL2RlcGxveW1lbnQvIiwic291cmNlcyI6WyJhc3NldHMvc2l0ZS9oaWdobGlnaHRfanMvbGFuZ3VhZ2VzL3N0YW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsU0FBUyxJQUFJLENBQUMsSUFBSTtJQUNoQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBRXpCLE1BQU0sTUFBTSxHQUFHO1FBQ2IsV0FBVztRQUNYLE9BQU87UUFDUCxNQUFNO1FBQ04sWUFBWTtRQUNaLFlBQVk7UUFDWixhQUFhO1FBQ2IsV0FBVztLQUNaLENBQUM7SUFFRixNQUFNLFVBQVUsR0FBRztRQUNqQixLQUFLO1FBQ0wsSUFBSTtRQUNKLElBQUk7UUFDSixNQUFNO1FBQ04sT0FBTztRQUNQLE9BQU87UUFDUCxVQUFVO1FBQ1YsUUFBUTtLQUNULENBQUM7SUFFRixNQUFNLEtBQUssR0FBRztRQUNaLE9BQU87UUFDUCxTQUFTO1FBQ1QsS0FBSztRQUNMLE1BQU07UUFDTixRQUFRO1FBQ1IsU0FBUztRQUNULGtCQUFrQjtRQUNsQixTQUFTO1FBQ1QsYUFBYTtRQUNiLFlBQVk7UUFDWixRQUFRO1FBQ1IseUJBQXlCO1FBQ3pCLHdCQUF3QjtRQUN4QixnQkFBZ0I7UUFDaEIsZUFBZTtRQUNmLE1BQU07S0FDUCxDQUFDO0lBVUYsTUFBTSxTQUFTLEdBQUc7UUFDaEIsS0FBSztRQUNMLFlBQVk7UUFDWixLQUFLO1FBQ0wsTUFBTTtRQUNOLE9BQU87UUFDUCxVQUFVO1FBQ1YsZ0JBQWdCO1FBQ2hCLHVCQUF1QjtRQUN2QixjQUFjO1FBQ2QsWUFBWTtRQUNaLFlBQVk7UUFDWixNQUFNO1FBQ04sT0FBTztRQUNQLE1BQU07UUFDTixPQUFPO1FBQ1AsT0FBTztRQUNQLG1CQUFtQjtRQUNuQixvQkFBb0I7UUFDcEIsaUJBQWlC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Q0FBQztpQkFDaEU7Z0JBQ0QsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRTthQUN6QjtZQUNEO2dCQUVFLEtBQUssRUFBRTtvQkFDTCxHQUFHO29CQUNILHVCQUF1QjtvQkFDdkIsV0FBVyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxhQUFhLENBQUMsR0FBRyxNQUFNO2lCQUN0RDtnQkFDRCxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsZ0JBQWdCLEVBQUU7YUFDL0I7WUFDRDtnQkFFRSxLQUFLLEVBQUUsZ0JBQWdCO2dCQUN2QixLQUFLLEVBQUUsOERBQThEO2FBQ3RFO1lBQ0Q7Z0JBQ0UsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBUWpCLDZEQUE2RCxFQUc3RCxvQ0FBb0MsQ0FDckM7Z0JBQ0QsU0FBUyxFQUFFLENBQUM7YUFDYjtZQUNEO2dCQUNFLEtBQUssRUFBRSxRQUFRO2dCQUNmLEtBQUssRUFBRSxHQUFHO2dCQUNWLEdBQUcsRUFBRSxHQUFHO2FBQ1Q7U0FDRjtLQUNGLENBQUM7QUFDSixDQUFDO0FBRUQsT0FBTyxFQUFFLElBQUksSUFBSSxPQUFPLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5MYW5ndWFnZTogU3RhblxuRGVzY3JpcHRpb246IFRoZSBTdGFuIHByb2JhYmlsaXN0aWMgcHJvZ3JhbW1pbmcgbGFuZ3VhZ2VcbkF1dGhvcjogU2VhbiBQaW5rbmV5IDxzZWFuLnBpbmtuZXlAZ21haWwuY29tPlxuV2Vic2l0ZTogaHR0cDovL21jLXN0YW4ub3JnL1xuQ2F0ZWdvcnk6IHNjaWVudGlmaWNcbiovXG5cbmZ1bmN0aW9uIHN0YW4oaGxqcykge1xuICBjb25zdCByZWdleCA9IGhsanMucmVnZXg7XG4gIC8vIHZhcmlhYmxlIG5hbWVzIGNhbm5vdCBjb25mbGljdCB3aXRoIGJsb2NrIGlkZW50aWZpZXJzXG4gIGNvbnN0IEJMT0NLUyA9IFtcbiAgICAnZnVuY3Rpb25zJyxcbiAgICAnbW9kZWwnLFxuICAgICdkYXRhJyxcbiAgICAncGFyYW1ldGVycycsXG4gICAgJ3F1YW50aXRpZXMnLFxuICAgICd0cmFuc2Zvcm1lZCcsXG4gICAgJ2dlbmVyYXRlZCdcbiAgXTtcblxuICBjb25zdCBTVEFURU1FTlRTID0gW1xuICAgICdmb3InLFxuICAgICdpbicsXG4gICAgJ2lmJyxcbiAgICAnZWxzZScsXG4gICAgJ3doaWxlJyxcbiAgICAnYnJlYWsnLFxuICAgICdjb250aW51ZScsXG4gICAgJ3JldHVybidcbiAgXTtcblxuICBjb25zdCBUWVBFUyA9IFtcbiAgICAnYXJyYXknLFxuICAgICdjb21wbGV4JyxcbiAgICAnaW50JyxcbiAgICAncmVhbCcsXG4gICAgJ3ZlY3RvcicsXG4gICAgJ29yZGVyZWQnLFxuICAgICdwb3NpdGl2ZV9vcmRlcmVkJyxcbiAgICAnc2ltcGxleCcsXG4gICAgJ3VuaXRfdmVjdG9yJyxcbiAgICAncm93X3ZlY3RvcicsXG4gICAgJ21hdHJpeCcsXG4gICAgJ2Nob2xlc2t5X2ZhY3Rvcl9jb3JyfDEwJyxcbiAgICAnY2hvbGVza3lfZmFjdG9yX2NvdnwxMCcsXG4gICAgJ2NvcnJfbWF0cml4fDEwJyxcbiAgICAnY292X21hdHJpeHwxMCcsXG4gICAgJ3ZvaWQnXG4gIF07XG5cbiAgLy8gdG8gZ2V0IHRoZSBmdW5jdGlvbnMgbGlzdFxuICAvLyBjbG9uZSB0aGUgW3N0YW4tZG9jcyByZXBvXShodHRwczovL2dpdGh1Yi5jb20vc3Rhbi1kZXYvZG9jcylcbiAgLy8gdGhlbiBjZCBpbnRvIGl0IGFuZCBydW4gdGhpcyBiYXNoIHNjcmlwdCBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9qb3NoZ29lYmVsL2RjZDMzZjgyZDQwNTlhOTA3Yzk4NjA0OTg5Mzg0M2NmXG4gIC8vXG4gIC8vIHRoZSBvdXRwdXQgZmlsZXMgYXJlXG4gIC8vIGRpc3RyaWJ1dGlvbnNfcXVvdGVkLnR4dFxuICAvLyBmdW5jdGlvbnNfcXVvdGVkLnR4dFxuXG4gIGNvbnN0IEZVTkNUSU9OUyA9IFtcbiAgICAnUGhpJyxcbiAgICAnUGhpX2FwcHJveCcsXG4gICAgJ2FicycsXG4gICAgJ2Fjb3MnLFxuICAgICdhY29zaCcsXG4gICAgJ2FkZF9kaWFnJyxcbiAgICAnYWxnZWJyYV9zb2x2ZXInLFxuICAgICdhbGdlYnJhX3NvbHZlcl9uZXd0b24nLFxuICAgICdhcHBlbmRfYXJyYXknLFxuICAgICdhcHBlbmRfY29sJyxcbiAgICAnYXBwZW5kX3JvdycsXG4gICAgJ2FzaW4nLFxuICAgICdhc2luaCcsXG4gICAgJ2F0YW4nLFxuICAgICdhdGFuMicsXG4gICAgJ2F0YW5oJyxcbiAgICAnYmVzc2VsX2ZpcnN0X2tpbmQnLFxuICAgICdiZXNzZWxfc2Vjb25kX2tpbmQnLFxuICAgICdiaW5hcnlfbG9nX2xvc3MnLFxuICAgICdiaW5vbWlhbF9jb2VmZmljaWVudF9sb2cnLFxuICAgICdibG9jaycsXG4gICAgJ2NicnQnLFxuICAgICdjZWlsJyxcbiAgICAnY2hvbDJpbnYnLFxuICAgICdjaG9sZXNreV9kZWNvbXBvc2UnLFxuICAgICdjaG9vc2UnLFxuICAgICdjb2wnLFxuICAgICdjb2xzJyxcbiAgICAnY29sdW1uc19kb3RfcHJvZHVjdCcsXG4gICAgJ2NvbHVtbnNfZG90X3NlbGYnLFxuICAgICdjb25qJyxcbiAgICAnY29zJyxcbiAgICAnY29zaCcsXG4gICAgJ2Nvdl9leHBfcXVhZCcsXG4gICAgJ2Nyb3NzcHJvZCcsXG4gICAgJ2Nzcl9leHRyYWN0X3UnLFxuICAgICdjc3JfZXh0cmFjdF92JyxcbiAgICAnY3NyX2V4dHJhY3RfdycsXG4gICAgJ2Nzcl9tYXRyaXhfdGltZXNfdmVjdG9yJyxcbiAgICAnY3NyX3RvX2RlbnNlX21hdHJpeCcsXG4gICAgJ2N1bXVsYXRpdmVfc3VtJyxcbiAgICAnZGV0ZXJtaW5hbnQnLFxuICAgICdkaWFnX21hdHJpeCcsXG4gICAgJ2RpYWdfcG9zdF9tdWx0aXBseScsXG4gICAgJ2RpYWdfcHJlX211bHRpcGx5JyxcbiAgICAnZGlhZ29uYWwnLFxuICAgICdkaWdhbW1hJyxcbiAgICAnZGltcycsXG4gICAgJ2Rpc3RhbmNlJyxcbiAgICAnZG90X3Byb2R1Y3QnLFxuICAgICdkb3Rfc2VsZicsXG4gICAgJ2VpZ2VudmFsdWVzX3N5bScsXG4gICAgJ2VpZ2VudmVjdG9yc19zeW0nLFxuICAgICdlcmYnLFxuICAgICdlcmZjJyxcbiAgICAnZXhwJyxcbiAgICAnZXhwMicsXG4gICAgJ2V4cG0xJyxcbiAgICAnZmFicycsXG4gICAgJ2ZhbGxpbmdfZmFjdG9yaWFsJyxcbiAgICAnZmRpbScsXG4gICAgJ2Zsb29yJyxcbiAgICAnZm1hJyxcbiAgICAnZm1heCcsXG4gICAgJ2ZtaW4nLFxuICAgICdmbW9kJyxcbiAgICAnZ2FtbWFfcCcsXG4gICAgJ2dhbW1hX3EnLFxuICAgICdnZW5lcmFsaXplZF9pbnZlcnNlJyxcbiAgICAnZ2V0X2ltYWcnLFxuICAgICdnZXRfbHAnLFxuICAgICdnZXRfcmVhbCcsXG4gICAgJ2hlYWQnLFxuICAgICdobW1faGlkZGVuX3N0YXRlX3Byb2InLFxuICAgICdobW1fbWFyZ2luYWwnLFxuICAgICdoeXBvdCcsXG4gICAgJ2lkZW50aXR5X21hdHJpeCcsXG4gICAgJ2luY19iZXRhJyxcbiAgICAnaW50X3N0ZXAnLFxuICAgICdpbnRlZ3JhdGVfMWQnLFxuICAgICdpbnRlZ3JhdGVfb2RlJyxcbiAgICAnaW50ZWdyYXRlX29kZV9hZGFtcycsXG4gICAgJ2ludGVncmF0ZV9vZGVfYmRmJyxcbiAgICAnaW50ZWdyYXRlX29kZV9yazQ1JyxcbiAgICAnaW52JyxcbiAgICAnaW52X1BoaScsXG4gICAgJ2ludl9jbG9nbG9nJyxcbiAgICAnaW52X2xvZ2l0JyxcbiAgICAnaW52X3NxcnQnLFxuICAgICdpbnZfc3F1YXJlJyxcbiAgICAnaW52ZXJzZScsXG4gICAgJ2ludmVyc2Vfc3BkJyxcbiAgICAnaXNfaW5mJyxcbiAgICAnaXNfbmFuJyxcbiAgICAnbGFtYmVydF93MCcsXG4gICAgJ2xhbWJlcnRfd20xJyxcbiAgICAnbGJldGEnLFxuICAgICdsY2hvb3NlJyxcbiAgICAnbGRleHAnLFxuICAgICdsZ2FtbWEnLFxuICAgICdsaW5zcGFjZWRfYXJyYXknLFxuICAgICdsaW5zcGFjZWRfaW50X2FycmF5JyxcbiAgICAnbGluc3BhY2VkX3Jvd192ZWN0b3InLFxuICAgICdsaW5zcGFjZWRfdmVjdG9yJyxcbiAgICAnbG1nYW1tYScsXG4gICAgJ2xtdWx0aXBseScsXG4gICAgJ2xvZycsXG4gICAgJ2xvZzFtJyxcbiAgICAnbG9nMW1fZXhwJyxcbiAgICAnbG9nMW1faW52X2xvZ2l0JyxcbiAgICAnbG9nMXAnLFxuICAgICdsb2cxcF9leHAnLFxuICAgICdsb2dfZGV0ZXJtaW5hbnQnLFxuICAgICdsb2dfZGlmZl9leHAnLFxuICAgICdsb2dfZmFsbGluZ19mYWN0b3JpYWwnLFxuICAgICdsb2dfaW52X2xvZ2l0JyxcbiAgICAnbG9nX2ludl9sb2dpdF9kaWZmJyxcbiAgICAnbG9nX21peCcsXG4gICAgJ2xvZ19tb2RpZmllZF9iZXNzZWxfZmlyc3Rfa2luZCcsXG4gICAgJ2xvZ19yaXNpbmdfZmFjdG9yaWFsJyxcbiAgICAnbG9nX3NvZnRtYXgnLFxuICAgICdsb2dfc3VtX2V4cCcsXG4gICAgJ2xvZ2l0JyxcbiAgICAnbWFjaGluZV9wcmVjaXNpb24nLFxuICAgICdtYXBfcmVjdCcsXG4gICAgJ21hdHJpeF9leHAnLFxuICAgICdtYXRyaXhfZXhwX211bHRpcGx5JyxcbiAgICAnbWF0cml4X3Bvd2VyJyxcbiAgICAnbWF4JyxcbiAgICAnbWRpdmlkZV9sZWZ0X3NwZCcsXG4gICAgJ21kaXZpZGVfbGVmdF90cmlfbG93JyxcbiAgICAnbWRpdmlkZV9yaWdodF9zcGQnLFxuICAgICdtZGl2aWRlX3JpZ2h0X3RyaV9sb3cnLFxuICAgICdtZWFuJyxcbiAgICAnbWluJyxcbiAgICAnbW9kaWZpZWRfYmVzc2VsX2ZpcnN0X2tpbmQnLFxuICAgICdtb2RpZmllZF9iZXNzZWxfc2Vjb25kX2tpbmQnLFxuICAgICdtdWx0aXBseV9sb2cnLFxuICAgICdtdWx0aXBseV9sb3dlcl90cmlfc2VsZl90cmFuc3Bvc2UnLFxuICAgICduZWdhdGl2ZV9pbmZpbml0eScsXG4gICAgJ25vcm0nLFxuICAgICdub3RfYV9udW1iZXInLFxuICAgICdudW1fZWxlbWVudHMnLFxuICAgICdvZGVfYWRhbXMnLFxuICAgICdvZGVfYWRhbXNfdG9sJyxcbiAgICAnb2RlX2Fkam9pbnRfdG9sX2N0bCcsXG4gICAgJ29kZV9iZGYnLFxuICAgICdvZGVfYmRmX3RvbCcsXG4gICAgJ29kZV9ja3JrJyxcbiAgICAnb2RlX2NrcmtfdG9sJyxcbiAgICAnb2RlX3JrNDUnLFxuICAgICdvZGVfcms0NV90b2wnLFxuICAgICdvbmVfaG90X2FycmF5JyxcbiAgICAnb25lX2hvdF9pbnRfYXJyYXknLFxuICAgICdvbmVfaG90X3Jvd192ZWN0b3InLFxuICAgICdvbmVfaG90X3ZlY3RvcicsXG4gICAgJ29uZXNfYXJyYXknLFxuICAgICdvbmVzX2ludF9hcnJheScsXG4gICAgJ29uZXNfcm93X3ZlY3RvcicsXG4gICAgJ29uZXNfdmVjdG9yJyxcbiAgICAnb3dlbnNfdCcsXG4gICAgJ3BvbGFyJyxcbiAgICAncG9zaXRpdmVfaW5maW5pdHknLFxuICAgICdwb3cnLFxuICAgICdwcmludCcsXG4gICAgJ3Byb2QnLFxuICAgICdwcm9qJyxcbiAgICAncXJfUScsXG4gICAgJ3FyX1InLFxuICAgICdxcl90aGluX1EnLFxuICAgICdxcl90aGluX1InLFxuICAgICdxdWFkX2Zvcm0nLFxuICAgICdxdWFkX2Zvcm1fZGlhZycsXG4gICAgJ3F1YWRfZm9ybV9zeW0nLFxuICAgICdxdWFudGlsZScsXG4gICAgJ3JhbmsnLFxuICAgICdyZWR1Y2Vfc3VtJyxcbiAgICAncmVqZWN0JyxcbiAgICAncmVwX2FycmF5JyxcbiAgICAncmVwX21hdHJpeCcsXG4gICAgJ3JlcF9yb3dfdmVjdG9yJyxcbiAgICAncmVwX3ZlY3RvcicsXG4gICAgJ3JldmVyc2UnLFxuICAgICdyaXNpbmdfZmFjdG9yaWFsJyxcbiAgICAncm91bmQnLFxuICAgICdyb3cnLFxuICAgICdyb3dzJyxcbiAgICAncm93c19kb3RfcHJvZHVjdCcsXG4gICAgJ3Jvd3NfZG90X3NlbGYnLFxuICAgICdzY2FsZV9tYXRyaXhfZXhwX211bHRpcGx5JyxcbiAgICAnc2QnLFxuICAgICdzZWdtZW50JyxcbiAgICAnc2luJyxcbiAgICAnc2luZ3VsYXJfdmFsdWVzJyxcbiAgICAnc2luaCcsXG4gICAgJ3NpemUnLFxuICAgICdzb2Z0bWF4JyxcbiAgICAnc29ydF9hc2MnLFxuICAgICdzb3J0X2Rlc2MnLFxuICAgICdzb3J0X2luZGljZXNfYXNjJyxcbiAgICAnc29ydF9pbmRpY2VzX2Rlc2MnLFxuICAgICdzcXJ0JyxcbiAgICAnc3F1YXJlJyxcbiAgICAnc3F1YXJlZF9kaXN0YW5jZScsXG4gICAgJ3N0ZXAnLFxuICAgICdzdWJfY29sJyxcbiAgICAnc3ViX3JvdycsXG4gICAgJ3N1bScsXG4gICAgJ3N2ZF9VJyxcbiAgICAnc3ZkX1YnLFxuICAgICdzeW1tZXRyaXplX2Zyb21fbG93ZXJfdHJpJyxcbiAgICAndGFpbCcsXG4gICAgJ3RhbicsXG4gICAgJ3RhbmgnLFxuICAgICd0YXJnZXQnLFxuICAgICd0Y3Jvc3Nwcm9kJyxcbiAgICAndGdhbW1hJyxcbiAgICAndG9fYXJyYXlfMWQnLFxuICAgICd0b19hcnJheV8yZCcsXG4gICAgJ3RvX2NvbXBsZXgnLFxuICAgICd0b19tYXRyaXgnLFxuICAgICd0b19yb3dfdmVjdG9yJyxcbiAgICAndG9fdmVjdG9yJyxcbiAgICAndHJhY2UnLFxuICAgICd0cmFjZV9nZW5fcXVhZF9mb3JtJyxcbiAgICAndHJhY2VfcXVhZF9mb3JtJyxcbiAgICAndHJpZ2FtbWEnLFxuICAgICd0cnVuYycsXG4gICAgJ3VuaWZvcm1fc2ltcGxleCcsXG4gICAgJ3ZhcmlhbmNlJyxcbiAgICAnemVyb3NfYXJyYXknLFxuICAgICd6ZXJvc19pbnRfYXJyYXknLFxuICAgICd6ZXJvc19yb3dfdmVjdG9yJ1xuICBdO1xuXG4gIGNvbnN0IERJU1RSSUJVVElPTlMgPSBbXG4gICAgJ2Jlcm5vdWxsaScsXG4gICAgJ2Jlcm5vdWxsaV9sb2dpdCcsXG4gICAgJ2Jlcm5vdWxsaV9sb2dpdF9nbG0nLFxuICAgICdiZXRhJyxcbiAgICAnYmV0YV9iaW5vbWlhbCcsXG4gICAgJ2JldGFfcHJvcG9ydGlvbicsXG4gICAgJ2Jpbm9taWFsJyxcbiAgICAnYmlub21pYWxfbG9naXQnLFxuICAgICdjYXRlZ29yaWNhbCcsXG4gICAgJ2NhdGVnb3JpY2FsX2xvZ2l0JyxcbiAgICAnY2F0ZWdvcmljYWxfbG9naXRfZ2xtJyxcbiAgICAnY2F1Y2h5JyxcbiAgICAnY2hpX3NxdWFyZScsXG4gICAgJ2RpcmljaGxldCcsXG4gICAgJ2Rpc2NyZXRlX3JhbmdlJyxcbiAgICAnZG91YmxlX2V4cG9uZW50aWFsJyxcbiAgICAnZXhwX21vZF9ub3JtYWwnLFxuICAgICdleHBvbmVudGlhbCcsXG4gICAgJ2ZyZWNoZXQnLFxuICAgICdnYW1tYScsXG4gICAgJ2dhdXNzaWFuX2RsbV9vYnMnLFxuICAgICdndW1iZWwnLFxuICAgICdobW1fbGF0ZW50JyxcbiAgICAnaHlwZXJnZW9tZXRyaWMnLFxuICAgICdpbnZfY2hpX3NxdWFyZScsXG4gICAgJ2ludl9nYW1tYScsXG4gICAgJ2ludl93aXNoYXJ0JyxcbiAgICAnbGtqX2NvcnInLFxuICAgICdsa2pfY29ycl9jaG9sZXNreScsXG4gICAgJ2xvZ2lzdGljJyxcbiAgICAnbG9nbm9ybWFsJyxcbiAgICAnbXVsdGlfZ3AnLFxuICAgICdtdWx0aV9ncF9jaG9sZXNreScsXG4gICAgJ211bHRpX25vcm1hbCcsXG4gICAgJ211bHRpX25vcm1hbF9jaG9sZXNreScsXG4gICAgJ211bHRpX25vcm1hbF9wcmVjJyxcbiAgICAnbXVsdGlfc3R1ZGVudF90JyxcbiAgICAnbXVsdGlub21pYWwnLFxuICAgICdtdWx0aW5vbWlhbF9sb2dpdCcsXG4gICAgJ25lZ19iaW5vbWlhbCcsXG4gICAgJ25lZ19iaW5vbWlhbF8yJyxcbiAgICAnbmVnX2Jpbm9taWFsXzJfbG9nJyxcbiAgICAnbmVnX2Jpbm9taWFsXzJfbG9nX2dsbScsXG4gICAgJ25vcm1hbCcsXG4gICAgJ25vcm1hbF9pZF9nbG0nLFxuICAgICdvcmRlcmVkX2xvZ2lzdGljJyxcbiAgICAnb3JkZXJlZF9sb2dpc3RpY19nbG0nLFxuICAgICdvcmRlcmVkX3Byb2JpdCcsXG4gICAgJ3BhcmV0bycsXG4gICAgJ3BhcmV0b190eXBlXzInLFxuICAgICdwb2lzc29uJyxcbiAgICAncG9pc3Nvbl9sb2cnLFxuICAgICdwb2lzc29uX2xvZ19nbG0nLFxuICAgICdyYXlsZWlnaCcsXG4gICAgJ3NjYWxlZF9pbnZfY2hpX3NxdWFyZScsXG4gICAgJ3NrZXdfZG91YmxlX2V4cG9uZW50aWFsJyxcbiAgICAnc2tld19ub3JtYWwnLFxuICAgICdzdGRfbm9ybWFsJyxcbiAgICAnc3R1ZGVudF90JyxcbiAgICAndW5pZm9ybScsXG4gICAgJ3Zvbl9taXNlcycsXG4gICAgJ3dlaWJ1bGwnLFxuICAgICd3aWVuZXInLFxuICAgICd3aXNoYXJ0J1xuICBdO1xuXG4gIGNvbnN0IEJMT0NLX0NPTU1FTlQgPSBobGpzLkNPTU1FTlQoXG4gICAgL1xcL1xcKi8sXG4gICAgL1xcKlxcLy8sXG4gICAge1xuICAgICAgcmVsZXZhbmNlOiAwLFxuICAgICAgY29udGFpbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHNjb3BlOiAnZG9jdGFnJyxcbiAgICAgICAgICBtYXRjaDogL0AocmV0dXJufHBhcmFtKS9cbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbiAgKTtcblxuICBjb25zdCBJTkNMVURFID0ge1xuICAgIHNjb3BlOiAnbWV0YScsXG4gICAgYmVnaW46IC8jaW5jbHVkZVxcYi8sXG4gICAgZW5kOiAvJC8sXG4gICAgY29udGFpbnM6IFtcbiAgICAgIHtcbiAgICAgICAgbWF0Y2g6IC9bYS16XVthLXotLl9dKy8sXG4gICAgICAgIHNjb3BlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIGhsanMuQ19MSU5FX0NPTU1FTlRfTU9ERVxuICAgIF1cbiAgfTtcblxuICBjb25zdCBSQU5HRV9DT05TVFJBSU5UUyA9IFtcbiAgICBcImxvd2VyXCIsXG4gICAgXCJ1cHBlclwiLFxuICAgIFwib2Zmc2V0XCIsXG4gICAgXCJtdWx0aXBsaWVyXCJcbiAgXTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdTdGFuJyxcbiAgICBhbGlhc2VzOiBbICdzdGFuZnVuY3MnIF0sXG4gICAga2V5d29yZHM6IHtcbiAgICAgICRwYXR0ZXJuOiBobGpzLklERU5UX1JFLFxuICAgICAgdGl0bGU6IEJMT0NLUyxcbiAgICAgIHR5cGU6IFRZUEVTLFxuICAgICAga2V5d29yZDogU1RBVEVNRU5UUyxcbiAgICAgIGJ1aWx0X2luOiBGVU5DVElPTlNcbiAgICB9LFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICBobGpzLkNfTElORV9DT01NRU5UX01PREUsXG4gICAgICBJTkNMVURFLFxuICAgICAgaGxqcy5IQVNIX0NPTU1FTlRfTU9ERSxcbiAgICAgIEJMT0NLX0NPTU1FTlQsXG4gICAgICB7XG4gICAgICAgIHNjb3BlOiAnYnVpbHRfaW4nLFxuICAgICAgICBtYXRjaDogL1xccyhwaXxlfHNxcnQyfGxvZzJ8bG9nMTApKD89XFwoKS8sXG4gICAgICAgIHJlbGV2YW5jZTogMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbWF0Y2g6IHJlZ2V4LmNvbmNhdCgvWzwsXVxccyovLCByZWdleC5laXRoZXIoLi4uUkFOR0VfQ09OU1RSQUlOVFMpLCAvXFxzKj0vKSxcbiAgICAgICAga2V5d29yZHM6IFJBTkdFX0NPTlNUUkFJTlRTXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBzY29wZTogJ2tleXdvcmQnLFxuICAgICAgICBtYXRjaDogL1xcYnRhcmdldCg/PVxccypcXCs9KS8sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICAvLyBoaWdobGlnaHRzIHRoZSAnVCcgaW4gVFssXSBmb3Igb25seSBTdGFuIGxhbmd1YWdlIGRpc3RyaWJ1dHJpb25zXG4gICAgICAgIG1hdGNoOiBbXG4gICAgICAgICAgL35cXHMqLyxcbiAgICAgICAgICByZWdleC5laXRoZXIoLi4uRElTVFJJQlVUSU9OUyksXG4gICAgICAgICAgLyg/OlxcKFxcKSkvLFxuICAgICAgICAgIC9cXHMqVCg/PVxccypcXFspL1xuICAgICAgICBdLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgIDI6IFwiYnVpbHRfaW5cIixcbiAgICAgICAgICA0OiBcImtleXdvcmRcIlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICAvLyBoaWdobGlnaHRzIGRpc3RyaWJ1dGlvbnMgdGhhdCBlbmQgd2l0aCBzcGVjaWFsIGVuZGluZ3NcbiAgICAgICAgc2NvcGU6ICdidWlsdF9pbicsXG4gICAgICAgIGtleXdvcmRzOiBESVNUUklCVVRJT05TLFxuICAgICAgICBiZWdpbjogcmVnZXguY29uY2F0KC9cXHcqLywgcmVnZXguZWl0aGVyKC4uLkRJU1RSSUJVVElPTlMpLCAvKF9scGRmfF9sdXBkZnxfbHBtZnxfY2RmfF9sY2RmfF9sY2NkZnxfcWYpKD89XFxzKltcXCguKlxcKV0pLylcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIC8vIGhpZ2hsaWdodHMgZGlzdHJpYnV0aW9ucyBhZnRlciB+XG4gICAgICAgIGJlZ2luOiBbXG4gICAgICAgICAgL34vLFxuICAgICAgICAgIC9cXHMqLyxcbiAgICAgICAgICByZWdleC5jb25jYXQocmVnZXguZWl0aGVyKC4uLkRJU1RSSUJVVElPTlMpLCAvKD89XFxzKltcXCguKlxcKV0pLylcbiAgICAgICAgXSxcbiAgICAgICAgc2NvcGU6IHsgMzogXCJidWlsdF9pblwiIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIC8vIGhpZ2hsaWdodHMgdXNlciBkZWZpbmVkIGRpc3RyaWJ1dGlvbnMgYWZ0ZXIgflxuICAgICAgICBiZWdpbjogW1xuICAgICAgICAgIC9+LyxcbiAgICAgICAgICAvXFxzKlxcdysoPz1cXHMqW1xcKC4qXFwpXSkvLFxuICAgICAgICAgICcoPyEuKi9cXGIoJyArIHJlZ2V4LmVpdGhlciguLi5ESVNUUklCVVRJT05TKSArICcpXFxiKSdcbiAgICAgICAgXSxcbiAgICAgICAgc2NvcGU6IHsgMjogXCJ0aXRsZS5mdW5jdGlvblwiIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIC8vIGhpZ2hsaWdodHMgdXNlciBkZWZpbmVkIGRpc3RyaWJ1dGlvbnMgd2l0aCBzcGVjaWFsIGVuZGluZ3NcbiAgICAgICAgc2NvcGU6ICd0aXRsZS5mdW5jdGlvbicsXG4gICAgICAgIGJlZ2luOiAvXFx3KihfbHBkZnxfbHVwZGZ8X2xwbWZ8X2NkZnxfbGNkZnxfbGNjZGZ8X3FmKSg/PVxccypbXFwoLipcXCldKS9cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHNjb3BlOiAnbnVtYmVyJyxcbiAgICAgICAgbWF0Y2g6IHJlZ2V4LmNvbmNhdChcbiAgICAgICAgICAvLyBDb21lcyBmcm9tIEBSdW5EZXZlbG9wbWVudCBhY2Nlc3NlZCAxMS8yOS8yMDIxIGF0XG4gICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL1ByaXNtSlMvcHJpc20vYmxvYi9jNTNhZDJlNjViNzE5M2FiNGYwM2ExNzk3NTA2YTU0YmJiMzNkNWEyL2NvbXBvbmVudHMvcHJpc20tc3Rhbi5qcyNMNTZcblxuICAgICAgICAgIC8vIHN0YXJ0IG9mIGJpZyBub25jYXB0dXJlIGdyb3VwIHdoaWNoXG4gICAgICAgICAgLy8gMS4gZ2V0cyBudW1iZXJzIHRoYXQgYXJlIGJ5IHRoZW1zZWx2ZXNcbiAgICAgICAgICAvLyAyLiBudW1iZXJzIHRoYXQgYXJlIHNlcGFyYXRlZCBieSBfXG4gICAgICAgICAgLy8gMy4gbnVtYmVycyB0aGF0IGFyZSBzZXBhcnRlZCBieSAuXG4gICAgICAgICAgLyg/OlxcYlxcZCsoPzpfXFxkKykqKD86XFwuKD86XFxkKyg/Ol9cXGQrKSopPyk/fFxcQlxcLlxcZCsoPzpfXFxkKykqKS8sXG4gICAgICAgICAgLy8gZ3JhYnMgc2NpZW50aWZpYyBub3RhdGlvblxuICAgICAgICAgIC8vIGdyYWJzIGNvbXBsZXggbnVtYmVycyB3aXRoIGlcbiAgICAgICAgICAvKD86W2VFXVsrLV0/XFxkKyg/Ol9cXGQrKSopP2k/KD8hXFx3KS9cbiAgICAgICAgKSxcbiAgICAgICAgcmVsZXZhbmNlOiAwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBzY29wZTogJ3N0cmluZycsXG4gICAgICAgIGJlZ2luOiAvXCIvLFxuICAgICAgICBlbmQ6IC9cIi9cbiAgICAgIH1cbiAgICBdXG4gIH07XG59XG5cbmV4cG9ydCB7IHN0YW4gYXMgZGVmYXVsdCB9O1xuIl19