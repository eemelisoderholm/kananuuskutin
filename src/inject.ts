import { PlayerData } from './player'
import { steamDefaultAvatarURL } from './steam'
import { cls, createEl, getText, yearsSince } from './utils'

// Find all SteamID elements on the page
document.querySelectorAll('.steam_player_id').forEach(steamIdEl => {
  const steamId = steamIdEl.textContent?.match(/\d{6,}/)?.[0]
  if (!steamId) return
  const teamEl = steamIdEl.closest('.size-1-of-2')
  const nameEl = steamIdEl.closest('.grid-flex')?.querySelector('.text.bold')
  const name = getText(nameEl)
  const team = getText(teamEl?.querySelector('h3'))
  const company = getText(teamEl?.querySelector('.text.standard')).replace('Yrityksen nimi:', '').trim()
  chrome.runtime.sendMessage(steamId, (playerData) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    steamIdEl.insertAdjacentElement('afterend', createPlayerCard({ ...playerData, name, team, company }))
    steamIdEl.remove()
    nameEl?.parentElement?.remove()
  })
})

function createPlayerCard(playerData: PlayerData) {
  return createEl('div', 'player', [
    createPlayerHeader(playerData),
    createSourceCards(playerData),
  ])
}

function createPlayerHeader(playerData: PlayerData) {
  const { name, team, company } = playerData
  return createEl('div', 'player-header', [
    createEl('div', 'player-header-left', createPlayerAvatar(playerData)),
    createEl('div', 'player-header-right', [
      createEl('div', 'player-header-name', name ?? ''),
      createEl('div', 'player-header-team', [
        createEl('strong', 'player-header-team-name', team ?? ''),
        company && createEl('span', 'player-header-team-company', `(${company})`)
      ])
    ])
  ])
}

function createChip(value: HTMLElement | string, { label, title }: { label?: string, title?: string } = {}): HTMLElement {
  const node = createEl('div', 'chip', [
    label && createEl('div', 'chip-label',
      label.startsWith('fa-icon:')
        ? createEl('i', label.replace('fa-icon:', '').split(' ').map(cn => `!${cn}`))
        : label
    ),
    createEl('div', 'chip-value', value)
  ])
  if (title) node.title = title
  return node
}

function createSourceCards(playerData: PlayerData) {
  const { steamId } = playerData
  return createEl('div', 'player-source-cards', [
    createSourceCard({
      id: 'ebinstats',
      content: createEbinstatsContent(playerData),
      url: `https://ebinstats.kanaliiga.fi/?s=playerstats&steamID=${steamId}`
    }),
    createSourceCard({
      id: 'leetify',
      content: createLeetifyContent(playerData),
      url: `https://beta.leetify.com/app/compare/${steamId}/${steamId}`,
      skip: !playerData.sources.leetify,
    }),
    createSourceCard({
      id: 'steam',
      content: createSteamContent(playerData),
      url: `https://steamcommunity.com/profiles/${steamId}`
    }),
    // TODO: https://csgostats.gg/player/${steamId}
  ])
}

function createLeetifyContent(playerData: PlayerData) {
  if (!playerData.sources.leetify) return document.createElement('div')
  const { ranks, ratings } = playerData.sources.leetify

  const highestMMRankRelevant = ranks.matchmaking.highest && ranks.matchmaking.highest !== ranks.matchmaking.current
  const highestFIRankRelevant = ranks.faceit.highest && ranks.faceit.highest !== ranks.faceit.current

  return createEl('div', 'player-leetify-content', [
    (ranks.matchmaking.current || ranks.faceit.current) &&
      createChip(createEl('div', 'player-rank-images', [
        ranks.matchmaking.current &&
          createRankImage('matchmaking', ranks.matchmaking.current),
        ranks.faceit.current &&
          createRankImage('faceit', ranks.faceit.current)
      ]), { title: 'Current rank according to leetify, based on last ~30 matches' }),
    (highestMMRankRelevant || highestFIRankRelevant) &&
      createChip(createEl('div', 'player-rank-images', [
        ranks.matchmaking.highest &&
          createRankImage('matchmaking', ranks.matchmaking.highest),
        ranks.faceit.highest &&
          createRankImage('faceit', ranks.faceit.highest)
      ]), { label: 'Best', title: 'Highest rank according to leetify, based on last ~30 matches' }),
    ratings?.leetify &&
      // Leetify seems to report leetify rating multiplied by 100
      createChip((ratings?.leetify * 100)?.toFixed(2), { label: 'Rating', title: 'Player Leetify rating' }),
      // Not sure how clutch and opening ratings are supposed to be displayed
      // createChip((ratings?.clutch * 100)?.toFixed(2), { label: 'Clutch' }),
      // createChip((ratings?.opening * 100)?.toFixed(2), { label: 'Opening' })
  ])
}

