var remoteMiner = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var result;
        var marker = Game.flags['Collect'];
        
        if(marker !== undefined) {
            if(!creep.memory.working && creep.carry.energy === 0) {
                if(creep.ticksToLive < 800) {
                    if(!creep.pos.isNearTo(Game.spawns.Spawn8)) { 
                        creep.moveTo(Game.spawns.Spawn8);
                        return;
                    } else {
                        Game.spawns.Spawn8.renewCreep(creep);
                        return;
                    }
                } else {
                    creep.memory.working = true;
                }
            } else if(creep.memory.working && creep.carry.energy === creep.carryCapacity) {
                creep.memory.working = false;
            }
            
            if(creep.memory.working) {
                if(marker.room !== undefined && marker.room.name === creep.room.name) {
                    var energy = _.filter(creep.room.find(FIND_DROPPED_ENERGY), e => e.amount >= creep.carryCapacity/10);
                    
                    if(energy.length > 0) {
                        var target = energy[0];
                        var targetValue = target.amount / creep.pos.findPathTo(target).length;
                        
                        for(let t of energy) {
                            var value = t.amount / creep.pos.findPathTo(t).length;
                            if(value > targetValue) {
                                target = t;
                                targetValue = value;
                            }
                        }
                        
                        result = creep.pickup(target);
                        
                        if(result === ERR_NOT_IN_RANGE) {
                            result = creep.moveTo(target);
                        }
                    } else {
                        var storages = _.filter(creep.room.find(FIND_STRUCTURES), s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0);
                        
                        if(storages.length > 0) {
                            var target = creep.pos.findClosestByRange(storages);
                            if(target.store[RESOURCE_ENERGY] > creep.carryCapacity - creep.carry.energy) {
                                result = creep.withdraw(target, RESOURCE_ENERGY, creep.carryCapacity - creep.carry.energy);
                            } else {
                                result = creep.withdraw(target, RESOURCE_ENERGY, target.store[RESOURCE_ENERGY]);
                            }
                            
                            if(result === ERR_NOT_IN_RANGE) {
                                result = creep.moveTo(target);
                            } else {
                                creep.repair(target);
                            }
                        }
                    }
                } else {
                    result = creep.moveTo(marker);
                }
            } else {
                var home = _.filter(Game.spawns, s => Game.flags['RemoteSpawn-1'] && s.room.name === Game.flags['RemoteSpawn-1'].room.name)[0];
                
                if(home === undefined)
                    home = Game.spawns.Spawn4;
                
                if(creep.room.name === home.room.name) {
                    var storage = creep.room.storage;
                  
                    if(storage !== undefined) {
                        if(creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            result = creep.moveTo(storage);
                        }
                    }
                } else {
                    result = creep.moveTo(home);
                }
            }
        }
        
        var road = _.filter(creep.pos.lookFor(LOOK_STRUCTURES), s => s.structureType === STRUCTURE_ROAD)[0];
        if(!!road)
            creep.repair(road);
        
        creep.memory.result = result;
    }
};

module.exports = remoteMiner;