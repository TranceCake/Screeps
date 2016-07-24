var roleUpgrader = require('role.upgrader');
var scheduler = require('scheduler');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var result;
        
        // used all energy, stop working
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
    
        // energy at full capacity, release spot and start working
        else if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }
        

        // instructions & harvesting
	    if(creep.memory.working) {
	        var energyStorage = creep.pos.findClosestByRange(FIND_STRUCTURES, {
	            filter: (o) => o.energy < o.energyCapacity
	        });
            
            if(energyStorage !== null) {
                work(creep, energyStorage);
            } else {
                roleUpgrader.run(creep);
            }
        } else {
            //var target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
            var target = null;
            
            if(target !== null) {
                collect(creep, target);
            } else {
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                collect(creep, source);
            }
        }
        creep.memory.result = result;
	}
};

module.exports = roleHarvester;

function work(creep, target) {
    if(!creep.pos.isNearTo(target)) {
        result = creep.moveTo(target);
    } else {
        result = creep.transfer(target, RESOURCE_ENERGY);
    }
}

function collect(creep, target) {
    if(!creep.pos.isNearTo(target)) {
        result = creep.moveTo(target);
    } else {
        if(target.energyCapacity !== undefined) {
            result = creep.harvest(target);
        } else {
            result = creep.pickup(target);
        }
    } 
}





