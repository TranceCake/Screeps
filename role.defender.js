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