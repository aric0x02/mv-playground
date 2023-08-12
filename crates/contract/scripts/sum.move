script {
   use Alice::Math;
//    use Std::Signer;
 use Alice::EventProxy;
   fun sum(account: signer, a: u64, b: u64) {
      let sum = Math::add(a, b);
    //   Event::emit(account, sum);
    EventProxy::emit_event(&account, sum);
   }
}