
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { return Meteor.subscribe('rooms'); }
});

Router.map(function(){
  this.route('roomsList', {
    path: '/',
    onRun: function() {
      Session.set('currentRoomId', null);
    }
  });
  this.route('roomPage', {
    path: '/rooms/:_id',
    data: function() { return Rooms.findOne(this.params._id); },
    onRun: function() { 
      Session.set('currentRoomId',this.params._id);
    },
    waitOn: function() {
      return [Meteor.subscribe('userPresence'),Meteor.subscribe('userData')];
    },
    layoutTemplate: 'chatLayout'
  });
  this.route('roomSubmit',{
    path: '/submit',
    onRun: function() {
      Session.set('currentRoomId', null);
    }
  });
});

var requireLogin = function(pause){ 
  if(!Meteor.user()){ 
    if(Meteor.loggingIn())
      this.render(this.loadingTemplate);
    else
      this.render('accessDenied');
    pause();
  }  
};

Router.onBeforeAction(requireLogin, { only: ['roomSubmit','roomPage'] });

