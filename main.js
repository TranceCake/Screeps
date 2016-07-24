var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleRepairer = require('role.repairer');
var roleDefender = require('role.defender');
var tower = require('tower');

module.exports.loop = function () {
    
    // garbage collection
    for(var name in Memory.creeps) {
        if(Game.creeps[name] == undefined)
            delete Memory.creeps[name];
    }

    // executing jobs for all creeps
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(!creep.spawning) {
            if(creep.memory.role == 'harvester') {
                roleHarvester.run(creep);
            }
            if(creep.memory.role == 'builder') {
                roleBuilder.run(creep);
            }
            if(creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep);
            }
            if(creep.memory.role == 'repairer') {
                roleRepairer.run(creep);
            }
            if(creep.memory.role == 'defender') {
                roleDefender.run(creep);
            }
        }
    }
    
    // executing jobs for all towers
    var towers = _.filter(Game.structures, (s) => s.structureType === STRUCTURE_TOWER);
    if(towers.length > 0) {
        for(t of towers) {
            tower.run(t);
        }
    }
    
    //==== Auto spawning section ====\\
    
    // determining the number and type op creeps needed
    var minHarvesters = 4;
    var numHarvesters = getTotalRolePoints('harvester');
    
    var minUpgraders = 2;
    var numUpgraders = getTotalRolePoints('upgrader');
    
    var minBuilders = 3;
    var numBuilders = getTotalRolePoints('builder');
    
    // the tower also repairs a bit so less repairers needed
    if(towers.length > 0) {
        var minRepairers = 1;
    } else {
        var minRepairers = 2;
    }
    var numRepairers = getTotalRolePoints('repairer');
    
    // if there are hostile creeps in the room try outmatching their numbers by spaning more defenders
    if(Game.spawns.Spawn1.room.find(FIND_HOSTILE_CREEPS).length > 0) {
        var minDefenders = Game.spawns.Spawn1.room.find(FIND_HOSTILE_CREEPS).length + 2;
    } else {
        var minDefenders = 2;
    }
    var numDefenders = getTotalRolePoints('defender');
    
    // calculating max energy capacity and current reserves
    var capacity = Game.spawns.Spawn1.room.energyCapacityAvailable;
    var available = Game.spawns.Spawn1.room.energyAvailable;
    
    // determining which type of creep to spawn next, based on resources and need
    if(numHarvesters < minHarvesters) {
        if(numHarvesters == 0 && available < capacity) {
            spawn('harvester', available);
        } else {
            spawn('harvester', capacity);
        }
    } else if(numDefenders < minDefenders) {
        spawn('defender', capacity);
    } else if(numUpgraders < minUpgraders) {
        spawn('upgrader', capacity);
    } else if(numBuilders < minBuilders) {
        spawn('builder', capacity);
    } else if(numRepairers < minRepairers) {
        spawn('repairer', capacity);
    } 
}

// spawn a custom creep, based on the max capacity of the room at the time
function spawn(role, capacity) {
    var parts;
    var tier;
    
    if(capacity < 550) {
        tier = 'basic';
        
        if(role === 'defender') {
            parts = [RANGED_ATTACK, MOVE, MOVE];
        } else {
            parts = [WORK, WORK, CARRY, MOVE];
        }
    } else if(capacity < 800) {
        tier = 'advanced';
        
        if(role === 'defender') {
            parts = [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE];
        } else {
            parts = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
        }
    } else if(capacity < 1300) {
        tier = 'elite';
        
        if(role === 'defender') {
            parts = [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE];
        } else {
            parts = [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
        }
    }
    
    var name = Game.spawns.Spawn1.createCreep(parts, undefined, {role: role, working: false, tier: tier, result: 0});
        
    if(!(name < 0)) {
        console.log('// spawned new ' + tier + ' ' + role + ': ' + name);
        console.log('| # Harvesters: ' + roleFilter('harvester').length);
        console.log('| # Defenders: ' + roleFilter('defender').length);
        console.log('| # Upgraders: ' + roleFilter('upgrader').length);
        console.log('| # Builders: ' + roleFilter('builder').length);
        console.log('| # Repairers: ' + roleFilter('repairer').length);
        console.log('| # Creeps total: ' + (roleFilter('harvester').length + roleFilter('upgrader').length + roleFilter('builder').length + roleFilter('defender').length + roleFilter('repairer').length));
    }   
}

// filter by role
function roleFilter(role) {
    return _.filter(Game.creeps, (c) => c.memory.role == role);
}

// determines the number of points per role, based on creep size (tier)
function getTotalRolePoints(role) {
    var basic = _.sum(roleFilter(role), (c) => c.body.length <= 4);
    var advanced = _.sum(roleFilter(role), (c) => c.body.length > 4) * 1.5;
    return basic + advanced;
}

// function that get the number of free spots adjacent to all sources of the room. for future routing/queueing systems
function findMiningSites(roomToSearch) {
    var sources = roomToSearch.find(FIND_SOURCES);
    var sites = [];
    
    for(i = 0; i < sources.length; i++) {
        var x = sources[i].pos.x;
        var y = sources[i].pos.y;
        
        var adjacent = roomToSearch.lookForAtArea(LOOK_TERRAIN, (y - 1), (x - 1), (y + 1), (x + 1), true);
        var siteArray = _.filter(adjacent, (s) => s.terrain === 'plain' || s.terrain === 'swamp');
        
        for(j = 0; j < siteArray.length; j++) {
            sites.push(new RoomPosition(siteArray[j].x, siteArray[j].y, roomToSearch.name));
        }
    }
    Memory.sites = sites;
}






