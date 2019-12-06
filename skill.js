//skills

module.exports.attack = function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=1;
	var damage=Math.ceil(adv.strength*multiplier*randomizer*power);
	//critical chance ~5% max 10%
	var criticalChance=adv.luck/(adv.luck+target.luck*19);
	if(criticalChance>0.1)criticalChance=0.1;
	//miss chance ~10% max 50%
	var missChance=target.agility/(adv.dexterity*9+target.agility);
	if(missChance>0.5)missChance=0.5;
	//critical
	if(Math.random()<criticalChance){
		damage*=3;
		return [name1+" attacked "+name2+". Critical! "+name2+" took "+damage+" damage...",damage];
	}
	//miss
	else if(Math.random()<missChance)
		return [name1+" attacked "+name2+". But missed...",0];
	//normal attack
	else
		return [name1+" attacked "+name2+". "+name2+" took "+damage+" damage...",damage];
}

module.exports.exterion = function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=3.5;
	var damage=Math.ceil(adv.strength*multiplier*randomizer*power);
	//miss chance ~10% max 50%
	var missChance=target.agility/(adv.dexterity*9+target.agility);
	if(missChance>0.5)missChance=0.5;
	//miss
	if(Math.random()<missChance){
		return [name1+" used Exterion! But missed...",0];
	}
	//hit
	else return [name1+" used Exterion! "+name2+" took "+damage+" damage...",damage];
}

module.exports.sacredexplode = function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=4;
	var damage=Math.ceil((adv.strength+adv.magicpower)*multiplier*randomizer*power);
	//miss chance ~10% max 50%
	var missChance=target.agility/(adv.dexterity*9+target.agility);
	if(missChance>0.5)missChance=0.5;
	//miss
	if(Math.random()<missChance){
		return [name1+" used Sacred Explode! But missed...",0];
	}
	//hit
	else return [name1+" used Sacred Explode! "+name2+" took "+damage+" damage...",damage];
}

module.exports.heal = function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var healPower=Math.ceil(adv.magicpower*randomizer*0.5);
	return [name1+" casted Heal! "+name1+" recovered "+healPower+" HP...",0,healPower];
}

module.exports.blessing = function(name1, name2, adv, target, ailment1){
	var buff=Math.ceil(adv.luck*Math.random()*0.5);
	ailment1.blessing+=buff;
	adv.luck+=buff;
	return [name1+" casted Blessing! Luck increased by "+buff+"...",0];
}

module.exports.breakspell = function(name1, name2, adv, target, ailment1, ailment2){
	target.revertBuff(ailment2);
	ailment2.breakSpell();
	return [name1+" casted Break Spell! "+name2+"'s buff is gone...",0];
}

module.exports.increasestrength = function(name1, name2, adv, target, ailment1){
	var buff=Math.ceil(adv.strength*Math.random()*0.5);
	ailment1.strength+=buff;
	adv.strength+=buff;
	return [name1+" casted Increase Strength! Strength increased by "+buff+"...",0];
}

module.exports.improvespeed = function(name1, name2, adv, target, ailment1){
	var buff=Math.ceil(adv.agility*Math.random()*0.5);
	ailment1.speed+=buff;
	adv.agility+=buff;
	return [name1+" casted Improve Speed! Agility increased by "+buff+"...",0];
}

module.exports.enhancedefense = function(name1, name2, adv, target, ailment1){
	var buff=Math.ceil(Math.random()*0.5);
	ailment1.defense=buff;
	return [name1+" casted Enhance Defense! Physical damages will be reduced...",0];
}

module.exports.enhancemagicresistance = function(name1, name2, adv, target, ailment1){
	var buff=Math.ceil(Math.random()*0.5);
	ailment1.magicresistance=buff;
	return [name1+" casted Enhance Magic Resistance! Magic damages will be reduced...",0];
}

module.exports.godblow = function(name1, name2, adv, target){
	if(Math.random()<0.5){
		var damage=Math.ceil(target.health*Math.random());
		return [name1+" used GOD BLOW! "+name2+" took "+damage+" damage...",damage];
	}
	else
		return [name1+" used GOD BLOW! "+name2+" took 1 damage... Pfft",1];
}

module.exports.partytrick = function(name1, name2, adv, target){
	if(target.eris==0)return [name1+" used party tricks! Beauties of Nature! That was fun...",0];
	else{
		target.eris--;
		adv.eris++;
		return [name1+" used party tricks! Beauties of Nature! "+name2+" donated 1 eris in awe...",0];
	}
}

module.exports.blast = function(name1, name2, adv, target){
	var damage=Math.ceil(target.health*0.25);
	return [name1+" casted Blast! "+name2+" took "+damage+" damage...",damage];
}

module.exports.detonation = function(name1, name2, adv, target){
	var damage=Math.ceil(target.health*0.5);
	return [name1+" casted Detonation! "+name2+" took "+damage+" damage...",damage];
}

module.exports.explosion = function(name1, name2, adv, target){
	return [name1+" casted Explosion! "+name2+" exploded...",target.health];
}

//intermediate
module.exports.fireball =  function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=1.2;
	var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
	return [name1+" casted Fire Ball! "+name2+" took "+damage+" damage!",damage];
}

