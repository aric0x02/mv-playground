module Alice::Storage {
    // Include Math module.
    use Alice::Math;

    // Store U64 number into resource.
    struct Sum   has copy, key, store, drop{
        val: u64
    }
   struct Sumt<T>   has copy, key, store, drop{
        val: T
    }
    // The function 'store_sum' to store the sum of a + b into a resource.
    public fun store_sum(account: &signer, a: u64, b: u64) {
        let sum = Sum {val: Math::add(a, b)};
        move_to<Sum>(account, sum);
    }

    // Get the sum stored under address resource.
    public fun get_sum(addr: address): u64 acquires Sum {
        borrow_global<Sum>(addr).val
    }
  public fun store_sumt<T>(account: &signer, a:u64,b:u64) {
        let sum = Sumt {val:Sum{val:a+b}};
        move_to<Sumt<Sum>>(account, sum);
    }

    // Get the sum stored under address resource.
    public fun get_sumt(addr: address): Sum acquires Sumt {
        borrow_global<Sumt<Sum>>(addr).val
    }
}