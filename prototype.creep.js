//Module to Export


module.exports = function () {
    /**
     * Get nearby assault creep, change as needed
     * @returns {*}
     */
    Creep.prototype.getNearByAssault =
        function (role = "assault") {
            return this.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: function (c) {
                    return c.memory.role == role;
                }
            });
        };
    /**
     * Get the closest creep
     * @returns {*}
     */
    Creep.prototype.getNearByCreep =
        function () {
            return this.pos.findClosestByRange(FIND_MY_CREEPS, {
                function(creep){
                    return creep.id !== super.id;
                }
            });
        };
    /**
     * Get nearby enemy creep, or specify a range and return more than one.
     * Also filtering out friendly creeps.
     * @param range
     * @returns {*}
     */
    Creep.prototype.getNearByEnemyCreep =
        function (range) {
            let distance = range || null;
            if (distance !== null) {
                return this.pos.findInRange(FIND_HOSTILE_CREEPS, range, Game.friendlyFilter());
            }
            return this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, Game.friendlyFilter());
        };
    /**
     * Get closest enemy structure.
     * Also filtering friendly structures
     * @returns {*}
     */
    Creep.prototype.getNearByEnemyStructure =
        function () {
            return this.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, Game.friendlyFilter());
        };
    /**
     * Attack nearby enemy creep.
     * @param target
     */
    Creep.prototype.attackEnemyCreep =
        function (target = null) {
            let myTarget = target || this.getNearByEnemyCreep();
            if (myTarget) {
                if (myTarget.pos != this.pos) {
                    this.moveTo(myTarget.pos.x, myTarget.pos.y);
                } else {
                    this.attack(myTarget);
                }
            }

        };
    /**
     * Attack nearby enemy creep, or specific target.
     * Also move to the target if not with in range.
     * Todo: Need to get this to be a bit smarter. Unused at the moment.
     * @param target
     * @returns {boolean}
     */
    Creep.prototype.attackRangedEnemyCreep =
        function (target = null) {
            let myTarget = target || this.getNearByEnemyCreep();
            if (myTarget) {
                if (myTarget.pos != this.pos) {
                    this.moveTo(myTarget.pos.x, myTarget.pos.y);
                } else {
                    this.rangedAttack(myTarget);
                }
                return true;
            }
            return false;
        };
    /**
     * Attack enemy structure, filtering out friendly structures.
     * @param target
     */
    Creep.prototype.attackEnemyStructure =
        function (target = null) {
            let myTarget = target || this.getNearByEnemyStructure();
            if (myTarget.pos != this.pos) {
                this.moveTo(myTarget.pos.x, myTarget.pos.y);
            } else {
                this.attack(myTarget);
            }

        };
    /**
     * Move creep to flag specified. Change as needed.
     * @param flag
     * @returns {boolean}
     */
    Creep.prototype.moveToFlaggedRoom =
        function (flag) {
            if (flag && flag.pos) {
                /*let creeps = _.filter(flag.room.lookForAt(LOOK_CREEPS,flag.pos), function(c){return !c.my});
                 let struct = _.filter(flag.room.lookForAt(LOOK_STRUCTURES,flag.pos), function(c){return !c.my});

                 if(creeps.length > 1){
                 return false;
                 }*/
                if (flag.pos.roomName != this.pos.roomName) {
                    this.moveTo(flag.pos, {ignoreCreeps: true, ignoreRoads: true}); //, {ignoreCreeps: true}
                    return true;
                } else {
                    //this.moveTo(flag.pos, {ignoreCreeps: true, ignoreRoads: true});
                    //this.moveTo(flag.pos, {ignoreCreeps: true, reusePath: 1, ignoreRoads: true});
                    this.moveTo(flag.pos, {reusePath: 1, ignoreRoads: true});
                    return true;
                }
            }
            return false;
        };
    /**
     * Dump our mineral at the terminal.
     * @returns {boolean}
     */
    Creep.prototype.dumpAtTerminal =
        function () {
            let mineral = this.room.getMineral();

            if (_.sum(this.carry) === 0) {
                //console.log("Not carrying anything");
                this.memory.refillingTerminal = false;
                return false;
            }
            if (!this.memory.refillingTerminal) {
                //console.log("Not filling Terminal");
                return false;
            }

            if (this.room.terminal && this.room.terminal.store[mineral.mineralType] > 0) {
                if (this.room.terminal.transfer(this, mineral.mineralType) != OK) {
                    this.moveTo(this.room.terminal);
                }
                return true;

            }

            var storage = this.room.getStorage();

            var transferMessage = this.transfer(storage, mineral.mineralType);
            if (transferMessage == ERR_NOT_IN_RANGE) {
                this.moveTo(storage);
            }
        };
    /**
     * Collect mineral from storage.
     * Todo: use the deposit from prototype.room.js
     * @returns {boolean}
     */
    Creep.prototype.collectMineralFromStorage =
        function () {
            let mineral = this.room.getMineral();

            if(this.carry[mineral.mineralType] === 0 && this.room.storage.store[mineral.mineralType] > 0){
                if(!this.pos.inRangeTo(this.room.storage.pos, 1)){
                    this.moveTo(this.room.storage);
                    this.memory.refillingTerminal = true;
                    return true;
                }else{
                    this.room.withdrawResource(this, mineral.mineralType);
                    this.memory.refillingTerminal = true;
                    return true;
                }
            }
            //this.memory.refillingTerminal = false;
            return false;
        };
    /**
     * Get this creeps home.
     * @returns {*}
     */
    Creep.prototype.getHome =
        function () {
            return Game.getObjectById(this.memory.home);
        };
    /**
     * Collect energy from storage.
     * Todo: use the withdraw from prototype.room.js
     * @param ignoreRoomStorage
     * @returns {boolean}
     */
    Creep.prototype.collectEnergyFromStorage =
        function (ignoreRoomStorage) {
            var home = this.getHome();
            if (this.carry.energy !== 0) {
                return false;
            }
            var homeLink = home.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType == STRUCTURE_LINK;
                }
            });
            if (homeLink && homeLink.energy > 0) {
                if (homeLink.pos.getRangeTo(this) > 1) {
                    this.moveTo(homeLink);
                }
                else {
                    let tMessage = homeLink.transferEnergy(this);
                    if (tMessage == OK) {
                        let dropOffEnergy = _.sum(this.carry);
                        this.room.saveUsedEnergy(dropOffEnergy);
                    }
                }
                return true;
            }

            var nearestContainer = this.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: function (structure) {
                    if (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0) {
                        return true;
                    }
                }
            });

            if (nearestContainer !== null) {
                if (nearestContainer.transfer(this, RESOURCE_ENERGY) != OK) {
                    this.moveTo(nearestContainer);
                }
                return true;
            }

            /*        if (this.room.terminal && this.room.terminal.store[RESOURCE_ENERGY] > 0) {
             if (this.room.terminal.transfer(this, RESOURCE_ENERGY) != OK) {
             this.moveTo(this.room.terminal);
             }
             return true;

             }*/

            if (!ignoreRoomStorage && this.room.storage) {
                let withdrawMessage = this.room.withdrawResource(this, RESOURCE_ENERGY);
                if (withdrawMessage != OK) {
                    this.moveTo(this.room.storage);
                }
                return true;
            }
        };
    /**
     * Collect energy from a container or link.
     * @returns {boolean}
     */
    Creep.prototype.collectEnergyFromDump =
        function () {

            let nearestContainer = this.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: function (structure) {
                    if (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 100) {
                        return true;
                    }
                }
            });

            let nearestLink = this.room.storage.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: function (structure) {
                    if ((structure.structureType == STRUCTURE_LINK) /*&& (structure.energy >= 0)*/) {
                        return true;
                    }
                }
            });

            if (nearestContainer && nearestLink && this.pos.getRangeTo(nearestContainer) < this.pos.getRangeTo(nearestLink) && !Memory.workingLinks[nearestLink.id]) {

                let message = nearestContainer.transfer(this, RESOURCE_ENERGY);
                //console.log(message + ":" + this.name);
                if (message == ERR_NOT_IN_RANGE) {
                    this.moveTo(nearestContainer);
                }

                this.memory.refillingStorage = true;
                return true;
            }

            if (nearestLink || nearestContainer) {
                this.memory.refillingStorage = true;
            }

            if (this.carry.energy !== 0) {
                return false;
            }

            if (nearestLink && nearestLink.energy > 0) {
                let transferMessage = nearestLink.transferEnergy(this);
                //console.log(transferMessage + ":" + this.name);
                if (transferMessage == ERR_NOT_IN_RANGE) {
                    this.moveTo(nearestLink);
                }
                Memory.workingLinks[nearestLink.id] = true;
                return true;
            }
            if (nearestContainer) {
                if (nearestContainer.transfer(this, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(nearestContainer);
                }
                return true;
            }
            this.memory.refillingStorage = false;

            return false;
        };
    /**
     * Deposit energy into the storage.
     * Todo: use the deposit from prototype.room.js
     * @returns {boolean}
     */
    Creep.prototype.dumpEnergyAtStorage =
        function () {
            if (this.carry.energy === 0) {
                return false;
            }
            if (!this.memory.refillingStorage) {
                return false;
            }

            if (_.sum(this.room.storage.store) < this.room.storage.storeCapacity) {
                let transferMessage = this.room.depositResource(this, RESOURCE_ENERGY);
                //console.log(transferMessage + ": " + this.name);
                if (transferMessage == ERR_NOT_IN_RANGE) {
                    this.moveTo(this.room.storage);
                }
            }
        };
    /**
     * Save our last position in the our memory.
     */
    Creep.prototype.setLastPosition =
        function () {
            this.memory.lastPosition = this.pos;
        };
    /**
     * Return if re have moved.
     * @returns {boolean}
     */
    Creep.prototype.didWeMove =
        function () {
            return this.memory.lastPosition == this.pos;
        };
    /**
     * Find my nearby creeps.
     * Used for navigating around another creep.
     * @returns {Array}
     */
    Creep.prototype.findMyNearByCreeps =
        function () {
            return _.filter(this.pos.findInRange(this.pos, 1, FIND_MY_CREEPS),
                function (c) {
                    return c.id != this.id;
                }
            );
        };
    /**
     * Move around another creep if we haven't moved.
     * Todo: get this working.
     *
     * Work in progress. Untested!!!
     *
     * @param pos
     * @returns {*}
     */
    Creep.prototype.moveMe =
        function (pos) {
            let statusMoved = this.moveTo(pos);
            if (statusMoved == OK) {
                this.setLastPosition();
            } else {
                if (this.didWeMove()) {
                    let nextPos = this.getNextPathPos();
                    let creepNotMoved = _.filter(this.findMyNearByCreeps(),
                        function (c) {
                            return c.pos == nextPos;
                        }
                    );
                    creepNotMoved.moveTo(this.pos);
                    statusMoved = this.moveTo(creepNotMoved);
                }
            }
            return statusMoved;
        };
};
