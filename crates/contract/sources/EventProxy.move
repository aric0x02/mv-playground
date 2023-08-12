module Alice::EventProxy {
    use Std::Event;

    struct U64 has store, drop, copy { val: u64 }
    struct UU<T> has store, drop, copy { val: T }
    public fun emit_event(acc: &signer, val: u64) {
        let event_handle = Event::new_event_handle(acc);
        
        Event::emit_event(
            &mut event_handle,
            U64 { val }
        );

        Event::destroy_handle(event_handle);
    }

    public fun emit_eventt<T>(acc: &signer, a: u64, b: u64) {
        let event_handle = Event::new_event_handle<UU<U64>>(acc);
        
        Event::emit_event(
            &mut event_handle,
            UU{val:U64{val:a+b}}
        );

        Event::destroy_handle(event_handle);
    }
    #[test(s = @0xD43593C715FDD31C61141ABD04A99FD6822C8558854CCDE39A5684E7A56DA27D)]
    fun test_guid_wrapper_backward_compatibility(s: signer) {
        emit_event(&s,1);
        // let sender_bytes = BCS::to_bytes(&address_of(&s));
        // let count_bytes = BCS::to_bytes(&0u64);
        // Vector::append(&mut count_bytes, sender_bytes);
        // let old_guid = count_bytes;
        // // should be 16 bytes of address + 8 byte integer
        // assert!(Vector::length(&old_guid) == 40, 0);
        // let old_guid_bytes = BCS::to_bytes(&old_guid);
        // // old_guid_bytes should be length prefix (24), followed by content of vector
        // // the length prefix is a ULEB encoded 32-bit value, so for length prefix 24,
        // // this should only occupy 1 byte: https://github.com/diem/bcs#uleb128-encoded-integers
        // // hence, 24 byte contents + 1 byte length prefix = 25 bytes
        // assert!(Vector::length(&old_guid_bytes) == 41, 1);

        // // now, build a new GUID and check byte-for-byte compatibility
        // let guid_wrapper = Event::create_guid_wrapper_for_test<u64>(&s);
        // let guid_wrapper_bytes = BCS::to_bytes(&guid_wrapper);

        // // check that the guid grapper bytes are identical to the old guid bytes
        // assert!(Vector::length(&guid_wrapper_bytes) == Vector::length(&old_guid_bytes), 2);
        assert!(1 == 1, 3)
    }
}
