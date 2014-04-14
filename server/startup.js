Meteor.startup(function(){
  Rooms.update({}, { $set: { messages: [], currentUserIds: [] } });
  if(!Meteor.users.findOne({username:'anonymous'}))
    Accounts.createUser({username:'anonymous'});
});
