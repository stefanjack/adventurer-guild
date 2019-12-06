var Ailments=require("./ailments.js");
var Skills=require("./skill.js");

function Adventurer(){
	this.level = 1;
	this.experience = 0;
	this.strength = Math.floor((Math.random() * 10) + 5);
	this.health = Math.floor((Math.random() * 10) + 5);
	this.magicpower = Math.floor((Math.random() * 10) + 5);
	this.dexterity = Math.floor((Math.random() * 10) + 5);
	this.agility = Math.floor((Math.random() * 10) + 5);
	this.luck = Math.floor((Math.random() * 10) + 5);
	//bonus
	var bonus_type = Math.floor((Math.random() * 6));
	var bonus_val = Math.floor((Math.random() * 10));
	if(bonus_type==0)this.strength+=bonus_val;
	else if(bonus_type==1)this.health+=bonus_val;
	else if(bonus_type==2)this.magicpower+=bonus_val;
	else if(bonus_type==3)this.dexterity+=bonus_val;
	else if(bonus_type==4)this.agility+=bonus_val;
	else if(bonus_type==5)this.luck+=bonus_val;
	//reincarnate lv
	this.reincarnate=0;
	//pantsu
	this.pantsu=0;
	//eris
	this.eris=0;
}

Adventurer.prototype.set = function(level, experience, strength, health, magicpower, dexterity, agility, luck, reincarnate, pantsu, eris){
	this.level = level;
	this.experience = experience;
	this.strength = strength;
	this.health = health;
	this.magicpower = magicpower;
	this.dexterity = dexterity;
	this.agility = agility;
	this.luck = luck;
	this.reincarnate = reincarnate;
	this.pantsu = pantsu;
	this.eris = eris;
	//back compability
	if(isNaN(reincarnate))this.reincarnate = 0;
	if(isNaN(pantsu))this.pantsu = 0;
	if(isNaN(eris))this.eris = 0;
}

Adventurer.prototype.showExp = function(){
	/*var previous=this.level*(this.level-1);
	var exp=Math.floor((this.experience-previous)*100/(this.level*2));
	if(exp<0)exp=0;
	return exp;*/
	return Math.floor(this.experience*100/this.nextLv());
}

Adventurer.prototype.stats = function(name){
    return "```\n"+name+" Lv "+this.level+
	"\nNext Lv: "+this.showExp()+"%"+
	"\n"+this.jobclass()+"\n"+
	"\nStrength      : "+this.strength+
	"\nHealth        : "+this.health+
	"\nMagic Power   : "+this.magicpower+
	"\nDexterity     : "+this.dexterity+
	"\nAgility       : "+this.agility+
	"\nLuck          : "+this.luck+
	"\n"+
	"\nReicarnateLv  : "+this.reincarnate+
	"\n"+this.eris+" eris"+
	"\n"+this.pantsu+" pantsu(s)"+
	"\n```";
};

function reincarnationBonus(val){
	return Math.ceil(Math.sqrt(val/10));
}

Adventurer.prototype.reincarnation = function(){
	this.reincarnate+=(this.level-1);
	this.level = 1;
	this.experience = 0;
	var reBonus=reincarnationBonus(this.reincarnate);
	this.strength = Math.floor((Math.random() * 10) + 5+reBonus);
	this.health = Math.floor((Math.random() * 10) + 5+reBonus);
	this.magicpower = Math.floor((Math.random() * 10) + 5+reBonus);
	this.dexterity = Math.floor((Math.random() * 10) + 5+reBonus);
	this.agility = Math.floor((Math.random() * 10) + 5+reBonus);
	this.luck = Math.floor((Math.random() * 10) + 5+reBonus);
	//bonus
	var bonus_type = Math.floor((Math.random() * 6));
	var bonus_val = Math.floor((Math.random() * 10)+reBonus);
	if(bonus_type==0)this.strength+=bonus_val;
	else if(bonus_type==1)this.health+=bonus_val;
	else if(bonus_type==2)this.magicpower+=bonus_val;
	else if(bonus_type==3)this.dexterity+=bonus_val;
	else if(bonus_type==4)this.agility+=bonus_val;
	else if(bonus_type==5)this.luck+=bonus_val;
}

