var terminal = {
    /** @param {Terminal} creep **/
    run: function(terminal, boosted) {
        // so essentially the thing you'll want to send is x = total_amount/(1+(Math.log(0.1*linearDistanceBetweenRooms + 0.9) + 0.1))
        if(terminal.store[RESOURCE_ENERGY] > 5000) {
            var receiver = boosted.room.name;
            var result = terminal.send(RESOURCE_ENERGY, 1000, receiver, 'boost');
        }
    }
};

module.exports = terminal;