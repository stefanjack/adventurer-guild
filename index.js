var Discord = require("discord.js");
var client = new Discord.Client();

var express = require('express');
var app     = express();

var http = require('http');
var querystring = require('querystring');

var conf=require('./config.js');
var url=conf.url;
var urlpath=conf.urlpath;

app.set('port', (process.env.PORT || 8080));
app.get('/', function(request, response) {
    var result = 'App is running<br>'+
	'<a href="./adventurer">adventurer</a><br>'+
	'<a href="./quest">quest</a><br>'+
	'<a href="./channel">channel</a><br>'+
	'<a href="./prefix">prefix</a><br>'+
	'<a href="./reconnect">reconnect</a><br>';
    response.send(result);
})
app.get('/adventurer', function(request, response) {
    var result = createSaveText();
    response.send("<pre>"+result+"</pre>");
})
app.get('/quest', function(request, response) {
    var result = createQuestText();
    response.send("<pre>"+result+"</pre>");
})
app.get('/channel', function(request, response) {
    var result = createChannelText();
    response.send("<pre>"+result+"</pre>");
})
app.get('/prefix', function(request, response) {
    var result = createPrefixText();
    response.send("<pre>"+result+"</pre>");
})
app.get('/reconnect', function(request, response) {
    client.destroy();
	client.login(token);
	var result = "Reconnecting...";
    response.send("<pre>"+result+"</pre>");
})

app.listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});

var Adventurer=require("./adventurer.js");
var adventurer={};

var Roulette=require('./roulette.js');
var roller=new Roulette();
var rollRoulette={};

var fightCooldown={};
	
var questAll={};
var quest={};
var questAllDone={};
var questDone={};

var botChannel={};

var prefix={};
var default_prefix='!';

var fs=require("fs");

function loadAdventurer(){
	//load
	var result="";
	var req = http.request({
		hostname: url,
		port: 80,
		path: urlpath+'/adventurer.txt',
		method: 'GET'
	}, (res) => {
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			result+=chunk;
		});
		res.on('end', () => {
			//parse
			var lines=result.split("\n");
			for(var i=0; i<lines.length; i++){
				if(lines[i]=='')continue;
				var obj=lines[i].split(",");
				if(adventurer[obj[0]]==undefined)adventurer[obj[0]]={};
				adventurer[obj[0]][obj[1]]=new Adventurer();
				adventurer[obj[0]][obj[1]].set(
					parseInt(obj[2]),parseInt(obj[3]),parseInt(obj[4]),parseInt(obj[5]),parseInt(obj[6]),parseInt(obj[7]),parseInt(obj[8]),parseInt(obj[9]),//basic
					parseInt(obj[10]),parseInt(obj[11]),//reincarnate+pantsu
					parseInt(obj[12])//eris
				);
			}
		console.log("Data loaded!");
		});
	});
	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});
	req.end();
}
loadAdventurer();

function loadQuest(){
	//load
	var result="";
	var req = http.request({
		hostname: url,
		port: 80,
		path: urlpath+'/quest.txt',
		method: 'GET'
	}, (res) => {
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			result+=chunk;
		});
		res.on('end', () => {
			//parse
			var lines=result.split("\n");
			for(var i=0; i<lines.length; i++){
				if(lines[i]=='')continue;
				var obj=lines[i].split("|");
				if(obj[0]=="questAll"){
					//back compability
					if(obj[5]==undefined)obj[5]='0';
					questAll[obj[1]]=[obj[2],parseInt(obj[3]),obj[4].replace(/!p/g,"|").replace(/!e/g,"!"),parseInt(obj[5])];
				}
				else if(obj[0]=="questAllDone"){
					if(questAllDone[obj[1]]==undefined)questAllDone[obj[1]]={};
					questAllDone[obj[1]][obj[2]]=parseInt(obj[3]);
				}
				else if(obj[0]=="quest"){
					if(quest[obj[1]]==undefined)quest[obj[1]]={};
					//back compability
					if(obj[6]==undefined)obj[6]='0';
					quest[obj[1]][obj[2]]=[obj[3],parseInt(obj[4]),obj[5].replace(/!p/g,"|").replace(/!e/g,"!"),parseInt(obj[6])];
				}
				else if(obj[0]=="questDone"){
					if(questDone[obj[1]]==undefined)questDone[obj[1]]={};
					questDone[obj[1]][obj[2]]=parseInt(obj[3]);
				}
			}
		console.log("Quest loaded!");
		});
	});
	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});
	req.end();
}
loadQuest();

var channelLoaded=false;

function checkChannel(guild){
	if(botChannel[guild]==undefined){
		delete botChannel[guild];
		saveChannel();
		return false;
	}
	else if(client.channels.has(botChannel[guild].id))
		return true;
	else{
		delete botChannel[guild];
		saveChannel();
		return false;
	}
}

function loadChannel(){
	if(channelLoaded)return;
	//load
	var result="";
	var req = http.request({
		hostname: url,
		port: 80,
		path: urlpath+'/channel.txt',
		method: 'GET'
	}, (res) => {
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			result+=chunk;
		});
		res.on('end', () => {
			//parse
			var lines=result.split("\n");
			for(var i=0; i<lines.length; i++){
				if(lines[i]=='')continue;
				var obj=lines[i].split(",");
				if(client.channels.get(obj[1])!=undefined){
					botChannel[obj[0]]=client.channels.get(obj[1]);
					//start event
					eventStatus[obj[0]]=0;
					var eventTime=openTime();
					console.log("event "+timeString(eventTime));
					setTimeout(openEvent.bind(this,obj[0]),eventTime);
				}
			}
			for(x in botChannel){
				
			}
		console.log("Channel loaded!");
		channelLoaded=true;
		});
	});
	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});
	req.end();
}

function loadPrefix(){
	//load
	var result="";
	var req = http.request({
		hostname: url,
		port: 80,
		path: urlpath+'/prefix.txt',
		method: 'GET'
	}, (res) => {
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			result+=chunk;
		});
		res.on('end', () => {
			//parse
			var lines=result.split("\n");
			for(var i=0; i<lines.length; i++){
				if(lines[i]=='')continue;
				var obj=lines[i].split("|");
				prefix[obj[0]]=obj[1].replace(/!p/g,"|").replace(/!e/g,"!");
			}
		console.log("Prefix loaded!");
		});
	});
	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});
	req.end();
}
loadPrefix();

function createSaveText(){
	var savetext="";
	for(guild in adventurer){
		for(user in adventurer[guild]){
			savetext+=guild+","+user+","+
			adventurer[guild][user].level+","+
			adventurer[guild][user].experience+","+
			adventurer[guild][user].strength+","+
			adventurer[guild][user].health+","+
			adventurer[guild][user].magicpower+","+
			adventurer[guild][user].dexterity+","+
			adventurer[guild][user].agility+","+
			adventurer[guild][user].luck+","+
			adventurer[guild][user].reincarnate+","+
			adventurer[guild][user].pantsu+","+
			adventurer[guild][user].eris+"\n";
		}
	}
	return savetext;
}

function saveData(){
	var savetext=querystring.stringify({
		'data': createSaveText()
	});
	var req=http.request({
		hostname: url,
		port: 80,
		path: urlpath+'/adventurer.php',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(savetext)
		}
	},(res)=>{
		res.setEncoding('utf8');
		if(res.statusCode==200)console.log('Data saved!');
	});
	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});
	req.write(savetext);
	req.end();
}

