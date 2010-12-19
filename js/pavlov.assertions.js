var is_A = function(actual, expected, message) {
  ok(actual instanceof expected, message)
}

QUnit.specify.extendAssertions({
    isA: is_A,
    isAn: is_A
});