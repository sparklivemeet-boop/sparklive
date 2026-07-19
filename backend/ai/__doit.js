const fs=require("fs");
const path=require("path");
const b="e:/SparkLive/backend/ai";
function w(r,c){const p=path.join(b,r);try{fs.mkdirSync(path.dirname(p),{recursive:true})}catch(e){}fs.writeFileSync(p,c,"utf8");console.log("OK: "+r);}
// --- ANALYTICS MODEL ---
let m=[];
m.push(""""SparkLive AI - Analytics Models"""");
m.push("import logging,time,math,random,statistics");
m.push("from typing import Any,Dict,List,Optional,Tuple");
m.push("from collections import defaultdict");
m.push("import numpy as np");
m.push("from config import settings");
m.push("from services.cache_service import cache_service");
m.push("logger=logging.getLogger(\"sparklive.ai.models.analytics\")");
w("models/analytics_model.py",m.join("\\n"));
console.log("analytics base template created");
