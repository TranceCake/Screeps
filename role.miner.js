var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var result;
        var source = Game.getObjectById(creep.memory.sourceId);
        if(!creep.pos.isNearTo(source)) {
            var sourceContainer = _.filter(source.room.find(FIND_STRUCTURES), s => s.structureType === STRUCTURE_CONTAINER && s.pos.isNearTo(source))[0];
        
            if(!!sourceContainer && !creep.pos.isEqualTo(sourceContainer)) {
                result = creep.moveTo(sourceContainer);
            } else {
                result = creep.moveTo(source);
            }
        } else {
            result = creep.harvest(source);
        }   
        
        creep.memory.result = result;
    },
    
    getBody: function (energy) {
        if (energy < BODYPART_COST[MOVE] + BODYPART_COST[WORK]) {
            return null;
        }

        var work = [], move = [];
        var cheapestPart = _.min([BODYPART_COST[MOVE], BODYPART_COST[WORK]]);
        var moveParts = 1;

        while (energy >= cheapestPart) {
            if (move.length < moveParts) {
                energy = this.addPart(energy, move, MOVE);
            } else if (energy >= BODYPART_COST[WORK] && work.length < 5) {
                // 5 WORK parts is enough to deplete an energy source
                energy = this.addPart(energy, work, WORK);
                moveParts = Math.floor(work.length / 3);
            } else {
                break;
            }
        }
        return work.concat(move);
    },
    
    addPart: function (energy, parts, part) {
        parts.push(part);
        return energy - BODYPART_COST[part];
    }
};

module.exports = roleMiner;





