require('prototype.spawn')();
var _livingRoles = {};

module.exports = function () {

    /**
     * Initialize the build queue
     */
    Room.prototype.initBuildQueue =
        function () {
            if (Memory.rooms === undefined) {
                Memory.rooms = {};
            }
            if (Memory.rooms[this.name] === undefined) {
                Memory.rooms[this.name] = {};
            }
            if (this.controller.my && Memory.rooms[this.name].buildQueue === undefined) {
                this.clearBuildQueue();
            }
        };

    /**
     * Add a creep to the build queue
     * @param name
     * @param body
     * @param memory
     */
    Room.prototype.addToBuildQueue =
        function (name, body, memory) {
            Memory.rooms[this.name].buildQueue.push({name: name, body: body, memory: memory});
        };

    /**
     * Remove the first creep from the queue
     */
    Room.prototype.removeFromBuildQueue =
        function () {
            Memory.rooms[this.name].buildQueue.shift();
        };

    /**
     * Clear the build queue
     */
    Room.prototype.clearBuildQueue =
        function () {
            Memory.rooms[this.name].buildQueue = {};
        };

    /**
     * Get the creeps in the queue with a specific role
     * @param role
     * @returns {Array}
     */
    Room.prototype.getRolesInBuildQueue =
        function (role) {
            return _.filter(Memory.rooms[this.name].buildQueue,
                function (creep) {
                    return creep.memory.role == role;
                }
            );
        };

    /**
     * Build the next creep(s) for this room
     * @constructor
     */
    Room.prototype.BuildNextCreep =
        function () {
            let spawns = this.getIdleSpawn();
            if (spawns) {
                for (let spawn in spawns) {
                    if (!spawns.hasOwnProperty(spawn)) {
                        continue;
                    }
                    let creep = this.getQueue();
                    let created = spawn.createCustomCreep(creep[0].name, creep[0].body, creep[0].memory);
                    if (created === true) {
                        this.removeFromBuildQueue();
                    }
                    else {
                        if (useUtilsLogger) {
                            spawn.log("Failed to build creep: " + creep.name, ERR);
                        } else {
                            console.log(spawn.name + "Failed to build creep: " + creep.name);
                        }

                    }
                }
            } else {
                // Failed to find any spawns
                // For debugging
            }
        };

    /**
     * Get the build queue
     * @returns {{}|*}
     */
    Room.prototype.getQueue =
        function () {
            return Memory.rooms[this.name].buildQueue;
        };

    /**
     *
     * @returns {boolean}
     */
    StructureSpawn.prototype.buildCreepFromQueue =
        function () {
            let creep = Memory.rooms[this.room.name].buildQueue[0];
            let created = this.createCustomCreep(creep.name, creep.body, creep.memory);
            if (created === true) {
                this.room.removeFromBuildQueue();
                return true;
            }
            else {
                if (useUtilsLogger) {
                    this.log("Failed to build creep: " + creep.name, ERR);
                } else {
                    console.log(this.name + "Failed to build creep: " + creep.name, ERR);
                }
            }
            return false;
        };
};

// Prototype.Game
module.exports.setup = function setup() {
    Object.assign(Game, {
            initBuildQueue()
            {
                if (Memory.GlobalQueue === undefined) {
                    Memory.GlobalQueue = {};
                }
            },
            addToBuildQueue(name, body, memory)
            {
                Memory.GlobalQueue.push({name: name, body: body, memory: memory});
            },
            removeFromBuildQueue()
            {
                Memory.GlobalQueue.shift();
            },
            clearBuildQueue()
            {
                Memory.GlobalQueue = {};
            },
            getRolesInBuildQueue(role)
            {
                return _.filter(Memory.GlobalQueue,
                    function (creep) {
                        return creep.memory.role == role;
                    }
                );
            },
            distributeQueue()
            {
                let creeps = Memory.GlobalQueue;

                let myRooms = _.filter(Game.rooms,
                    function (room) {
                        return room.getQueue().length < 10;
                    }
                );
                for (let room in myRooms) {
                    if (!myRooms.hasOwnProperty(room)) {
                        continue;
                    }
                    room.addToBuildQueue(creeps[0].name, creeps[0].body, creeps[0].memory);
                    removeFromBuildQueue()
                }
            },
            getLivingRoles(role){
                let roleFilter = {
                    filter: function (creep) {
                        return creep.memory.role == role;
                    }
                };
                if (_livingRoles) {
                    return _.filter(_livingRoles, roleFilter);
                }
                _livingRoles = Game.creeps;
                return _.filter(_livingRoles, roleFilter);
            },
            /**
             * Garbage Collector - Clears variables to prevent them from persisting to next tick
             */
            gcQueue () {
                _livingRoles = undefined;
                this.gc()
            }
        }
    );
};