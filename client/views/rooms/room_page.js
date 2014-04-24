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
  
  var callback;
  var paused;
  //private 
  function update(){
    var newDate = new Date();
    setTimeLeft( getTimeLeft() - (newDate - currentDate) );// change to new Date()...
    currentDate = newDate;
    
    if(getTimeLeft() <= 0){
      stop(callback);
      return;
    }
  }
  //public
  function runTimer(cb){
    callback = cb;
    currentDate = new Date();
    intervalId = setInterval(update, delay);
  }
  
  function setTimeLeft(time){
    _dep.changed();
    timeLeft = time;
  }
  function init(){
    setTimeLeft(0);
  }
  function getTimeLeft(){
    _dep.depend();
    return timeLeft; 
  }
  function setTimeMin(pomoMinutes, breakMinutes){
    pomoMin = pomoMinutes;
    breakMin = breakMinutes;
  }
  function start(cb){
    stop();
    timeLeft = pomoMin*1000*60;
    runTimer(cb);
  }
  function breakTimer(cb){
    stop();
    timeLeft = breakMin*1000*60;
    runTimer(cb);
  }
  function pause(cb){
    paused = true;
    clearInterval(intervalId);
    cb && cb();
  }
  function stop(cb){
    setTimeLeft(0);
    clearInterval(intervalId);
    cb && cb();
  }
  function resume(){
    if(paused){
      paused = false;
      runTimer(callback);
    }
  }
  return {
    setTimeMin: setTimeMin,
    init: init,
    start: start,
    breakTimer: breakTimer,
    pause: pause,
    stop: stop,
    resume: resume,
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
    return this.messages;// temp hack
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
    var users = Meteor.users.find({ _id: {$in:userIdArray}});
    return users;
  },
  time: function() {
    var time = timer.getTimeLeft();
    return msToString(time);
  },
  userIsOwner: function(){
    return this.ownerId === Meteor.user()._id;
  }
});



var workingOn = null;
Template.roomPage.created = function(){
  
}
var session = null; // rem to change to var
Template.roomPage.rendered = function(){

  timer.setTimeMin(2,1);
  timer.init();

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
  },
  'click #stop': function(e){
    e.preventDefault();
    timer.stop();
  },
  'click #pause': function(e){
    e.preventDefault();
    timer.pause();
  },
  'click #resume': function(e){
    e.preventDefault();
    timer.resume();
  }
});
