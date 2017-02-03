var Discord = require("discord.js");
var client = new Discord.Client();

var Adventurer=require("./adventurer.js");
var adventurer={};
var fightCooldown={};
var questAll={};
var quest={};
var questAllDone={};
var questDone={};

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
	fs.writeFileSync('./adventurer.txt', savetext,  function(err) {
		if (err) return console.error(err);
		console.log("Data saved!");
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
	
	//admin get adventurers data
	if(content.startsWith("<@"+client.user.id+"> data")){
		if(msg.author.id=="206099144346042369")msg.author.sendMessage("```"+createSaveText()+"```");
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
		else if(adventurer[msg.guild.id][msg.author.id+""]!=undefined) msg.channel.sendMessage(adventurer[msg.guild.id][msg.author.id].stats(msg.author.username));
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
							console.log(enemyID);
							console.log(questAll[msg.guild.id]);
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
});

var questFlavor=[
"He has attempted to kidnap the Goddess. Serve him JUSTICE. Or Pizza.",
"Battle-Crazed Idiots ran rampant on the street!",
"The cultists are causing trouble!",
"A wild adventurer appeared!",
"He is WANTED!",
"The guild want 'em dead... Once is not enough."
];

//event
function doEvent(){
	
}

client.on('ready', () => {
	console.log('TO BATTLE!');
	
	//var eventTime=5000;//random
	//setTimeout(doEvent,eventTime);
});

client.login("TOKEN");