Meteor.publish('rooms',function(){
  return Rooms.find();
});

Meteor.publish('userPresence', function(){
  return Meteor.presences.find({});
});

Meteor.publish('userData', function() {
  return Meteor.users.find({}, { username: 1, profile: 1 } );
});
