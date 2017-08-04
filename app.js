'use strict';
const tg = require('node-telegram-bot-api');
var aikin = require('nulldev-aikin');
let util = require('util');
let http = require('http');
let request = require('request');
var fs = require('fs');
var ms = require('jjg-ping');
var process = require('process');
process.on('uncaughtException', function(err) { console.error((err && err.stack) ? err.stack : err); });
console.log(
	'\n\n\n'                          +
	'+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n' +
	'      INITIALIZING BOT...    \n' +
	'+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n'
);
var _s = "\n-----------------------------------------";
require.extensions['.json'] = function (module, filename) { module.exports = fs.readFileSync(filename, 'utf8'); };
var jsondata = require('./config.json'),
	cfg      = JSON.parse(jsondata),
	denylist = cfg.denylist,
	token    = cfg.bot.token,
	nltoken  = cfg.bot.nl_token,
	nlsight  = cfg.bot.sight,
	_n       = cfg.bot.botname,
	isDev    = cfg.dev.devmode,
	devs     = String.prototype.toLowerCase.apply(cfg.dev.devs).split(",");
console.log('\nLOADED JSON DATA:\n' + jsondata);
var aikin_api = new aikin;
aikin_api.set({ nlkey: nltoken });
const bot = new tg(token, { polling: true });
console.log(
	'\n#-#-#-#-#-#-#-#-#-#-#'          +
	'\n#-------------------#'          +
	'\n# AIKIN BOT STARTED #'          +
	'\n#-------------------#'          +
	'\n#-#-#-#-#-#-#-#-#-#-#\n\n'      + 
	'-- Copyright (c) 2017 NullDev --' +
	'\n\nListening...'
);

function descImg(url, id){
	var options = {
		uri: 'https:\/\/api.nulldev.org\/sight-bot-ai.php',
		method: 'POST',
		body: '{\"url\":\"' + url + '\"}',
		headers: {
			'NL-Token': nlsight,
			'Content-Type': 'application/json'
		}
	};
	try{
		request(options, function(error, response, body){
			if (error) console.log(_err);
			else {
				var jsonraw = JSON.parse(body);
				if (jsonraw.description != null && jsonraw.description != ''){
					console.log(_s);
					console.log('\nSIGHT GOT URI: ' + url + "\nSIGHT GOT DESC: \n" + body + "\n");
					var _conf = Math.round(jsonraw.description.captions[0].confidence * 100);
					var res = "I am " + _conf + "% sure that it\'s " + jsonraw.description.captions[0].text;
					bot.sendMessage(id, res);
					console.log('AIKIN REPLY: ' + res);
				}
				else console.log(_err);
			}
		});
	}
	catch(err){ console.log(err); }
}

function evalEmo(_in, id){
	var options = {
		uri : 'https://api.nulldev.org/emo?text=' + encodeURI(_in),
		method : 'GET'
	};
	request(options, function(error, response, body){
		if (error) {
			bot.sendMessage(id, "err");
			console.log(error);
		}
		else {
			console.log("AIKIN: Got callback: " + body);
			var emoParsed = JSON.parse(body);
			var _r = "Emotion Tone: " + emoParsed.emotion_tone + 
					 "\nConfidence (Value): " + emoParsed.confidence_value + 
					 "\nConfidence (in %): " + emoParsed.confidence_percent;
			bot.sendMessage(id, _r);
			console.log('\nAIKIN REPLY: ' + _r);
		}
	});
}

function isset(_var) { return ((_var && _var != null && _var != "" ) ? true : false); }
function isaDev(_from, _id) { return ((devs.indexOf(_from.toString().toLowerCase()) > -1 || devs.indexOf(frID.toString()) > -1) ? true : false); }
function isDenied(_from, _id) { return ((denylist.indexOf(from.toString().toLowerCase()) > -1 || denylist.indexOf(frID.toString().toLowerCase()) > -1) ? true : false); }

function isIdle(){ 
	var _res;
	fs.readFile('silentmode', 'utf8', function (err, ls) { 
		if (err) console.log(err);
		_res = ls.toString().includes('1') ? true : false;
	});
	return _res; 
}

