function AppViewModel() {
  var self = this;

  self.socket = io();
  self.ships = ko.observableArray([]);
  self.username = ko.observable();

  // Initialize varibles
  self.$loginPage = $('.login.page'); // The login page
  self.$gamePage = $('.game.page'); // The chatroom page
  self.connected = false;
  self.hello = ko.observable('');

  self.socket.on('new move', function(data){
    self.updateShipOrCreateNewOne(data);
  });

  self.updateShipOrCreateNewOne = function(data) {
    var existingShip = self.getShipByUsername(data.username);
    if ( existingShip != null ) {
      self.updateShip(existingShip, data);
    } else {
      self.createNewShip(data);
    }
  };

  self.updateShip = function(existingShip, newData) {
    // remove and istances of the existing ship in the observable array, and
    // populate the array with a new ship containing the same data
    self.ships.remove(existingShip);
    var updatedShip = {
      username: existingShip.username,
      data: newData
    };
    self.ships.push(updatedShip);

  };

  self.getShipByUsername = function(username) {
    var ship = null;
    for (var s in self.ships() ) {
      var candidateShip = self.ships()[s];
      if ( candidateShip.username == username ) {
        ship = candidateShip;
        break;
      }
    }
    return ship;
  };

  self.createNewShip = function(data) {
    var newShip = {
      username: data.username,
      data: data
    };
    self.ships.push(newShip);
  };

  self.registerUsername = function() {
    // If the username is valid
    if ( self.username() ) {
      self.$loginPage.fadeOut();
      self.$gamePage.show();
      self.$loginPage.off('click');

      // Tell the server your username
      self.socket.emit('add user', self.username() );
      self.connected = true;
    };
  };
};

$(function(){

  var vm = new AppViewModel();
  ko.applyBindings(vm);

  $( document ).on( "mousemove", function( event ) {
    var data = {
      xPos: event.pageX,
      yPos: event.pageY,
    };

    vm.socket.emit('new move', data);
    return false;
  });

});
  