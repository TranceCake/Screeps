var remoteMiningManager = {
    run: function(room, number) {
        
        var peaceKeepers = _.filter(Game.creeps, c => c.memory.role === 'peaceKeeper' && c.memory.flag === 'Remote-' + number);
        if(!peaceKeepers[0] || peaceKeepers[0].ticksToLive < 250 && peaceKeepers.length === 1) {
            // add peaceKeeper to spawn queue
            return 'keeper';
        }
        
        var miners = _.filter(Game.creeps, c => c.memory.role === 'remoteMiner' && c.memory.remote === number);
        if(miners.length < 3) {
            // add remoteMiner to spawn queue
            return 'miner';
        }
        
        var collectors = _.filter(Game.creeps, c => c.memory.role === 'remoteCollector' && c.memory.remote === number);
        if(collectors.length < 8) {
            // add remoteCollector to spawn queue
            return 'collector';
        }
    }
};

module.exports = remoteMiningManager;