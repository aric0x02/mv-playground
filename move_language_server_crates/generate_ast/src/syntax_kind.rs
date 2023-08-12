use proc_macro2::{Punct, Spacing};
use quote::{format_ident, quote};

use crate::utils::reformat;
use stdx::to_upper_snake_case;

pub(crate) struct SymbolKindsSrc<'a> {
    pub(crate) punct: &'a [(&'a str, &'a str)],
    pub(crate) keywords: &'a [&'a str],
    // pub(crate) contextual_keywords: &'a [&'a str],
    pub(crate) literals: &'a [&'a str],
    pub(crate) tokens: &'a [&'a str],
    pub(crate) nodes: &'a [&'a str],
}

pub(crate) const KINDS_SRC: SymbolKindsSrc = SymbolKindsSrc {
    punct: &[
        (":", "COLON"),
        ("::", "COLON_COLON"),
        (";", "SEMICOLON"),
        (",", "COMMA"),
        ("(", "L_PAREN"),
        (")", "R_PAREN"),
        ("{", "L_BRACE"),
        ("}", "R_BRACE"),
        ("[", "L_BRACK"),
        ("]", "R_BRACK"),
        ("+", "PLUS"),
        ("-", "MINUS"),
        ("*", "STAR"),
        ("/", "SLASH"),
        ("%", "MOD"),
        ("#", "NUMSIGN"),
        ("@", "ATSIGN"),
        (".", "DOT"),
        ("..", "DOTDOT"),
        ("&", "AMP"),
        ("&&", "AMP_AMP"),
        ("&mut", "AMP_MUT"),
        ("^", "CARET"),
        ("|", "PIPE"),
        ("||", "PIPE_PIPE"),
        ("!", "BANG"),
        ("!=", "BANG_EQ"),
        ("=", "EQ"),
        ("==", "EQ_EQ"),
        ("==>", "EQ_EQ_GT"),
        (">", "GT"),
        (">>", "GT_GT"),
        (">=", "GT_EQ"),
        ("<", "LT"),
        ("<<", "LT_LT"),
        ("<=", "LT_EQ"),
        ("<==>", "LT_EQ_EQ_GT"),
        ("_", "WILDCARD"),
    ],
    keywords: &[
        "struct", "script", "module", "const", "use", "as", "let", "mut", "return", "fun", "true",
        "false", "move", "while", "if", "else", "break", "continue", "address",
    ],
    literals: &["INTEGER_NUMBER", "BYTE_STRING", "HEX_STRING"],
    nodes: &[
        "SOURCE_FILE",
        "ADDRESS_DEF",
        "ADDRESS_ITEM_LIST",
        "MODULE_DEF",
        "ADDRESS_IDENT",
        "SCRIPT_DEF",
        "FUNCTION_DEF",
        "ITEM_LIST",
        "NAME_REF",
        "STRUCT",
        "RECORD_FIELD_LIST",
        "RECORD_FIELD",
        "GENERIC_PARAM_LIST",
        "TYPE_PARAM",
        "TYPE_BOUND_LIST",
        "TYPE_BOUND",
        "PARAM_LIST",
        "PARAM",
        "RET_TYPE",
        "EXPR",
        "BLOCK_EXPR",
        "DOT_EXPR",
        "CALL_EXPR",
        "ARG_LIST",
        "RECORD_EXPR",
        "RECORD_EXPR_FIELD_LIST",
        "RECORD_EXPR_FIELD",
        "LITERAL",
        "PATH",
        "PATH_SEGMENT",
        "NAME",
        "BIN_EXPR",
        "PREFIX_EXPR",
        "PATH_EXPR",
        "PAREN_EXPR",
        "EXPR_STMT",
        "LET_STMT",
        "REF_TYPE",
        "PATH_TYPE",
        "PAREN_PAT",
        "TUPLE_PAT",
        "RECORD_PAT",
        "RECORD_PAT_FIELD_LIST",
        "RECORD_PAT_FIELD",
        "PATH_PAT",
        "WILDCARD_PAT",
        "REST_PAT",
        "IDENT_PAT",
        "ADDRESS_LIT",
    ],
    tokens: &["ERROR", "IDENT", "WHITESPACE", "COMMENT", "DIEM_ADDRESS"],
};

