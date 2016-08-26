var tower = {
    run: function(tower) {
        var hostileAttackCreeps = tower.room.find(FIND_HOSTILE_CREEPS, { 
            filter: (c) => (c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0)
        });
        var targets = this.getTargets(hostileAttackCreeps, tower , 4);
        
        if(targets.length > 0) {
            var target = tower.pos.findClosestByRange(hostileAttackCreeps);
            tower.attack(target);
        } else {
            var hostileCreeps = tower.room.find(FIND_HOSTILE_CREEPS);
            var targets = this.getTargets(hostileCreeps, tower, 4);
            
            if(targets.length > 0) {
                var target = tower.pos.findClosestByRange(hostileCreeps);
                tower.attack(target);
            } else {
                var damagedAttackCreeps = tower.room.find(FIND_MY_CREEPS, {
                    filter: (c) => c.hits < c.hitsMax && (c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0)
                });
                
                if(damagedAttackCreeps.length > 0) {
                    var target = damagedAttackCreeps[0];
                    
                    for(let c of damagedAttackCreeps) {
                        if((c.hits / c.hitsMax) < (target.hits / target.hitsMax)) {
                            target = c;
                        }
                    }
                    tower.heal(target);
                } else {
                    var damagedCreeps = tower.room.find(FIND_MY_CREEPS, {
                        filter: (c) => c.hits < c.hitsMax
                    });
                    
                    if(damagedCreeps.length > 0) {
                        var target = damagedCreeps[0];
                        
                        for(let c of damagedCreeps) {
                            if((c.hits / c.hitsMax) < (target.hits / target.hitsMax)) {
                                target = c;
                            }
                        }
                        tower.heal(target);
                    } else {
                        var rampart = tower.room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_RAMPART })[0];
                        var maxHits;
                        
                        if(rampart == undefined) {
                            maxHits = 300000;
                        } else {
                            maxHits = rampart.hitsMax;
                        }
                        
                        if(maxHits > tower.room.controller.level * 300000)
                            maxHits = tower.room.controller.level * 300000;
                        
                        var damagedStructures = tower.room.find(FIND_STRUCTURES, {
                            filter: (s) => (s.structureType === STRUCTURE_RAMPART && s.hits < maxHits) 
                            || (s.hits / s.hitsMax < 0.33 && !(s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART)) 
                            || (s.structureType === STRUCTURE_WALL && s.hits < maxHits && s.hitsMax > 1)
                        });
                        
                        if(damagedStructures.length > 0 && tower.energy > (tower.energyCapacity * 0.66)) {
                            var target = damagedStructures[0];
                            
                            for(let s of damagedStructures) {
                                if((s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) && (target.structureType === STRUCTURE_WALL || target.structureType === STRUCTURE_RAMPART)) {
                                    if(wallPercentage(s, maxHits) < wallPercentage(target, maxHits)) {
                                        target = s;
                                    }
                                } else if((s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) && !(target.structureType === STRUCTURE_WALL || target.structureType === STRUCTURE_RAMPART)) {
                                    if(wallPercentage(s, maxHits) < target.hits / target.hitsMax) {
                                        target = s;
                                    }
                                } else if(!(s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) && (target.structureType === STRUCTURE_WALL || target.structureType === STRUCTURE_RAMPART)) {
                                    if(s.hits / s.hitsMax < wallPercentage(target, maxHits)) {
                                        target = s;
                                    }
                                } else {
                                    if(s.hits / s.hitsMax < target.hits / target.hitsMax) {
                                        target = s;
                                    }
                                }
                            }
                            
                            tower.repair(target);
                        }
                    }
                }
            }
        }
    },
    
    getTargets: function(hCreeps, tower, rng = 4) {
        var targets = [];
        
        for(let h of hCreeps) {
            var x = h.pos.x;
            x - rng < 0 ? 0 : x + rng > 49 ? 49 : x;
            var y = h.pos.y;
            y - rng < 0 ? 0 : y + rng > 49 ? 49 : y;
            
            var allCreeps = tower.room.lookForAtArea(LOOK_CREEPS, (y - rng), (x - rng), (y + rng), (x + rng), true);
            var myCreeps = _.filter(allCreeps, c => c.creep.my);
            if(myCreeps.length > 0) {
                targets.push(h);
            } else {
                var allStructures = tower.room.lookForAtArea(LOOK_STRUCTURES, (y - rng), (x - rng), (y + rng), (x + rng), true);
                var defendedStructures = _.filter(allStructures, s => s.structure.structureType !== STRUCTURE_ROAD);
                if(defendedStructures.length > 0) {
                    targets.push(h);
                }
            }
        }
        return targets;
    }
};

module.exports = tower;

function wallPercentage(structure, max) {
    return structure.hits / (structure.hitsMax - (structure.hitsMax - max));
}