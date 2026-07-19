const fs = require("fs");
const path = require("path");
const b = "e:/SparkLive/backend/ai";

function w(r,c){
  const p = path.join(b,r);
  try { fs.mkdirSync(path.dirname(p), {recursive:true}); } catch(e) {}
  fs.writeFileSync(p,c,"utf8");
  console.log("OK: "+r);
}

