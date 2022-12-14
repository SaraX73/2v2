const lang = (path, args = {}) => require("./lang.js")(path, { ...args, ...require("./emojis.json") });
let MessageEmbed = require("./MessageEmbed.js");
const {getMatchMessageFromData} = require("./matchStuff.js")

function easyBoard(board) {
 this.toAdvanced=()=>{
  let toReturn=[[],[],[],[],[]];
  for(let y=0;y<5;y++) {
   for(let x=0;x<5;x++) {
    let t = board[y][x];
    toReturn[y][x]={
     red: t.includes("r"),
     blue: t.includes("b"),
     green: t.includes("g"),
     yellow: t.includes("y"),
     hard: t.includes("h_"),
     soft: t.includes("s_"),
     top: (
      t.endsWith("_r")?"red":
      t.endsWith("_b")?"blue":
      t.endsWith("_g")?"green":
      t.endsWith("_y")?"yellow":
      null
      )
    };
   };
  };
  return toReturn
 };
 this.toSimple=()=>{
  
  let toReturn=[[],[],[],[],[]];
  for(let y=0;y<5;y++) {
   for(let x=0;x<5;x++) {
    let t = board[y][x];
    toReturn[y][x]=`${t.hard?"h_":t.soft?"s_":""}${t.red?"r":""}${t.blue?"b":""}${t.green?"g":""}${t.yellow?"y":""}${t.top=="red"?"_r":t.top=="blue"?"_b":t.top=="green"?"_g":t.top=="yellow"?"_y":"null"}`;
   };
  };
  return toReturn;
 };
 return this;
};


function checkWin(b,x,y){
 this.isQ=(t)=>t?(t.red||t.blue)&&(t.green||t.yellow)&&!t.hard:!1;
 
 this.winForms=[
  [[-1,0],[1,0]],    [[-2,0],[-1,0]],
  [[1,0],[2,0]],    [[0,-1],[0,1]], 
  [[0,-2],[0,-1]],  [[0,1],[0,2]],
  [[-1,-1],[1,1]],   [[-2,-2],[-1,-1]],
  [[1,1],[2,2]],
 ];

 let winTiles=[];

 for(let wf of this.winForms) {
  let [[wx1,wy1],[wx2,wy2]]=wf;
  if(
   this.isQ(b[y][x])&&
   this.isQ(b?b[y+wy1]?b[y+wy1][x+wx1]:null:null)&&
   this.isQ(b?b[y+wy2]?b[y+wy2][x+wx2]:null:null)
  ){
   if(winTiles.length<1) winTiles.push([x,y]);
   if(!winTiles.includes([x+wx1,y+wy1])) winTiles.push([x+wx1,y+wy1]);
   if(!winTiles.includes([x+wx1,y+wy1])) winTiles.push([x+wx2,y+wy2]);
  };
 };
 return winTiles.length>0?winTiles:null;
};


module.exports = async function noTileClick(int) {
 
 if (!int.isRepliable()) return;
 await int.deferReply({ephemeral: true});
 
 let rawData = MessageEmbed.import(int.message.embeds[0]);
 console.log(rawData)
 let [y,x] = int.customId.split` `[1].split`_`.map(e=>Number(e));
 let tempBoard = easyBoard(rawData.board).toAdvanced();
 let tile = tempBoard[y][x];
 
 let error = !rawData.players.some(p => p.id == int.user.id) ? "You're not in this match" :
 tile.hard ? "This tile is hard locked" :
  tile.soft ? `This tile is soft locked by <@${Object.entries(rawData.softLock).find(v=>v[1].x==x&&v[1].y==y)[0]}>` :
  tile[rawData.players.find(p=>p.id==int.user.id).role] ? "You've played on this tile before" :
  rawData.players.find(p=>p.id==int.user.id).role != rawData.currentTurn ? "It's not your turn" : null;
  
  if (error) return await int.editReply({
   content: `**${error}**`,
   ephemeral: true
  });
 
 let currentRole = rawData.players.find(p=>p.id==int.user.id).role;
  console.log(tempBoard)

 
 let userSL=rawData.softLock[int.user.id];
 
 tile[currentRole]=true;
 tile.soft=true;
 tile.top=currentRole;
 tempBoard[y][x]=tile;
 if(userSL) tempBoard[userSL.y][userSL.x].soft=false;
 rawData.softLock[int.user.id]={x,y};
 
 let win = checkWin(tempBoard,x,y);
 
 if(win!=null) {
  rawData.players[rawData.players.indexOf(rawData.players.find(p=>p.id==int.user.id))].won=true;
  rawData.turnOrder=rawData.turnOrder.filter(t=>t!=currentRole);
  for(let [wx,wy] of win) {
   tempBoard[wy][wx].hard=true;
  };
 };
 
 rawData.currentTurn=rawData.turnOrder[rawData.turnOrder.indexOf(currentRole)+1<rawData.turnOrder.length?rawData.turnOrder.indexOf(currentRole)+1:0];
 
  console.log(tempBoard)

 rawData.board=easyBoard(tempBoard).toSimple();
  
  console.log(rawData)

 
 await int.message.edit(getMatchMessageFromData(rawData));
 
 return await int.deleteReply();
 
};
