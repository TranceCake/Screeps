var terminal = {
    /** @param {Terminal} creep **/
    run: function(terminal, boosted) {
        var terminals = _.filter(Game.structures, (s) => s.structureType === STRUCTURE_TERMINAL);
        var avg = _.sum(terminals, t => t.store[RESOURCE_ENERGY]) / terminals.length;
        var lowestTerminal = _.min(terminals, t => t.store[RESOURCE_ENERGY]);
        
        if(lowestTerminal.id !== terminal.id) {
            if(!!terminal.store && terminal.store[RESOURCE_ENERGY] - avg > 10000 && !!lowestTerminal.store) {
                console.log(terminal.room.name + ' (' + terminal.store[RESOURCE_ENERGY] + ') to ' + lowestTerminal.room.name + ' (' + lowestTerminal.store[RESOURCE_ENERGY] + ') avg: ' + Math.round(avg));
                var receiver = lowestTerminal.room;
                var result = terminal.send(RESOURCE_ENERGY, 1000, receiver.name, 'equalize');
            }
        }
        
        // so essentially the thing you'll want to send is x = total_amount/(1+(Math.log(0.1*linearDistanceBetweenRooms + 0.9) + 0.1))
        if(!!boosted && terminal.store[RESOURCE_ENERGY] > 5000) {
            var receiver = boosted.room;
            var result = terminal.send(RESOURCE_ENERGY, 1000, receiver.name, 'boost');
        }
    }
};

module.exports = terminal;