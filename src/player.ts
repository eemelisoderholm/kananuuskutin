import { config } from './config'
import { fetchPlayerEbinstatsData, PlayerEbinstatsData } from './ebinstats'
import { fetchLeetifyPlayerData, PlayerLeetifyData } from './leetify'
import { fetchPlayerSteamData, PlayerSteamData } from './steam'
import { secondsSince } from './utils'

export interface PlayerData {
  steamId: string
  name?: string
  team?: string
  company?: string
  sources: {
    steam?: PlayerSteamData
    leetify?: PlayerLeetifyData
    ebinstats?: PlayerEbinstatsData
  }
}

// TODO: Don't pass whole PlayerData objects with optional fields
// for the local in-page data, only the sources record and steamId

export async function getPlayerData(steamId: string): Promise<PlayerData> {
  const cached = config.cacheEnabled ? await playerCache.get(steamId) : undefined

  const [leetify, steam, ebinstats] = await Promise.all([
    resolveFresh(cached?.sources?.leetify) || fetchLeetifyPlayerData(steamId),
    resolveFresh(cached?.sources?.steam) || fetchPlayerSteamData(steamId),
    resolveFresh(cached?.sources?.ebinstats) || fetchPlayerEbinstatsData(steamId)
  ])
  const player: PlayerData = { steamId, sources: { leetify, steam, ebinstats } }

  const someDataReceived = Object.values(player.sources).some(Boolean)
  if (someDataReceived && config.cacheEnabled) void playerCache.set(player)

  return player
}

class PlayerDataCache {

  private key = (steamId: string) => `kananuuskutin/cache/${steamId}`

  public async get(steamId: string): Promise<PlayerData | undefined> {
    const found = await chrome.storage.local.get(this.key(steamId))
    return found[this.key(steamId)] as PlayerData
  }

  public async set(player: PlayerData) {
    return chrome.storage.local.set({ [this.key(player.steamId)]: player })
  }

  public async clear() {
    return chrome.storage.local.clear()
  }
}

/** Return given data as a resolved promise if it's not expired, otherwise return false */
function resolveFresh<T extends { updatedAt: string }>(data?: T): Promise<T> | false {
  return data && secondsSince(data.updatedAt) >= config.cacheExpirationSec
    ? Promise.resolve(data)
    : false
}

const playerCache = new PlayerDataCache()

