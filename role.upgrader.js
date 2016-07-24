var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var result;

        // used all energy, stop working
        if(creep.memory.working && creep.carry.energy == 0)
            creep.memory.working = false;

        // energy at full capacity, release spot and start working
        else if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            Memory.spots++;
            creep.memory.hasSpot = false;
            creep.memory.working = true;
        }

        // instructions & harvesting
	    if(creep.memory.working) {
            if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                result = creep.moveTo(creep.room.controller);
            } else {
                result = creep.upgradeController(creep.room.controller);
            }
        } else {
            
            // try to get a spot
            if(Memory.spots > 0 && !creep.memory.hasSpot) {
                Memory.spots--;
                creep.memory.hasSpot = true;
            }
            
            // if spot available: go there, if not: wait in line
            if(creep.memory.hasSpot) {
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                
                if(creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    result = creep.moveTo(source);
                } else {
                    result = creep.harvest(source);
                }
            } else {
                result = 'queueing';
            }
        }
        creep.memory.result = result;
	}
};

module.exports = roleUpgrader;