# Kananuuskutin Chrome Extension

Embed some [Leetify](https://beta.leetify.com/), [Ebinstats](https://ebinstats.kanaliiga.fi/) and [Steam Community](https://steamcommunity.com/) links and data about player CS:GO ranks, play hours etc. to [Toornament](https://www.toornament.com/en_US/) match players page.

Makes snooping [Kanaliiga](https://kanaliiga.fi/) opponents a bit more convenient before matches. I like to share a screenshot of the player info while scheduling the next match with my team, so this helps with that.

This thing is *super fragile*, very minor changes in any service could break this at any moment. Use at your own risk and hope for the best. Don't hold you breath for fixes when it inevitably breaks in the future.

## Installation

This is not published to the extension store for now, so:

1. Download and extract, or clone this repo
2. Go to Chrome extensions view
3. Enable the developer mode toggle
4. Load this directory as unpacked extension

## Usage

Navigate to a match in Toornament, and open the players tab.

The player names and SteamIDs should be replaced by more detailed player cards, as data is fetched.

The matched URL is `https://play.toornament.com/*/tournaments/*/matches/*/players`

The data from each service is cached locally for 24 hours. This MVP is VMP, meaning no settings or controls for the extension. If you want more recent data, or there's a problem, your best bet is removing and reinstalling the extension.

## Development

Requires [NodeJS](https://nodejs.org/en/) to build

1. `npm install`
2. `npm run build`

Rollup is configured to handle two module entry points, `content.ts` and `background.ts`, and bundle into two respective files in `/dist`

* `inject.js` [Content script](https://developer.chrome.com/docs/extensions/mv3/content_scripts/) executed within the page context, responsible for the DOM reading and manipulation.
* `worker.js` [Service worker](https://developer.chrome.com/docs/extensions/mv3/migrating_to_service_workers/#workers) runs in a separate thread, bypassing CORS restrictions content scripts are subject to.

## Other thoughts / details / TODO

I originally wanted to build another small stats web app that crammed more data into single "upcoming match" view, but decided to go browser extension route since a lot of the data isn't available through any sort of reasonable public API, and this way any sketchy web scraping involved is at least technically user-driven.

For now there's no runtime dependencies, as the initial idea was to keep this a trivial one file userscript, but it's past that point and it's probably time to pick some UI lib to clean up the messy rendering with raw DOM ops.

Could also add some proper XML/HTML parsers as deps to make the parsing less horrific, turns out the native DOMParser isn't available in Service Workers, so it's all RegEx for now ":D"

Random feature ideas I might explore next if I have time, but my commitment here is incredibly slim
* Team-level stats. Match by team name to Kanaliiga stats/ebinstats, pull best and worst maps for quick pick/ban insight.
* Maybe consider rendering in a different view and using Toornament as a data source.
* Make it more dense, but still readable. All the interesting and not so interesting info about upcoming match fitting on a single screen(shot) is a priority.
* Remove /dist from version control, configure rollup to zip the build and the manifest, Github action to make a release.
* Maybe use Manifest as the entry point for builds, looks like there's [some tools](https://github.com/crxjs/chrome-extension-tools) for that
