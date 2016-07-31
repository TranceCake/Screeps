var roleMiner = require('role.miner');
var roleCollector = require('role.collector');
var roleDefender = require('role.defender');
var roleUpgrader = require('role.upgrader');

var spawnManager = {

    /** @param {Spawn} spawn **/
    run: function(spawn) {
        if(_.isObject(spawn.spawning)) {
            return;
        }
        
        var memSources = spawn.room.memory.sources;
        var sourceIds = Object.keys(memSources);
        var links = _.filter(spawn.room.find(FIND_MY_STRUCTURES), s => s.structureType === STRUCTURE_LINK);
        
        var creepsInRoom = _.filter(Game.creeps, creep => creep.room.name === spawn.room.name);
        
        var miners = _.filter(creepsInRoom, creep => creep.memory.role === 'miner');
        var miningCreeps = _.filter(miners, miner => miner.memory.sourceId !== undefined);
        
        var collectors = _.filter(creepsInRoom, creep => creep.memory.role === 'collector');
        var extensions = _.filter(spawn.room.find(FIND_MY_STRUCTURES), s => s.structureType === STRUCTURE_EXTENSION);
        var minCollectors = sourceIds.length + Math.floor(extensions.length / 5);
        if(minCollectors > 6) {
            minCollectors = 6;
        } 
        
        if(links.length > 1){
            minCollectors = 4;
        }
        
        var emptySources = [];
        
        if(miningCreeps.length > 0) {
            for(let creep of miningCreeps) {
                var i = sourceIds.indexOf(creep.memory.sourceId);
                if(i != -1) {
                    sourceIds.splice(i, 1);
                }
            }
            emptySources = sourceIds;
        } else {
            emptySources = sourceIds;
        }
        
        var upgraders = _.filter(creepsInRoom, creep => creep.memory.role === 'upgrader');
        var minUpgraders = (spawn.room.find(FIND_SOURCES).length * 2) + Math.floor(extensions.length / 5);
        if(extensions.length > 10) {
            minUpgraders = 4;
        }
        
        var linkFillers =  _.filter(creepsInRoom, creep => creep.memory.role === 'linkFiller');
        if(links.length > 1 && spawn.room.storage !== undefined) {
            var minLinkFillers = 1;
        } else {
            var minLinkFillers = 0;
        }
        
        var builders = _.filter(creepsInRoom, creep => creep.memory.role === 'builder');
        if(spawn.room.find(FIND_CONSTRUCTION_SITES).length > 10) {
            var minBuilders = 4;
        } else if(spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            var minBuilders = 2;
        } else {
            var minBuilders = 0;
        }
        
        var defenders = _.filter(creepsInRoom, creep => creep.memory.role === 'defender');
        // if there are hostile creeps in the room try outmatching their numbers by spawning more defenders
        if(spawn.room.find(FIND_HOSTILE_CREEPS).length > 0) {
            var minDefenders = spawn.room.find(FIND_HOSTILE_CREEPS).length + 3;
        } else {
            var minDefenders = 3;
        }
        
        var attackers = _.filter(Game.creeps, creep => creep.memory.role === 'attacker');
        if(Game.flags['Attack'] !== undefined) {
            var minAttackers = 3;
        } else {
            var minAttackers = 0;
        }
        
        // calculating max energy capacity and current reserves
        var capacity = spawn.room.energyCapacityAvailable;
        var available = spawn.room.energyAvailable;
        var result;
        
        if(miners.length == 0) {
            result = this.spawnCreep(spawn, roleMiner.getBody(Math.floor(available / 2)), 'miner', { sourceId: emptySources[0] });
        } else if(collectors.length == 0 && miners.length == 1) {
            result = this.spawnCreep(spawn, roleCollector.getBody(Math.floor(available / 2)), 'collector', { working: 'false' });
        } else if(available === capacity) {
            if(defenders.length < minDefenders) {
                result = this.spawnCreep(spawn, roleDefender.getBody(available), 'defender');
            } else if(emptySources.length > 0) {
                result = this.spawnCreep(spawn, roleMiner.getBody(available), 'miner', { sourceId: emptySources[0] });
            } else if(collectors.length < minCollectors) {
                result = this.spawnCreep(spawn, roleCollector.getBody(available), 'collector', { working: 'false' });
            } else if(upgraders.length < minUpgraders) {
                result = this.spawnCreep(spawn, roleUpgrader.getBody(available), 'upgrader');
            } else if(linkFillers.length < minLinkFillers) {
                result = this.spawnCreep(spawn, [WORK, CARRY, MOVE], 'linkFiller');
            } else if(builders.length < minBuilders) {
                result = this.spawnCreep(spawn, [WORK, CARRY, CARRY, MOVE], 'builder');
            } else if(attackers.length < minAttackers) {
                result = this.spawnCreep(spawn, [TOUGH, MOVE, TOUGH, MOVE, TOUGH, MOVE, TOUGH, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, ATTACK, MOVE], 'attacker');
            } else {
                result = 'nothing to spawn..';
            }
        }
        
        return result;
	},
	
	spawnCreep: function(spawn, body, role, mem = {}) {
	    var result = spawn.createCreep(body, undefined, _.assign(mem, { role: role }));
	    
	    if(_.isString(result)) {
            console.log('Spawned new ' + role + ', ' + result + ' [' + body + ']');
            return result;
        } else {
            console.log('Failed to spawn new ' + role + ', err: ' + result);
            return null;
        }
	}
};

module.exports = spawnManager;