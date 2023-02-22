"use strict";const h={cacheEnabled:!0,cacheExpirationSec:86400},y=(e,t)=>Math.round((t.getTime()-e.getTime())/1e3),p=e=>{const t=new Date,a=new Date(e);return y(a,t)};function c(e){const t=parseInt(e,10);return isFinite(t)?t:void 0}function f(e){const t=parseFloat(e);return isFinite(t)?t:void 0}async function v(e){try{console.debug(`Fetching player data from Ebinstats for SteamID ${e}`);const a=await(await fetch(`https://ebinstats.kanaliiga.fi/?s=playerstats&steamID=${e}`)).text(),r=a.match(/Total stats \(K\/A\/D\)<\/div>\s*<div.*?>(\d{1,6} \/ \d{1,6} \/ \d{1,6})<\/div>/)?.[1]??"0 / 0 / 0",[n,s,i]=r.split(" / ").map(g=>c(g)??0),u=isFinite(n/i)?n/i:n,l=c(a.match(/(\d*)<\/div><div class='bold'>CS:GO Hours/)?.[1])??0,d=c(a.match(/csgo_ranks\/(\d{1,2})\.png/)?.[1])??0;return!l&&!d&&!u?void 0:{updatedAt:new Date().toISOString(),adr:c(a.match(/Average ADR<\/div>\s*<div.*?>(\d*)<\/div>/)?.[1])??0,kad:r,kills:n,assists:s,deaths:i,kdr:u,kpr:f(a.match(/KPR<\/div>\s*<div.*?>([+-]?([0-9]*[.])?[0-9]+)<\/div>/)?.[1])??0,kanarating:f(a.match(/Average Kanarating<\/div>\s*<div.*?>([+-]?([0-9]*[.])?[0-9]+)<\/div>/)?.[1])??0,hours:l,rank:d}}catch(t){console.debug(`Error fetching Ebinstats for SteamID ${e}`,t);return}}async function k(e){try{console.debug(`Fetching player data from Leetify for SteamID ${e}`);const a=await(await fetch(`https://api.leetify.com/api/compare?friendName=${e}&period=1`)).json();if(!a||!a.player||Array.isArray(a.player))throw new Error("Invalid player data");return{updatedAt:new Date().toISOString(),avatar:a.player.profilePicture??"",ranks:{matchmaking:{current:a.player?.currentRanks?.matchmaking??void 0,highest:a.player?.highestRanks?.matchmaking??void 0},faceit:{current:a?.player?.currentRanks?.faceit??void 0,highest:a?.player?.highestRanks?.faceit??void 0}},ratings:{leetify:a.ratings.leetify,clutch:a.ratings.clutch.overall.clutchRating,opening:a.ratings.opening.openingRating}}}catch(t){console.debug(`Error fetching player data from Leetify for SteamID ${e}`,t);return}}async function S(e){try{console.debug(`Fetching player data from Steam Community for SteamID ${e}`);const a=await(await fetch(`https://steamcommunity.com/profiles/${e}?xml=1`,{redirect:"error"})).text(),r=/<hoursOnRecord>(.*)<\/hoursOnRecord>\s*<statsName><!\[CDATA\[CSGO\]\]>/;return{updatedAt:new Date().toISOString(),hours:c(a.match(r)?.[1]?.replaceAll(",",""))??0,avatar:a.match(/https:\/\/avatars\.akamai\.steamstatic.com\/\w+_full\.jpg/)?.[0]??"",memberSince:a.match(/<memberSince>([\w,\s\d]+)<\/memberSince>/)?.[1]??""}}catch(t){console.debug(`Error fetching player data from Steam Community for SteamID ${e}`,t);return}}async function D(e){const t=await m.get(e),[a,r,n]=await Promise.all([o(t?.sources?.leetify)||k(e),o(t?.sources?.steam)||S(e),o(t?.sources?.ebinstats)||v(e)]),s={steamId:e,sources:{leetify:a,steam:r,ebinstats:n}};return Object.values(s.sources).some(Boolean)&&h.cacheEnabled&&m.set(s),s}class b{key=t=>`kananuuskutin/cache/${t}`;async get(t){return(await chrome.storage.local.get(this.key(t)))[this.key(t)]}async set(t){return chrome.storage.local.set({[this.key(t.steamId)]:t})}async clear(){return chrome.storage.local.clear()}}function o(e){return e&&p(e.updatedAt)>=h.cacheExpirationSec?Promise.resolve(e):!1}const m=new b;chrome.runtime.onMessage.addListener((e,t,a)=>!e||typeof e!="string"?!1:(console.debug(`SteamID ${e} requested from background service worker`),D(e).then(a),!0));
