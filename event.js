var Adventurer=require("./adventurer.js");//redundant?
var Ailments=require("./ailments.js");
var Skills=require("./skill.js");

function LiveAdventurer(adv){
	this.hp = adv.health;
	this.potion=0;
	this.participate=false;
	this.mana=adv.magicpower;
	this.crystal=0;
	this.ailment=new Ailments();
}

LiveAdventurer.prototype.stat = function(adv){
	if(this.hp>adv.health)this.hp=adv.health;
	if(this.hp<=0)return "DEAD";
	else return "HP: "+this.hp+" / "+adv.health+" ("+this.potion+" potions)";
}

LiveAdventurer.prototype.hpInfo = function(adv){
	if(this.hp>adv.health)this.hp=adv.health;
	if(this.hp<=0)return "DEAD";
	else return "HP: "+this.hp+" / "+adv.health;
}

LiveAdventurer.prototype.combat = function(name1, name2, adv, target, liveTarget){
	if(this.hp>adv.health)this.hp=adv.health;
	this.participate=true;
	var battleLog="";
	var result;
	if(!this.ailment.stunned()){
		//result=this.attack(name1, name2, adv,target,liveTarget);
		result=Skills['attack'](name1, name2, adv, target, this.ailment, liveTarget.ailment);
		result=['attack'].concat(result);
		battleLog+=result[1]+"\n";
		//buff
		if(liveTarget.ailment.defense>0 && isPhysical(result[0]))
			result[2]=Math.ceil(result[2]*(1-liveTarget.ailment.defense));
		if(liveTarget.ailment.magicresistance>0 && isMagic(result[0]))
			result[2]=Math.ceil(result[2]*(1-liveTarget.ailment.magicresistance));
		//damage
		liveTarget.hp-=result[2];
		//heal
		if(result[3]!=undefined){
			this.hp+=result[3];
			if(this.hp>adv.health)hp1=adv.health;
		}
	}
	else battleLog=name1+" cannot move!";
	
	//check dead
	if(liveTarget.hp<=0)return battleLog;
	
	//counter
	if(!liveTarget.ailment.stunned()){
		//result=liveTarget.attack(name2, name1, target,adv,this);
		result=Skills['attack'](name2, name1, target, adv, liveTarget.ailment, this.ailment);
		result=['attack'].concat(result);
		battleLog+=result[1]+"\n";
		//buff
		if(this.ailment.defense>0 && isPhysical(result[0]))
			result[2]=Math.ceil(result[2]*(1-this.ailment.defense));
		if(this.ailment.magicresistance>0 && isMagic(result[0]))
			result[2]=Math.ceil(result[2]*(1-this.ailment.magicresistance));
		//damage
		this.hp-=result[2];
		//heal
		if(result[3]!=undefined){
			liveTarget.hp+=result[3];
			if(liveTarget.hp>target.health)liveTarget.hp=target.health;
		}
	}
	else battleLog=name2+" cannot move!";
	return battleLog+"\n\n"+this.stat(adv);
}

//mana cost

/*
LiveAdventurer.prototype.attack = function(name1, name2, adv, target, liveTarget){
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
		liveTarget.hp-=damage;
		return name1+" attacked "+name2+". Critical! "+name2+" took "+damage+" damage...";
	}
	//miss
	else if(Math.random()<missChance){
		return name1+" attacked "+name2+". But missed...";
	}
	//normal attack
	else {
		liveTarget.hp-=damage;
		return name1+" attacked "+name2+". "+name2+" took "+damage+" damage...";
	}
}

LiveAdventurer.prototype.magic = function(name1, name2, adv, target, liveTarget){
	var randomizer=Math.random()+0.5;
	var multiplier=adv.level/target.level;
	//limit multiplier 0.5~1.5
	if(multiplier>1.5)multiplier=1.5;
	else if(multiplier<0.5)multiplier=0.5;
	var power=1;
	var damage=Math.ceil(adv.magicpower*multiplier*randomizer*power);
	liveTarget.hp-=damage;
	return name1+" used a magic! "+name2+" took "+damage+" damage!";
}
*/
LiveAdventurer.prototype.usePotion = function(target, liveTarget){
	//check dead
	if(this.hp<0)return " you are dead!";
	//check target dead
	else if(liveTarget.hp<0)return " target already dead! There's no saving him (for now)";
	//check have potion
	else if(this.potion>=1){
		liveTarget.hp=target.health;
		this.potion--;
		return " have used potion on ";
	} else return " you don't have any potion!";
}

LiveAdventurer.prototype.revive = function(adv){
	this.hp = adv.health;
}

module.exports=LiveAdventurer;