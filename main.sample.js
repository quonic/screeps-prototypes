

var game = require('prototype.game'); // This is about the only way I could get this to work.
require('prototype.room')();
require('prototype.spawn')();
require('prototype.creep')();


module.exports.loop = function () {


//getHarvestedEnergy and getUsedEnergy example usage.  
    for (let roomKey in rooms) {
      let room = Game.rooms[roomKey];
      var isMyRoom = (room.controller ? room.controller.my : 0);
      if (isMyRoom) {
          let deposit = room.getHarvestedEnergy();
          if(deposit){
              Memory.stats['room.' + room.name + '.homeHarvestedEnergy'] = deposit;
              Memory.stats['room.' + room.name + '.homeHarvestedEnergyTotal'] = Memory.stats['room.' + room.name + '.homeHarvestedEnergyTotal'] + Memory.stats['room.' + room.name + '.homeHarvestedEnergy'];
          }else{
              Memory.stats['room.' + room.name + '.homeHarvestedEnergy'] = 0;
          }
          let withdraw = room.getUsedEnergy();
          if(withdraw){
              Memory.stats['room.' + room.name + '.homeUsedEnergy'] = withdraw;
              Memory.stats['room.' + room.name + '.homeUsedEnergyTotal'] = Memory.stats['room.' + room.name + '.homeUsedEnergyTotal'] + Memory.stats['room.' + room.name + '.homeUsedEnergy'];
          }else{
              Memory.stats['room.' + room.name + '.homeUsedEnergy'] = 0;
          }
          
      }
  }
}
