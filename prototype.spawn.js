let priceMap = {};
priceMap[MOVE] = 50;
priceMap[WORK] = 100;
priceMap[CARRY] = 50;
priceMap[ATTACK] = 80;
priceMap[RANGED_ATTACK] = 150;
priceMap[TOUGH] = 10;
priceMap[HEAL] = 250;
priceMap[CLAIM] = 600;
//var statsConsole = require("statsConsole");

//Module to Export
module.exports = function () {
    /**
     *
     * @param name
     * @param body
     * @param memory
     * @returns {*}
     */
    StructureSpawn.prototype.createCustomCreep =
        function (name, body, memory) {
            if (this.spawning) {
                return true;
            }
            var existingCreep = Game.creeps[name];

            if (!existingCreep) {
                var createMessage = this.createCreep(body, name, memory);
                if (createMessage == name) {
                    this.memory.state = "OK";
                    this.memory.spawning = name;
                    this.log(this.name + " Respawning " + name, INFO, false);
                }
                else {
                    this.memory.spawning = "";
                    switch (createMessage) {
                        case ERR_NOT_ENOUGH_RESOURCES:
                            return ERR_NOT_ENOUGH_RESOURCES;
                        case ERR_NOT_ENOUGH_ENERGY:
                            if (this.room.storedEnergyInRoom() < 100000) {
                                if (this.memory.state != "SaveEnergy") {
                                    this.log(this.name + " saving up for " + name, 0);
                                }
                                this.memory.state = "SaveEnergy";
                            }
                            return ERR_NOT_ENOUGH_ENERGY;
                            break;
                        case ERR_BUSY:
                            return ERR_BUSY;
                        case -4:
                            return -4;
                            break;
                        default:
                            this.log("unexpected spawn message: " + createMessage + " body was " + JSON.stringify(body), ERR);
                            return 0;
                            break;
                    }
                }
                return true;
            }
            return false;
        };
    /**
     *
     * @param bodyParts
     * @param maxPrice
     * @returns {Array}
     * @constructor
     */
    StructureSpawn.prototype.BodyBuild =
        function (bodyParts, maxPrice) {

            var remainingCapacity = this.room.energyCapacityAvailable;
            if (maxPrice) {
                remainingCapacity = maxPrice;
            }
            var resultingBody = [];
            while (true) {
                for (var assaultPartsIterator = 0; assaultPartsIterator < bodyParts.length; assaultPartsIterator++) {
                    if (remainingCapacity < 50 || resultingBody.length == 50) {
                        resultingBody.sort(function (a, b) {
                            return priceMap[a] - priceMap[b];
                        });
                        return resultingBody;
                    }
                    var nextPart = bodyParts[assaultPartsIterator];
                    if (priceMap[nextPart] <= remainingCapacity) {
                        resultingBody.unshift(nextPart);
                        remainingCapacity -= priceMap[nextPart];
                    }
                }
            }

        };
};