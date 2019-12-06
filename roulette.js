function Roulette(){
	this.gambler=[];
	this.count=0;
}

//valid bet
var valid=['0','1','2','3','4','5','6','7','8','9','10','11','12',
'13','14','15','16','17','18','19','20','21','22','23','24',
'25','26','27','28','29','30','31','32','33','34','35','36',
'1-12','13-24','25-36','1st','2nd','3rd',
'1-18','19-36','red','black','even','odd'];
var payout=[36,36,36,36,36,36,36,36,36,36,36,36,36,
36,36,36,36,36,36,36,36,36,36,36,36,
36,36,36,36,36,36,36,36,36,36,36,36,
3,3,3,3,3,3,2,2,2,2,2,2];
var red=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
var black=[2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];

Roulette.prototype.add = function(adv,name,bet,sum){
	//check already bet
	for(var i=0; i<this.count; i++){
		if(this.gambler[i]['adventurer']==adv){
			return 1; //already bet
		}
	}
	//check valid bet
	bet=parseBet(bet);
	if(bet<0){
		return 2;//invalid bet
	} 
	//check valid sum
	if(isNaN(parseInt(sum)) || !isFinite(sum) || sum.indexOf(".")>=0){
		return 3; //sum not number
	}
	sum=parseInt(sum);
	if(sum<=0)return 3; // <= zero bet
	//check enough money
	if(adv.eris<sum){
		return 4; //not enough money
	}
	//add
	this.gambler[this.count]={};
	this.gambler[this.count]['adventurer']=adv;
	this.gambler[this.count]['name']=name;
	this.gambler[this.count]['bet']=bet;
	this.gambler[this.count]['sum']=sum;
	adv.eris-=sum;
	this.count++;
	return 0;
}

function parseBet(bet){
	var betType=-1;
	//is in valid
	for(var i=0; i<valid.length; i++){
		if(bet==valid[i]){
			betType=i;
			break;
		}
	}
	return betType;
}

Roulette.prototype.roll = function(){
	//luck based
	var odds_count=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
	var odds=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
	//average
	var avg=0;
	for(var i=0; i<this.count; i++){
		avg+=this.gambler[i]['adventurer'].luck;
	}
	avg/=this.count;
	for(var i=0; i<odds.length; i++)odds[i]*=avg;
	//add odds
	for(var i=0; i<this.count; i++){
		for(var j=0; j<37; j++){
			if(isWin(this.gambler[i]['bet'],j)){
				odds[j]+=this.gambler[i]['adventurer'].luck;
				odds_count[j]++;
			}
		}
	}
	//re-average and total
	var tot=0;
	for(var i=0; i<37; i++){
		odds[i]/=odds_count[i];
		tot+=odds[i];
	}
	//roll
	var rolled = (Math.random() * tot);
	//parse roll
	for(var i=0; i<37; i++){
		if(rolled<=odds[i]){
			rolled=i;
			break;
		} else rolled-=odds[i];
	}
	//process result
	var text="";
	if(red.indexOf(rolled)!=-1)text+="Red - ";
	else if(black.indexOf(rolled)!=-1)text+="Black - ";
	text+=rolled+"\n\n";
	for(var i=0; i<this.count; i++){
		if(isWin(this.gambler[i]['bet'],rolled)){
			pay=this.gambler[i]['sum']*payout[this.gambler[i]['bet']];
			this.gambler[i]['adventurer'].eris+=pay;
			text+=this.gambler[i]['name']+" won "+pay+" eris! (Current: "+this.gambler[i]['adventurer'].eris+" eris)\n";
		}
		else{
			text+=this.gambler[i]['name']+" lose!\n";
		}
	}
	return text;
}

function isWin(bet,rolled){
	//0-36
	if(bet<37){
		if(rolled==bet)return true;
	}
	//1-12,...
	else if(bet==37){
		if(1<=rolled && rolled<=12)return true;
	}
	else if(bet==38){
		if(13<=rolled && rolled<=24)return true;
	}
	else if(bet==39){
		if(25<=rolled && rolled<=36)return true;
	}
	//1st,...
	else if(bet==40){
		if(rolled%3==1)return true;
	}
	else if(bet==41){
		if(rolled%3==2)return true;
	}
	else if(bet==42){
		if(rolled%3==0)return true;
	}
	//1-18,...
	else if(bet==43){
		if(1<=rolled && rolled<=18)return true;
	}
	else if(bet==44){
		if(19<=rolled && rolled<=36)return true;
	}
	//red,black
	else if(bet==45){
		if(red.indexOf(rolled)!=-1)return true;
	}
	else if(bet==46){
		if(black.indexOf(rolled)!=-1)return true;
	}
	//even,odd
	else if(bet==47){
		if(rolled%2==0)return true;
	}
	else if(bet==48){
		if(rolled%2==1)return true;
	}
	return false;
}
	
module.exports=Roulette;
