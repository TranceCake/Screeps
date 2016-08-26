var roleMiner = require('role.miner');
var roleCollector = require('role.collector');
var roleDefender = require('role.defender');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

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
        var minCollectors = sourceIds.length;
        
        if(links.length < 2)
            minCollectors += Math.floor(extensions.length / 5);

        if(_.sum(_.filter(spawn.room.find(FIND_STRUCTURES), s => s.structureType === STRUCTURE_CONTAINER), c => c.store[RESOURCE_ENERGY]) > 1000)
            minCollectors += 1;
        
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
        var minUpgraders = 3;
        
        var linkFillers =  _.filter(creepsInRoom, creep => creep.memory.role === 'linkFiller');
        if(links.length > 1 && spawn.room.storage !== undefined) {
            var minLinkFillers = 1;
        } else {
            var minLinkFillers = 0;
        }
        
        var builders = _.filter(creepsInRoom, creep => creep.memory.role === 'builder');
        if(spawn.room.find(FIND_CONSTRUCTION_SITES).length > 10) {
            var minBuilders = 2;
        } else if(spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            var minBuilders = 1;
        } else {
            var minBuilders = 0;
        }
        
        var defenders = _.filter(creepsInRoom, creep => creep.memory.role === 'defender');
        // if there are hostile creeps in the room try outmatching their numbers by spawning more defenders
        if(spawn.room.find(FIND_HOSTILE_CREEPS).length > 0) {
            var minDefenders = 0;//var minDefenders = spawn.room.find(FIND_HOSTILE_CREEPS).length + 1;
        } else {
            var minDefenders = 0;
        }
        
        var attackers = _.filter(Game.creeps, creep => creep.memory.role === 'attacker');
        if(Game.flags['Attack'] !== undefined) {
            var minAttackers = 2;
        } else {
            var minAttackers = 0;
        }
        
        var claimers = _.filter(Game.creeps, creep => creep.memory.role === 'claimer');
        if(Game.flags['Claim'] !== undefined) {
            var minClaimers = 1;
        } else {
            var minClaimers = 0;
        }
        
        var spawnBuilders = _.filter(Game.creeps, creep => creep.memory.role === 'spawnBuilder');
        if(Game.flags['Spawn'] !== undefined) {
            var minSpawnBuilders = 2;
        } else {
            var minSpawnBuilders = 0;
        }
        
        var drainers = _.filter(Game.creeps, creep => creep.memory.role === 'drainer');
        if(Game.flags['Drain'] !== undefined) {
            var minDrainers = 4;
        } else {
            var minDrainers = 0;
        }
        
        // calculating max energy capacity and current reserves
        var capacity = spawn.room.energyCapacityAvailable;
        var available = spawn.room.energyAvailable;
        var result;
        
        if(miners.length == 0) {
            result = this.spawnCreep(spawn, roleMiner.getBody(available), 'miner', { sourceId: emptySources[0] });
        } else if(collectors.length == 0 && miners.length == 1) {
            result = this.spawnCreep(spawn, roleCollector.getBody(available), 'collector', { working: false });
        } else {
            if(defenders.length < minDefenders) {
                result = this.spawnCreep(spawn, roleDefender.getBody(available), 'defender');
            } else if(emptySources.length > 0) {
                result = this.spawnCreep(spawn, roleMiner.getBody(available), 'miner', { sourceId: emptySources[0] });
            } else if(collectors.length < minCollectors) {
                result = this.spawnCreep(spawn, roleCollector.getBody(available), 'collector', { working: false });
            } else if(upgraders.length < minUpgraders) {
                result = this.spawnCreep(spawn, roleUpgrader.getBody(available), 'upgrader', { flag: spawn.room.name + '-Upgrade' });
            } else if(linkFillers.length < minLinkFillers) {
                result = this.spawnCreep(spawn, [CARRY, CARRY, MOVE], 'linkFiller');
            } else if(builders.length < minBuilders) {
                result = this.spawnCreep(spawn, roleBuilder.getBody(available), 'builder', { idle: false });
            } else if(attackers.length < minAttackers) {
                result = this.spawnCreep(spawn, [TOUGH, MOVE, TOUGH, MOVE, TOUGH, MOVE, TOUGH, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, ATTACK, MOVE], 'attacker');
            } else if(claimers.length < minClaimers) {
                result = this.spawnCreep(spawn, [TOUGH, MOVE, TOUGH, MOVE, CLAIM, MOVE], 'claimer');
            } else if(spawnBuilders.length < minSpawnBuilders) {
                result = this.spawnCreep(spawn, [WORK, MOVE, WORK, MOVE, WORK, MOVE, WORK, MOVE, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'spawnBuilder', { working: false });
            } else if(drainers.length < minDrainers) {
                result = this.spawnCreep(spawn, [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE], 'drainer');//result = this.spawnCreep(spawn, [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL], 'drainer');
            }else {
                result = 'nothing to spawn..';
            }
        }
        
        return result;
	},
	
	spawnCreep: function(spawn, body, role, mem = {}) {
	    var result = spawn.createCreep(body, undefined, _.assign(mem, { role: role }));
	    
	    if(_.isString(result)) {
            console.log(spawn.name + ' in ' + spawn.room.name + ' spawned new ' + role + ', ' + result + ' [' + body + ']');
            return result;
        } else {
            //console.log(spawn.name + ' in ' + spawn.room.name + ' failed to spawn new ' + role + ', err: ' + result);
            return null;
        }
	}
};

module.exports = spawnManager;