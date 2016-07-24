var roleUpgrader = require('role.upgrader');

var roleHarvester = {

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
	        var energyStorage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
	            filter: (o) => o.energy < o.energyCapacity
	        });
            
            if(energyStorage !== null) {
                if(creep.transfer(energyStorage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    result = creep.moveTo(energyStorage);
                } else {
                    result = creep.transfer(energyStorage, RESOURCE_ENERGY);
                }
            } else {
                roleUpgrader.run(creep);
            }
        } else {
            var target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
            
            if(target != null) {
                if(creep.pickup(target) === ERR_NOT_IN_RANGE) {
                    result = creep.moveTo(target);
                } else {
                    result = creep.pickup(target);
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
        }
        creep.memory.result = result;
	}
};

module.exports = roleHarvester;