var link = {
    run: function(link) {
        var storage = link.room.storage;
        
        if(storage !== undefined && link.cooldown === 0) {
            if(link.pos.isNearTo(storage)) {
                if(link.energy > 100) {
                    var receiver = _.filter(link.room.find(FIND_MY_STRUCTURES), s => s.structureType === STRUCTURE_LINK && s.id !== link.id);
                    var amount = receiver[0].energyCapacity - receiver[0].energy;
                    if(amount > link.energy)
                        amount = link.energy;
                    
                    if(receiver.length > 0 && amount > 0) {
                        link.transferEnergy(receiver[0], amount);
                    }
                }
            }
        }
    }
};

module.exports = link;