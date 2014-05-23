var Timer = function(){
  var self = this;
  self._dep = new Deps.Dependency;
  self.delay = 100;

  self.study;// true: study, false: break
  self.timeLeft;
    
  self.pomoMin; // 50/10 or 25/5
  self.breakMin;
    
  self.currentState; // 0: stop, 1: Run study, 2: Run break
  self.intervalId;
  self.currentDate;
    
  self.callback;
  self.paused;
};

Timer.prototype = {
  init: function(){
    setTimeLeft(0);
  },
  runTimer: function(cb){
    callback = cb;
    currentDate = new Date();
    intervalId = setInterval(update, delay);
  },
  setTimeLeft: function(time){
    _dep.changed();
    timeLeft = time;
  },
  getTimeLeft: function(){
    _dep.depend();
    return timeLeft; 
  },
  setTimeMin: function(pomoMinutes, breakMinutes){
    pomoMin = pomoMinutes;
    breakMin = breakMinutes;
  },
  start: function(cb){
    stop();
    timeLeft = pomoMin*1000*60;
    runTimer(cb);
  },
  breakTimer: function(cb){
    stop();
    timeLeft = breakMin*1000*60;
    runTimer(cb);
  },
  pause: function(cb){
    paused = true;
    clearInterval(intervalId);
    cb && cb();
  },
  stop: function(cb){
    setTimeLeft(0);
    clearInterval(intervalId);
    cb && cb();
  },
  resume: function(){
    if(paused){
      paused = false;
      runTimer(callback);
    }
  },
  //private 
  _update: function(){
    var newDate = new Date();
    setTimeLeft( getTimeLeft() - (newDate - currentDate) );// change to new Date()...
    currentDate = newDate;
    
    if(getTimeLeft() <= 0){
      stop(callback);
      return;
    }
  }
};


var timerStore = {
  nextId: 0,
  cache: {},
  addTimer: function(timer){
    if(!timer.id){
      timer.id = nextId++;
      cache[timer.id] = timer;
      return true;
    } else{
      return false;
    }
  }
}
Meteor.methods({
  'timer/createTimer': function(){
    var timer = new Timer();
    timerStore.addTimer(timer);
    return timer.id;
  }
});
