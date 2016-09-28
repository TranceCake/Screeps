var remoteMiningManager = {
    run: function(room) {
        var localCreeps = room.find(FIND_MY_CREEPS);
        var miners = _.filter(localCreeps, c => c.memory.role === 'remoteMiner');
        if(miners.length < room.memory.sources.length) {
            // add remoteMiner to spawn queue;
        }
        
        var peaceKeeper = _.filter(localCreeps, c => c.memory.role === 'peaceKeeper');
        if(peacekeeper.ticksToLive < 220) {
            // add peaceKeeper to spawn queue
        }
    }
};

module.exports = remoteMiningManager;