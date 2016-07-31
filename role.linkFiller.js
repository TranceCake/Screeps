var roleLinkFiller = {
    run: function(creep) {
        var result;
        var storage = creep.room.storage;
        var link = _.filter(creep.room.find(FIND_MY_STRUCTURES), s => s.structureType === STRUCTURE_LINK && s.pos.isNearTo(storage));
        
        if(link.length > 0) {
            if(!creep.pos.isNearTo(storage)) {
                result = creep.moveTo(storage);
            } else if(!creep.pos.isNearTo(link[0])) {
                result = creep.moveTo(link[0]);
            } else {
                var amount = link[0].energyCapacity - link[0].energy;
                if(amount > 50)
                    amount = 50;

                if(creep.carry.energy == 0 && storage.store[RESOURCE_ENERGY] > 0) {
                    result = creep.withdraw(storage, RESOURCE_ENERGY);
                } else {
                    result = creep.transfer(link[0], RESOURCE_ENERGY);
                    //console.log(result)
                }

            }
        } else {
            result = -10;
        }
        creep.memory.result = result;
    }
};

module.exports = roleLinkFiller;