var peaceKeeper = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var marker = Game.flags['Remote-' + creep.memory.remote];
        var result;
        
        if(marker !== undefined) {
            if(marker.room !== undefined && marker.room.name === creep.room.name) {
                var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
                var invaders = _.filter(hostiles, c => c.owner.username === 'Invader');
                
                if(invaders.length > 0) {
                    var healers = _.filter(invaders, i => i.getActiveBodyparts(HEAL) > 0);
                    if(healers.length > 0) {
                        var target = creep.pos.findClosestByPath(healers);
                        result = this.attack(creep, target);
                    } else {
                        var target = creep.pos.findClosestByPath(invaders);
                        result = this.attack(creep, target);
                    }
                } else {
                    var keepers = _.filter(hostiles, c => !c.pos.inRangeTo(creep.room.find(FIND_MINERALS)[0],8) && (c.owner.username === 'Source Keeper'));
                    
                    if(keepers.length > 0) {
                        var keeper = creep.pos.findClosestByRange(keepers);
                        result = this.attack(creep, keeper);
                    } else {
                        var lairs = _.filter(creep.room.find(FIND_HOSTILE_STRUCTURES), s => !s.pos.inRangeTo(creep.room.find(FIND_MINERALS)[0],8));
                        var target = _.min(lairs, l => l.ticksToSpawn);
                        
                        if(!creep.pos.isNearTo(target))
                            result = creep.moveTo(target);
                    }
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
        var result = creep.rangedAttack(target);
        if(result === ERR_NOT_IN_RANGE) {
            result = creep.moveTo(target);
        } else if(!creep.pos.inRangeTo(target, 3)) {
            creep.moveTo(target);
        }
        return result;
    }
};

module.exports = peaceKeeper;