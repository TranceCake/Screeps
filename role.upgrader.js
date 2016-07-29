var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var result;

        // instructions & harvesting
        if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            result = creep.moveTo(creep.room.controller);
        } else {
            result = creep.upgradeController(creep.room.controller);
        }
        
        creep.memory.result = result;
	}
};

module.exports = roleUpgrader;
