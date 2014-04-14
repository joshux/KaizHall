

var Future = Npm.require('fibers/future');
Meteor.methods({
  getOpenTokData: function(roomId){
    var userId = Meteor.userId();
    var loc = 'localhost';
        
    var room = Rooms.findOne(roomId);
    if(!room)
      throw new Meteor.Error(401,'room not found');
    room.currentUserIds.push(userId);
    
    var sessionId, token;
    var opentok = new OpenTok.OpenTokSDK(Config.apiKey,Config.secret); 
    if( room.sessionId === null){
      var fut = new Future();
      var d = Npm.require('domain').create();
      d.on('error', function(error) {
        console.log('error');
      });
      d.run(function(){
        opentok.createSession(function(result){
          sessionId = result;
          fut['return']();
        });
      });
      fut.wait();
      Rooms.update(roomId, {$set: { sessionId:sessionId }}, function(error){
        if(error){
          throw new Meteor.Error(401,error);
        }else{
          ;
        }
      });
    } else{
      sessionId = room.sessionId;
    }
    token = opentok.generateToken({session_id: sessionId});
    return {sessionId: sessionId , token: token };
  }
});


