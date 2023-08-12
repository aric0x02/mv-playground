module usertests::script_book {
    use Std::Signer;
    use Alice::Storage;
  public (script)  fun test() {
    
    }
  public (script)  fun test2(a: u64, b: u64) {
        // Store sum.
        assert!((a + b) == 5, 101);
    }
   public (script)  fun store_sum_func(account: signer, a: u64, b: u64) {
        // Store sum.
        Storage::store_sum(&account, a, b);

        // Get sum from resource.
        let sum = Storage::get_sum(Signer::address_of(&account));
        EventProxy::emit_event(&account, sum);
        // Throw error if sums don't match.
        // Error code is 101.
        assert!((a + b) == sum, 101);
    }
 use Alice::Math;
//    use Std::Signer;
 use Alice::EventProxy;
   public (script) fun sum_func(account: signer, a: u64, b: u64) {
      let sum = Math::add(a, b);
    //   Event::emit(account, sum);
    EventProxy::emit_event(&account, sum);
   }
   public (script) fun sum_funct<T>(account: signer, a: u64,b:u64) {
    //   Event::emit(account, sum);
    EventProxy::emit_eventt<T>(&account, a,b);
   }
  public (script)  fun store_sum_funct<T>(account: signer, a: u64,b:u64) {
        // Store sum.
        Storage::store_sumt<T>(&account, a,b);

        // Get sum from resource.
        let _ = Storage::get_sumt(Signer::address_of(&account));

        // Throw error if sums don't match.
        // Error code is 101.
        // assert!(a == sum, 101);
    }
}