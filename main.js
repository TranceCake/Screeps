var roleMiner = require('role.miner');
var roleCollector = require('role.collector');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var spawnManager = require('manager.spawn');
var roleDefender = require('role.defender');
var tower = require('tower');
var link = require('link');
var roleLinkFiller = require('role.linkFiller');
var roleAttacker = require('role.attacker');

module.exports.loop = function () {
    
    _.forEach(Game.rooms, room => {
        if(_.isUndefined(room.memory.sources)) {
            room.memory.sources = {};
            
            var sources = room.find(FIND_SOURCES);
        
            for(let source of sources) {
                Object.assign(room.memory.sources, { [source.id]: {} } );
            }
            
            var spawn = _.filter(Game.spawns, spawn => spawn.room.name === room.name);
            _.forEach(room.memory.sources, function(source, id) {
                if(_.isUndefined(source.range) && spawn.length > 0) {
                    _.set(room.memory.sources[id], 'range', spawn[0].pos.findPathTo(Game.getObjectById(id)).length);
                }
            });
        }
        
    });
    
    // garbage collection
    for(var name in Memory.creeps) {
        if(Game.creeps[name] == undefined)
            delete Memory.creeps[name];
    }

    // executing jobs for all creeps
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(!creep.spawning) {
            if(creep.memory.role == 'miner') {
                roleMiner.run(creep);
            }
            if(creep.memory.role == 'collector') {
                roleCollector.run(creep);
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
            if(creep.memory.role == 'linkFiller') {
                roleLinkFiller.run(creep);
            }
            if(creep.memory.role == 'attacker') {
                roleAttacker.run(creep);
            }
        }
    }
    
    // executing jobs for all towers
    var towers = _.filter(Game.structures, (s) => s.structureType === STRUCTURE_TOWER);
    if(towers.length > 0) {
        for(let t of towers) {
            tower.run(t);
        }
    }
    
    // executing jobs for all towers
    var links = _.filter(Game.structures, (s) => s.structureType === STRUCTURE_LINK);
    if(towers.length > 0) {
        for(let l of links) {
            link.run(l);
        }
    }
    // determining the number and type of creeps needed
    
    _.forEach(Game.spawns, spawn => {
        spawn.memory.result = spawnManager.run(spawn);
    });
}