function createSteamContent({ steamId, sources }: PlayerData) {
  const hours = sources?.steam?.hours ?? 0
  const memberSince = new Date(sources?.steam?.memberSince ?? '')
  const years = isFinite(memberSince.getTime()) ? yearsSince(memberSince) : 0
  return createEl('div', 'player-steam-content', [
    createChip(steamId, { label: 'fa-icon:far fa-user', title: 'SteamID64' }),
    hours && createChip(`${hours}h`, { label: 'fa-icon:far fa-clock', title: 'Current total CS:GO hours according to Steam' }),
    years && createChip(`${years}y`, { label: 'fa-icon:far fa-cake-slice', title: 'Steam account age in years' })
  ])
}

function createEbinstatsContent({ sources }: PlayerData) {
  if (!sources.ebinstats) return document.createElement('div')
  const { adr, kpr, kdr, kanarating, hours, rank } = sources.ebinstats
  return createEl('div', 'player-ebinstats-content', [
    rank && createChip(createRankImage('matchmaking', rank), { title: 'Matchmaking rank reported during season sign-up' }),
    adr && createChip(adr.toString(), { label: 'ADR', title: 'Average Damage per Round' }),
    kpr && createChip(kpr.toFixed(2), { label: 'KPR', title: 'Average Kills Per Round' }),
    kdr && createChip(kdr.toFixed(2) , { label: 'KDR', title: 'Total Kill/Death Ratio'}),
    // kad && createChip(kad, { label: 'KAD', title: 'Total Kills / Assists / Deaths' }),
    kanarating && createChip(kanarating.toFixed(2), { label: 'Kana', title: 'Average Kanarating' }),
    hours && createChip(hours ? `${hours}h` : 'N/A', { label: 'fa-icon:far fa-clock', title: 'CS:GO hours reported during season sign-up' }),
  ])
}

interface SourceCardOpts {
  id: string
  url: string
  content: HTMLElement
  skip?: boolean
}

function createSourceCard({ id, url, content, skip }: SourceCardOpts): HTMLElement | undefined {
  if (skip) return
  content.classList.add(cls('player-source-card-content'))
  return createEl('div', ['player-source-card', `player-source-${id}`], [
    createLink(id, url, 'player-source-card-title'),
    createEl('div', 'player-source-card-container', content)
  ])
}

function createPlayerAvatar({ sources }: PlayerData) {
  const img = new Image()
  img.width = 60
  img.height = 60
  img.classList.add(cls('player-avatar'))
  img.src =
    sources?.steam?.avatar ||
    sources?.leetify?.avatar ||
    steamDefaultAvatarURL
  return img
}

type RankSystem = 'faceit' | 'matchmaking'

function createRankImage(system: RankSystem, rank: number) {
  const img = new Image()
  img.width = system === 'matchmaking' ? 50 : 20
  img.height = 20
  img.classList.add(cls(`player-${system}-rank-image`))
  if (rank > 0) {
      img.src = `https://beta.leetify.com/assets/images/rank-icons/${system}${rank}.png`
  }
  return img
}

function createLink(text: string | Element, href: string, classNames: string | string[] = []) {
  const a = document.createElement('a')
  a.href = href
  if (typeof text === 'string') {
    a.textContent = text
  } else {
    a.appendChild(text)
  }
  a.target = '_blank'
  if (typeof classNames === 'string') classNames = [classNames]
  classNames.map(cls).forEach(name => a.classList.add(name))
  return a
}