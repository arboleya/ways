if('undefined' !== typeof Tinytest){

  Tinytest.add('Ways', function (test) {
    test.isNotNull(Ways, {
      message: 'Expect `Ways` to be defined'
    });
  });
}