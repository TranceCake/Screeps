var roleDefender = {
    run: function(creep) {
        var result;
        
        var hostileAttackCreeps = creep.room.find(FIND_HOSTILE_CREEPS, { 
            filter: (c) => c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0
        });
        
        //console.log('hAttackCreeps');
        
        if(hostileAttackCreeps.length > 0) {
            var target = creep.pos.findClosestByPath(hostileAttackCreeps);
            result = defend(creep, target);
        } else {
            var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
            
            //console.log('hCreeps');
            
            if(hostileCreeps.length > 0) {
                var target = creep.pos.findClosestByPath(hostileCreeps);
                
                result = defend(creep, target);
            } else {
                var hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
                var hostileConstructionSites = creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES);
                
                if(hostileConstructionSites.length > 0) {
                    for(h of hostileConstructionSites) {
                        hostileStructures.push(h);
                    }
                }
                
                //console.log('hStructures');
                
                if(hostileStructures.length > 0) {
                    var target = creep.pos.findClosestByPath(hostileStructures);
                    result = defend(creep, target);
                } else {
                    var flags = _.filter(Game.flags, f => f.room !== undefined && f.room.name === creep.room.name);
                    var flagName = creep.room.name + '-Idle';
                    
                    if(flags.length > 0) {
                        var flag = _.filter(flags, f => f.name === flagName)[0];
                        
                        if(!creep.pos.isNearTo(flag)) {
                            result = creep.moveTo(flag);
                        }
                    }
                }
            }
        }
        creep.memory.result = result;
    },
    
    getBody: function (energy) {
        if (energy < BODYPART_COST[MOVE] + BODYPART_COST[ATTACK]) {
            return null;
        }

        var attack = [], move = [];
        var cost = BODYPART_COST[MOVE] + BODYPART_COST[ATTACK];

        while (energy >= cost) {
            if (attack.length < 5) {
                energy = this.addPart(energy, move, MOVE);
                energy = this.addPart(energy, attack, ATTACK);
            } else {
                break;
            }
        }

        return move.concat(attack);
    },
    
    addPart: function (energy, parts, part) {
        parts.push(part);
        return energy - BODYPART_COST[part];
    }
};

module.exports = roleDefender;

function defend(creep, hostile) {
    if(creep.attack(hostile) === ERR_NOT_IN_RANGE) {
        return creep.moveTo(hostile);
        //return creep.move(creep.room.getDirectionTo(hostile));
    } else {
        return creep.attack(hostile);
    }
}

// kiting notes:
//- if hostile creep isNear() look around 9x9 area for a free spot that has no enemies near it and walk there then shoot
