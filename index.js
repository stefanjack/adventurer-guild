var Discord = require("discord.js");
var client = new Discord.Client();

var express = require('express');
var app     = express();

app.set('port', (process.env.PORT || 8080));
app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});

var Adventurer=require("./adventurer.js");
var adventurer={};

var fightCooldown={};

var questAll={};
var quest={};
var questAllDone={};
var questDone={};

var botChannel={};

var fs=require("fs");

if(fs.existsSync("./adventurer.txt")){
	//load
	var adventurerReader = require('readline').createInterface({
		input: fs.createReadStream('./adventurer.txt')
	});
	adventurerReader.on('line', function (line) {
		var obj=line.split(",");
		if(adventurer[obj[0]]==undefined)adventurer[obj[0]]={};
		adventurer[obj[0]][obj[1]]=new Adventurer();
		adventurer[obj[0]][obj[1]].set(
			parseInt(obj[2]),parseInt(obj[3]),parseInt(obj[4]),parseInt(obj[5]),parseInt(obj[6]),parseInt(obj[7]),parseInt(obj[8]),parseInt(obj[9]),//basic
			parseInt(obj[10]),parseInt(obj[11]),//reincarnate+pantsu
			parseInt(obj[12])//eris
			);
	});
	console.log("Data loaded!");
}
else console.log("Save data not found!");

if(fs.existsSync("./quest.txt")){
	//load
	var questReader = require('readline').createInterface({
		input: fs.createReadStream('./quest.txt')
	});
	questReader.on('line', function (line) {
		var obj=line.split("|");
		if(obj[0]=="questAll"){
			questAll[obj[1]]=[obj[2],parseInt(obj[3]),obj[4].replace(/!p/g,"|").replace(/!e/g,"!")];
		}
		else if(obj[0]=="questAllDone"){
			if(questAllDone[obj[1]]==undefined)questAllDone[obj[1]]={};
			questAllDone[obj[1]][obj[2]]=parseInt(obj[3]);
		}
		else if(obj[0]=="quest"){
			if(quest[obj[1]]==undefined)quest[obj[1]]={};
			quest[obj[1]][obj[2]]=[obj[3],parseInt(obj[4]),obj[5].replace(/!p/g,"|").replace(/!e/g,"!")];
		}
		else if(obj[0]=="questDone"){
			if(questDone[obj[1]]==undefined)questDone[obj[1]]={};
			questAllDone[obj[1]][obj[2]]=parseInt(obj[3]);
		}
	});
	console.log("Quest loaded!");
}
else console.log("Quest data not found!");

function loadChannel(){
	if(fs.existsSync("./channel.txt")){
		//load
		var channelReader = require('readline').createInterface({
			input: fs.createReadStream('./channel.txt')
		});
		channelReader.on('line', function (line) {
			var obj=line.split(",");
			botChannel[obj[0]]=client.channels.get(obj[1]);
			//start event
			var eventTime=Math.ceil(Math.random()*35400000)+600000; //10 mins~10 hrs
			setTimeout(function(){openEvent(obj[0]);},eventTime);
		});
		console.log("Channel loaded!");
	}
	else console.log("Channel data not found!");
}

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
	var savetext=createSaveText();
	fs.writeFile('./adventurer.txt', savetext,  function(err) {
		if (err) return console.error(err);
		console.log("Data saved!");
	});
}

function createQuestText(){
	var savetext="";
	for(x in questAll){
		savetext+="questAll|"+x+"|"+questAll[x][0]+"|"+questAll[x][1]+"|"+questAll[x][2].replace(/!/g,"!e").replace(/\|/g,"!p")+"\n";
		for(y in questAllDone[x]){
			savetext+="questAllDone|"+x+"|"+y+"|"+questAllDone[x][y]+"\n";
		}
	}
	for(x in quest){
		for(y in quest[x]){
			savetext+="quest|"+x+"|"+y+"|"+quest[x][y][0]+"|"+quest[x][y][1]+"|"+quest[x][y][2].replace(/!/g,"!e").replace(/\|/g,"!p")+"\n";
			savetext+="questDone|"+x+"|"+y+"|"+questDone[x][y]+"\n";
		}
	}
	return savetext;
}

function saveQuest(){
	var savetext=createQuestText();
	fs.writeFile('./quest.txt', savetext,  function(err) {
		if (err) return console.error(err);
		console.log("Quest saved!");
	});
}