function createQuestText(){
	var savetext="";
	for(x in questAll){
		if(questAll[x]==undefined)continue;
		//back compability
		savetext+="questAll|"+x+"|"+questAll[x][0]+"|"+questAll[x][1]+"|"+questAll[x][2].replace(/!/g,"!e").replace(/\|/g,"!p")+"|"+questAll[x][3]+"\n";
		for(y in questAllDone[x]){
			savetext+="questAllDone|"+x+"|"+y+"|"+questAllDone[x][y]+"\n";
		}
	}
	for(x in quest){
		for(y in quest[x]){
			if(quest[x][y]==undefined)continue;
			//back compability
			if(quest[x][y][3]==undefined)quest[x][y][3]=0;
			savetext+="quest|"+x+"|"+y+"|"+quest[x][y][0]+"|"+quest[x][y][1]+"|"+quest[x][y][2].replace(/!/g,"!e").replace(/\|/g,"!p")+"|"+quest[x][y][3]+"\n";
			if(questDone[x][y]==undefined)continue;
			savetext+="questDone|"+x+"|"+y+"|"+questDone[x][y]+"\n";
		}
	}
	return savetext;
}

function saveQuest(){
	var savetext=querystring.stringify({
		'data': createQuestText()
	});
	var req=http.request({
		hostname: url,
		port: 80,
		path: urlpath+'/quest.php',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(savetext)
		}
	},(res)=>{
		res.setEncoding('utf8');
		if(res.statusCode==200)console.log('Quest saved!');
	});
	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});
	req.write(savetext);
	req.end();
}

function createChannelText(){
	var savetext="";
	for(guild in botChannel){
		savetext+=guild+","+botChannel[guild].id+"\n";
	}
	return savetext;
}

function saveChannel(){
	var savetext=querystring.stringify({
		'data': createChannelText()
	});
	var req=http.request({
		hostname: url,
		port: 80,
		path: urlpath+'/channel.php',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(savetext)
		}
	},(res)=>{
		res.setEncoding('utf8');
		if(res.statusCode==200)console.log('Channel saved!');
	});
	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});
	req.write(savetext);
	req.end();
}

function createPrefixText(){
	var savetext="";
	for(x in prefix){
		if(prefix[x]==undefined)continue;
		savetext+=x+"|"+prefix[x].replace(/!/g,"!e").replace(/\|/g,"!p")+"\n";
	}
	return savetext;
}

function savePrefix(){
	var savetext=querystring.stringify({
		'data': createPrefixText()
	});
	var req=http.request({
		hostname: url,
		port: 80,
		path: urlpath+'/prefix.php',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(savetext)
		}
	},(res)=>{
		res.setEncoding('utf8');
		if(res.statusCode==200)console.log('Prefix saved!');
	});
	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});
	req.write(savetext);
	req.end();
}

function helpText(guild){
	var tabspace=""; for(var i=0; i<prefix[guild].length; i++)tabspace+=" ";
	
	var text="```Commands:\n\n"+
	prefix[guild]+"prefix           change command prefix (admin only)\n"+
	prefix[guild]+"new              register as adventurer\n"+
	prefix[guild]+"stat             check your stats\n"+
	prefix[guild]+"fight            fight someone\n"+
	prefix[guild]+"reincarnate      RESET to Lv 1 with bonus stat!\n"+
	tabspace+"                 DO AT YOUR OWN RISK\n"+
	tabspace+"                 alias: rein\n"+
	prefix[guild]+"leaderboard      show top 10 level adventurers\n"+
	tabspace+"                 alias: lead\n"+
	prefix[guild]+"hall of fame     show special adventurers\n"+
	tabspace+"                 alias: fame\n"+
	prefix[guild]+"issue quest      issue a quest for all\n"+
	prefix[guild]+"quest start      start a quest for yourself\n"+
	prefix[guild]+"quest list       show quest available\n"+
	//"transfer eris    transfer eris to others\n"+
	//"transfer pantsu  transfer pantsu to others\n"+
	prefix[guild]+"roulette         play roulette\n"+
	tabspace+"                 alias: roll\n"+
	"@"+client.user.username+"#"+client.user.discriminator+" here"+"   start event in the channel\n"+
	"```";
	
	return text;
}

function timeString(millis){
	var seconds=Math.ceil(millis/1000);
	var minutes=0;
	if(seconds>=60){minutes=Math.floor(seconds/60); seconds%=60;}
	var hours=0;
	if(minutes>=60){hours=Math.floor(minutes/60); minutes%=60;}
	var text="";
	if(hours>0)text+=hours+" hours";
	if(text!="")text+=" ";
	if(minutes>0)text+=minutes+" minutes";
	if(text!="")text+=" ";
	if(seconds>0)text+=seconds+" seconds";
	return text;
}

function respond(obj, msg){
	obj.send(msg)
	.catch(error => {console.log("Caught "+error.name+": "+error.message+" (code: "+error.code+")");});
}

var bully=0;
var word="asdfghjkl";
var owner="000000000000000000";

