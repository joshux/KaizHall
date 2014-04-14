Rooms = new Meteor.Collection('rooms');

Meteor.methods({
  room: function(roomAttributes) {
    var user = Meteor.user();
    var roomWithSameName = Rooms.findOne({name: roomAttributes.name});
    
    if(!user)
      throw new Meteor.Error(401, ' need to login '); 
      
    if(!roomAttributes.name)
      throw new Meteor.Error(422, ' Pleas fill in room name ');
      
    if(roomAttributes.name && roomWithSameName)
      throw new Meteor.Error(302, 'Room name already exists', roomWithSameLink._id);
      
    var room = _.extend(_.pick(roomAttributes, 'name', 'description','pomoMinutes','breakMinutes'), {
      ownerId: user._id,
      owner: user.username,
      submitted: new Date().getTime(),
      messages: [], // would change
      currentUserIds: [], // currently no use
      sessionId: null
    });
    
    var roomId = Rooms.insert(room);
  
    return roomId;
  },
  
  sendMessage: function(message){ 
    var user = Meteor.user();
    if(!user)
      throw new Meteor.Error(401, ' need to login '); 
    var msg = _.extend(_.pick(message,'chatMessage'), {
      senderId: user._id,
      senderName: user.username,
      submitted: new Date().getTime()
    });
    
    var room = Rooms.findOne({name:message.roomName}); 
    room.messages.push(msg);
    Rooms.update(room._id, {$set: {messages: room.messages}}, function(error){
    // diff $set: room ({messages: [..]}) v.s. $set: { messages: room.messages }  => ask stackoverflow
      if(error){
        ;//throwError(error.reason);
      } else {
        ;
      }
    });
    
    return 1;
  }
});
