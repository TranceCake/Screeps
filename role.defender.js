roleDefender = {
    run: function(creep) {
        var result;
        
        hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if(creep.attack(hostile) === ERR_NOT_IN_RANGE) {
            result = creep.moveTo(hostile);
        } else {
            result = creep.attack(hostile);
        }
        creep.memory.result = result;
    }
};

module.exports = roleDefender;

// kiting notes:
//- if hostile creep isNear() look around 9x9 area for a free spot that has no enemies near it and walk there then shoot
