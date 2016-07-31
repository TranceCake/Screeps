var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var result;
        
        if(creep.carry.energy > 0) {
            var site;
            var sites = creep.room.find(FIND_CONSTRUCTION_SITES);
            var prioritySites = _.filter(sites, (s) => s.structureType === STRUCTURE_RAMPART || s.structureType === STRUCTURE_WALL);
            var topPrioritySites = _.filter(sites, (s) => s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_TOWER);
            
            if(topPrioritySites.length > 0) {
                site = creep.pos.findClosestByPath(topPrioritySites);
                result = work(creep, site);
            } else if(prioritySites.length > 0) {
                site = creep.pos.findClosestByPath(prioritySites);
                result = work(creep, site);
            } else if(sites.length > 0) {
                site = creep.pos.findClosestByPath(sites);
                result = work(creep, site);
            }
        } else {
            result = -6;   
        }
        creep.memory.result = result;
	}
};

module.exports = roleBuilder;

function work(creep, target) {
    if(creep.build(target) === ERR_NOT_IN_RANGE) {
        return creep.moveTo(target);
    } else {
        return creep.build(target);
    }
}







