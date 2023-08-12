mod adt;

use crate::grammar::expressions::atom::bump_address;
use crate::grammar::params::param_list;
use crate::grammar::types::type_;
use crate::grammar::{block_expr, name, name_r};
use crate::marker::Marker;
use crate::parser::Parser;
use crate::SyntaxKind::{self, *};
use crate::TokenSet;

pub(crate) const TOP_LEVEL_ITEM_RECOVERY_SET: TokenSet =
    TokenSet::new(&[T![address], T![module], T![script]]);

pub(crate) const ITEM_RECOVERY_SET: TokenSet = TokenSet::new(&[
    T![struct],
    // T![const],
    // T![let],
    // T![use],
    T![module],
    T![fun],
    // T![public],
    // T![script],
    T![;],
]);

pub(crate) fn address(p: &mut Parser) {
    let m = p.start();

    assert!(p.eat(T![address]));
    let recovery_set = TOP_LEVEL_ITEM_RECOVERY_SET.union(TokenSet::new(&[T!['{']]));
    address_ident_r(p, recovery_set);

    if p.at(T!['{']) {
        address_item_list(p);
    } else {
        p.error("expected `{`");
    }

    m.complete(p, ADDRESS_DEF);
}

pub(crate) fn script(p: &mut Parser) {
    let m = p.start();

    assert!(p.eat(T![script]));
    if p.at(T!['{']) {
        item_list(p);
    } else if !p.eat(T![;]) {
        p.error("expected `;` or `{`");
    }
    m.complete(p, SCRIPT_DEF);
}

pub(crate) fn address_ident_r(p: &mut Parser, recovery_tokens: TokenSet) {
    let m = p.start();
    if !bump_address(p) {
        p.error_and_skip_until("expected valid address", recovery_tokens);
    }
    m.complete(p, ADDRESS_IDENT);
}

pub(crate) fn module(p: &mut Parser) {
    let m = p.start();

    assert!(p.at(T![module]));
    p.bump(T![module]);

    if p.nth_at(1, T![::]) {
        address_ident_r(p, TokenSet::new(&[T![::]]));
        p.bump(T![::]);
    }
    name(p);
    if p.at(T!['{']) {
        item_list(p);
    } else if !p.eat(T![;]) {
        p.error("expected `;` or `{`");
    }
    m.complete(p, MODULE_DEF);
}

pub(crate) fn address_item_list(p: &mut Parser) {
    assert!(p.at(T!['{']));
    let m = p.start();
    p.bump(T!['{']);

    while !(p.at(T!['}']) || p.at(EOF)) {
        module(p);
    }
    p.expect(T!['}']);
    m.complete(p, ADDRESS_ITEM_LIST);
}

pub(crate) fn item_list(p: &mut Parser) {
    assert!(p.at(T!['{']));
    let m = p.start();
    p.bump(T!['{']);
    while !(p.at(T!['}']) || p.at(EOF)) {
        item(p);
    }
    p.expect(T!['}']);
    m.complete(p, ITEM_LIST);
}

pub(crate) fn item(p: &mut Parser) {
    let m = p.start();
    let m = match opt_item(p, m) {
        Ok(()) => {
            if p.at(T![;]) {
                p.err_and_bump(
                    "expected item, found `;`\n\
                     consider removing this semicolon",
                );
            }
            return;
        }
        Err(m) => m,
    };
    m.abandon(p);
    // if p.at(T!['{']) {
    //     error_block(p, "expected an item");
    // } else if p.at(T!['}']) && !stop_on_r_curly {
    //     let e = p.start();
    //     p.error("unmatched `}`");
    //     p.bump(T!['}']);
    //     e.complete(p, ERROR);
    if !p.at(EOF) && !p.at(T!['}']) {
        p.err_and_bump("expected an item");
    } else {
        p.error("expected an item");
    }
}

/// Try to parse an item, completing `m` in case of success.
pub(crate) fn opt_item(p: &mut Parser, m: Marker) -> Result<(), Marker> {
    match p.current() {
        T![fun] => function_def(p, m),
        T![struct] => adt::struct_(p, m),
        _ => {
            p.error("expected an item");
            m.complete(p, ERROR);
        }
    }
    Ok(())
}

pub(crate) fn function_def(p: &mut Parser, m: Marker) {
    assert!(p.at(T![fun]));
    p.bump(T![fun]);

    name_r(p, ITEM_RECOVERY_SET);

    if p.at(T!['(']) {
        param_list(p);
    } else {
        p.error("expected function arguments");
    }

    // test function_ret_type
    // fn foo() {}
    // fn bar() -> () {}
    opt_ret_type(p);

    block_expr(p);
    m.complete(p, FUNCTION_DEF);
}

fn opt_ret_type(p: &mut Parser) -> bool {
    if p.at(T![:]) {
        let m = p.start();
        p.bump(T![:]);
        type_(p);
        m.complete(p, RET_TYPE);
        true
    } else {
        false
    }
}
