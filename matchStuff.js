const lang = (path, args = {}) => require("./lang.js")(path, { ...args, ...require("./emojis.json") });
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
let MessageEmbed = require("./MessageEmbed.js");
function emote(e) {
 return lang("emoji", { e }).split`:` [2].slice(0, -1)
};

let a=()=>"null";
let b=(z)=>({
 id: z.id,
 role: z.team==1?(z.pos=="1"?"yellow":"green"):(z.pos=="1"?"blue":"red"),
 won: false
});
let c=(y,x,w)=>{
 return new ButtonBuilder()
 .setStyle(ButtonStyle.Secondary)
 .setEmoji(emote(y))
 .setDisabled(y.startsWith("s_")||y.startsWith("h_")||y.includes(x.split``[0]))
 .setCustomId(`match.play ${w[0]}_${w[1]}`);
};
let d=(v,u,t)=>{
 let r=new ActionRowBuilder(),q=0;
 for(let s of v) {
  r.addComponents(c(s,u,[t,q]));
  q++;
 };
 return r;
};
let e=(p,o)=>{
 let m=[],l=0;
 for(let n of p) {
  m.push(d(n,o,l));
  l++
 };
 return m;
};


function convertPlayersDataToMatch(p) {
 return {
  players: [
   b(p[0]),
   b(p[1]),
   b(p[2]),
   b(p[3])
  ].sort((a,b)=>a.role=="red"?0:a.role=="blue"?1:a.role=="green"?2:3),
  turnOrder: ["red","blue","green","yellow"],
  currentTurn: "red",
  softLock: {
   [p[0].id]: null,
   [p[1].id]: null,
   [p[2].id]: null,
   [p[3].id]: null
   },
   board: [
    [a(),a (),a(),a(),a()],
    [a(),a(),a(),a(),a()],
    [a(),a(),a(),a(),a()],
    [a(),a(),a(),a(),a()],
    [a(),a(),a(),a(),a()]
   ]
}};

function getMatchMessageFromData(data) {
 let embed = new MessageEmbed()
  .setTitle("TickOatTwo 2v2 - during match")
  .export(data);
 let desc=["**","**","**---------------------\n","**"];
 let isWon=(
  data.players.find(p=>p.role=="red").won&&
  data.players.find(p=>p.role=="blue").won
 )||(
  data.players.find(p=>p.role=="green").won&&
  data.players.find(p=>p.role=="yellow").won
 );
 for(let player of data.players) {
  let x,en;
  switch(player.role) {
   case"red":x=0,en="r_r";break;
   case"blue":x=1,en="b_b";break;
   case"green":x=2,en="g_g";break;
   case"yellow":x=3,en="y_y";break;
  };

  desc[x]+=`${lang("emoji",{e:en})} \``
  desc[x]+=data.softLock[player.id]?`(${data.softLock[player.id].y+1},${data.softLock[player.id].x+1})`:"(n,n)";
  desc[x]+=`\` <@${player.id}>`;
  desc[x]+=player.won?` Won!`:"";
  desc[x]+=data.currentTurn==player.role?" <--":"";
  desc[x]+="**";
 };
 embed.setDescription(desc.join`\n`);
 return {
  embeds: [embed],
  components: isWon?undefined:e(data.board,data.currentTurn)
 };
};

module.exports = {convertPlayersDataToMatch, getMatchMessageFromData}
