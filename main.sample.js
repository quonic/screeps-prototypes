var game = require('prototype.game'); // This is about the only way I could get this to work.
require('prototype.room')();
require('prototype.spawn')();
require('prototype.creep')();
require('utils.logger'); // From: https://github.com/Puciek/screeps-elk/blob/master/js/utils.logger.js

module.exports.loop = function () {

    game.setup();

    //getHarvestedEnergy and getUsedEnergy example usage.
    let rooms = Game.rooms;
    for (let roomKey in rooms) {
        if (!rooms.hasOwnProperty(roomKey)) {
            continue;
        }
        let room = Game.rooms[roomKey];
        var isMyRoom = (room.controller ? room.controller.my : 0);
        if (isMyRoom) {
            let deposit = room.getHarvestedEnergy();
            if (deposit) {
                Memory.stats['room.' + room.name + '.homeHarvestedEnergy'] = deposit;
                Memory.stats['room.' + room.name + '.homeHarvestedEnergyTotal'] = Memory.stats['room.' + room.name + '.homeHarvestedEnergyTotal'] + Memory.stats['room.' + room.name + '.homeHarvestedEnergy'];
            } else {
                Memory.stats['room.' + room.name + '.homeHarvestedEnergy'] = 0;
            }
            let withdraw = room.getUsedEnergy();
            if (withdraw) {
                Memory.stats['room.' + room.name + '.homeUsedEnergy'] = withdraw;
                Memory.stats['room.' + room.name + '.homeUsedEnergyTotal'] = Memory.stats['room.' + room.name + '.homeUsedEnergyTotal'] + Memory.stats['room.' + room.name + '.homeUsedEnergy'];
            } else {
                Memory.stats['room.' + room.name + '.homeUsedEnergy'] = 0;
            }

        }
        room.gc();
    }
};
