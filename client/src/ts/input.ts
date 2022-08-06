export function createMessageInput(
    inputCb: (message: string, maxMessageSize: number) => void,
    textElementId: string = "chat-input",
    sendElementId: string = "chat-submit",
    maxMessageSize: number = 512,
): void {
    const textElement: HTMLTextAreaElement = document.getElementById(textElementId) as any
    if (!textElement) {
        throw new Error("Cant find html element with id: '" + textElement + "'")
    }
    textElement.setAttribute("maxlength", "" + maxMessageSize)
    const sendElement: HTMLButtonElement = document.getElementById(sendElementId) as any
    if (!sendElement) {
        throw new Error("Cant find html element with id: '" + sendElementId + "'")
    }

    const submit = () => {
        if (textElement.value.split("\n").join("").split(" ").join("").length !== 0) {
            let value = textElement.value
            textElement.value = ""
            while (
                value.startsWith(" ") ||
                value.startsWith("\n")
            ) {
                value = value.substring(1)
            }
            while (
                value.endsWith(" ") ||
                value.endsWith("\n")
            ) {
                value = value.slice(0, -1)
            }
            inputCb(value, maxMessageSize)
        } else {
            textElement.value = ""
        }
    }
    sendElement.onclick = (event) => {
        if (event.button !== 0) {
            return
        }
        submit()
    }
    let shift: boolean
    textElement.onkeydown = (event) => {
        if (event.key === "Shift") {
            shift = true
        }
    }
    textElement.onkeyup = (event) => {
        if (event.key === "Shift") {
            shift = false
        }
        if (
            shift ||
            event.key !== "Enter"
        ) {
            return
        }
        if (textElement.value.length > maxMessageSize) {
            textElement.value = textElement.value.slice(0, maxMessageSize)
            return
        }
        submit()
    }
}