Adventurer.prototype.jobclass = function(){
	if(this.strength>=this.health && this.strength>=this.magicpower && this.strength>=this.dexterity && this.strength>=this.agility && this.strength>=this.luck)
		return "Swordsman";
	else if(this.health>=this.strength && this.health>=this.magicpower && this.health>=this.dexterity && this.health>=this.agility && this.health>=this.luck){
		if(this.strength>=this.magicpower && this.strength>=this.dexterity && this.strength>=this.agility && this.strength>=this.luck)
			return "Arch Priest";
		else
			return "Crusader";
	}
	else if(this.magicpower>=this.strength && this.magicpower>=this.health && this.magicpower>=this.dexterity && this.magicpower>=this.agility && this.magicpower>=this.luck)
		return "Arch Wizard";
	else if(this.dexterity>=this.strength && this.dexterity>=this.health && this.dexterity>=this.magicpower && this.dexterity>=this.agility && this.dexterity>=this.luck)
		return "Archer";
	else if(this.agility>=this.strength && this.agility>=this.health && this.agility>=this.magicpower && this.agility>=this.dexterity && this.agility>=this.luck)
		return "Thief";
	else
		return "Adventurer";
}

Adventurer.prototype.randomStatSwap = function(multiplier){
	var stat1=Math.floor(Math.random()*6);
	var stat2=Math.floor(Math.random()*6);
	var str="";
	//swap
	var temp=0;
	if(stat1==0){str="strength"; temp=this.strength;}
	else if(stat1==1){str="health"; temp=this.health;}
	else if(stat1==2){str="magicpower"; temp=this.magicpower;}
	else if(stat1==3){str="dexterity"; temp=this.dexterity;}
	else if(stat1==4){str="agility"; temp=this.agility;}
	else if(stat1==5){str="luck"; temp=this.luck;}
	str+=" swapped with ";
	var temp2=0;
	if(stat2==0){str+="strength"; temp2=this.strength; this.strength=temp;}
	else if(stat2==1){str+="health"; temp2=this.health; this.health=temp;}
	else if(stat2==2){str+="magic power"; temp2=this.magicpower; this.magicpower=temp;}
	else if(stat2==3){str+="dexterity"; temp2=this.dexterity; this.dexterity=temp;}
	else if(stat2==4){str+="agility"; temp2=this.agility; this.agililty=temp;}
	else if(stat2==5){str+="luck"; temp2=this.luck; this.luck=temp;}
	if(stat1==0){this.strength=temp2;}
	else if(stat1==1){this.health=temp2;}
	else if(stat1==2){this.magicpower=temp2;}
	else if(stat1==3){this.dexterity=temp2;}
	else if(stat1==4){this.agility=temp2;}
	else if(stat1==5){this.luck=temp2;}
	return str;
}

Adventurer.prototype.addStat = function(adv){
	var shadow=new Adventurer();
	shadow.set(this.level+adv.level,0,this.strength+adv.strength,this.health+adv.health,this.magicpower+adv.magicpower,this.dexterity+adv.dexterity,this.agility+adv.agility,this.luck+adv.luck);
	return shadow;
}

Adventurer.prototype.getShadow = function(multiplier){
	var shadow=new Adventurer();
	shadow.set(1,0,this.strength*multiplier,this.health*multiplier,this.magicpower*multiplier,this.dexterity*multiplier,this.agility*multiplier,this.luck*multiplier);
	return shadow;
}

Adventurer.prototype.nextLv = function(lv){
	if(lv==undefined)lv=this.level;
	//return lv*(lv+1);
	return lv*2;
}

