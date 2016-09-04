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
        
        //===== INITIAL VARIABLES =====\\
        var memSources = spawn.room.memory.sources;
        var sourceIds = Object.keys(memSources);
        var creepsInRoom = _.filter(Game.creeps, creep => creep.room.name === spawn.room.name);
        var capacity = spawn.room.energyCapacityAvailable;
        var available = spawn.room.energyAvailable;
        
        //===== MINER PREP CODE
        var miners = _.filter(creepsInRoom, creep => creep.memory.role === 'miner');
        var miningCreeps = _.filter(miners, miner => miner.memory.sourceId !== undefined);
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
        
        //===== STARTUP/RECOVERY MINER
        if(miners.length === 0)
            return this.spawnCreep(spawn, roleMiner.getBody(available), 'miner', { sourceId: emptySources[0] });
        
        //===== STARTUP/RECOVERY COLLECTOR
        var collectors = _.filter(creepsInRoom, creep => creep.memory.role === 'collector');
        var minCollectors = sourceIds.length;
        
        var minedEnergy = _.sum(_.filter(spawn.room.find(FIND_STRUCTURES), s => s.structureType === STRUCTURE_CONTAINER), c => c.store[RESOURCE_ENERGY]) + _.sum(spawn.room.find(FIND_DROPPED_ENERGY), e => e.amount);
        minCollectors += Math.floor(minedEnergy / 1000);
        
        if(collectors.length === 0 && miners.length === 1)
            return this.spawnCreep(spawn, roleCollector.getBody(available), 'collector', { working: false });
        
        //===== DEFENDERS
        if(spawn.room.find(FIND_HOSTILE_CREEPS).length > 0) {
            var defenders = _.filter(creepsInRoom, creep => creep.memory.role === 'defender');
            var minDefenders = 0;//var minDefenders = spawn.room.find(FIND_HOSTILE_CREEPS).length + 1;
            
            if(defenders.length < minDefenders) {
                return this.spawnCreep(spawn, roleDefender.getBody(available), 'defender');
            }
        }
        
        //===== MINERS
        if(emptySources.length > 0)
            return this.spawnCreep(spawn, roleMiner.getBody(available), 'miner', { sourceId: emptySources[0] });
        
        //===== COLLECTORS
        if(collectors.length < minCollectors)
            return this.spawnCreep(spawn, roleCollector.getBody(available), 'collector', { working: false });
        
        //===== UPGRADERS
        var upgraders = _.filter(creepsInRoom, creep => creep.memory.role === 'upgrader');
        var minUpgraders = 4;
        
        if(_.sum(_.filter(spawn.room.find(FIND_STRUCTURES), s => s.structureType === STRUCTURE_CONTAINER), c => c.store[RESOURCE_ENERGY]) > 1000)
            minUpgraders += 1;
        
        if(upgraders.length < minUpgraders && spawn.room.memory.threatLevel === 0)
            return this.spawnCreep(spawn, roleUpgrader.getBody(available), 'upgrader', { flag: spawn.room.name + '-Upgrade' });
        
        //===== LINKFILLERS
        var links = _.filter(spawn.room.find(FIND_MY_STRUCTURES), s => s.structureType === STRUCTURE_LINK);
        var linkFillers =  _.filter(creepsInRoom, creep => creep.memory.role === 'linkFiller');
        
        if(links.length > 1 && spawn.room.storage !== undefined) {
            var minLinkFillers = 1;
            
            if(linkFillers.length < minLinkFillers  && spawn.room.memory.threatLevel === 0)
                return this.spawnCreep(spawn, [CARRY, CARRY, CARRY, MOVE], 'linkFiller');
        }
        
        //===== BUILDERS
        if(spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            var minBuilders = 1;
            var builders = _.filter(creepsInRoom, creep => creep.memory.role === 'builder');
            var sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
            
            if(sites.length > 5)
                minBuilders += Math.floor(sites.length / 5);
            
            if(builders.length < minBuilders && spawn.room.memory.threatLevel === 0)
                return this.spawnCreep(spawn, roleBuilder.getBody(available), 'builder', { idle: false });
        }
        
        //===== ATTACKERS
        if(Game.flags['Attack'] !== undefined) {
            var attackers = _.filter(Game.creeps, creep => creep.memory.role === 'attacker');
            var minAttackers = 3;
            
            if(attackers.length < minAttackers)
                return this.spawnCreep(spawn, [TOUGH, MOVE, TOUGH, MOVE, TOUGH, MOVE, TOUGH, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE], 'attacker');
        }
        
        //===== CLAIMERS
        if(Game.flags['Claim'] !== undefined) {
            var claimers = _.filter(Game.creeps, creep => creep.memory.role === 'claimer');
            var minClaimers = 1;
            
            if(claimers.length < minClaimers && spawn.room.memory.threatLevel === 0)
                return this.spawnCreep(spawn, [TOUGH, MOVE, TOUGH, MOVE, CLAIM, MOVE], 'claimer');
        }
        
        //===== SPAWNBUILDERS
        if(Game.flags['Spawn'] !== undefined) {
            var spawnBuilders = _.filter(Game.creeps, creep => creep.memory.role === 'spawnBuilder');
            var minSpawnBuilders = 2;
            
            if(spawnBuilders.length < minSpawnBuilders && spawn.room.memory.threatLevel === 0)
                return this.spawnCreep(spawn, [WORK, MOVE, WORK, MOVE, WORK, MOVE, WORK, MOVE, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'spawnBuilder', { working: false });
        }
        
        //===== DRAINERS
        if(Game.flags['Drain'] !== undefined) {
            var drainers = _.filter(Game.creeps, creep => creep.memory.role === 'drainer');
            var minDrainers = 4;
            
            if(drainers.length < minDrainers)
                return this.spawnCreep(spawn, [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL], 'drainer');
        }
        
        //===== TANKS
        if(Game.flags['Tank'] !== undefined) {
            var tanks = _.filter(Game.creeps, creep => creep.memory.role === 'tank');
            var minTanks = 1;
            
            if(tanks.length < minTanks)
                return this.spawnCreep(spawn, [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'tank');
        }
        
        return 'nothing to spawn..';
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