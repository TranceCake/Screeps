var roleAttacker = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var result;
        var marker = Game.flags['Attack'];
        var hold = Game.flags['Hold'];
        
        if(hold === undefined) {
            if(marker !== undefined) {
                if(marker.room !== undefined && marker.room.name === creep.room.name) {
                    var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
                    var hostileAttackCreeps = _.filter(creep.room.find(FIND_HOSTILE_CREEPS), c => c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0);
                    var hostileStructures = _.filter(creep.room.find(FIND_HOSTILE_STRUCTURES), s => s.structureType !== STRUCTURE_CONTROLLER);
                    
                    if(hostileAttackCreeps.length > 0) {
                        if(creep.rangedAttack(hostileAttackCreeps[0]) === ERR_NOT_IN_RANGE || creep.attack(hostileAttackCreeps[0]) === ERR_NOT_IN_RANGE) {
                            result = creep.moveTo(hostileAttackCreeps[0]);
                            if(result === ERR_NO_PATH) {
                                var path = getPath(creep, hostileAttackCreeps[0]);
                                result = creep.moveByPath(path);
                            }
                        } else {
                            var nearbyCreeps = creep.room.lookForAtArea(LOOK_CREEPS, creep.pos.y - 3, creep.pos.x - 3, creep.pos.y + 3, creep.pos.x + 3, true);
                            var nearbyHostiles;
                            
                            for(let creep of nearbyCreeps) {
                                nearbyHostiles.push(creep.creep);
                            }

                            if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                                if(nearbyHostiles.length > 1) {
                                    creep.rangedMassAttack();
                                } else {
                                    result = creep.rangedAttack(hostileAttackCreeps[0]);
                                }
                            } else {
                                result = creep.attack(hostileAttackCreeps[0]);
                            }
                        }
                    } else if(hostileCreeps.length > 0) {
                        if(creep.rangedAttack(hostileCreeps[0]) === ERR_NOT_IN_RANGE) {
                            result = creep.moveTo(hostileCreeps[0]);
                            if(result === ERR_NO_PATH) {
                                var path = creep.room.findPath(creep.pos, hostileCreeps[0].pos, {ignoreDestructibleStructures: true});
                                result = creep.moveByPath(path);
                                console.log('res: ' + result)
                            }
                        } else {
                            result = creep.rangedAttack(hostileCreeps[0]);
                        }
                    } else if(hostileStructures.length > 0) {
                        if(creep.rangedAttack(hostileStructures[0]) === ERR_NOT_IN_RANGE || creep.attack(hostileStructures[0]) === ERR_NOT_IN_RANGE) {
                            result = creep.moveTo(hostileStructures[0]);
                            if(result === ERR_NO_PATH) {
                                var path = getPath(creep, hostileStructures[0]);
                                result = creep.moveByPath(path);
                            }
                        } else {
                            if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                                result = creep.rangedAttack(hostileStructures[0]);
                            } else {
                                result = creep.attack(hostileStructures[0]);
                            }
                        }
                    }
                    
                } else {
                    result = creep.moveTo(marker);
                }
            } else {
                if(!creep.pos.isNearTo(Game.flags['Idle'])) {
                    result = creep.moveTo(Game.flags['Idle']);
                }
            }
        } else {
            if(!creep.pos.isNearTo(hold)) {
                result = creep.moveTo(hold);
            }
        }
        creep.memory.result = result;
    },
    
    getPath: function(creep, hostile) {
        return creep.room.findPath(creep.pos, hostile.pos, {'ignoreDestructibleStructures': true});
    }
};

module.exports = roleAttacker;