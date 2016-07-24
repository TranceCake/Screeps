var scheduler = {
    request: function(creep) {
        if(Memory.spots > 0) {
            Memory.spots--;
            creep.memory.hasSpot = true;
            return true;
        }
        return false;
    },
    
    release: function(creep) {
        creep.memory.hasSpot = false;
        Memory.spots++;
    }
};

module.exports = scheduler;