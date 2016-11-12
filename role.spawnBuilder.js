var roleSpawnBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var marker = Game.flags['Spawn'];
        var result;
        
        if(creep.hits < creep.hitsMax)
            creep.heal(creep);
        
        if(marker !== undefined) {
            if(marker.room !== undefined && marker.room.name === creep.room.name) {
                result = this.work(creep);
            } else {
                result = creep.moveTo(marker);
            }
        } else {
            result = this.work(creep);
        }
        creep.memory.result = result;
    },
    
    work: function(creep) {
        // used all energy, stop working
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
    
        // energy at full capacity, release spot and start working
        else if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }
        
        if(creep.memory.working) {
            var site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            
            if(!!site) {
                if(creep.build(site) === ERR_NOT_IN_RANGE) {
                    result = creep.moveTo(site);
                } else {
                    result = creep.build(site);
                }
            } else {
                var containers = _.filter(creep.room.find(FIND_STRUCTURES), s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < s.store.capacity);
                var container = creep.pos.findClosestByPath(containers);
                if(!!container) {
                    if(creep.transfer(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        result = creep.moveTo(container);
                    } else {
                        result = creep.transfer(container, RESOURCE_ENERGY);
                    }
                }
            }
        } else {
            var source = creep.pos.findClosestByPath(_.filter(creep.room.find(FIND_SOURCES), s => s.energy > 0));
            
            if(!creep.pos.isNearTo(source)) {
                result = creep.moveTo(source);
            } else {
                result = creep.harvest(source);
            }
        }
        return result;
    }
};

module.exports = roleSpawnBuilder;