var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleDefender = require('role.defender');

module.exports.loop = function () {
    
    for(var name in Memory.creeps) {
        if(Game.creeps[name] == undefined)
            delete Memory.creeps[name];
    }

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
            if(creep.memory.role == 'defender') {
                roleDefender.run(creep);
            }
        }
    }
    
    // Auto spawning
    var minHarvesters = 4;
    var numHarvesters = getTotalRolePoints('harvester');
    
    var minUpgraders = 1;
    var numUpgraders = getTotalRolePoints('upgrader');
    
    var minBuilders = 1;
    var numBuilders = getTotalRolePoints('builder');
    
    var minDefenders = 1;
    var numDefenders = getTotalRolePoints('defender');
    
    var energyStructures = _.filter(Game.structures, (s) => s.energyCapacity > 0);
    var capacity = _.sum(energyStructures, (s) => s.energyCapacity);
    
    getTotalRolePoints('builder');
    
    if(numHarvesters < minHarvesters) {
        spawn('harvester', capacity);
    } else if(numUpgraders < minUpgraders) {
        spawn('upgrader', capacity);
    } else if(numBuilders < minBuilders) {
        spawn('builder', capacity);
    } else if(numDefenders < minDefenders) {
        spawn('defender', capacity);
    } else if(numBuilders < 4) {
        spawn('builder', capacity);
    }
}

// spawn custom creep
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
    }
    
    var name = Game.spawns.Spawn1.createCreep(parts, undefined, {role: role, working: false, hasSpot: false});
        
    if(!(name < 0)) {
        console.log('// spawned new ' + tier + ' ' + role + ': ' + name);
        console.log('| # Harvesters: ' + roleFilter('harvester').length);
        console.log('| # Upgraders: ' + roleFilter('upgrader').length);
        console.log('| # Builders: ' + roleFilter('builder').length);
        console.log('| # Defenders: ' + roleFilter('defender').length);
        console.log('| # Creeps total: ' + (roleFilter('harvester').length + roleFilter('upgrader').length + roleFilter('builder').length + roleFilter('defender').length));
    }   
}

// filter by role
function roleFilter(role) {
    return _.filter(Game.creeps, (c) => c.memory.role == role);
}

function getTotalRolePoints(role) {
    var basic = _.sum(roleFilter(role), (c) => c.body.length <= 4);
    var advanced = _.sum(roleFilter(role), (c) => c.body.length > 4) * 1.5;
    return basic + advanced;
}