client.on("message", msg => {
	if(msg.author.bot)return;
	var content=msg.content.toLowerCase();
	
	if(msg.guild==null){
		//private msg cmd
		if(msg.author.id==owner){
			if(content.startsWith("say ")){
				var index=content.indexOf(' ');
				var channel=msg.content.substr(index+1);
				index=channel.indexOf(' ');
				if(index==-1)return;
				var say=channel.substr(index+1);
				channel=channel.substr(0,index);
				if(client.channels.get(channel)==undefined)return;
				client.channels.get(channel).send(say)
				.catch(error => {console.log(error.name+": "+error.message+" (code: "+error.code+")");});
			}
			//announce
			else if(content.startsWith("announce ")){
				var index=content.indexOf(' ');
				var say=msg.content.substr(index+1);
				for(guild in botChannel)botChannel[guild].send(say)
				.catch(error => {console.log(error.name+": "+error.message+" (code: "+error.code+")");});
			}
		}
		return;
	}
	
	//new server prefix
	if(prefix[msg.guild.id]==undefined)prefix[msg.guild.id]=default_prefix;
	//prefix check
	if(prefix[msg.guild.id]==msg.content.substr(0,prefix[msg.guild.id].length))
		content=msg.content.toLowerCase().substr(prefix[msg.guild.id].length);
	//mention bot
	else if(msg.content.startsWith("<@"+client.user.id+">") || msg.content.startsWith("<@!"+client.user.id+">"))
		content=msg.content.toLowerCase();
	else content="";
	
	//sulk
	if(msg.author.id==owner && content.startsWith("sulk")){
		if(sulk==0)sulk=msg.guild.id;
		else sulk=0;
		respond(msg.channel, "O7");
		return;
	}
	if(sulk!=0){
		if(msg.guild.id==sulk){
			respond(msg.channel, word);
			return;
		}
	}
	
	//bully people
	if(bully!=0){
		if(msg.author.id==bully){
			respond(msg.channel, word);
		}
	}
	//admin target bully
	if(msg.author.id==owner && content.startsWith("bully <@")){
		bully=msg.mentions.users.firstKey();
		respond(msg.channel, "O7");
		return;
	}
	else if(msg.author.id==owner && content.startsWith("bully ")){
		bully=content.substr(6);
		respond(msg.channel, "O7");
		return;
	}
	//stop bully
	if(msg.author.id==owner && content.startsWith("stop")){
		bully=0;
		respond(msg.channel, "O7");
		return;
	}
	//set bully word
	if(msg.author.id==owner && content.startsWith("word ")){
		word=msg.content.substr(prefix[msg.guild.id].length+5);
		respond(msg.channel, "O7");
		return;
	}
	//repeat message
	if(msg.author.id==owner && content.startsWith("say ")){
		respond(msg.channel, msg.content.substr(prefix[msg.guild.id].length+4));
		return;
	}
	//set nickname
	if(msg.author.id==owner && content.startsWith("nick ")){
		msg.guild.members.get(client.user.id).setNickname(msg.content.substr(prefix[msg.guild.id].length+5));
		respond(msg.channel, "O7");
		return;
	}
	//reload
	if(msg.author.id==owner && content.startsWith("reload")){
		console.log('reloading...');
		loadAdventurer();
		loadQuest();
		loadChannel();
		loadPrefix();
		respond(msg.channel, "RELOADED!");
		return;
	}
	//eval
	if(msg.author.id==owner && content.startsWith("eval ")){
		var exec=msg.content.substr(prefix[msg.guild.id].length+5);
		console.log(exec);
		eval(exec);
	}
	
	//za warudo
	if(msg.author.id!=owner && zawarudo!=0)return;
	
	//new server
	if(adventurer[msg.guild.id]==undefined)adventurer[msg.guild.id]={};
	if(fightCooldown[msg.guild.id]==undefined)fightCooldown[msg.guild.id]={};
	if(quest[msg.guild.id]==undefined)quest[msg.guild.id]={};
	if(questAllDone[msg.guild.id]==undefined)questAllDone[msg.guild.id]={};
	if(questDone[msg.guild.id]==undefined)questDone[msg.guild.id]={};
	
	//set prefix
	if(content.startsWith("prefix ") && content.length>7){
		//check perm
		if(msg.guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR") || msg.author.id==owner){//or owner
			prefix[msg.guild.id]=content.substr(7);
			respond(msg.channel, 'prefix is now: `'+prefix[msg.guild.id]+'`');
			savePrefix();
			return;
		}
		respond(msg.channel, 'admin permission required');
		return;
	}
	
	//mention bot
	if(content.startsWith("<@"+client.user.id+">") || content.startsWith("<@!"+client.user.id+">")){
		var cmd=content.substr(content.indexOf(">")+2);
		//set channel
		if(cmd.startsWith("here")){
			botChannel[msg.guild.id]=msg.channel;
			if(eventStatus[msg.guild.id]==undefined){
				eventStatus[msg.guild.id]=0;
				var eventTime=openTime();
				setTimeout(openEvent.bind(this,msg.guild.id),eventTime);
			}
			respond(msg.channel, "Roger");
			saveChannel();
			return;
		}
		//unset channel
		if(cmd.startsWith("stop")){
			if(botChannel[msg.guild.id]!=undefined){
				if(botChannel[msg.guild.id]==msg.channel){
					delete botChannel[msg.guild.id];////untested
					respond(msg.channel, "Roger");
					saveChannel();
				}
			}
			return;
		}
		//owner command
		if(msg.author.id==owner){
			//play games
			if(cmd.startsWith("play ")){
				game=msg.content.substr(msg.content.indexOf('>')+2+"play ".length);
				if(game.length>0){
					console.log("playing "+game);
					client.user.setGame(game);
					return;
				}
			}
			//za warudo
			if(cmd.startsWith("za warudo")){
				if(zawarudo==0){
					respond(msg.channel, "Toki wo tomare!");
					zawarudo=1;
				}
				else {
					respond(msg.channel, "Soshite toki wo ugokidashita");
					zawarudo=0;
				}
				return;
			}
		}
		//help
		respond(msg.channel, helpText(msg.guild.id));
	}
	
	//help
	else if(content.startsWith("help") || content=="command" || content=="commands") {
		respond(msg.channel, helpText(msg.guild.id));
	}
	
	//new adventurer
	else if(content.startsWith("new")) {
		if(adventurer[msg.guild.id][msg.author.id]==undefined){
			console.log("new");
			adventurer[msg.guild.id][msg.author.id]=new Adventurer();
			respond(msg.channel, msg.author+" is now an adventurer!");
			//save
			saveData();
		}
		else respond(msg.channel, msg.author+" is already an adventurer!");
    }
	
	//adventurer stat
	else if(content.startsWith("stat")) {
		console.log("stat");
		//stats of preset character
		if(content.startsWith("stat kazuma")) respond(msg.channel, Adventurer.Kazuma.stats("Kazuma"));
		else if(content.startsWith("stat aqua")) respond(msg.channel, Adventurer.Aqua.stats("Aqua"));
		else if(content.startsWith("stat megumin")) respond(msg.channel, Adventurer.Megumin.stats("Megumin"));
		//is mentioned
		else if(msg.mentions.users.array().length>0) {
			var mentionID=msg.mentions.users.firstKey();
			var mentionUser=client.users.get(mentionID);
			//check mentioned is not this bot
			if(mentionID==client.user.id) respond(msg.channel, msg.author+" if you fight me, you'll understand...");
			//check mentioned is not adventurer
			else if(adventurer[msg.guild.id][mentionID]!=undefined) respond(msg.channel, adventurer[msg.guild.id][mentionID].stats(mentionUser.username));
			else respond(msg.channel, mentionUser+" is not an adventurer!");
		}
		//self (check is adventurer)
		else if(adventurer[msg.guild.id][msg.author.id]!=undefined) respond(msg.channel, adventurer[msg.guild.id][msg.author.id].stats(msg.author.username));
		else respond(msg.channel, msg.author+" is not an adventurer! Use `"+prefix[msg.guild.id]+"new` command!");
	}
	
	//fight
	else if(content.startsWith("fight")) {
		//check adventurer
		if(adventurer[msg.guild.id][msg.author.id]!=undefined){
			//check cooldown
			if(fightCooldown[msg.guild.id][msg.author.id]==undefined)fightCooldown[msg.guild.id][msg.author.id]=[0,0];
			var timeLeft=(fightCooldown[msg.guild.id][msg.author.id][1]*1000)-(new Date().getTime()-fightCooldown[msg.guild.id][msg.author.id][0]);
			if(timeLeft>0){
				respond(msg.channel, msg.author+" you are too tired, rest "+timeString(timeLeft)+" more!");
				return;
			}
			console.log("fight");
			var prelevel=adventurer[msg.guild.id][msg.author.id].level;
			//if event
			if(content.startsWith("fight event") && eventStatus[msg.guild.id]==2){
				if(participator[msg.guild.id][msg.author.id]==undefined){
					participator[msg.guild.id][msg.author.id]=new LiveAdv(adventurer[msg.guild.id][msg.author.id]);
				}
				//check dead
				if(participator[msg.guild.id][msg.author.id].hp<=0){
					respond(msg.channel, msg.author+" you are dead!");
					return;
				}
				var eventName=event[msg.guild.id][5];
				var result=participator[msg.guild.id][msg.author.id].combat(msg.author.username,eventName,adventurer[msg.guild.id][msg.author.id],adversaries[msg.guild.id][0],adversaries[msg.guild.id][1]);
				respond(msg.channel, "```"+result+"\n\n"+eventName+" ("+adversaries[msg.guild.id][1].hpInfo(adversaries[msg.guild.id][0])+")```");
				//if win
				if(adversaries[msg.guild.id][1].hp<=0){
					adversaries[msg.guild.id][2]--;
					//cabbage
					if(event[msg.guild.id][0]==2){
						adventurer[msg.guild.id][msg.author.id].eris+=10000;
						adventurer[msg.guild.id][msg.author.id].getExp(100);
						adversaries[msg.guild.id][1]=new LiveAdv(adversaries[msg.guild.id][0]);
						respond(msg.channel, "*throws 10,000 eris at* "+msg.author);
					}
					//cicada
					if(event[msg.guild.id][0]==3){
						adventurer[msg.guild.id][msg.author.id].getExp(adversaries[msg.guild.id][0].level);
						adversaries[msg.guild.id][0]=adversaries[msg.guild.id][0].addStat(getCicada());
						adversaries[msg.guild.id][1]=new LiveAdv(adversaries[msg.guild.id][0]);
					}
					//snow sprite
					if(event[msg.guild.id][0]==4){
						adventurer[msg.guild.id][msg.author.id].eris+=100000;
						adventurer[msg.guild.id][msg.author.id].getExp(adversaries[msg.guild.id][0].level);
						adversaries[msg.guild.id][0]=getSnowSprite();
						adversaries[msg.guild.id][1]=new LiveAdv(adversaries[msg.guild.id][0]);
						event[msg.guild.id][5]="Snow Sprite";
						respond(msg.channel, "*throws 100,000 eris at* "+msg.author);
						//winter shogun
						if(Math.random()<0.10){//10%
							adversaries[msg.guild.id][2]++;
							adversaries[msg.guild.id][0]=getWinterShogun();
							adversaries[msg.guild.id][1]=new LiveAdv(adversaries[msg.guild.id][0]);
							event[msg.guild.id][5]="Winter Shogun";
							respond(msg.channel, "**Winter Shogun appeared!**");
						}
					}
					if(adversaries[msg.guild.id][2]<=0){
						clearTimeout(closingEvent[msg.guild.id]);
						closeEvent(msg.guild.id,true);
					}
					else {
						if(event[msg.guild.id][5]!="Winter Shogun")respond(msg.channel, adversaries[msg.guild.id][2]+" "+event[msg.guild.id][5]+" left...");
					}
				}
				fightCooldown[msg.guild.id][msg.author.id]=[new Date().getTime(),10]; // 10 sec cooldown
				//check lv up
				if(adventurer[msg.guild.id][msg.author.id].level>prelevel) respond(msg.channel, msg.author+" leveled up!");
				//save
				saveData();
				return;
			}
			//if preset enemy
			if(content.startsWith("fight kazuma")) {
				var battleLog=adventurer[msg.guild.id][msg.author.id].fight(msg.author.username,"Kazuma",Adventurer.Kazuma);
				respond(msg.channel, "```"+battleLog+"```");
				fightCooldown[msg.guild.id][msg.author.id]=[new Date().getTime(),10];
			}
			else if(content.startsWith("fight aqua")) {
				var battleLog=adventurer[msg.guild.id][msg.author.id].fight(msg.author.username,"Aqua",Adventurer.Aqua);
				respond(msg.channel, "```"+battleLog+"```");
				fightCooldown[msg.guild.id][msg.author.id]=[new Date().getTime(),10];
			}
			else if(content.startsWith("fight megumin")) {
				var battleLog=adventurer[msg.guild.id][msg.author.id].fight(msg.author.username,"Megumin",Adventurer.Megumin);
				respond(msg.channel, "```"+battleLog+"```");
				fightCooldown[msg.guild.id][msg.author.id]=[new Date().getTime(),10];
			}
			else {
				var enemyID=undefined;
				//check no mention
				if(msg.mentions.users.array().length==0){
					//not mention
					var indexTarget=msg.content.indexOf('fight ');
					if(indexTarget==-1){
						//usage help
						respond(msg.channel, "```Usage:\n"+prefix[msg.guild.id]+"fight <mention>\n\npreset enemy available: Kazuma, Aqua, Megumin\n\nExample:\n"+prefix[msg.guild.id]+"fight Kazuma```");
						return;
					}
					var target=msg.content.trim().substr(indexTarget+'fight '.length);
					//username
					enemyID=msg.guild.members.find(val => val.user.username==target);
					if(enemyID==null){
						//nickname
						enemyID=msg.guild.members.find('nickname',target);
						if(enemyID==null){
							//usage help
							respond(msg.channel, "```Usage:\n"+prefix[msg.guild.id]+"fight <mention>\n\npreset enemy available: Kazuma, Aqua, Megumin\n\nExample:\n"+prefix[msg.guild.id]+"fight Kazuma```");
							return;
						}
						else
							enemyID=enemyID.user.id;
					}
					else
						enemyID=enemyID.id
				}
				else 
					enemyID=msg.mentions.users.firstKey();
				if(enemyID==undefined || enemyID==null)return;
				//check enemy is not self
				if(msg.author.id==enemyID){
					respond(msg.channel, msg.author+" don't do this to yourself!");
					return;
				}
				//check enemy is this bot
				if(enemyID==client.user.id){
					respond(msg.channel, msg.author+" thou hath challengeth me, now feel my wrath!");
					var shadow=adventurer[msg.guild.id][msg.author.id].getShadow(3);
					var battleLog=adventurer[msg.guild.id][msg.author.id].fight(msg.author.username,client.user.username,shadow);
					respond(msg.channel, "```"+battleLog+"```");
					fightCooldown[msg.guild.id][msg.author.id]=[new Date().getTime(),10];
					if(!battleLog.endsWith(client.user.username+" wins!\n")){
						//eris reward
						var reward=Math.ceil(Math.random()*adventurer[msg.guild.id][msg.author.id].level);
						adventurer[msg.guild.id][msg.author.id].eris+=reward;
						respond(msg.channel, msg.author+" thy shalt remember 'tis!\nYou stole "+reward+" eris from the guild!");
					}
					return;
				}
				var enemyUser=client.users.get(enemyID);
				//check enemy is adventurer
				if(adventurer[msg.guild.id][enemyID]!=undefined){
					var prelevel2=adventurer[msg.guild.id][enemyID].level;
					var battleLog=adventurer[msg.guild.id][msg.author.id].fight(msg.author.username,enemyUser.username,adventurer[msg.guild.id][enemyID]);
					respond(msg.channel, "```"+battleLog+"```");
					fightCooldown[msg.guild.id][msg.author.id]=[new Date().getTime(),10];
					if(adventurer[msg.guild.id][enemyID].level>prelevel2) respond(msg.channel, enemyUser+" leveled up!");
					//check quests if win
					if(battleLog.endsWith(msg.author.username+" wins!\n")){
						if(questAll[msg.guild.id]!=undefined){
							if(enemyID==questAll[msg.guild.id][0]){
								if(questAllDone[msg.guild.id][msg.author.id]==undefined)questAllDone[msg.guild.id][msg.author.id]=0;
								questAllDone[msg.guild.id][msg.author.id]++;
								//check quest complete
								if(questAllDone[msg.guild.id][msg.author.id]>=questAll[msg.guild.id][1]){
									//reward & reset quest (quest all reward x3)
									var reward=Math.ceil(Math.random()*adventurer[msg.guild.id][questAll[msg.guild.id][0]].level*questAll[msg.guild.id][1]*3);
									adventurer[msg.guild.id][msg.author.id].eris+=reward;
									questAll[msg.guild.id]=undefined;
									respond(msg.channel, msg.author+"You have completed the shared quest!\n*throws "+reward+" eris at you*");
								}
							}
						}
						if(quest[msg.guild.id][msg.author.id]!=undefined){
							if(enemyID==quest[msg.guild.id][msg.author.id][0]){
								questDone[msg.guild.id][msg.author.id]++;
								//check quest complete
								if(questDone[msg.guild.id][msg.author.id]>=quest[msg.guild.id][msg.author.id][1]){
									//reward & reset quest
									var reward=Math.ceil(Math.random()*adventurer[msg.guild.id][quest[msg.guild.id][msg.author.id][0]].level*quest[msg.guild.id][msg.author.id][1]);
									adventurer[msg.guild.id][msg.author.id].eris+=reward;
									quest[msg.guild.id][msg.author.id]=undefined;
									respond(msg.channel, msg.author+"You have completed the personal quest!\n*throws "+reward+" eris at you*");
								}
							}
						}
						//save
						saveQuest();
					}
				}
				else respond(msg.channel, enemyUser+" is not an adventurer!");
			}
			if(adventurer[msg.guild.id][msg.author.id].level>prelevel) respond(msg.channel, msg.author+" leveled up!");
			//save
			saveData();
		}
		else respond(msg.channel, msg.author+" is not an adventurer! Use `"+prefix[msg.guild.id]+"new` command!");
	}
	
	//reincarnate
	else if(content=="reincarnate" || content=="rein"){
		//check is adventurer
		if(adventurer[msg.guild.id][msg.author.id]!=undefined){
			console.log("reincarnate");
			adventurer[msg.guild.id][msg.author.id].reincarnation();
			respond(msg.channel, msg.author+" have reincarnated");
			//save
			saveData();
		}
		else respond(msg.channel, msg.author+" is not an adventurer! Use `"+prefix[msg.guild.id]+"new` command!");
	}
	
	//leaderboard
	else if(content=="leaderboard" || content=="lead"){
		console.log("leaderboard");
		var server=JSON.parse(JSON.stringify(adventurer[msg.guild.id]));
		var top;
		var text="";
		for(i=0; i<10; i++){
			//count objects
			var length=0;
			for(x in server)length++;
			if(length<=0)break;
			for(x in server){
				if(top==undefined)top=x;
				else if(server[x].level>server[top].level)top=x;
			}
			if(client.users.get(top)!=undefined)
				text+=(i+1)+". "+client.users.get(top).username+" Lv "+server[top].level+"\n";
			else
				i--;
			delete server[top];
			top=undefined;
		}
		if(text=="")respond(msg.channel, "There is no adventurer :frowning:");
		else respond(msg.channel, "```"+text+"```");
	}
	
	//hall of fame
	else if(content=="hall of fame" || content=="fame"){
		var server=adventurer[msg.guild.id];
		var top;
		var text="";
		//no adventurer
		var length=0;
		for(x in server)length++;
		if(length<=0){
			respond(msg.channel, "There is no adventurer :frowning:");
			return;
		}
		console.log("hall of fame");
		for(x in server){
			if(top==undefined)top=x;
			else if(server[x].level>server[top].level)top=x;
		}
		text+="Highest Lv  : "+client.users.get(top).username+" ("+server[top].level+")\n";
		for(x in server){
			if(top==undefined)top=x;
			else if(server[x].strength>server[top].strength)top=x;
		}
		text+="Highest STR : "+client.users.get(top).username+" ("+server[top].strength+")\n";
		for(x in server){
			if(top==undefined)top=x;
			else if(server[x].health>server[top].health)top=x;
		}
		text+="Highest HP  : "+client.users.get(top).username+" ("+server[top].health+")\n";
		for(x in server){
			if(top==undefined)top=x;
			else if(server[x].magicpower>server[top].magicpower)top=x;
		}
		text+="Highest MAG : "+client.users.get(top).username+" ("+server[top].magicpower+")\n";
		for(x in server){
			if(top==undefined)top=x;
			else if(server[x].dexterity>server[top].dexterity)top=x;
		}
		text+="Highest DEX : "+client.users.get(top).username+" ("+server[top].dexterity+")\n";
		for(x in server){
			if(top==undefined)top=x;
			else if(server[x].agility>server[top].agility)top=x;
		}
		text+="Highest AGI : "+client.users.get(top).username+" ("+server[top].agility+")\n";
		for(x in server){
			if(top==undefined)top=x;
			else if(server[x].luck>server[top].luck)top=x;
		}
		text+="Highest LUCK: "+client.users.get(top).username+" ("+server[top].luck+")\n";
		for(x in server){
			if(top==undefined)top=x;
			else if(server[x].eris>server[top].eris)top=x;
		}
		text+="Most eris   : "+client.users.get(top).username+" ("+server[top].eris+")\n";
		for(x in server){
			if(top==undefined)top=x;
			else if(server[x].pantsu>server[top].pantsu)top=x;
		}
		text+="Most Pantsu : "+client.users.get(top).username+" ("+server[top].pantsu+")\n";
		respond(msg.channel, "```"+text+"```");
	}
	
	//issue (shared) quest
	else if(content=="issue quest"){
		//check cooldown
		if(questAll[msg.guild.id]!=undefined){
			//cooldown = 1hr
			var timePassed=new Date().getTime()-questAll[msg.guild.id][3];
			if(timePassed<3600000){
				respond(msg.channel, "It's too soon to give up! Try again "+timeString(3600000-timePassed)+" later.");
				return;
			}
		}
		//copy adventurer ID
		var arrayID=[];
		var length=0;
		for(x in adventurer[msg.guild.id]){
			if(client.users.get(x)!=undefined){//user quit and isnt related to bot anymore
				arrayID[length]=x;
				length++;
			}
		}
		//not enough adventurer
		if(length<1){
			respond(msg.channel, "Not enough adventurer! At least 1 is needed");
			return;
		}
		console.log("issue quest");
		//target id, kill needed, flavor
		questAll[msg.guild.id]=[arrayID[Math.floor(Math.random()*arrayID.length)],Math.ceil(Math.random()*3+1)*5,questFlavor[Math.floor(Math.random()*questFlavor.length)],new Date().getTime()];
		questAllDone[msg.guild.id]={};
		respond(msg.channel, "Quest issued!\nKill "+questAll[msg.guild.id][1]+" "+client.users.get(questAll[msg.guild.id][0]).username+"!\n"+questAll[msg.guild.id][2]);
		//save
		saveQuest();
	}
	
	//start (personal) quest
	else if(content=="quest start"){
		//check is adventurer
		if(adventurer[msg.guild.id][msg.author.id]==undefined){
			respond(msg.channel, msg.author+" is not an adventurer! Use `"+prefix[msg.guild.id]+"new` command!");
			return;
		}
		//copy adventurer ID
		var arrayID=[];
		var length=0;
		for(x in adventurer[msg.guild.id]){
			arrayID[length]=x;
			length++;
		}
		//not enough adventurer
		if(length<2){
			respond(msg.channel, "Not enough adventurer! At least 2 is needed");
			return;
		}
		//check cooldown
		if(quest[msg.guild.id][msg.author.id]!=undefined){
			//cooldown = 1hr
			var timePassed=new Date().getTime()-quest[msg.guild.id][msg.author.id][3];
			if(timePassed<3600000){
				respond(msg.channel, "It's too soon to give up! Try again "+timeString(3600000-timePassed)+" later.");
				return;
			}
		}
		console.log("quest start");
		var randomID;
		//target must not be itself & still exist
		while(randomID==undefined || randomID==msg.author.id || client.users.get(randomID)==undefined)randomID=arrayID[Math.floor(Math.random()*arrayID.length)];
		//target id, kill needed, flavor
		quest[msg.guild.id][msg.author.id]=[randomID,Math.ceil(Math.random()*3+1)*5,questFlavor[Math.floor(Math.random()*questFlavor.length)],new Date().getTime()];
		questDone[msg.guild.id][msg.author.id]=0;
		respond(msg.channel, "Quest started!\nKill "+quest[msg.guild.id][msg.author.id][1]+" "+client.users.get(quest[msg.guild.id][msg.author.id][0]).username+"!\n"+quest[msg.guild.id][msg.author.id][2]);
		//save
		saveQuest();
	}
	
	//quest list
	else if(content=="quest list"){
		//check is adventurer
		if(adventurer[msg.guild.id][msg.author.id]==undefined){
			respond(msg.channel, msg.author+" is not an adventurer! Use `"+prefix[msg.guild.id]+"new` command!");
			return;
		}
		console.log("quest list");
		var text="Shared Quest:\n";
		if(questAll[msg.guild.id]!=undefined){
			if(client.users.get(questAll[msg.guild.id][0])!=undefined){
				if(client.guilds.get(msg.guild.id).members.has(client.users.get(questAll[msg.guild.id][0]))){
					text+="None";
					questAll[msg.guild.id]=undefined;
				}
				text+="Kill "+questAll[msg.guild.id][1]+" "+client.users.get(questAll[msg.guild.id][0]).username+"!\n"+questAll[msg.guild.id][2];
				if(questAllDone[msg.guild.id][msg.author.id]==undefined)questAllDone[msg.guild.id][msg.author.id]=0;
				text+="\nKilled: "+questAllDone[msg.guild.id][msg.author.id];
			}
			else {
				text+="None";
				questAll[msg.guild.id]=undefined;
			}
		}
		else text+="None";
		text+="\n\nPersonal Quest:\n";
		if(quest[msg.guild.id][msg.author.id]!=undefined){
			if(client.users.get(quest[msg.guild.id][msg.author.id][0])!=undefined){
				if(client.guilds.get(msg.guild.id).members.has(client.users.get(quest[msg.guild.id][msg.author.id][0]))){
					text+="None";
					quest[msg.guild.id][msg.author.id]=undefined;
				}
				text+="Kill "+quest[msg.guild.id][msg.author.id][1]+" "+client.users.get(quest[msg.guild.id][msg.author.id][0]).username+"!\n"+quest[msg.guild.id][msg.author.id][2]+"\nKilled: "+questDone[msg.guild.id][msg.author.id];
			}
			else{
				text+="None";
				quest[msg.guild.id][msg.author.id]=undefined;
			}
		}
		else text+="None";
		respond(msg.channel, "```"+text+"```");
	}
	
	/*//transfer
	else if(content.startsWith("transfer ")){
		//check is adventurer
		if(adventurer[msg.guild.id][msg.author.id]==undefined){
			respond(msg.channel, msg.author+" is not an adventurer! Use `new adventurer` command!");
			return;
		}
		if(content.startsWith("transfer eris")){
			var passed=true;
			//check no mention
			if(msg.mentions.users.array().length==0 || !content.startsWith("transfer eris <@"))
				passed=false;
			//check sum
			var sum=content.substr(content.indexOf(">")+2).trim().split(" ")[0];
			if(isNaN(parseInt(sum)) || !isFinite(sum) || sum.indexOf(".")>=0 || !passed){
				//usage help
				respond(msg.channel, "```Usage:\ntransfer eris <mention> <sum>\n\nInfo:\ntransfer eris to others```");
				return;
			}
			sum=parseInt(sum);
			var targetID=msg.mentions.users.firstKey();
			var targetUser=client.users.get(targetID);
			//check enough balance
			if(adventurer[msg.guild.id][msg.author.id].eris<sum){
				respond(msg.channel, msg.author+" short on money? Do some quest!");
				return;
			}
			//check target is not self
			if(msg.author.id==targetID){
				respond(msg.channel, msg.author+" *throws back your money*");
				return;
			}
			//check target is adventurer
			if(adventurer[msg.guild.id][targetID]==undefined){
				respond(msg.channel, targetUser+" is not an adventurer!");
				return;
			}
			console.log("transfer eris");
			adventurer[msg.guild.id][msg.author.id].eris-=sum;
			adventurer[msg.guild.id][targetID].eris+=sum;
			respond(msg.channel, msg.author+" has given "+targetUser+" "+sum+" eris. Be thankful!");
			//save
			saveData();
		}
		else if(content.startsWith("transfer pantsu")){
			var passed=true;
			//check no mention
			if(msg.mentions.users.array().length==0 || !content.startsWith("transfer pantsu <@"))
				passed=false;
			//check sum
			var sum=content.substr(content.indexOf(">")+2).trim().split(" ")[0];
			if(isNaN(parseInt(sum)) || !isFinite(sum) || sum.indexOf(".")>=0 || !passed){
				//usage help
				respond(msg.channel, "```Usage:\ntransfer pantsu <mention> <sum>\n\nInfo:\ntransfer pantsu to others```");
				return;
			}
			sum=parseInt(sum);
			var targetID=msg.mentions.users.firstKey();
			var targetUser=client.users.get(targetID);
			//check enough pantsu
			if(adventurer[msg.guild.id][msg.author.id].pantsu<sum){
				respond(msg.channel, msg.author+" you don't have the *goods*, go steal some!");
				return;
			}
			//check target is not self
			if(msg.author.id==targetID){
				respond(msg.channel, msg.author+" *throws back your pantsu*");
				return;
			}
			//check target is adventurer
			if(adventurer[msg.guild.id][targetID]==undefined){
				respond(msg.channel, targetUser+" is not an adventurer!");
				return;
			}
			console.log("transfer pantsu");
			adventurer[msg.guild.id][msg.author.id].pantsu-=sum;
			adventurer[msg.guild.id][targetID].pantsu+=sum;
			respond(msg.channel, msg.author+" has *sneakily* given "+targetUser+" "+sum+" pantsu(s). Be grateful!");
			//save
			saveData();
		}
	}*/
	
	//shop list
	else if(content=="shop list" && eventStatus[msg.guild.id]==1){
		respond(msg.channel, "To buy use `"+prefix[msg.guild.id]+"shop <item number>` command\n"+
		"```Welcome to Wiz Shop!\n\n"+
		"1. Potion      (100 eris) Restores HP\n"+
		"2. Wiz Special (9 pantsu) Permanently increase random stat (limited offer)\n"+
		"\n(item will vaporate after the event ended)```");
	}
	
	//shop buy
	else if(content.startsWith("shop ") && eventStatus[msg.guild.id]==1){
		//check is adventurer
		if(adventurer[msg.guild.id][msg.author.id]==undefined){
			respond(msg.channel, msg.author+" is not an adventurer! Use `"+prefix[msg.guild.id]+"new` command!");
			return;
		}
		var number=content.substr(5);
		if(number=="1"){
			//potion
			//check eris
			var price=100;
			if(adventurer[msg.guild.id][msg.author.id].eris<price){
				respond(msg.channel, msg.author+" short on money? Go home!");
				return;
			}
			if(participator[msg.guild.id][msg.author.id]==undefined){
				participator[msg.guild.id][msg.author.id]=new LiveAdv(adventurer[msg.guild.id][msg.author.id]);
			}
			adventurer[msg.guild.id][msg.author.id].eris-=price;
			participator[msg.guild.id][msg.author.id].potion++;
			respond(msg.channel, msg.author+" bought potion!");
			//save
			saveData();
		}
		else if(number=="2"){
			//Wiz Special
			//check pantsu
			var price=9;
			if(adventurer[msg.guild.id][msg.author.id].pantsu<price){
				respond(msg.channel, msg.author+" short on pantsu? ¯\\\_(ツ)\_/¯");
				return;
			}
			adventurer[msg.guild.id][msg.author.id].pantsu-=price;
			adventurer[msg.guild.id][msg.author.id].randomGain();
			respond(msg.channel, msg.author+" bought Wiz Special... He feels kinda stronger");
			//save
			saveData();
		}
	}
	
	//command list
	else if(content=="command list" && eventStatus[msg.guild.id]==2){
		respond(msg.channel, "```Commands:\n\n"+
		prefix[msg.guild.id]+"fight event  fight the boss\n"+
		prefix[msg.guild.id]+"check party  see party's HP\n"+
		prefix[msg.guild.id]+"use potion   use your potion on someone\n"+
		prefix[msg.guild.id]+"revive       revive comrades for 10,000 eris (not self)\n"+
		"```");
	}
	
	//check party
	else if(content=="check party" && eventStatus[msg.guild.id]>=1){
		var text="```\n";
		for(x in participator[msg.guild.id]){
			text+=client.users.get(x).username+"\n"+participator[msg.guild.id][x].stat(adventurer[msg.guild.id][x])+"\n\n";
		}
		respond(msg.channel, text+"```");
	}
	
	//potion
	else if(content.startsWith("use potion") && eventStatus[msg.guild.id]==2){
		//check is adventurer
		if(adventurer[msg.guild.id][msg.author.id]==undefined){
			respond(msg.channel, msg.author+" is not an adventurer! Use `"+prefix[msg.guild.id]+"new` command!");
			return;
		}
		if(participator[msg.guild.id][msg.author.id]==undefined){
			participator[msg.guild.id][msg.author.id]=new LiveAdv(adventurer[msg.guild.id][msg.author.id]);
		}
		//check target
		if(msg.mentions.users.array().length>0) {
			var mentionID=msg.mentions.users.firstKey();
			var mentionUser=client.users.get(mentionID);
			//check mentioned is not adventurer
			if(adventurer[msg.guild.id][mentionID]!=undefined){
				if(participator[msg.guild.id][mentionID]==undefined){
					participator[msg.guild.id][mentionID]=new LiveAdv(adventurer[msg.guild.id][mentionID]);
				}
				var result=participator[msg.guild.id][msg.author.id].usePotion(adventurer[msg.guild.id][mentionID],participator[msg.guild.id][mentionID]);
				if(result.indexOf("dead")<0 && result.indexOf("any"))
					respond(msg.channel, msg.author+result+mentionUser+"```"+mentionUser.username+"\n"+participator[msg.guild.id][mentionID].stat(adventurer[msg.guild.id][mentionID])+"```");
				else respond(msg.channel, msg.author+result);
			}
			else respond(msg.channel, mentionUser+" is not an adventurer!");
		}
		//self
		else if(adventurer[msg.guild.id][msg.author.id]!=undefined){
			var result=participator[msg.guild.id][msg.author.id].usePotion(adventurer[msg.guild.id][msg.author.id],participator[msg.guild.id][msg.author.id]);
			if(result.indexOf("dead")<0 && result.indexOf("any"))
				respond(msg.channel, msg.author+result+"\n```"+msg.author.username+"\n"+participator[msg.guild.id][msg.author.id].stat(adventurer[msg.guild.id][msg.author.id])+"```");
			else respond(msg.channel, msg.author+result);
		}
	}
	
	//revive
	else if(content.startsWith("revive ") && eventStatus[msg.guild.id]==2){
		//check is adventurer
		if(adventurer[msg.guild.id][msg.author.id]==undefined){
			respond(msg.channel, msg.author+" is not an adventurer! Use `"+prefix[msg.guild.id]+"new` command!");
			return;
		}
		if(participator[msg.guild.id][msg.author.id]==undefined){
			participator[msg.guild.id][msg.author.id]=new LiveAdv(adventurer[msg.guild.id][msg.author.id]);
		}
		//check target
		if(msg.mentions.users.array().length>0) {
			var mentionID=msg.mentions.users.firstKey();
			var mentionUser=client.users.get(mentionID);
			//check mentioned is not adventurer
			if(adventurer[msg.guild.id][mentionID]!=undefined){
				if(participator[msg.guild.id][mentionID]==undefined){
					participator[msg.guild.id][mentionID]=new LiveAdv(adventurer[msg.guild.id][mentionID]);
				}
				//check target dead
				if(participator[msg.guild.id][mentionID].hp>0){
					respond(msg.channel, mentionUser+" is not dead yet, baka!");
					return;
				}
				//check mentioned is yourself
				if(mentionID==msg.author.id){
					respond(msg.channel, msg.author+" you are now a corpse. So stay still.");
					return;
				}
				//check money
				var price=10000;
				if(adventurer[msg.guild.id][msg.author.id].eris<price){
					respond(msg.channel, msg.author+" Aqua doesn't feel you have enough ~~money~~ faith");
					return;
				}
				adventurer[msg.guild.id][msg.author.id].eris-=price;
				participator[msg.guild.id][mentionID].revive(adventurer[msg.guild.id][mentionID]);
				respond(msg.channel, msg.author+" called Aqua to revive "+mentionUser+"\nThank you for your patronage\n```"+mentionUser.username+"\n"+participator[msg.guild.id][mentionID].stat(adventurer[msg.guild.id][mentionID])+"```");
			}
			else respond(msg.channel, mentionUser+" is not an adventurer!");
		}
		//usage
		else {
			respond(msg.channel, "```Usage:\n"+prefix[msg.guild.id]+"revive <mention>```");
		}
	}
	
	//roulette
	else if(content.startsWith("roulette") || content.startsWith("roll")){
		//check adv
		if(adventurer[msg.guild.id][msg.author.id]!=undefined){
			console.log("roulette");
			if(content.startsWith("roulette board") || content.startsWith("roll board")){
				respond(msg.channel, {files: ['./roulette.png']});
			}
			else {
				//split content
				var obj=content.split(" ");
				//check enough args
				if(obj.length<3){
					//usages
					respond(msg.channel, "```Usages:\n"+prefix[msg.guild.id]+"roulette <bet type> <sum>\nor\n"+prefix[msg.guild.id]+"roll <bet type> <sum>\n\nAvailable bet types:\n0 1  2  3  4  5  6  7  8  9 10 11 12\n13 14 15 16 17 18 19 20 21 22 23 24\n25 26 27 28 29 30 31 32 33 34 35 36\n1-12 13-24 25-36 1st 2nd 3rd\n1-18 19-36 red black even odd```");
					return;
				}
				var success=roller.add(adventurer[msg.guild.id][msg.author.id],msg.author+"",obj[1],obj[2]);
				if(success==0)respond(msg.channel, msg.author+" bet accepted.");
				else if(success==1)respond(msg.channel, msg.author+" , you already bet!");
				else if(success==2)respond(msg.channel, msg.author+" , invalid bet!");
				else if(success==3)respond(msg.channel, msg.author+" , invalid sum!");
				else if(success==4)respond(msg.channel, msg.author+" , not enough money, duh!");
				var rolltime=10000; //10 sec
				if(rollRoulette[msg.guild.id]!=undefined){
					clearTimeout(rollRoulette[msg.guild.id]);
					rollRoulette[msg.guild.id]=undefined;
				}
				if(roller.count>0)rollRoulette[msg.guild.id]=setTimeout(rollNow.bind(this,msg.channel),rolltime);
			}
		}
		else respond(msg.channel, msg.author+" is not an adventurer! Use `"+prefix[msg.guild.id]+"new` command!");
	//save
	saveData();
	}
	
});

