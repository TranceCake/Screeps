var roleUpgrader = require('role.upgrader');
var scheduler = require('scheduler');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var result;
        
        // used all energy, stop working
        if(creep.memory.working && creep.carry.energy == 0)
            creep.memory.working = false;

        // energy at full capacity, release spot and start working
        else if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            scheduler.release(creep);
            creep.memory.working = true;
        }
        

        // instructions & harvesting
	    if(creep.memory.working) {
	        var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (o) => o.hits < o.hitsMax && !(o.structureType === STRUCTURE_WALL || o.structureType === STRUCTURE_RAMPART)
            });
            
            var site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            
            if(structure !== null) {
                if(creep.repair(structure) === ERR_NOT_IN_RANGE) {
                    result = creep.moveTo(structure);
                } else {
                    result = creep.repair(structure);
                }
            } else if(site != null) {
                if(creep.build(site) === ERR_NOT_IN_RANGE) {
                    result = creep.moveTo(site);
                } else {
                    result = creep.build(site);
                }
            } else {
                roleUpgrader.run(creep);
            }
        } else {
            
            // try to get a spot
            if(!creep.memory.hasSpot) {
                var res = scheduler.request(creep);
                if(!res) {
                    result = 'queueing';
                }
            }
            
            if(creep.memory.hasSpot) {
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                
                if(creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    result = creep.moveTo(source);
                } else {
                    result = creep.harvest(source);
                }
            }
        }
        creep.memory.result = result;
	}
};

module.exports = roleBuilder;