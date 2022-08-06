
export interface AudioData {
    [key: string]: HTMLAudioElement
}

export interface AudioManager {
    getData(): AudioData,
    get(id: string): HTMLAudioElement,
    set(id: string, element: HTMLAudioElement): void,
    remove(id: string): void,
    play(id: string): void,
    loadAudio(id: string): HTMLAudioElement,
    loadList(): void,
}

export function getAudioManager(): AudioManager {
    const audioData: AudioData = {}
    return {
        getData: () => audioData,
        get(id: string): HTMLAudioElement {
            return audioData[id]
        },
        set: (id: string, element: HTMLAudioElement) => {
            audioData[id] = element
        },
        loadAudio: (id: string) => {
            const element: HTMLAudioElement = document.getElementById(id) as any
            audioData[element.id] = element
            return element
        },
        remove: (id: string) => {
            delete audioData[id]
        },
        play: (id: string) => {
            audioData[id].pause()
            audioData[id].currentTime = 0
            audioData[id].play()
        },
        loadList: () => {
            const audioElements = document.getElementsByTagName("audio")

            for (let index = 0; index < audioElements.length; index++) {
                const srcElement = audioElements.item(index)
                if (srcElement) {
                    const newElement = new Audio(srcElement.src)
                    newElement.id = srcElement.id
                    newElement.volume = Number(srcElement.volume)
                    if (
                        typeof newElement.id !== "string" ||
                        newElement.id.length === 0
                    ) {
                        continue
                    }
                    audioData[newElement.id] = newElement
                }
            }
        },
    }
}