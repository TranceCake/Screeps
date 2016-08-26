var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var result;
        
        if(creep.carry.energy > 0) {
            var site;
            var sites = creep.room.find(FIND_CONSTRUCTION_SITES);
            var prioritySites = _.filter(sites, (s) => s.structureType === STRUCTURE_RAMPART || s.structureType === STRUCTURE_WALL);
            var topPrioritySites = _.filter(sites, (s) => s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_TOWER);
            
            if(topPrioritySites.length > 0) {
                creep.memory.idle = false;
                site = creep.pos.findClosestByPath(topPrioritySites);
                result = work(creep, site);
            } else if(prioritySites.length > 0) {
                creep.memory.idle = false;
                site = creep.pos.findClosestByPath(prioritySites);
                result = work(creep, site);
            } else if(sites.length > 0) {
                creep.memory.idle = false;
                site = creep.pos.findClosestByPath(sites);
                result = work(creep, site);
            } else {
                creep.memory.idle = true;
                var flags = _.filter(Game.flags, f => f.room !== undefined && f.room.name === creep.room.name);
                var flagName = creep.room.name + '-Idle';
                
                if(flags.length > 0) {
                    var flag = _.filter(flags, f => f.name === flagName)[0];
                    
                    if(!creep.pos.isNearTo(flag)) {
                        result = creep.moveTo(flag);
                    }
                }
            }
        } else {
            result = -6;   
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
    }
};

module.exports = roleBuilder;

function work(creep, target) {
    if(creep.build(target) === ERR_NOT_IN_RANGE) {
        return creep.moveTo(target);
    } else {
        return creep.build(target);
    }
}







