Template.roomSubmit.events({
  'submit form': function(e) {
    e.preventDefault();
    
    var room = {
      name: $(e.target).find('[name=name]').val(),
      description: $(e.target).find('[name=description]').val(),
      pomoMinutes: parseInt($(e.target).find('[name=pomo-minutes]').val()),
      breakMinutes: parseInt($(e.target).find('[name=break-minutes]').val())
    };
    
    //room._id = Rooms.insert(room);
    //Router.go('roomPage', room);
    
    Meteor.call('room', room, function(error, id){
      if(error)
        return alert(error.reason);
      Router.go('roomPage', {_id:id} );
    });
  }
});
