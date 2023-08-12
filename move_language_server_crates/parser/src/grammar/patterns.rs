use super::*;

pub(super) const PATTERN_FIRST: TokenSet =
    expressions::atom::LITERAL_FIRST.union(paths::PATH_FIRST).union(TokenSet::new(&[
        // T![box],
        // T![ref],
        T![mut],
        T!['('],
        T!['['],
        T![&],
        T![_],
        T![-],
        // T![.],
    ]));

// test tuple_pat
// fn main() {
//     let (a, b, ..) = ();
//     let (a,) = ();
//     let (..) = ();
//     let () = ();
// }
fn tuple_pat(p: &mut Parser) {
    assert!(p.at(T!['(']));
    let m = p.start();
    p.bump(T!['(']);
    let mut has_comma = false;
    let mut has_pat = false;
    let mut has_rest = false;
    while !p.at(EOF) && !p.at(T![')']) {
        has_pat = true;
        if !p.at_ts(PATTERN_FIRST) {
            p.error("expected a pattern");
            break;
        }
        has_rest |= p.at(T![..]);

        pattern(p);
        if !p.at(T![')']) {
            has_comma = true;
            p.expect(T![,]);
        }
    }
    p.expect(T![')']);

    m.complete(p, if !has_comma && !has_rest && has_pat { PAREN_PAT } else { TUPLE_PAT });
}

pub(crate) fn pattern(p: &mut Parser) {
    match p.current() {
        T![mut] => ident_pat(p),
        IDENT => match p.nth(1) {
            // record_pat
            T!['{'] => path_pat(p),
            _ => ident_pat(p),
        },

        T![.] if p.at(T![..]) => rest_pat(p),
        T![_] => wildcard_pat(p),
        T!['('] => tuple_pat(p),

        _ => {
            p.err_recover("expected pattern", PAT_RECOVERY_SET);
        }
    };
}

const PAT_RECOVERY_SET: TokenSet =
    TokenSet::new(&[T![let], T![if], T![while], T![')'], T![,], T![=]]);

// test path_part
// fn foo() {
//     let Bar { .. } = ();
//     let Bar(..) = ();
// }
fn path_pat(p: &mut Parser) {
    assert!(paths::is_path_start(p));
    let m = p.start();
    paths::expr_path(p);
    let kind = match p.current() {
        T!['{'] => {
            record_pat_field_list(p);
            RECORD_PAT
        }
        _ => PATH_PAT,
    };
    m.complete(p, kind);
}

// // test tuple_pat_fields
// // fn foo() {
// //     let S() = ();
// //     let S(_) = ();
// //     let S(_,) = ();
// //     let S(_, .. , x) = ();
// // }
// fn tuple_pat_fields(p: &mut Parser) {
//     assert!(p.at(T!['(']));
//     p.bump(T!['(']);
//     pat_list(p, T![')']);
//     p.expect(T![')']);
// }

// test record_pat_field_list
// fn foo() {
//     let S {} = ();
//     let S { f, ref mut g } = ();
//     let S { h: _, ..} = ();
//     let S { h: _, } = ();
// }
fn record_pat_field_list(p: &mut Parser) {
    assert!(p.at(T!['{']));
    let m = p.start();
    p.bump(T!['{']);
    while !p.at(EOF) && !p.at(T!['}']) {
        match p.current() {
            // A trailing `..` is *not* treated as a REST_PAT.
            T![.] if p.at(T![..]) => p.bump(T![..]),
            T!['{'] => error_block(p, "expected ident"),

            _ => {
                let m = p.start();
                // attributes::outer_attrs(p);
                match p.current() {
                    // test record_pat_field
                    // fn foo() {
                    //     let S { 0: 1 } = ();
                    //     let S { x: 1 } = ();
                    //     let S { #[cfg(any())] x: 1 } = ();
                    // }
                    IDENT if p.nth(1) == T![:] => {
                        name_ref(p);
                        p.bump(T![:]);
                        pattern(p);
                    }
                    _ => ident_pat(p),
                }
                m.complete(p, RECORD_PAT_FIELD);
            }
        }
        if !p.at(T!['}']) {
            p.expect(T![,]);
        }
    }
    p.expect(T!['}']);
    m.complete(p, RECORD_PAT_FIELD_LIST);
}

// test placeholder_pat
// fn main() { let _ = (); }
fn wildcard_pat(p: &mut Parser) {
    assert!(p.at(T![_]));
    let m = p.start();
    p.bump(T![_]);
    m.complete(p, WILDCARD_PAT);
}

// test dot_dot_pat
// fn main() {
//     let .. = ();
//     //
//     // Tuples
//     //
//     let (a, ..) = ();
//     let (a, ..,) = ();
//     let Tuple(a, ..) = ();
//     let Tuple(a, ..,) = ();
//     let (.., ..) = ();
//     let Tuple(.., ..) = ();
//     let (.., a, ..) = ();
//     let Tuple(.., a, ..) = ();
//     //
//     // Slices
//     //
//     let [..] = ();
//     let [head, ..] = ();
//     let [head, tail @ ..] = ();
//     let [head, .., cons] = ();
//     let [head, mid @ .., cons] = ();
//     let [head, .., .., cons] = ();
//     let [head, .., mid, tail @ ..] = ();
//     let [head, .., mid, .., cons] = ();
// }
fn rest_pat(p: &mut Parser) {
    assert!(p.at(T![..]));
    let m = p.start();
    p.bump(T![..]);
    m.complete(p, REST_PAT);
}

// fn pat_list(p: &mut Parser, ket: SyntaxKind) {
//     while !p.at(EOF) && !p.at(ket) {
//         if !p.at_ts(PATTERN_FIRST) {
//             p.error("expected a pattern");
//             break;
//         }
//
//         pattern(p);
//         if !p.at(ket) {
//             p.expect(T![,]);
//         }
//     }
// }

// test bind_pat
// fn main() {
//     let a = ();
//     let mut b = ();
// }
fn ident_pat(p: &mut Parser) {
    let m = p.start();
    p.eat(T![mut]);
    name(p);
    m.complete(p, IDENT_PAT);
}