var questFlavor=[
"He has attempted to kidnap the Goddess. Serve him JUSTICE. Or Pizza.",
"Battle-Crazed Idiots ran rampant on the street!",
"The cultists are causing trouble!",
"A wild adventurer appeared!",
"He is WANTED!",
"The guild want 'em dead... Once is not enough."
];

//event char
var LiveAdv=require("./event.js");
var eventChar={};

//event
var event={};
var eventStatus={}; // undefined or 0:none, 1:opened, 2:started
var eventList=[
//type,open,start,closeWin,closeLose,adversaryName
//dragon
[1,"Announcement: A large **DRAGON** has been seen going near this town. The estimated time of its arrival will be within 20 minutes. All available adventurers, please ready your equipment for battle.","**THE DRAGON IS HERE!!!!!!**","The dragon has been slain... Good job!","The dragon lose interest and left...","Dragon"]
,
//cabbage
[2,"I apologize for gathering everyone on such short notice! I think everyone should know the emergency is because of the **CABBAGES**! Each one is worth 10,000 Eris! They will be ripe within 20 minutes.","It is time to harvest **CABBAGES**! Serve them on plate!","All cabbage have been caught! Fried cabbages is delicious!","The cabbages have flown faraway...","Cabbage"]
,
//cicada
[3,"There are a lot of **CICADAS** in the forest! Because of the large quantity, we need a lot of people. We will start in 20 minutes!","It is time to hunt the **CICADAS**!","Cicadas exterminated! You arrogant and greedy humans.","And thus, cicadas continue to pee while flying about...","Cicada"]
,
//snow sprite
[4,"**SNOW SPRITE HUNT!** in 20 minutes! Each is worth 100,000 Eris. Get ready boi...","Snow sprites appeared!","Snow sprites exterminated! Spring will come early...","And winter goes on...","Snow Sprite"]
];

