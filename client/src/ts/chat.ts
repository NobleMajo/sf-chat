
export interface MessageDate {
    pos: "left" | "center" | "right",
    bg: "green" | "red" | "yellow" | "blue" | "dark",
    time: number | string,
    issuer: string,
    msg: string,
    status: "green" | "orange" | "yellow" | "blue" | "dark",
}

export function createHtmlMessage(
    data: MessageDate
): HTMLLIElement {
    if (typeof data.time === "number") {
        data.time = new Date(data.time).toLocaleString()
    }
    const message: HTMLLIElement = document.createElement("li")
    message.classList.add("msg-" + data.pos)
    message.classList.add("msg-" + data.bg)
    message.innerHTML =
        `<div class="entete">` +
        `<span class="status ${data.status}"></span> ` +
        `<h2>${data.issuer}</h2> <h3>${data.time}</h3>` +
        `</div>` +
        `<div class="triangle"></div>` +
        `<div class="msg">` +
        `<pre>${data.msg}</pre>` +
        `</div>`
    return message
}

export interface ChatManager {
    get: () => ChatData
    remove: (millis: number) => void,
    add: (data: MessageDate) => void
    clear: () => void
}

export function isElementScrolledToBottom(
    element: HTMLElement
): boolean {
    if (element.scrollTop >= (element.scrollHeight - element.offsetHeight)) {
        return true;
    }
    return false;
}

export function scrollToBottom(
    element: HTMLElement
): void {
    element.scrollTop = element.scrollHeight;
}

export interface ChatData {
    [key: string]: {
        data: MessageDate,
        element: HTMLLIElement,
        refresh: () => void,
    }
}

export function getChatManager(
    elementId: string = "chat-holder"
): ChatManager {
    let chatData: ChatData = {}
    const chatManagerElement = document.getElementById(elementId)
    if (!chatManagerElement) {
        throw new Error(
            "Chat Manager element with id '" +
            elementId + "' not found"
        )
    }
    return {
        get: () => chatData,
        remove: (millis: number) => {
            delete chatData["" + millis]
        },
        add: (data: MessageDate) => {
            const autoScroll = isElementScrolledToBottom(chatManagerElement)
            const element = createHtmlMessage(data)
            chatData[data.time] = {
                data: data,
                element: element,
                refresh: () => {
                    const nElement = createHtmlMessage(data)
                    chatData[data.time].element.innerHTML = nElement.innerHTML
                    chatData[data.time].element.classList.forEach((c) => {
                        chatData[data.time].element.classList.remove(c)
                    })
                    nElement.classList.forEach((c) => {
                        chatData[data.time].element.classList.add(c)
                    })
                },
            }
            chatManagerElement.append(element)
            if (autoScroll) {
                scrollToBottom(chatManagerElement)
            }
        },
        clear: () => {
            chatData = {}
            chatManagerElement.innerHTML = ""
        }
    }
}