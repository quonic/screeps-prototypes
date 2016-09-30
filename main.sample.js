var game = require('prototype.game'); // This is about the only way I could get this to work.
require('prototype.room')();
require('queue')();
require('prototype.creep')();

global.EMERG = 0;
global.ALERT = 1;
global.CRIT = 2;
global.ERR = 3;
global.WARNING = 4;
global.NOTICE = 5;
global.INFO = 6;
global.DEBUG = 7;
// Check if we failed to load utils.logger and don't try to run more than once
try {
    require('utils.logger'); // From: https://github.com/Puciek/screeps-elk/blob/master/js/utils.logger.js
    global.useUtilsLogger = true;
} catch (err) {
    global.useUtilsLogger = false;
    console.log("utils.logger.js: Not found.", ERR);
}

module.exports.loop = function () {

    game.setup();

    let rooms = Game.rooms;
    for (let roomKey in rooms) {
        if (!rooms.hasOwnProperty(roomKey)) {
            continue;
        }
        let room = Game.rooms[roomKey];
        var isMyRoom = (room.controller ? room.controller.my : 0);
        if (isMyRoom) {
            //getHarvestedEnergy and getUsedEnergy example usage.
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
        // Room Garbage Collector, clearing variables persist
        room.gc();
    }
    // Game Garbage Collector, clearing variables persist
    game.gc();
    game.gcQueue();
};
