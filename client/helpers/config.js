Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY'
});
Meteor.Presence.state = function(){
  return {
    currentRoomId: Session.get('currentRoomId')
  };
};