function getDragon(adv){
	var en=new Adventurer();
	var length=0;
	en.set(0,0,0,0,0,0,0,0);
	for(x in adv){
		en.level+=adv[x].level;
		en.strength+=adv[x].strength;
		en.health+=adv[x].health;
		en.magicpower+=adv[x].magicpower;
		en.dexterity+=adv[x].dexterity;
		en.agility+=adv[x].agility;
		en.luck+=adv[x].luck;
		en.eris+=adv[x].eris;
		length++;
	}
	en.strength=Math.ceil(en.strength/length/3);
	en.health*=10;
	en.magicpower=Math.ceil(en.magicpower/length);
	en.dexterity=Math.ceil(en.dexterity/length);
	en.agility=Math.ceil(en.agility/length);
	return en;
}

function getCabbage(){
	var en=new Adventurer();
	en.set(1,0,1,1,1,10,10000,10000);
	return en;
}

function getCicada(){
	var en=new Adventurer();
	en.set(50,0,100,1000,100,100,100,1);
	return en;
}

function getSnowSprite(){
	var en=new Adventurer();
	en.set(10,0,1,1,1,1,10000,10000);
	return en;
}

function getWinterShogun(){
	var en=new Adventurer();
	en.set(2000,0,10000,100000,10000,10000,10000,10000);
	return en;
}