function createChannelText(){
	var savetext="";
	for(guild in botChannel){
		savetext+=guild+","+botChannel[guild].id+"\n";
	}
	return savetext;
}

function saveChannel(){
	var savetext=createChannelText();
	fs.writeFile('./channel.txt', savetext,  function(err) {
		if (err) return console.error(err);
		console.log("Channel saved!");
	});
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

var bully=0;//'215316808331165697';// megu macy
//145370060402196480 miyuchi

client.on("message", msg => {
	if(msg.author.id==client.user.id)return;
	var content=msg.content.toLowerCase();
	
	//bully people
	if(bully!=0){if(msg.author.id==bully)msg.channel.sendMessage("fuck you");}
	//admin toogle bully
	if(msg.author.id=='206099144346042369' && content.startsWith(".bully <@"))bully=msg.mentions.users.firstKey();
	else if(msg.author.id=='206099144346042369' && content.startsWith(".bully "))bully=content.substr(7);
	if(msg.author.id=='206099144346042369' && content.startsWith(".stop"))bully=0;
	
	//new server
	if(adventurer[msg.guild.id]==undefined)adventurer[msg.guild.id]={};
	if(fightCooldown[msg.guild.id]==undefined)fightCooldown[msg.guild.id]={};
	if(quest[msg.guild.id]==undefined)quest[msg.guild.id]={};
	if(questAllDone[msg.guild.id]==undefined)questAllDone[msg.guild.id]={};
	if(questDone[msg.guild.id]==undefined)questDone[msg.guild.id]={};
	
	//admin get data
	if(content.startsWith("<@"+client.user.id+"> data")){
		if(msg.author.id=="206099144346042369")msg.author.sendMessage(
		"adventurer\n```\n"+createSaveText()+"```\n"+
		"quest\n```\n"+createQuestText()+"```\n"+
		"channel\n```\n"+createChannelText()+"```\n");
	}
	
	//admin reincarnate all (wipe)
	if(content.startsWith("<@"+client.user.id+"> reincarnate all")){
		if(msg.author.id=="206099144346042369"){
			for(x in adventurer[msg.guild.id])adventurer[msg.guild.id][x].reincarnation();
			msg.channel.sendMessage("Everyone has been reincarnated...");
			//save
			saveData();
			return;
		}
	}
	
	//set bot channel for event
	if(content.startsWith("<@"+client.user.id+"> here")){
		botChannel[msg.guild.id]=msg.channel;
		if(eventStatus[msg.guild.id]==undefined){
			var eventTime=Math.ceil(Math.random()*35400000)+600000; //10 mins~10 hrs
			setTimeout(function(){openEvent(msg.guild.id);},eventTime);
		}
		msg.channel.sendMessage("Roger");
		saveChannel();
		return;
	}
	
	//help
	if(content.startsWith("<@"+client.user.id+">")){
		msg.channel.sendMessage("```Commands:\n\n"+
		"new adventurer   register as adventurer\n"+
		"adventurer stat  check your stats\n"+
		"fight            fight someone\n"+
		"reincarnate me   RESET to Lv 1 with bonus stat!\n"+
		"                 DO AT YOUR OWN RISK\n"+
		"leaderboard      show top 10 level adventurers\n"+
		"hall of fame     show special adventurers\n"+
		"issue quest      issue a quest for all\n"+
		"quest start      start a quest for yourself\n"+
		"quest list       show quest available\n"+
		//"transfer eris    transfer eris to others\n"+
		//"transfer pantsu  transfer pantsu to others\n"+
		"```");
	}
	
	//new adventurer
	else if(content.startsWith("new adventurer")) {
		if(adventurer[msg.guild.id][msg.author.id]==undefined){
			console.log("new adventurer");
			adventurer[msg.guild.id][msg.author.id]=new Adventurer();
			msg.channel.sendMessage(msg.author+" is now an adventurer!");
			//save
			saveData();
		}
		else msg.channel.sendMessage(msg.author+" is already an adventurer!");
    }
	
	//adventurer stat
	else if(content.startsWith("adventurer stat")) {
		console.log("adventurer stat");
		//stats of preset character
		if(content.startsWith("adventurer stat kazuma")) msg.channel.sendMessage(Adventurer.Kazuma.stats("Kazuma"));
		else if(content.startsWith("adventurer stat aqua")) msg.channel.sendMessage(Adventurer.Aqua.stats("Aqua"));
		else if(content.startsWith("adventurer stat megumin")) msg.channel.sendMessage(Adventurer.Megumin.stats("Megumin"));
		//is mentioned
		else if(msg.mentions.users.array().length>0) {
			var mentionID=msg.mentions.users.firstKey();
			var mentionUser=client.users.get(mentionID);
			//check mentioned is not this bot
			if(mentionID==client.user.id) msg.channel.sendMessage(msg.author+" if you fight me, you'll understand...");
			//check mentioned is not adventurer
			else if(adventurer[msg.guild.id][mentionID]!=undefined) msg.channel.sendMessage(adventurer[msg.guild.id][mentionID].stats(mentionUser.username));
			else msg.channel.sendMessage(mentionUser+" is not an adventurer!");
		}
		//self (check is adventurer)
		else if(adventurer[msg.guild.id][msg.author.id]!=undefined) msg.channel.sendMessage(adventurer[msg.guild.id][msg.author.id].stats(msg.author.username));
		else msg.channel.sendMessage(msg.author+" is not an adventurer! Use `new adventurer` command!");
	}
	
	//fight
	else if(content.startsWith("fight")) {
		//check adventurer
		if(adventurer[msg.guild.id][msg.author.id]!=undefined){
			//check cooldown
			if(fightCooldown[msg.guild.id][msg.author.id]==undefined)fightCooldown[msg.guild.id][msg.author.id]=[0,0];
			var timeLeft=(fightCooldown[msg.guild.id][msg.author.id][1]*1000)-(new Date().getTime()-fightCooldown[msg.guild.id][msg.author.id][0]);
			if(timeLeft>0){
				msg.channel.sendMessage(msg.author+" you are too tired, rest "+timeString(timeLeft)+" more!");
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
					msg.channel.sendMessage(msg.author+" you are dead!");
					return;
				}
				var result=participator[msg.guild.id][msg.author.id].combat(msg.author.username,event[msg.guild.id][5],adventurer[msg.guild.id][msg.author.id],adversaries[msg.guild.id][0],adversaries[msg.guild.id][1]);
				msg.channel.sendMessage("```"+result+"\n\n"+event[msg.guild.id][5]+" ("+adversaries[msg.guild.id][1].hpInfo(adversaries[msg.guild.id][0])+")```");
				//if win
				if(adversaries[msg.guild.id][1].hp<=0){
					clearTimeout(closingEvent[msg.guild.id]);
					closeEvent(msg.guild.id,true);
				}
				return;
			}
			//if preset enemy
			if(content.startsWith("fight kazuma")) {
				var battleLog=adventurer[msg.guild.id][msg.author.id].fight(msg.author.username,"Kazuma",Adventurer.Kazuma);
				msg.channel.sendMessage("```"+battleLog+"```");
				fightCooldown[msg.guild.id][msg.author.id]=[new Date().getTime(),Math.ceil(Math.random()*50+10)];
			}
			else if(content.startsWith("fight aqua")) {
				var battleLog=adventurer[msg.guild.id][msg.author.id].fight(msg.author.username,"Aqua",Adventurer.Aqua);
				msg.channel.sendMessage("```"+battleLog+"```");
				fightCooldown[msg.guild.id][msg.author.id]=[new Date().getTime(),Math.ceil(Math.random()*50+10)];
			}
			else if(content.startsWith("fight megumin")) {
				var battleLog=adventurer[msg.guild.id][msg.author.id].fight(msg.author.username,"Megumin",Adventurer.Megumin);
				msg.channel.sendMessage("```"+battleLog+"```");
				fightCooldown[msg.guild.id][msg.author.id]=[new Date().getTime(),Math.ceil(Math.random()*50+10)];
			}
			else {
				//check no mention
				if(msg.mentions.users.array().length==0){
					//usage help
					msg.channel.sendMessage("```Usage:\nfight <mention>\n\npreset enemy available: Kazuma, Aqua, Megumin\n\nExample:\nfight Kazuma\n\nInfo:\nfight someone```");
					return;
				}
				var enemyID=msg.mentions.users.firstKey();
				//check enemy is not self
				if(msg.author.id==enemyID){
					msg.channel.sendMessage(msg.author+" don't do this to yourself!");
					return;
				}
				//check enemy is this bot
				if(enemyID==client.user.id){
					msg.channel.sendMessage(msg.author+" thou hath challengeth me, now feel my wrath!");
					var shadow=adventurer[msg.guild.id][msg.author.id].getShadow(10);
					var battleLog=adventurer[msg.guild.id][msg.author.id].fight(msg.author.username,client.user.username,shadow);
					msg.channel.sendMessage("```"+battleLog+"```");
					fightCooldown[msg.guild.id][msg.author.id]=[new Date().getTime(),Math.ceil(Math.random()*50+10)];
					if(!battleLog.endsWith(client.user.username+" wins!\n")){
						//eris reward
						var reward=Math.ceil(Math.random()*adventurer[msg.guild.id][msg.author.id].level);
						adventurer[msg.guild.id][msg.author.id].eris+=reward;
						msg.channel.sendMessage(msg.author+" thy shalt remember 'tis!\nYou stole "+reward+" eris from the guild!");
					}
					return;
				}
				var enemyUser=client.users.get(enemyID);
				//check enemy is adventurer
				if(adventurer[msg.guild.id][enemyID]!=undefined){
					var prelevel2=adventurer[msg.guild.id][enemyID].level;
					var battleLog=adventurer[msg.guild.id][msg.author.id].fight(msg.author.username,enemyUser.username,adventurer[msg.guild.id][enemyID]);
					msg.channel.sendMessage("```"+battleLog+"```");
					fightCooldown[msg.guild.id][msg.author.id]=[new Date().getTime(),Math.ceil(Math.random()*50+10)];
					if(adventurer[msg.guild.id][enemyID].level>prelevel2) msg.channel.sendMessage(enemyUser+" leveled up!");
					//check quests if win
					if(battleLog.endsWith(msg.author.username+" wins!\n")){
						if(questAll[msg.guild.id]!=undefined){
							if(enemyID==questAll[msg.guild.id][0]){
								if(questAllDone[msg.guild.id][msg.author.id]==undefined)questAllDone[msg.guild.id][msg.author.id]=0;
								questAllDone[msg.guild.id][msg.author.id]++;
								//check quest complete
								if(questAllDone[msg.guild.id][msg.author.id]>=questAll[msg.guild.id][1]){
									//reward & reset quest
									var reward=Math.ceil(Math.random()*adventurer[msg.guild.id][questAll[msg.guild.id][0]].level*questAll[msg.guild.id][1]);
									adventurer[msg.guild.id][msg.author.id].eris+=reward;
									questAll[msg.guild.id]=undefined;
									msg.channel.sendMessage(msg.author+"You have completed the shared quest!\n*throws "+reward+" eris at you*");
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
									msg.channel.sendMessage(msg.author+"You have completed the personal quest!\n*throws "+reward+" eris at you*");
								}
							}
						}
						//save
						saveQuest();
					}
				}
				else msg.channel.sendMessage(enemyUser+" is not an adventurer!");
			}
			if(adventurer[msg.guild.id][msg.author.id].level>prelevel) msg.channel.sendMessage(msg.author+" leveled up!");
			//save
			saveData();
		}
		else msg.channel.sendMessage(msg.author+" is not an adventurer! Use `new adventurer` command!");
	}
	
	//reincarnate
	else if(content=="reincarnate me"){
		//check is adventurer
		if(adventurer[msg.guild.id][msg.author.id]!=undefined){
			console.log("reincarnate");
			adventurer[msg.guild.id][msg.author.id].reincarnation();
			msg.channel.sendMessage(msg.author+" have reincarnated");
			//save
			saveData();
		}
		else msg.channel.sendMessage(msg.author+" is not an adventurer! Use `new adventurer` command!");
	}
	
	//leaderboard
	else if(content=="leaderboard"){
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
			text+=(i+1)+". "+client.users.get(top).username+" Lv "+server[top].level+"\n";
			delete server[top];
			top=undefined;
		}
		if(text=="")msg.channel.sendMessage("There is no adventurer :frowning:");
		else msg.channel.sendMessage("```"+text+"```");
	}
	
	//hall of fame
	else if(content=="hall of fame"){
		var server=adventurer[msg.guild.id];
		var top;
		var text="";
		//no adventurer
		var length=0;
		for(x in server)length++;
		if(length<=0){
			msg.channel.sendMessage("There is no adventurer :frowning:");
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
		msg.channel.sendMessage("```"+text+"```");
	}
	
	//issue (shared) quest
	else if(content=="issue quest"){
		//already issued
		if(questAll[msg.guild.id]!=undefined){
			msg.channel.sendMessage("Quest already issued! Check it by `quest list` command!");
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
		if(length<1){
			msg.channel.sendMessage("Not enough adventurer! At least 1 is needed");
			return;
		}
		console.log("issue quest")
		//target id, kill needed, flavor
		questAll[msg.guild.id]=[arrayID[Math.floor(Math.random()*arrayID.length)],Math.ceil(Math.random()*3+1)*5,questFlavor[Math.floor(Math.random()*questFlavor.length)]];
		questAllDone[msg.guild.id]={};
		msg.channel.sendMessage("Quest issued!\nKill "+questAll[msg.guild.id][1]+" "+client.users.get(questAll[msg.guild.id][0]).username+"!\n"+questAll[msg.guild.id][2]);
		//save
		saveQuest();
	}
	
	//start (personal) quest
	else if(content=="quest start"){
		//check is adventurer
		if(adventurer[msg.guild.id][msg.author.id]==undefined){
			msg.channel.sendMessage(msg.author+" is not an adventurer! Use `new adventurer` command!");
			return;
		}
		//already started
		if(quest[msg.guild.id][msg.author.id]!=undefined){
			msg.channel.sendMessage("Quest already started! Check it by `quest list` command!");
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
			msg.channel.sendMessage("Not enough adventurer! At least 2 is needed");
			return;
		}
		console.log("quest start");
		var randomID;
		//target must not be itself
		while(randomID==undefined || randomID==msg.author.id)randomID=arrayID[Math.floor(Math.random()*arrayID.length)];
		//target id, kill needed, flavor
		quest[msg.guild.id][msg.author.id]=[randomID,Math.ceil(Math.random()*3+1)*5,questFlavor[Math.floor(Math.random()*questFlavor.length)]];
		questDone[msg.guild.id][msg.author.id]=0;
		msg.channel.sendMessage("Quest started!\nKill "+quest[msg.guild.id][msg.author.id][1]+" "+client.users.get(quest[msg.guild.id][msg.author.id][0]).username+"!\n"+quest[msg.guild.id][msg.author.id][2]);
		//save
		saveQuest();
	}
	
	//quest list
	else if(content=="quest list"){
		//check is adventurer
		if(adventurer[msg.guild.id][msg.author.id]==undefined){
			msg.channel.sendMessage(msg.author+" is not an adventurer! Use `new adventurer` command!");
			return;
		}
		console.log("quest list");
		var text="Shared Quest:\n";
		if(questAll[msg.guild.id]!=undefined){
			text+="Kill "+questAll[msg.guild.id][1]+" "+client.users.get(questAll[msg.guild.id][0]).username+"!\n"+questAll[msg.guild.id][2];
			if(questAllDone[msg.guild.id][msg.author.id]==undefined)questAllDone[msg.guild.id][msg.author.id]=0;
			text+="\nKilled: "+questAllDone[msg.guild.id][msg.author.id];
		}
		else text+="None";
		text+="\n\nPersonal Quest:\n";
		if(quest[msg.guild.id][msg.author.id]!=undefined)
			text+="Kill "+quest[msg.guild.id][msg.author.id][1]+" "+client.users.get(quest[msg.guild.id][msg.author.id][0]).username+"!\n"+quest[msg.guild.id][msg.author.id][2]+"\nKilled: "+questDone[msg.guild.id][msg.author.id];
		else text+="None";
		msg.channel.sendMessage("```"+text+"```");
	}
	
	/*//transfer
	else if(content.startsWith("transfer ")){
		//check is adventurer
		if(adventurer[msg.guild.id][msg.author.id]==undefined){
			msg.channel.sendMessage(msg.author+" is not an adventurer! Use `new adventurer` command!");
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
				msg.channel.sendMessage("```Usage:\ntransfer eris <mention> <sum>\n\nInfo:\ntransfer eris to others```");
				return;
			}
			sum=parseInt(sum);
			var targetID=msg.mentions.users.firstKey();
			var targetUser=client.users.get(targetID);
			//check enough balance
			if(adventurer[msg.guild.id][msg.author.id].eris<sum){
				msg.channel.sendMessage(msg.author+" short on money? Do some quest!");
				return;
			}
			//check target is not self
			if(msg.author.id==targetID){
				msg.channel.sendMessage(msg.author+" *throws back your money*");
				return;
			}
			//check target is adventurer
			if(adventurer[msg.guild.id][targetID]==undefined){
				msg.channel.sendMessage(targetUser+" is not an adventurer!");
				return;
			}
			console.log("transfer eris");
			adventurer[msg.guild.id][msg.author.id].eris-=sum;
			adventurer[msg.guild.id][targetID].eris+=sum;
			msg.channel.sendMessage(msg.author+" has given "+targetUser+" "+sum+" eris. Be thankful!");
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
				msg.channel.sendMessage("```Usage:\ntransfer pantsu <mention> <sum>\n\nInfo:\ntransfer pantsu to others```");
				return;
			}
			sum=parseInt(sum);
			var targetID=msg.mentions.users.firstKey();
			var targetUser=client.users.get(targetID);
			//check enough pantsu
			if(adventurer[msg.guild.id][msg.author.id].pantsu<sum){
				msg.channel.sendMessage(msg.author+" you don't have the *goods*, go steal some!");
				return;
			}
			//check target is not self
			if(msg.author.id==targetID){
				msg.channel.sendMessage(msg.author+" *throws back your pantsu*");
				return;
			}
			//check target is adventurer
			if(adventurer[msg.guild.id][targetID]==undefined){
				msg.channel.sendMessage(targetUser+" is not an adventurer!");
				return;
			}
			console.log("transfer pantsu");
			adventurer[msg.guild.id][msg.author.id].pantsu-=sum;
			adventurer[msg.guild.id][targetID].pantsu+=sum;
			msg.channel.sendMessage(msg.author+" has *sneakily* given "+targetUser+" "+sum+" pantsu(s). Be grateful!");
			//save
			saveData();
		}
	}*/
	
	//shop list
	else if(content=="shop list" && eventStatus[msg.guild.id]==1){
		msg.channel.sendMessage("To buy use `shop <item number>` command"+
		"```Welcome to Wiz Shop!\n\n"+
		"1. Potion      (100 eris) Restores HP\n"+
		"2. Wiz Special (9 pantsu) Permanently increase random stat (limited offer)\n"+
		"(item will vaporate after the event ended)```");
	}
	
	//shop buy
	else if(content.startsWith("shop ") && eventStatus[msg.guild.id]==1){
		//check is adventurer
		if(adventurer[msg.guild.id][msg.author.id]==undefined){
			msg.channel.sendMessage(msg.author+" is not an adventurer! Use `new adventurer` command!");
			return;
		}
		var number=content.substr(5);
		if(number=="1"){
			//potion
			//check eris
			if(adventurer[msg.guild.id][msg.author.id].eris<100){
				msg.channel.sendMessage(msg.author+" short on money? Go home!");
				return;
			}
			if(participator[msg.guild.id][msg.author.id]==undefined){
				participator[msg.guild.id][msg.author.id]=new LiveAdv(adventurer[msg.guild.id][msg.author.id]);
			}
			adventurer[msg.guild.id][msg.author.id].eris-=100;
			participator[msg.guild.id][msg.author.id].potion++;
			msg.channel.sendMessage(msg.author+" bought potion!");
			//save
			saveData();
		}
		else if(number=="2"){
			//Wiz Special
			//check pantsu
			if(adventurer[msg.guild.id][msg.author.id].pantsu<9){
				msg.channel.sendMessage(msg.author+" short on pantsu? ¯\\\_(ツ)\_/¯");
				return;
			}
			adventurer[msg.guild.id][msg.author.id].pantsu-=9;
			adventurer[msg.guild.id][msg.author.id].randomGain();
			msg.channel.sendMessage(msg.author+" feels kinda stronger");
			//save
			saveData();
		}
	}
	
	//command list
	else if(content=="command list" && eventStatus[msg.guild.id]==2){
		msg.channel.sendMessage("```Commands:\n\n"+
		"fight event  fight the boss\n"+
		"check party  see party's HP\n"+
		"use potion   use your potion on someone\n"+
		"```");
	}
	
	//check party
	else if(content=="check party" && eventStatus[msg.guild.id]==2){
		var text="```\n";
		for(x in participator[msg.guild.id]){
			text+=client.users.get(x).username+"\n"+participator[msg.guild.id][x].stat(adventurer[msg.guild.id][x])+"\n\n";
		}
		msg.channel.sendMessage(text+"```");
	}
	
	//potion
	else if(content.startsWith("use potion") && eventStatus[msg.guild.id]==2){
		//check is adventurer
		if(adventurer[msg.guild.id][msg.author.id]==undefined){
			msg.channel.sendMessage(msg.author+" is not an adventurer! Use `new adventurer` command!");
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
					msg.channel.sendMessage(msg.author+result+mentionUser+"```"+mentionUser.username+"\n"+participator[msg.guild.id][mentionID].stat(adventurer[msg.guild.id][mentionID])+"```");
				else msg.channel.sendMessage(msg.author+result);
			}
			else msg.channel.sendMessage(mentionUser+" is not an adventurer!");
		}
		//self
		else if(adventurer[msg.guild.id][msg.author.id]!=undefined){
			var result=participator[msg.guild.id][msg.author.id].usePotion(adventurer[msg.guild.id][msg.author.id]);
			if(result.indexOf("dead")<0 && result.indexOf("any"))
				msg.channel.sendMessage(msg.author+result+"```"+msg.author.username+"\n"+participator[msg.guild.id][msg.author.id].stat(adventurer[msg.guild.id][msg.author.id])+"```");
			else msg.channel.sendMessage(msg.author+result);
		}
	}
	
	//
	else if(content=="i win" && eventStatus[msg.guild.id]==2){
		clearTimeout(closingEvent[msg.guild.id]);
		closeEvent(msg.guild.id,true);
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
//type 1: boss
[1,"Announcement: A large dragon has been seen going near this town. The estimated time of its arrival will be within 10 minutes. All available adventurers, please ready your equipment for battle.","**THE DRAGON IS HERE!!!!!!**","The dragon has been slain... Good job!","The dragon lose interest and left...","Dragon"]

];

function getDragon(adv){
	var dragon=new Adventurer();
	var length=0;
	dragon.set(0,0,0,0,0,0,0,0);
	for(x in adv){
		dragon.level+=adv[x].level;
		dragon.strength+=adv[x].strength;
		dragon.health+=adv[x].health;
		dragon.magicpower+=adv[x].magicpower;
		dragon.dexterity+=adv[x].dexterity;
		dragon.agility+=adv[x].agility;
		dragon.luck+=adv[x].luck;
		dragon.eris+=adv[x].eris;
		length++;
	}
	dragon.strength=Math.ceil(dragon.strength/2);
	dragon.health*=10;
	return dragon;
}

var closingEvent={};
var participator={};
var adversaries={};

function openEvent(guild){
	console.log("open event");
	eventStatus[guild]=1;
	participator[guild]={};
	//random event
	event[guild]=eventList[Math.floor(Math.random()*eventList.length)];
	botChannel[guild].sendMessage("`Raid Event` @here\n"+event[guild][1]+"\nEquipment shop has opened! Use `shop list` command");
	
	var eventTime=600000; //10 mins
	setTimeout(function(){startEvent(guild);},eventTime);
}

function startEvent(guild){
	console.log("start event");
	eventStatus[guild]=2;
	botChannel[guild].sendMessage("`Raid Event` @here\n"+event[guild][2]+"\nEquipment shop has closed!\nUse `command list` command to see what you can do!");
	//adversaries
	if(event[guild][0]==1){
		var dragon=getDragon(adventurer[guild]);
		adversaries[guild]=[dragon,new LiveAdv(dragon)];
	}
	
	var eventTime=3600000; //duration 1 hrs
	closingEvent[guild]=setTimeout(function(){closeEvent(guild,false);},eventTime);
}

function closeEvent(guild,win){
	console.log("close event");
	eventStatus[guild]=0;
	if(win){
		//reward
		var length=0;
		for(x in participator[guild])length++;
		var reward=Math.ceil(adversaries[guild][0].eris/length);
		for(x in participator[guild]){
			if(participator[guild][x].hp>0)adventurer[guild][x].eris+=reward;
		}
		botChannel[guild].sendMessage("`Raid Event`\n"+event[guild][3]+"\n\n"+reward+" eris for everyone participated! (if you are alive that is)");
		saveData();
	}
	else botChannel[guild].sendMessage("`Raid Event`\n"+event[guild][4]);
	
	var eventTime=Math.ceil(Math.random()*35400000)+600000; //10 mins~10 hrs
	setTimeout(function(){openEvent(guild);},eventTime);
}

client.on('ready', () => {
	console.log('TO BATTLE!');
	loadChannel();
});

//load
var token;
var tokenReader = require('readline').createInterface({
	input: fs.createReadStream('./token.txt')
});
tokenReader.on('line', function (line) {
	if(token==undefined){
		token=line;
		client.login(token);
	}
});
