var roleTank = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var result;
        var marker = Game.flags['Tank'];
        var hold = Game.flags['Tank-Hold'];
        
        if(hold === undefined) {
            
            if(marker !== undefined) {
                if(!creep.pos.isNearTo(marker)) {
                    result = creep.moveTo(marker);
                }
            }
        } else {
            if(!creep.pos.isNearTo(hold)) {
                result = creep.moveTo(hold);
            }
        }
        creep.memory.result = result;
    }
};

module.exports = roleTank;