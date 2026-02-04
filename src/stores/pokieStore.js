import { writable, derived } from 'svelte/store'

export const options = writable({})
export const showNameSelection = writable(true)
export const isSpectator = writable(false)
export const name = writable('')
export const nameErrors = writable([])
export const pointOptions = writable([1, 2, 3, 5, 8, 13])
export const mySelection = writable(null)
export const players = writable([])
export const cardsFlipped = writable(false)
export const waitingForMessage = writable(false)
export const lastChosenPoints = writable(null)
export const confetti = writable({})
export const placeholderName = writable(getRandomName())
export const roomId = writable('')
export const roomPrefilled = writable(false)

export const playersStillChoosing = derived([players], ([$players]) => {
    let playersStillThinking = $players.filter(player => !player.points).map(player => player.user)

    if(playersStillThinking.length <= 2) {
        return playersStillThinking.join(' and ')
    } else {
        let lastPlayer = playersStillThinking[playersStillThinking.length - 1]
        lastPlayer = ` and ${lastPlayer}`
        return playersStillThinking.join(', ')
    }
})

function getRandomName() {
    let firstNames = ['Berthefried', 'Tatiana', 'Hildeburg', 'Bilbo', 'Frodo', 'Theodulph', 'Poppy', 'Daddy', 'Hilda', 'Falco', 'Bandobras','Odo','Eglantine','Gerontius','Samwise','Gorbadoc','Gormadoc','Griffo','Lotho','Andwise','Bungo','Bilbo','Mungo','Balbo','Bingo','Dudo','Drogo','Elfstan','Ferdibrand','Meriadoc','Peregrin','Hamfast','Rosamunda','Menegilda','Wiseman','Wilcom','Merry','Asphodel','Firiel','Hildigrim','Donnamira','Rosie','Filibert','Sigismond','Isembold','Hugo','Lalia','Marmadoc','Saradoc','Primula','Tobold','Mimosa','Orgulas','Frodo','Lobelia','Togo','Celandine','Wilibald','Robin','Ted','Adaldrida','Will','Adamanta','Belladonna','Flambard','Adalgrim','Hob',]
    let lastNames = ['Baggins', 'Lightfoot', 'Boulderhill', 'Bolger','Twofoot','Bracegirdle','Chubb-Baggins','Bullroarer','Proudfoot','Took','Gamgee','Broadbelt','Deepdelver','Boffin','Pimple','Roper','Baggins','Fairbarn','Brandybuck','Goold','Gamwich','Jolly','Gardner','Burrows','Fairbairn','Cotton','Clayhanger','Masterful','Scattergold','Hornblower','Bunce','Sackville-Baggins','Goodbody','Smallburrow','Sandyman','Whitfoot','Hayward']

    let name = `${pickRandom(firstNames)} ${pickRandom(lastNames)}`
    return name
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}
