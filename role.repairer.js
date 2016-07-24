var roleUpgrader = require('role.upgrader');
var scheduler = require('scheduler');

var roleRepairer = {

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
            var dmgStructures = _.filter(creep.room.find(FIND_STRUCTURES), (o) => o.hits < o.hitsMax && !(o.structureType === STRUCTURE_WALL || o.structureType === STRUCTURE_RAMPART));
            var structure = dmgStructures[0];
            
            for (s of dmgStructures) {
                if((s.hits / s.hitsMax) < (structure.hits / structure.hitsMax)) {
                    structure = s;
                }
            }
            //console.log(structure, structure.hits / structure.hitsMax);
            
            if(structure !== null) {
                work(creep, structure);
            } else {
                roleUpgrader.run(creep);
            }
        } else {
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            collect(creep, source);
        }
        creep.memory.result = result;
	}
};

module.exports = roleRepairer;

function work(creep, target) {
    if(creep.repair(target) === ERR_NOT_IN_RANGE) {
        result = creep.moveTo(target);
    } else {
        result = creep.repair(target);
    }
}

function collect(creep, target) {
    if(!creep.pos.isNearTo(target)) {
        result = creep.moveTo(target);
    } else {
        result = creep.harvest(target);
    }
}