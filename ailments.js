function Ailments(){
	this.strength=0;
	this.speed=0;
	this.defense=0;
	this.magicresistance=0;
	this.blessing=0;
	
	this.sleep=0; // stun
	//paralyze
	this.blind=0; // stun
	this.immobilize=0; // stun
	this.bind=0; //stun
	this.skillbind=0; // only attack works
	
	this.createwater=0;
	this.createearth=0;
	//poison
}

Ailments.prototype.breakSpell = function(){
	this.strength=0;
	this.speed=0;
	this.defense=0;
	this.magicresistance=0;
	this.blessing=0;
}

Ailments.prototype.stunned = function(){
	var bool=(this.sleep>0 || this.blind>0 || this.immobilize>0 || this.bind>0);
	this.sleep--;
	this.blind--;
	this.immobilize--;
	this.bind--;
	return bool;
}

module.exports=Ailments;
