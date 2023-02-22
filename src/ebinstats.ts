import { parseFloatFinite, parseIntFinite } from './utils'

export interface PlayerEbinstatsData {
  updatedAt: string
  hours: number
  adr: number
  kpr: number
  kad: string
  kills: number
  assists: number
  deaths: number
  kdr: number
  kanarating: number
  rank: number
}

export async function fetchPlayerEbinstatsData(steamId: string): Promise<PlayerEbinstatsData | undefined> {
  try {
    console.debug(`Fetching player data from Ebinstats for SteamID ${steamId}`)
    const res = await fetch(`https://ebinstats.kanaliiga.fi/?s=playerstats&steamID=${steamId}`)
    const html = await res.text()

    // Turns out DOMParser isn't supported within Service Workers. Regex for HTML it is then!

    const kad = html.match(/Total stats \(K\/A\/D\)<\/div>\s*<div.*?>(\d{1,6} \/ \d{1,6} \/ \d{1,6})<\/div>/)?.[1] ?? '0 / 0 / 0'
    const [kills, assists, deaths] = kad.split(' / ').map(x => parseIntFinite(x) ?? 0)
    const kdr = isFinite(kills / deaths) ? kills / deaths : kills
    const hours = parseIntFinite(html.match(/(\d*)<\/div><div class='bold'>CS:GO Hours/)?.[1]) ?? 0
    const rank = parseIntFinite(html.match(/csgo_ranks\/(\d{1,2})\.png/)?.[1]) ?? 0

    // Ebinstats can output an empty "No such player" document for valid players,
    if (!hours && !rank && !kdr) return
    
    return {
      updatedAt: new Date().toISOString(),
      adr: parseIntFinite(html.match(/Average ADR<\/div>\s*<div.*?>(\d*)<\/div>/)?.[1]) ?? 0,
      kad,
      kills,
      assists,
      deaths,
      kdr,
      kpr: parseFloatFinite(html.match(/KPR<\/div>\s*<div.*?>([+-]?([0-9]*[.])?[0-9]+)<\/div>/)?.[1]) ?? 0,
      kanarating: parseFloatFinite(html.match(/Average Kanarating<\/div>\s*<div.*?>([+-]?([0-9]*[.])?[0-9]+)<\/div>/)?.[1]) ?? 0,
      hours,
      rank,
    }
  } catch (err) {
    console.debug(`Error fetching Ebinstats for SteamID ${steamId}`, err)
    return
  }
}

