roleDefender = {
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
                }
                
                var closestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
                if(creep.pos.isNearTo(closestSpawn)) {
                    var desiredPos = new RoomPosition(creep.pos.x, creep.pos.y - 1, creep.room.name);
    	            var blocked = desiredPos.lookFor(LOOK_CREEPS);
    	            if(blocked.length > 0) {
    	                creep.move(8);
    	            } else {
    	                creep.move(1);
    	            }
    	        }
            }
        }
        creep.memory.result = result;
    }
};

module.exports = roleDefender;

function defend(creep, hostile) {
    if(creep.attack(hostile) === ERR_NOT_IN_RANGE) {
        return creep.move(creep.room.getDirectionTo(hostile));
    } else {
        return creep.attack(hostile);
    }
}

// kiting notes:
//- if hostile creep isNear() look around 9x9 area for a free spot that has no enemies near it and walk there then shoot
