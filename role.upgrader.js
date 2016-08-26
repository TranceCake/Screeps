var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var result;

        if(creep.carry.energy > 0) {
            result = this.moveToTarget(creep);
        } else {
            var link = _.filter(creep.room.find(FIND_STRUCTURES), s => s.structureType === STRUCTURE_LINK && !s.pos.isNearTo(creep.room.storage) && s.progress === undefined);
            
            if(link.length > 0) {
                if(creep.withdraw(link[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    result = creep.moveTo(link[0]);
                    //console.log('wut');
                } else {
                    //console.log('in range');
                    result = creep.withdraw(link[0], RESOURCE_ENERGY);
                    //console.log(result);
                }
            } else {
                //console.log('test')
                result = this.moveToTarget(creep);
            }
        }
        creep.memory.result = result;
	},
    
    getBody: function (energy) {
        if (energy < BODYPART_COST[MOVE] + BODYPART_COST[CARRY] + BODYPART_COST[WORK]) {
            return null;
        }

        var work = [], carry = [], move = [];
        var cost = _.sum([BODYPART_COST[MOVE], BODYPART_COST[CARRY], BODYPART_COST[WORK]]);

        while (energy >= cost) {
            if(carry.length < 6) {
                energy = this.addPart(energy, carry, CARRY);
                energy = this.addPart(energy, move, MOVE);
                energy = this.addPart(energy, work, WORK);
            } else {
                break;
            }
        }
        return work.concat(carry).concat(move);
    },
    
    addPart: function (energy, parts, part) {
        parts.push(part);
        return energy - BODYPART_COST[part];
    },
    
    moveToTarget: function(creep) {
        if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            var flag = _.filter(Game.flags, f => f.name === creep.memory.flag)[0];
            
            if(flag !== undefined) {
                return creep.moveTo(flag);
            } else {
                return creep.moveTo(creep.room.controller);
            }
        } else {
            return creep.upgradeController(creep.room.controller);
        }
    }
};

module.exports = roleUpgrader;
