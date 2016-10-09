var peaceKeeper = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var marker = Game.flags[creep.memory.flag];
        var result;
        
        if(marker !== undefined) {
            if(marker.room !== undefined && marker.room.name === creep.room.name) {
                var keepers = _.filter(creep.room.find(FIND_HOSTILE_CREEPS), c => !c.pos.inRangeTo(creep.room.find(FIND_MINERALS)[0],8));
                
                if(keepers.length > 0) {
                    var keeper = creep.pos.findClosestByRange(keepers);
                    result = this.attack(creep, keeper);
                } else {
                    var lairs = _.filter(creep.room.find(FIND_HOSTILE_STRUCTURES), s => !s.pos.inRangeTo(creep.room.find(FIND_MINERALS)[0],8));
                    var target = _.min(lairs, l => l.ticksToSpawn);
                    
                    if(!creep.pos.isNearTo(target))
                        result = creep.moveTo(target);
                    
                }
            } else {
                result = creep.moveTo(marker);
            }
        }
        if(creep.hits < creep.hitsMax)
            creep.heal(creep);
        creep.memory.result = result;
    },
    
    attack: function(creep, target) {
        var result = creep.attack(target);
        if(result === ERR_NOT_IN_RANGE) {
            result = creep.moveTo(target);
            creep.attack(target);
        }
        return result;
    }
};

module.exports = peaceKeeper;