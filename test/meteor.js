if('undefined' !== typeof Tinytest){

  if(Meteor.isServer) return;

  Tinytest.add('Ways', function (test) {
    test.isNotNull(Ways, {
      message: 'Expect `Ways` to be defined'
    });
  });
}