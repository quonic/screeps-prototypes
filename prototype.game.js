let timer = 0;
var _livingRoles = {};

module.exports.setup = function setup() {
    Object.assign(Game, {
            friendlyFilter() {
                return {
                    filter: function (c) {
                        if (c.owner.username === "Nam") {
                            return false;
                        } else if (c.owner.username === "Zim") {
                            return false;
                        } else if (c.owner.username === "GMan") {
                            return false;
                        } else if (c.owner.username === "Dushinto") {
                            return false;
                        } else if (c.owner.username === "Icon") {
                            return false;
                        } else if (c.owner.username === "Artritus") {
                            return false;
                        } else if (c.owner.username === "EmptySet") {
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
            },
            /**
             *
             * @param ticks
             * @param distance
             * @param energyCap
             */
            cost(ticks, distance, energyCap) {
                let minerBody = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE];
                let minerAmount = (ticks / (1500 - distance));
                let minerCost = this.getBodyCost(minerBody);
                let energyMined = ticks * 10;
                let haulerSize = energyCap / 2;
                let haulerTrips = Math.floor(1500 / (distance * 2));
                let haulerAmount = energyMined / haulerSize / haulerTrips;
                let claimerAmount = ticks / (500 - distance);
                let creepDamage = ((minerBody.length * minerAmount) + (2 * claimerAmount) + ((haulerTrips * 2) * (haulerAmount) * (haulerSize / 25)));
                let roadDamage = ((creepDamage + ticks) * 0.001) * distance;
                let minerPrice = (minerCost * minerAmount);
                let haulerPrice = ((haulerSize * 2) * haulerAmount);
                let containerPrice = ticks * 0.5;
                let claimerPrice = (claimerAmount * 650);
                let losses = roadDamage + haulerPrice + claimerPrice + roadDamage + containerPrice;
                console.log("Results for " + ticks + " ticks at a distance of " + distance);
                console.log("You need " + minerAmount + " miners to mine " + energyMined + " energy.");
                console.log("With a energy capacity of " + energyCap + ", you can build haulers holding " + haulerSize + " energy. They can make " + haulerTrips + " trips, so you require " + haulerAmount + " haulers");
                console.log("You will need " + claimerAmount + " claimers");
                console.log("Because of all this traffic, your roads will lose " + creepDamage + " ticks per segment");
                console.log("Cost of miners: " + minerPrice);
                console.log("Cost of haulers: " + haulerPrice);
                console.log("Cost of claimers: " + claimerPrice);
                console.log("Cost of road repairs: " + roadDamage);
                console.log("cost of Container: " + containerPrice);
                console.log("You will make " + (energyMined - losses) + " energy")
            },
            /**
             *
             * @param body (BodyPart)
             * @returns {number}
             */
            getBodyCost (body) {
                let cost = 0;
                for (let part of body) {
                    cost += BODYPART_COST[part]
                }
                return cost
            }
        }
    )
    ;
};