Adventurer.prototype.getExp = function(exp){
	this.experience+=exp;
	//check lv up
	var next=this.nextLv();
	if(this.experience>=next){
		this.levelUp();
		//reset exp
		var surplus=this.experience-next;
		this.experience=0;
		//recheck lv up again
		this.getExp(surplus);
	}
}

Adventurer.prototype.randomGain = function(){
	var reBonus=reincarnationBonus(this.reincarnate);
	var bonus_type = Math.floor((Math.random() * 6));
	var bonus_val = Math.ceil(Math.random() * (2+reBonus));
	if(bonus_type==0)this.strength+=bonus_val;
	else if(bonus_type==1)this.health+=bonus_val;
	else if(bonus_type==2)this.magicpower+=bonus_val;
	else if(bonus_type==3)this.dexterity+=bonus_val;
	else if(bonus_type==4)this.agility+=bonus_val;
	else if(bonus_type==5)this.luck+=bonus_val;
}

Adventurer.prototype.keepClass = function(original){
	if(original=="Swordsman"){
		while(original!=this.jobclass())
			this.strength++;
	}
	else if(original=="Arch Priest" || original=="Crusader"){
		while(this.jobclass()!="Arch Priest" && this.jobclass()!="Crusader")
			this.health++;
		if(original=="Arch Priest"){
			while(original!=this.jobclass())
				this.strength++;
		}
		else{
			while(original!=this.jobclass())
				this.strength--;
		}
	}
	else if(original=="Arch Wizard"){
		while(original!=this.jobclass())
			this.magicpower++;
	}
	else if(original=="Archer"){
		while(original!=this.jobclass())
			this.dexterity++;
	}
	else if(original=="Thief"){
		while(original!=this.jobclass())
			this.agility++;
	}
	else if(original=="Adventurer"){
		while(original!=this.jobclass())
			this.luck++;
	}
}

Adventurer.prototype.levelUp = function(){
	var currentClass=this.jobclass();
	this.level+=1;
	var reBonus=reincarnationBonus(this.reincarnate);
	this.strength+=Math.floor((Math.random() * (2+reBonus)) + 1);
	this.health+=Math.floor((Math.random() * (2+reBonus)) + 1);
	this.magicpower+=Math.floor((Math.random() * (2+reBonus)) + 1);
	this.dexterity+=Math.floor((Math.random() * (2+reBonus)) + 1);
	this.agility+=Math.floor((Math.random() * (2+reBonus)) + 1);
	this.luck+=Math.floor((Math.random() * (2+reBonus)) + 1);
	this.keepClass(currentClass);
}

Adventurer.prototype.revertBuff = function(ailment){
	this.strength-=ailment.strength; this.agility-=ailment.speed; this.luck-=ailment.blessing;
}

var physicalAttack=['attack','exterion','sacredexplode','godblow','snipe'];
function isPhysical(attack){
	for(var i=0; i<physicalAttack.length; i++){
		if(attack==physicalAttack[i]){
			return true;
		}
	}
	return false;
}

var magicAttack=['fireball','bladeofwind','lightning','freezegust','energyignition','inferno','crystalprison','lightningstrike','tornado','lightofsaber','tinder','freeze','windbreath'];
// blast, detonation, explosion is exception (anti-magic resistance)
function isMagic(attack){
	for(var i=0; i<magicAttack.length; i++){
		if(attack==magicAttack[i]){
			return true;
		}
	}
	return false;
}