function openTime(){
	//return 3000; //3 sec
	return Math.ceil(Math.random()*35400000)+600000; //10 mins~10 hrs
}
//var prepareTime=3000; // 3 sec
var prepareTime=1200000; // 20 minutes

var closingEvent={};
var participator={};
var adversaries={};

function openEvent(guild){
	if(!checkChannel(guild))return;
	console.log("open event");
	eventStatus[guild]=1;
	participator[guild]={};
	//random event
	event[guild]=eventList[Math.floor(Math.random()*eventList.length)];
	if(prefix[guild]==undefined)
		prefix[guild]="!";
	botChannel[guild].send("`Raid Event` @here\n"+event[guild][1]+"\nEquipment shop has opened! Use `"+prefix[guild]+"shop list` command")
	.catch(error => {console.log(error.name+": "+error.message+" (code: "+error.code+")");});
	
	var eventTime=prepareTime;
	setTimeout(startEvent.bind(this,guild),eventTime);
}

function startEvent(guild){
	if(!checkChannel(guild))return;
	console.log("start event");
	eventStatus[guild]=2;
	botChannel[guild].send("`Raid Event` @here\n"+event[guild][2]+"\nEveryone have evacuated, so equipment shop has closed!\nUse `"+prefix[guild]+"command list` command to see what you can do!")
	.catch(error => {console.log(error.name+": "+error.message+" (code: "+error.code+")");});
	//adversaries
	if(event[guild][0]==1){
		var enemy=getDragon(adventurer[guild]);
		adversaries[guild]=[enemy,new LiveAdv(enemy),1];
	}
	else if(event[guild][0]==2){
		var enemy=getCabbage();
		adversaries[guild]=[enemy,new LiveAdv(enemy),Math.ceil(Math.random()*15)+15];
		botChannel[guild].send(adversaries[guild][2]+" cabbages sighted!")
		.catch(error => {console.log(error.name+": "+error.message+" (code: "+error.code+")");});
	}
	else if(event[guild][0]==3){
		var enemy=getCicada();
		adversaries[guild]=[enemy,new LiveAdv(enemy),Math.ceil(Math.random()*15)+15];
		botChannel[guild].send(adversaries[guild][2]+" cicadas sighted!")
		.catch(error => {console.log(error.name+": "+error.message+" (code: "+error.code+")");});
	}
	else if(event[guild][0]==4){
		var enemy=getSnowSprite();
		adversaries[guild]=[enemy,new LiveAdv(enemy),Math.ceil(Math.random()*15)+15];
		botChannel[guild].send(adversaries[guild][2]+" snow sprites sighted!")
		.catch(error => {console.log(error.name+": "+error.message+" (code: "+error.code+")");});
	}
	var eventTime=14400000; //duration 4 hrs
	closingEvent[guild]=setTimeout(closeEvent.bind(this,guild,false),eventTime);
}