bot.on('message', (msg) => {
	var txt   = msg.text;
	txt = isset(txt) ? txt.replace(/\//gi, "") : txt;
	var from  = msg.chat.username;
	var frID  = msg.from.id;
	//Username could be non-existant
	if (typeof from === 'undefined' || !from || from == null) from = frID;
	var name  = msg.chat.first_name;
	//Just to be save
	if (typeof name === 'undefined' || !name || name == null) name = "Unknown";
	//If picture
	var _pic  = msg.photo;
	if (typeof _pic !== 'undefined' && _pic != null) _pic = msg.photo[0].file_id;
	const _id = msg.chat.id;
	if (true){
		console.log(_s);
		if (typeof txt !== 'undefined' && txt != null) console.log('\nUSER ' +  from + ' MADE CHAT MESSAGE: ' + txt + "\n");
		if (typeof txt === 'undefined' || txt == null) console.log('\nUSER ' +  from + ' MADE CHAT PICTURE: ' + _pic + "\n");
		console.log(JSON.stringify(msg));
		if (isDev == 1 && !isaDev(from, frID)){
			//bot.sendMessage(_id, "ID: " + frID + "\nName: " + name + "\nUser: " + from + "\nChatID: " + _id);
			bot.sendMessage(_id, 
				"Sorry, " + name + 
				"... I am currently in maintenance mode! That normally means that my developer Chris is fixing bugs or programming features. " +
				"So please check back later :)\n\nYou can contact the developer for more information:\n\n@NullPing"
			);
			console.log(_s);
			console.log('\nUSER ' + from + ' GOT DENIED. RESON: Maintenance Mode\n');
			console.log(from.toString().toLowerCase() + " != " + devs.toString());
		}
		else if (isDenied(from, frID)){
			bot.sendMessage(_id, 
				"Sorry, " + name + 
				"... You got denied from using this bot. \n\nIf you think this is a mistake, please" +
				" contact the developer:\n\n@NullPing"
			);
			console.log(_s);
			console.log('\nUSER ' + from + ' GOT DENIED. RESON: Banned\n');
		}
		else if (typeof _pic !== 'undefined' && _pic != null){
			console.log('\nUSER ' + from + ' SENT PICTURE');
			var options = {
				uri: "https:\/\/api.telegram.org\/bot" + token + "\/getFile?file_id=" + _pic,
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			};
			try{
				request(options, function(error, response, body){
					var jsonraw = JSON.parse(body), _p = jsonraw.result.file_path;
					console.log('\nGOT PATH: ' + _p);
					var uri = "https:\/\/api.telegram.org\/file\/bot" + token + "\/" + _p;
					console.log('GOT URI: ' + uri);
					descImg(uri, _id);

				});
			}
			catch(err){ return; }
		}
		else if (txt.indexOf('!-- ') === 0){
			var cmd = txt.slice('!-- '.length), uri1 = "http://core.telegram.com", uri2 = "http://nulldev.org";
			console.log('\nUSER ' + from + ' PERFORMED COMMAND: ' + cmd + '\n');
			//Callback hell...
			if (cmd.toLowerCase() == "status") {
				aikin.prepare(function(){
					aikin_api.write("test", function (_c) {
						ms.system.ping(uri1, function(l1, s1) {
							ms.system.ping(uri2, function(l2, s2) {
								bot.sendMessage(_id, 
									"AIKIN Health Status: " + 
									((typeof _c === 'undefined' || _c == null) ? "Dead" : "Healthy") +
									"\nTelegram API Status: Online (Ping: " + l1 + ")" +
									"\nNullDev Backend: Online (Ping: " + l2 + ")" +
									"\nIn Devmode: " + ((isDev == 1) ? "Yes" : "No") +
									"\nMain Developer: @NullPing" +
									"\nUsers marked as Devs: " + devs.toString()
								);
							});
						});
					});
				});
			}
			if (cmd.toLowerCase() == "help") {
				var _r = "Commands:\n\n !-- status\n !-- git\n !-- ping\n !-- emo\n !-- silent\n !-- banner\n !-- whoami\n !-- help";
				bot.sendMessage(_id, _r);
				console.log('AIKIN REPLY: ' + _r + "\n");
			}
			if (cmd.toLowerCase() == "clearcache") {
				if (isaDev(from, frID)){
					aikin_api.resetCache(function () { console.log("\n\n--- AIKIN RESET ---\n\n"); });
					bot.sendMessage(_id, "AIKIN: Cache Cleared. I forgot everything...");
				}
				else bot.sendMessage(_id, "AIKIN: Insufficient permissions...");
			}
			if (cmd.toLowerCase() == "git") {
				var _r = "The bot (client) is open source! :)\nGrab the code here:\n\nhttps://github.com/NLDev/Telegram-AI";
				bot.sendMessage(_id, _r);
				console.log('AIKIN REPLY: ' + _r + "\n");
			}
			if (cmd.toLowerCase() == "ping") {
				var startTime = new Date();
				var _r = "Pong!";
				bot.sendMessage(_id, _r);
				console.log('\nAIKIN REPLY: ' + _r);
				var diff = new Date() - startTime;
				var _r2 = "(Took " + diff + "MS)";
				bot.sendMessage(_id, _r2);
				console.log('AIKIN REPLY: ' + _r2 + "\n");
			}
			if (cmd.toLowerCase().indexOf("emo") === 0) {
				var _txt = cmd.slice('emo '.length);
				if (_txt == ""){
					var _r = "AIKIN: Usage: !-- emo your text";
					bot.sendMessage(_id, _r);
					console.log('\nAIKIN REPLY: ' + _r + "\n");
				}
				else evalEmo(_txt, _id);
			}
			if (cmd.toLowerCase() == "silent"){
				if (isaDev(from, frID)){
					/* Temp remove
					fs.readFile('silentmode', 'utf8', function (err, ls) {
						if (err) console.log(err);
						if (ls.toString().includes('0')) {
							fs.writeFile('silentmode', '1', function (err) { if (err) return console.log(err); });
							bot.sendMessage(_id, "AIKIN: In silent mode now");
							console.log("AIKIN: SILENT MODE ON");
						}
						else {
							fs.writeFile('silentmode', '0', function (err) { if (err) return console.log(err); });
							bot.sendMessage(_id, "AIKIN: Not in silent mode anymore");
							console.log("AIKIN: SILENT MODE OFF");
						}
					});
					*/ 
				}
				else bot.sendMessage(_id, "AIKIN: Insufficient permissions...");
			}
			if (cmd.toLowerCase() == "whoami") {
				bot.sendMessage(_id, 
					"First Name: "      + msg.chat.first_name    + 
					"\nUser name: "     + from                   +
					"\nLanguage-Code: " + msg.from.language_code +
					"\nID: "            + msg.from.id            +
					"\nIs Dev: "        + (isaDev(from, frID) ? "Yes" : "No")
				);
			}
			if (cmd.toLowerCase() == "banner") {
				bot.sendPhoto({
					chatId: _id,
					caption: 'AIKIN Banner',
					photo: './banner.jpg'
				}, function(err, msg) {
					console.log(err);
					console.log(msg);
				});
			}
		}
		//First message
		else if (txt.toLowerCase() == "start"){
			console.log('\nUSER ' + from + ' STARTED FIRST TIME\n');
			var craftedMsg = "Hii " + name + "!";
			bot.sendMessage(_id, craftedMsg + "\n\n");
			console.log('AIKIN REPLY: ' + craftedMsg);
		}
		//Developer Info (Without Database in case offline)
		else if (/^((who is|whos|who's) (ur|your) (dev|developer|coder|programmer|owner|creator|maker))+(.*)$/i.test(txt) ||
				 /^((who|who did|whod|who'd|who is) (made|created|programmed|coded|programed|developed|) (u|you|aikin))+(.*)$/i.test(txt)){
			var d1_f = [
				"His username is @NullPing",
				"@NullPing is his username",
				"@NullPing would be his username!",
				"You can contact him here: @NullPing",
				"If you wanna contact him, his username is @NullPing",
				"If you wanna message him, his username is @NullPing",
				"If you want to contact him, his username is @NullPing",
				"If you wanna contact him, his username is @NullPing",
				"His username would be @NullPing"
			],  
			d1 = d1_f[Math.floor(Math.random() * d1_f.length)],
			ansmsg = [
				"Chris. " + d1,
				"Chris (@NullPing)",
				"Chris! " + d1,
				"Chris! (@NullPing)",
				"Chris is my dev! " + d1,
				"Chris is my dev! (@NullPing)",
				"Chris-Sensai, " + d1,
				"Chris-Sensai (@NullPing)",
				"My developer is chris and " + d1,
				"My developer is chris. " + d1,
				"My developer is chris. (@NullPing)",
				"Chris is my developer! " + d1,
				"Chris is my developer! (@NullPing)",
				"It's chris! " + d1,
				"It's chris! (@NullPing)",
				"Chris is my creator. " + d1,
				"Chris is my creator. (@NullPing)",
				"My creator is chris! " + d1,
				"My creator is chris! (@NullPing)"
			],
			ans = ansmsg[Math.floor(Math.random() * ansmsg.length)];
			bot.sendMessage(_id, ans);
			console.log(_s);
			console.log('\nAIKIN REPLY: ' + ans + "\n");
		}
		else {
			//AIKIN Package calls API Endpoint
			aikin.wrap(function(){
				aikin_api.ask(txt, function (callback) {
					bot.sendMessage(_id, callback.message);
					console.log(_s);
					console.log('\nAIKIN REPLY: ' + callback.message + "\n");
					console.log(JSON.stringify(callback));
				});
			});
		}
	}
});
