var roleRepairer = require('role.repairer');
var scheduler = require('scheduler');

var roleBuilder = {

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
	        if(creep.pos.isNearTo(creep.pos.findClosestByRange(FIND_SOURCES))) {
	            var direction = creep.pos.getDirectionTo(creep.pos.findClosestByRange(FIND_SOURCES));
	            if(direction < 5) {
	                //console.log(direction + ' ' + (direction + 4));
	                creep.move(direction + 4);
	            } else {
	                //console.log(direction + ' ' + (direction - 4));
	                creep.move(direction - 4);
	            }
	        }
	        
            var site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            
            if(site !== null) {
                work(creep, site);
            } else {
                roleRepairer.run(creep);
            }
            
        } else {
            var source = creep.pos.findClosestByRange(FIND_SOURCES);
            collect(creep, source);
        }
        creep.memory.result = result;
	}
};

module.exports = roleBuilder;

function work(creep, target) {
    if(!creep.pos.isNearTo(target)) {
        result = creep.moveTo(target);
    } else {
        result = creep.build(target);
    }
}

function collect(creep, target) {
    if(!creep.pos.isNearTo(target)) {
        result = creep.moveTo(target);
    } else {
        result = creep.harvest(target);
    }
}








