
export interface PlayerLeetifyData {
  updatedAt: string
  avatar: string
  ranks: Record<LeetifyRankType, {
    current?: number
    highest?: number
  }>
  ratings: {
    leetify: number
    clutch: number
    opening: number
  }
}

export type LeetifyRankType = 'matchmaking' | 'faceit'

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access  */
export async function fetchLeetifyPlayerData(steamId: string): Promise<PlayerLeetifyData | undefined> {
  try {
    console.debug(`Fetching player data from Leetify for SteamID ${steamId}`)
    const res = await fetch(`https://api.leetify.com/api/compare?friendName=${steamId}&period=1`)
    const data = await res.json()
    if (!data || !data.player || Array.isArray(data.player)) {
      throw new Error('Invalid player data')
    }
    return {
      updatedAt: new Date().toISOString(),
      avatar: data.player.profilePicture ?? '',
      ranks: {
        matchmaking: {
          current: data.player?.currentRanks?.matchmaking ?? undefined,
          highest: data.player?.highestRanks?.matchmaking ?? undefined,
        },
        faceit: {
          current: data?.player?.currentRanks?.faceit ?? undefined,
          highest: data?.player?.highestRanks?.faceit ?? undefined,
        }
      },
      ratings: {
        leetify: data.ratings.leetify,
        clutch: data.ratings.clutch.overall.clutchRating,
        opening: data.ratings.opening.openingRating,
      }
    }
  } catch (err) {
    console.debug(`Error fetching player data from Leetify for SteamID ${steamId}`, err)
    return
  }
}