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