module.exports.bladeofwind =  function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=1.2;
	var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
	return [name1+" casted Blade of Wind! "+name2+" took "+damage+" damage!",damage];
}

module.exports.lightning =  function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=1.2;
	var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
	return [name1+" casted Lightning! "+name2+" took "+damage+" damage!",damage];
}

module.exports.freezegust =  function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=1.2;
	var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
	return [name1+" casted Freeze Gust! "+name2+" took "+damage+" damage!",damage];
}

module.exports.sleep =  function(name1, name2, adv, target, ailment1, ailment2){
	ailment2.sleep=2;
	return [name1+" casted Sleep! "+name2+" fell asleep!",0];
}

//advanced
module.exports.energyignition =  function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=1.5;
	var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
	return [name1+" casted Energy Ignition! "+name2+" took "+damage+" damage!",damage];
}

module.exports.inferno =  function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=1.5;
	var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
	return [name1+" casted Inferno! "+name2+" took "+damage+" damage!",damage];
}

module.exports.crystalprison =  function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=1.5;
	var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
	return [name1+" casted Crystal Prison! "+name2+" took "+damage+" damage!",damage];
}

module.exports.lightningstrike =  function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=1.5;
	var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
	return [name1+" casted Lightning Strike! "+name2+" took "+damage+" damage!",damage];
}

module.exports.tornado =  function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=1.5;
	var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
	return [name1+" casted Tornado! "+name2+" took "+damage+" damage!",damage];
}

module.exports.bottomlessswamp =  function(name1, name2, adv, target, ailment1, ailment2){
	ailment2.immobilize=1;
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=1.3;
	var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
	return [name1+" casted Bottomless Swamp! "+name2+" is immobilized and took "+damage+" damage!",damage];
}

module.exports.lightofsaber =  function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=1.8;
	var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
	return [name1+" casted Light of Saber! "+name2+" took "+damage+" damage!",damage];
}

module.exports.anklesnare =  function(name1, name2, adv, target, ailment1, ailment2){
	ailment2.immobilize=2;
	return [name1+" casted Ankle Snare! "+name2+" is immobilized...",0];
}

module.exports.snipe = function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=1.5;
	var damage=Math.ceil(adv.strength*multiplier*randomizer*power);
	//critical chance ~5% max 10%
	var criticalChance=adv.luck/(adv.luck+target.luck*19);
	if(criticalChance>0.1)criticalChance=0.1;
	//critical
	if(Math.random()<criticalChance){
		damage*=3;
		return [name1+" used Snipe! Critical! "+name2+" took "+damage+" damage...",damage];
	}
	//normal hit
	else return [name1+" used Snipe! "+name2+" took "+damage+" damage...",damage];
}

module.exports.steal = function(name1, name2, adv, target){
	//success chance ~50% min 50%
	var successChance=adv.luck/(target.luck+adv.luck);
	if(successChance<0.5)successChance=0.5;
	//miyuchi safety pantsu
	if(name2=="Miyuchi")return [name1+" used Steal! But failed...",0];
	//failed
	else if(Math.random()>successChance)return [name1+" used Steal! But failed...",0];
	//success
	else {
		adv.pantsu++;
		return [name1+" used Steal! "+name1+" got "+name2+"'s pantsu",0];
	}
}

module.exports.bind = function(name1, name2, adv, target, ailment1, ailment2){
	ailment2.immobilize=2;
	return [name1+" used Bind! "+name2+" is immobilized...",0];
}

//beginner
module.exports.tinder = function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=0.5;
	var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
	return [name1+" casted Tinder! "+name2+" took "+damage+" damage...",damage];
}

module.exports.createwater = function(name1, name2, adv, target, ailment1){
	ailment1.createwater=1;
	return [name1+" casted Create Water...!",0];
}

module.exports.freeze = function(name1, name2, adv, target, ailment1, ailment2){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	if(ailment1.createwater==1){
		ailment1.createwater=0;
		ailment2.immobilize=1;
		var power=0.75;
		var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
		return [name1+" casted Freeze! "+name2+" is immobilized and took "+damage+" damage...",damage];
	}
	else{
		var power=0.25;
		var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
		return [name1+" casted Freeze! "+name2+" took "+damage+" damage...",damage];
	}
}

module.exports.createearth = function(name1, name2, adv, target, ailment1){
	ailment1.createearth=1;
	return [name1+" casted Create Earth...!",0];
}

module.exports.windbreath = function(name1, name2, adv, target, ailment1, ailment2){
	if(ailment1.createearth==1){
		ailment1.createearth=0;
		ailment2.blind=1;
		var randomizer=Math.random()+0.5;
		var multiplier=adv.level/target.level;
		//limit multiplier 0.5~1.5
		if(multiplier>1.5)multiplier=1.5;
		else if(multiplier<0.5)multiplier=0.5;
		var power=0.25;
		var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
		return [name1+" casted Wind Breath! "+name2+" is blinded and took "+damage+" damage...!",damage];
	}
	else
		return [name1+" casted Wind Breath! Nothing happens...",0];
}

module.exports.draintouch = function(name1, name2, adv, target){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=0.5;
	var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
	return [name1+" used Drain Touch! "+damage+" HP is absorbed from "+name2+"...!",damage,damage];
}