pub(crate) fn generate_syntax_kinds(grammar: SymbolKindsSrc<'_>) -> String {
    let (single_byte_tokens_values, single_byte_tokens): (Vec<_>, Vec<_>) = grammar
        .punct
        .iter()
        .filter(|(token, _name)| token.len() == 1)
        .map(|(token, name)| (token.chars().next().unwrap(), format_ident!("{}", name)))
        .unzip();

    let punctuation_values = grammar.punct.iter().map(|(token, _name)| {
        if "{}[]()".contains(token) {
            let c = token.chars().next().unwrap();
            quote! { #c }
        } else {
            let cs = token.chars().map(|c| Punct::new(c, Spacing::Joint));
            quote! { #(#cs)* }
        }
    });
    let punctuation =
        grammar.punct.iter().map(|(_token, name)| format_ident!("{}", name)).collect::<Vec<_>>();

    let full_keywords_values = &grammar.keywords;
    let full_keywords =
        full_keywords_values.iter().map(|kw| format_ident!("{}_KW", to_upper_snake_case(kw)));

    let all_keywords_values = grammar.keywords.iter().collect::<Vec<_>>();
    let all_keywords_idents = all_keywords_values.iter().map(|kw| format_ident!("{}", kw));
    let all_keywords = all_keywords_values
        .iter()
        .map(|name| format_ident!("{}_KW", to_upper_snake_case(name)))
        .collect::<Vec<_>>();

    let literals =
        grammar.literals.iter().map(|name| format_ident!("{}", name)).collect::<Vec<_>>();

    let tokens = grammar.tokens.iter().map(|name| format_ident!("{}", name)).collect::<Vec<_>>();

    let nodes = grammar.nodes.iter().map(|name| format_ident!("{}", name)).collect::<Vec<_>>();

    let ast = quote! {
        #![allow(bad_style, missing_docs, unreachable_pub)]
        /// The kind of syntax node, e.g. `IDENT`, `USE_KW`, or `STRUCT`.
        #[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Debug)]
        #[repr(u16)]
        pub enum SyntaxKind {
            // Technical SyntaxKinds: they appear temporally during parsing,
            // but never end up in the final tree
            #[doc(hidden)]
            TOMBSTONE,
            #[doc(hidden)]
            EOF,
            #(#punctuation,)*
            #(#all_keywords,)*
            #(#literals,)*
            #(#tokens,)*
            #(#nodes,)*

            // Technical kind so that we can cast from u16 safely
            #[doc(hidden)]
            __LAST,
        }
        use self::SyntaxKind::*;

        impl SyntaxKind {
            pub fn is_keyword(self) -> bool {
                matches!(self, #(#all_keywords)|*)
                // match self {
                //     #(#all_keywords)|* => true,
                //     _ => false,
                // }
            }

            pub fn is_punct(self) -> bool {
                matches!(self, #(#punctuation)|*)
                // match self {
                //     #(#punctuation)|* => true,
                //     _ => false,
                // }
            }

            pub fn is_literal(self) -> bool {
                matches!(self, #(#literals)|*)

                // match self {
                //     #(#literals)|* => true,
                //     _ => false,
                // }
            }

            pub fn from_keyword(ident: &str) -> Option<SyntaxKind> {
                let kw = match ident {
                    #(#full_keywords_values => #full_keywords,)*
                    _ => return None,
                };
                Some(kw)
            }

            pub fn from_char(c: char) -> Option<SyntaxKind> {
                let tok = match c {
                    #(#single_byte_tokens_values => #single_byte_tokens,)*
                    _ => return None,
                };
                Some(tok)
            }
        }

        #[macro_export]
        macro_rules! T {
            #([#punctuation_values] => { $crate::SyntaxKind::#punctuation };)*
            #([#all_keywords_idents] => { $crate::SyntaxKind::#all_keywords };)*
            [ident] => { $crate::SyntaxKind::IDENT };
            [shebang] => { $crate::SyntaxKind::SHEBANG };
        }
    };

    reformat(ast.to_string())
    // sourcegen::add_preamble("sourcegen_ast", sourcegen::reformat(ast.to_string()))
}
