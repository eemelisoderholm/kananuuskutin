import { getPlayerData } from './player'

chrome.runtime.onMessage.addListener(
  (message, _, callback) => {
    if (!message || typeof message !== 'string') return false
    console.debug(`SteamID ${message} requested from background service worker`)
    void getPlayerData(message).then(callback)
    return true
  }
)
