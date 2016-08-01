var roleClaimer = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var marker = Game.flags['Spawn'];
        var result;
        
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
            
            if(creep.build(site) === ERR_NOT_IN_RANGE) {
                result = creep.moveTo(site);
            } else {
                result = creep.build(site);
            }
        } else {
            var source = creep.pos.findClosestByPath(creep.room.find(FIND_SOURCES));
            
            if(!creep.pos.isNearTo(source)) {
                result = creep.moveTo(source);
            } else {
                result = creep.harvest(source);
            }
        }
        return result;
    }
};

module.exports = roleClaimer;