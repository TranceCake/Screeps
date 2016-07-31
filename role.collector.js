var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var result;
        
        // used all energy, stop working
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
    
        // energy at full capacity, release spot and start working
        else if(!creep.memory.working && creep.carry.energy >= creep.carryCapacity / 2) {
            creep.memory.working = true;
        }
        

        // instructions & harvesting
	    if(creep.memory.working) {
	        var energyStorages = _.filter(creep.room.find(FIND_STRUCTURES), s => s.energy < s.energyCapacity && !(s.structureType === STRUCTURE_LINK || s.structureType === STRUCTURE_TOWER));
	        var towers = _.filter(creep.room.find(FIND_MY_STRUCTURES), s => s.structureType === STRUCTURE_TOWER && s.energy < s.energyCapacity * 0.8);
	        var buffers = _.filter(creep.room.find(FIND_STRUCTURES), (s) => s.store && s.store[RESOURCE_ENERGY] < s.storeCapacity && s.structureType !== STRUCTURE_CONTAINER);
            var priorityStorages = _.filter(energyStorages, (s) => s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION);
            var creepsInRoom = _.filter(Game.creeps, c => c.room.name === creep.room.name);
            var linkFillers =  _.filter(creepsInRoom, creep => creep.memory.role === 'linkFiller');
            var lowCreeps = _.filter(creepsInRoom, c => ((c.memory.role === 'upgrader' && !linkFillers.length > 0) || (c.memory.role === 'builder' && c.memory.idle === false)) && c.carry.energy < (c.carryCapacity / 2));
            var priorityCreeps = _.filter(lowCreeps, c => c.carry.energy === 0);
            
            if(priorityStorages.length > 0) {
                result = work(creep, creep.pos.findClosestByPath(priorityStorages));
            } else if(priorityCreeps.length > 0){
                result = work(creep, creep.pos.findClosestByPath(priorityCreeps));
            } else if(energyStorages.length > 0) {
                result = work(creep, creep.pos.findClosestByPath(energyStorages));
            } else if(lowCreeps.length > 0) {
                result = work(creep, creep.pos.findClosestByPath(lowCreeps));
            } else if(towers.length > 0) {
                result = work(creep, creep.pos.findClosestByPath(towers));
            } else if(buffers.length > 0) {
                result = work(creep, creep.pos.findClosestByPath(buffers));
            }
        } else {
            var targets = _.filter(creep.room.find(FIND_DROPPED_ENERGY), e => e.amount >= (creep.carryCapacity / 2) && e.resourceType === RESOURCE_ENERGY);
            if(targets.length > 0) {
                var target = creep.pos.findClosestByPath(targets);
                result = collect(creep, target);
            } else {
                targets = _.filter(creep.room.find(FIND_STRUCTURES), s => s.structureType === STRUCTURE_CONTAINER);
                var priorityTargets = _.filter(targets, t => t.structureType === STRUCTURE_CONTAINER);
                
                if(priorityTargets.length > 0) {
                    var target = priorityTargets[0];
                    var targetValue = target.store[RESOURCE_ENERGY] / creep.pos.findPathTo(target).length;
                    for(let p of priorityTargets) {
                        value = p.store[RESOURCE_ENERGY] / creep.pos.findPathTo(p).length;
                        if(value > targetValue) {
                            target = p;
                            targetValue = value;
                        }
                    }
                    
                    result = take(creep, target);
                } else if(targets.length > 0) {
                    var target = creep.pos.findClosestByPath(targets);
                    result = take(creep, target);
                }
            }
        }
        creep.memory.result = result;
	},
	
	getBody: function (energy) {
        if (energy < BODYPART_COST[MOVE] + BODYPART_COST[CARRY]) {
            return null;
        }

        var carry = [], move = [];
        var cost = BODYPART_COST[MOVE] + BODYPART_COST[CARRY];

        while (energy >= cost) {
            if (carry.length < 5) {
                energy = this.addPart(energy, move, MOVE);
                energy = this.addPart(energy, carry, CARRY);
            } else {
                break;
            }
        }

        return carry.concat(move);
    },
    
    addPart: function (energy, parts, part) {
        parts.push(part);
        return energy - BODYPART_COST[part];
    }
};

module.exports = roleHarvester;

function work(creep, target) {
    if(creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        return creep.moveTo(target);
    } else {
        return creep.transfer(target, RESOURCE_ENERGY);
    }
}

function collect(creep, target) {
    if(!creep.pos.isNearTo(target)) {
        return creep.moveTo(target);
    } else {
        return creep.pickup(target);
    } 
}

function take(creep, target) {
    if(!creep.pos.isNearTo(target)) {
        return creep.moveTo(target);
    } else {
        if(target.store[RESOURCE_ENERGY] > creep.carryCapacity - creep.carry.energy) {
            return creep.withdraw(target, RESOURCE_ENERGY, creep.carryCapacity - creep.carry.energy);
        } else {
            return creep.withdraw(target, RESOURCE_ENERGY, target.store[RESOURCE_ENERGY]);
        }
    } 
}





