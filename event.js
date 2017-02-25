var Adventurer=require("./adventurer.js");

function LiveAdventurer(adv){
	this.hp = adv.health;
	this.potion=0;
	this.participate=false;
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
	var move=Math.floor(Math.random()*2);
	var result;
	if(move==0)result=this.attack(name1, name2, adv,target,liveTarget);
	else if(move==1)result=this.magic(name1, name2, adv,target,liveTarget);
	battleLog+=result;
	//check dead
	if(liveTarget.hp<=0)return battleLog;
	//counter
	move=Math.floor(Math.random()*2);
	if(move==0)result=liveTarget.attack(name2, name1, target,adv,this);
	else if(move==1)result=this.magic(name2, name1, target,adv,this);
	battleLog+="\n"+result;
	
	return battleLog+"\n\n"+this.stat(adv);
}

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