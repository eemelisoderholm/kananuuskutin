import { parseIntFinite } from './utils'

export interface PlayerSteamData {
  updatedAt: string
  hours: number
  avatar: string
  memberSince: string
}

export const steamDefaultAvatarURL = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/b5/b5bd56c1aa4644a474a2e4972be27ef9e82e517e_full.jpg'

export async function fetchPlayerSteamData(steamId: string): Promise<PlayerSteamData | undefined> {
  try {
    console.debug(`Fetching player data from Steam Community for SteamID ${steamId}`)
    const res = await fetch(`https://steamcommunity.com/profiles/${steamId}?xml=1`, { redirect: 'error' })
    const xml = await res.text()

    const hoursRegex = /<hoursOnRecord>(.*)<\/hoursOnRecord>\s*<statsName><!\[CDATA\[CSGO\]\]>/
    return {
      updatedAt: new Date().toISOString(),
      hours: parseIntFinite(xml.match(hoursRegex)?.[1]?.replaceAll(',', '')) ?? 0,
      avatar: xml.match(/https:\/\/avatars\.akamai\.steamstatic.com\/\w+_full\.jpg/)?.[0] ?? '',
      memberSince: xml.match(/<memberSince>([\w,\s\d]+)<\/memberSince>/)?.[1] ?? '',
    }
  } catch (err) {
    console.debug(`Error fetching player data from Steam Community for SteamID ${steamId}`, err)
    return
  }
}

// TODO: Also get data from https://steamcommunity.com/profiles/${steamId}/stats/csgo/?xml=1 ?