//parameter: this name, enemy name, enemy adventurer
Adventurer.prototype.fight = function(name1, name2, enemy){
	var battleLog="";
	var hp1=this.health;
	var hp2=enemy.health;
	var job1=this.jobclass().replace(/ /g,"");
	var job2=enemy.jobclass().replace(/ /g,"");
	var ailment1=new Ailments();
	var ailment2=new Ailments();
	while(hp1>0 && hp2>0){
		if(!ailment1.stunned()){
			var result=this.combat(name1, name2, enemy, ailment1, ailment2, job1);
			battleLog+=result[1]+"\n";
			//buff
			if(ailment2.defense>0 && isPhysical(result[0]))
				result[2]=Math.ceil(result[2]*(1-ailment2.defense));
			if(ailment2.magicresistance>0 && isMagic(result[0]))
				result[2]=Math.ceil(result[2]*(1-ailment2.magicresistance));
			//damage
			hp2-=result[2];
			//heal
			if(result[3]!=undefined){
				hp1+=result[3];
				if(hp1>this.health)hp1=this.health;
			}
		}
		if(hp2<=0)break;
		
		if(!ailment2.stunned()){
			result=enemy.combat(name2, name1, this, ailment2, ailment1, job2);
			battleLog+=result[1]+"\n";
			//buff
			if(ailment1.defense>0 && isPhysical(result[0]))
				result[2]=Math.ceil(result[2]*(1-ailment1.defense));
			if(ailment1.magicresistance>0 && isMagic(result[0]))
				result[2]=Math.ceil(result[2]*(1-ailment1.magicresistance));
			//damage
			hp1-=result[2];
			//heal
			if(result[3]!=undefined){
				hp2+=result[3];
				if(hp2>enemy.health)hp2=enemy.health;
			}
		}
	}
	//revert buff
	this.revertBuff(ailment1);
	enemy.revertBuff(ailment2);
	//declare winner
	if(hp1>0){
		battleLog+=name2+" died...\n"+name1+" wins!\n";
		this.getExp(enemy.level);
	} else {
		battleLog+=name1+" died...\n"+name2+" wins!\n";
		enemy.getExp(this.level);
	}
	return battleLog;
}

var odds={
Swordsman:{
	attack:60,
	exterion:15,
	sacredexplode:10,
	steal:10,
	explosion:5
},
ArchPriest:{
	attack:20,
	heal:20,
	blessing:5,
	breakspell:5,
	increasestrength:5,
	improvespeed:5,
	enhancedefense:5,
	enhancemagicresistance:5,
	godblow:10,
	partytrick:5,
	steal:10,
	explosion:5
},
Crusader:{
	attack:85,
	steal:10,
	explosion:5
},
ArchWizard:{
	attack:40,
	//intermediate
	fireball:12,
	bladeofwind:12,
	lightning:12,
	freezegust:12,
	sleep:12,
	//advanced
	energyignition:5,
	inferno:5,
	crystalprison:5,
	lightningstrike:5,
	tornado:5,
	bottomlessswamp:5,
	lightofsaber:5,
	anklesnare:5,
	//detonate
	blast:10,
	detonation:10,
	steal:20,
	explosion:20
},
Archer:{
	attack:60,
	snipe:25,
	steal:10,
	explosion:5
},
Thief:{
	attack:50,
	steal:25,
	bind:20,
	explosion:5
},
Adventurer:{
	attack:40,
	snipe:10,
	tinder:5,
	createwater:5,
	freeze:5,
	createearth:5,
	windbreath:5,
	draintouch:10,
	steal:10,
	explosion:5
}
};

Adventurer.prototype.combat = function(name1, name2, target, ailment1, ailment2, job){
	var chance=0;
	var skills=odds[job];
	for(attack in skills){
		chance+=skills[attack];
	}
	var skill=Math.floor((Math.random() * chance));
	for(attack in skills){
		if(skill<skills[attack]){
			var return1=[attack];
			//var return2=this[attack](name1, name2, target, ailment1, ailment2);
			var return2=Skills[attack](name1, name2, this, target, ailment1, ailment2);
			return return1.concat(return2);
		}
		else skill-=skills[attack];
	}
}

var Kazuma = new Adventurer();
Kazuma.set(1,0,13,12,9,14,15,792,0,0);
var Aqua = new Adventurer();
Aqua.set(21,0,72,81,26,3,46,1,0,0);
var Megumin = new Adventurer();
Megumin.set(6,0,17,26,231,32,21,18,0,0);

module.exports=Adventurer;
module.exports.Kazuma=Kazuma;
module.exports.Aqua=Aqua;
module.exports.Megumin=Megumin;