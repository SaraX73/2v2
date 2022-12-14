let lang = require("./lang.json");

function deepCopy(obj) {
 return JSON.parse(JSON.stringify(obj))
};

module.exports = function(path, args={}) {
 let selector = deepCopy(lang);
 for(let cPath of path.split`.`) {
  selector=selector[cPath];
 };
 selector=selector.join`\n`;
 for(let [key,value] of Object.entries(args)){
  selector=selector.split(`\${${key}}`).join(value);
 };
 return selector;
};
