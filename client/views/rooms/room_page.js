var timer = (function(){
  var _dep = new Deps.Dependency;
  var delay = 100;

  var study;// true: study, false: break
  var timeLeft;
  
  var pomoMin; // 50/10 or 25/5
  var breakMin;
  
  var currentState; // 0: stop, 1: Run study, 2: Run break
  var intervalId;
  var currentDate;
  
  
  //private
  function runTimer(cb){
    stop();
    currentDate = new Date();
    intervalId = setInterval(update, delay, cb);
  }  
  function update(cb){
    var newDate = new Date();
    setTimeLeft( timeLeft - (newDate - currentDate) );// change to new Date()...
    currentDate = newDate;
    if(timeLeft <= 0){
      //timeLeft = 0;
      setTimeLeft(timeLeft);
      stop(cb);
      return;
    }
  }
  function setTimeLeft(time){
    _dep.changed();
    timeLeft = time;
  }
  
  //public
  function init(){
    setTimeLeft(0);
  }
  function getTimeLeft(){
    _dep.depend();
    return timeLeft; 
  }
  function stop(cb){
    clearInterval(intervalId);
    cb && cb();
  }
  function setTimeMin(pomoMinutes, breakMinutes){
    pomoMin = pomoMinutes;
    breakMin = breakMinutes;
  }
  function start(cb){
    timeLeft = pomoMin*1000*60;
    runTimer(cb);
  }
  function breakTimer(cb){
    timeLeft = breakMin*1000*60;
    runTimer(cb);
  }
  function pause(){
    //not yet
  }
  return {
    setTimeMin: setTimeMin,
    init: init,
    start: start,
    pause: pause,
    stop: stop,
    breakTimer: breakTimer,
    getTimeLeft: getTimeLeft
  };
}());

function msToString(ms) { 
  if(ms===0)
    return '00:00';
  var seconds = parseInt(ms/1000, 10);
  var minutes = parseInt(seconds/60, 10);
  function pad(num) {
    if (num < 10) return '0' + num;
    else return num.toString();
  }

  return pad(minutes) + ':' + pad(seconds - minutes * 60);    
}
Template.roomPage.helpers({
  messages: function() {
    return this.messages;// wrong
  },
  users: function() {
    var anonymous = Meteor.users.findOne({username: 'anonymous'});
    if(!anonymous)
      return null;
    var anonymous_id = anonymous._id;
    var roomId = this._id;
    var userIdArray = Meteor.presences.find({state:{currentRoomId: roomId}}).map(function(obj){
      return obj.userId || anonymous_id;
    });
    var users = Meteor.users.find({ _id: {$in:userIdArray}}); console.log(users.fetch());
    return users;
  },
  time: function() {
    var time = timer.getTimeLeft();
    return msToString(time);
  }
});



var workingOn = null;
Template.roomPage.created = function(){
  
}
var session = null; // rem to change to var
Template.roomPage.rendered = function(){
  /*Session.set('openTokData', undefined);
  Meteor.call('getOpenTokData',this.data._id ,function(error,data){
    if(error){
      console.log('getOpenTokData error:' + error.reason);
    } else{
      Session.set('openTokData',data);
    }
  });*/
  
  //bootbox.prompt
  timer.setTimeMin(25,5);
  timer.init();
  
  
  /*Deps.autorun(function(computation){
    var data;
    if( ( data = Session.get('openTokData') ) !== undefined) {
      
      session = TB.initSession(data.sessionId);
      session.addEventListener('sessionConnected', sessionConnectedHandler);
      session.addEventListener('streamCreated', streamCreatedHandler);
      session.connect(Config.apiKey,data.token);
      computation.stop();
    }
  });*/
  
};

function sessionConnectedHandler(event){
  var publisher = TB.initPublisher(Config.apiKey, myPublisherDiv); 
  session.publish(publisher);
  
  subscribeToStreams(event.streams);
}
function streamCreatedHandler(event){
  subscribeToStreams(event.streams);
}
function subscribeToStreams(streams){
  for(var i=0; i<streams.length; i++){
    if(streams[i].connection.connectionId === session.connection.connectionId){
      return;
    }
    var div = $('<div>',{
      id: 'stream'+streams[i].streamId
    });
    $('#videos').append(div);
    
  }
}
Template.roomPage.events({
  'submit #chat-form': function(e){
    e.preventDefault();
    
    var message = {
      chatMessage: $(e.target).find('[name=chatInput]').val(),
      roomName: this.name
    };

    Meteor.call('sendMessage', message, function(error,nothing){    
      if(error)
        return alert(error.reason);
      var n = nothing;
    });
    
    $(e.target).find('[name=chatInput]').val('');
  },
  'click #start': function(e){
    e.preventDefault();
    timer.start(function(){alert('finished study')});
  },
  'click #break': function(e){
    e.preventDefault();
    timer.breakTimer(function(){alert('finished break')});
  }
});