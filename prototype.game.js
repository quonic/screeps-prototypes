let timer = 0;
var _livingRoles = {};

module.exports.setup = function setup() {
    Object.assign(Game, {
            friendlyFilter() {
                return {
                    filter: function (c) {
                        if (c.owner.username === "Nam") {
                            return false;
                        } else if (c.owner.username === "Friend1") {
                            return false;
                        } else if (c.owner.username === "Friend2") {
                            return false;
                        }
                        return true;
                    }
                };
            },
            startTimer() {
                timer = this.cpu.getUsed()
            },
            /**
             *
             * @returns {number}
             */
            endTimer() {
                return this.cpu.getUsed() - timer;
            },
            initBuildQueue()
            {
                if (Memory.GlobalQueue == undefined) {
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
                return _.filter(Memory.GlobalQueue, {
                    filter: function (creep) {
                        return creep.memory.role = role;
                    }
                });
            },
            distributeQueue()
            {
                let creeps = Memory.GlobalQueue;
                
                let myRooms = _.filter(Game.rooms, {
                    filter: function (room) {
                        return room.getQueue().length < 10;
                    }
                });
                for (let room in myRooms) {
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
             *
             * @param small
             * @returns {*}
             */
            guid(small = false) {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }
                
                if (small) {
                    return s4() + s4();
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            }
        }
    );
};
