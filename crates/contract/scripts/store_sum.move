
script {
    use Std::Signer;
    use Alice::Storage;

    fun store_sum(account: signer, a: u64, b: u64) {
        // Store sum.
        Storage::store_sum(&account, a, b);

        // Get sum from resource.
        let sum = Storage::get_sum(Signer::address_of(&account));

        // Throw error if sums don't match.
        // Error code is 101.
        assert!((a + b) == sum, 101);
    }
}