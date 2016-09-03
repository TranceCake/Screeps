var roleRaider = {
  run: function() {
    var marker = Game.flags['Raid'];

    if(marker !== undefined) {
      if(creep.memory.working && creep.carry.energy == 0) {
          creep.memory.working = false;
      } else if(!creep.memory.working && creep.carry.energy === creep.carryCapacity) {
          creep.memory.working = true;
      }

      if(creep.memory.working) {
        if(marker.room !== undefined && marker.room.name === creep.room.name) {
          var target = creep.room.storage;
          
          if(target !== undefined && _.sum(target.store) > 0 {
            var content = Object.keys(creep.carry);

            if(creep.withdraw(target, content[0], creep.carryCapacity - _.sum(creep.carry)) === ERR_NOT_IN_RANGE) {
              creep.moveTo(target);
            } else {
              creep.withdraw(target, content[0], creep.carryCapacity - _.sum(creep.carry));
            }
          }
        }
      } else {
        if(creep.room.name === Game.spawns.Spawn1.room.name) {
          var storage = creep.room.storage;
          
          if(storage !== undefined) {
            var content = Object.keys(creep.carry);
            
            if(creep.transfer(content[0], storage) === ERR_NOT_IN_RANGE) {
              creep.moveTo(storage);
            } else {
              creep.creep.transfer(content[0]);
            }
          }
        } else {
          creep.moveTo(Game.spawns.Spawn1);
        }
      }
    }
  }
};

module.exports = roleRaider;