function closeEvent(guild,win){
	if(!checkChannel(guild))return;
	console.log("close event");
	eventStatus[guild]=0;
	if(win){
		//reward
		var reward=0;
		//dragon
		if(event[guild][0]==1){
			var length=0;
			for(x in participator[guild])length++;
			var expreward=Math.ceil(adversaries[guild][0].level/length);
			for(x in participator[guild]){
				if(participator[guild][x].hp>0 && participator[guild][x].participate)adventurer[guild][x].getExp(expreward);
			}
			//1 mil
			reward=Math.ceil(1000000/length);
		}
		//cabbage
		else if(event[guild][0]==2)reward=100;
		//cicada
		else if(event[guild][0]==3)reward=200*adversaries[guild][0].level;
		//snow sprite
		else if(event[guild][0]==3)reward=100000;
		
		for(x in participator[guild]){
			if(participator[guild][x].hp>0 && participator[guild][x].participate)adventurer[guild][x].eris+=reward;
		}
		botChannel[guild].send("`Raid Event` @here\n"+event[guild][3]+"\n\n"+reward+" eris for everyone participated! (if you are alive)")
		.catch(error => {console.log(error.name+": "+error.message+" (code: "+error.code+")");});
		//save
		saveData();
	}
	else {
		botChannel[guild].send("`Raid Event` @here\n"+event[guild][4])
		.catch(error => {console.log(error.name+": "+error.message+" (code: "+error.code+")");});
	}
	
	var eventTime=openTime();
	console.log("event "+timeString(eventTime));
	setTimeout(openEvent.bind(this,guild),eventTime);
}

function rollNow(channel){
	channel.send(roller.roll())
	.catch(error => {console.log(error.name+": "+error.message+" (code: "+error.code+")");});
	roller=new Roulette();
	//save
	saveData();
}

var game="mention me for help";

client.on('disconnect', () => {console.log('disconnect');});
client.on('reconnecting', () => {console.log('reconnecting');});

client.on('ready', () => {
	console.log('TO BATTLE!');
	client.user.setGame(game);
	loadChannel();
});

//load
var token=conf.token;
client.login(token);
