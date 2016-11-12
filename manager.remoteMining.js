var remoteMiningManager = {
    run: function(number) {
        
        var peaceKeepers = _.filter(Game.creeps, c => c.memory.role === 'peaceKeeper' && c.memory.remote === number);
        if(!peaceKeepers[0] || peaceKeepers.length < 2 || _.min(peaceKeepers, p => p.ticksToLive) < 300 && peaceKeepers.length === 2) {
            // add peaceKeeper to spawn queue
            return 'keeper';
        }
        
        var miners = _.filter(Game.creeps, c => c.memory.role === 'remoteMiner' && c.memory.remote === number);
        if(miners.length < 3) {
            // add remoteMiner to spawn queue
            return 'miner';
        }
        
        var collectors = _.filter(Game.creeps, c => c.memory.role === 'remoteCollector' && c.memory.remote === number);
        if(number === 1 && collectors.length < 6) {
            // add remoteCollector to spawn queue
            return 'collector';
        } else if(number === 2 && collectors.length < 7) {
            // add remoteCollector to spawn queue
            return 'collector';
        } else if(number === 3 && collectors.length < 7) {
            // add remoteCollector to spawn queue
            return 'collector';
        }
        
        return 'nothing';
    }
};

module.exports = remoteMiningManager;