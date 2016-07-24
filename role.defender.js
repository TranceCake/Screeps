roleDefender = {
    run: function(creep) {
        var result;
        
        hostile = creep.room.find(FIND_HOSTILE_CREEPS)[0];
        if(creep.attack(hostile) === ERR_NOT_IN_RANGE) {
            result = creep.moveTo(creep.room.getDirectionTo(hostile));
        } else {
            result = creep.attack(hostile);
        }
        creep.memory.result = result;
    }
};

module.exports = roleDefender;

// kiting notes:
//- if hostile creep isNear() look around 9x9 area for a free spot that has no enemies near it and walk there then shoot
