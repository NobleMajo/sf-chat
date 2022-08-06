import { createMessageInput } from "./input"
import { StatefullClient } from "statefull-client"
import { getChatManager } from "./chat"
import { getUserList } from './user';
import { AnyEvent } from "./types";
import { getAudioManager } from "./audioloader"

const chatManager = getChatManager()
const userList = getUserList()
const audioManager = getAudioManager()
audioManager.loadList()

let nodeName: string
let chatName: HTMLHeadElement
let chatStatus: HTMLHeadElement

const sfClient = new StatefullClient({
    onDisconnect: () => {
        chatManager.add({
            bg: "red",
            status: "orange",
            pos: "center",
            issuer: "System",
            time: Date.now(),
            msg: "Your connection dropped!",
        })
        chatName.innerHTML = "Connection dropped"
        chatStatus.innerHTML = "Reconnect in 10 seconds..."
        audioManager.play("discord-leave")
        setTimeout(() => {
            audioManager.play("pornhub")
            setTimeout(() => {
                chatStatus.innerHTML = "Reconnect..."
                location.reload()
            }, 1000 * 5)
        }, 1000 * 5)
    },
    onData: (client, data) => {
        const aEvent: AnyEvent = data as any
        if (aEvent.action === "msg") {
            chatManager.add({
                bg: "blue",
                pos: "left",
                status: "green",
                issuer: aEvent.issuer,
                msg: aEvent.msg,
                time: aEvent.time,
            })
            audioManager.play("troete")
        } else if (aEvent.action === "user.join") {
            userList.add({
                status: "green",
                issuer: aEvent.issuer,
                msg: new Date(aEvent.time).toLocaleString(),
                avatar: aEvent.avatar,
            })
            chatManager.add({
                bg: "dark",
                status: "yellow",
                pos: "center",
                issuer: "System",
                time: Date.now(),
                msg: aEvent.issuer + " joined the chat.",
            })
            Object.values(chatManager.get()).forEach((data) => {
                data.data.issuer === aEvent.issuer
                data.data.status === "green"
                data.refresh()
            })
            audioManager.play("billigerhose")
        } else if (aEvent.action === "user.leave") {
            userList.remove(aEvent.issuer)
            chatManager.add({
                bg: "dark",
                status: "yellow",
                pos: "center",
                issuer: "System",
                time: Date.now(),
                msg: aEvent.issuer + " left the chat.",
            })
            Object.values(chatManager.get()).forEach((data) => {
                data.data.issuer === aEvent.issuer
                data.data.status === "orange"
                data.refresh()
            })
            audioManager.play("fuerfortnite")
        } else {
            console.error("Unknown event: ", aEvent)
        }
    },
    onInit: (client, initObj: any) => {
        nodeName = "" + (initObj.node.id + 1)
        chatName = document.getElementById("chat-name") as any
        chatStatus = document.getElementById("chat-status") as any
        chatName.innerHTML = "Chat " + nodeName
        chatStatus.innerHTML = "You are connected!"

        userList.add({
            status: "green",
            issuer: initObj.user.issuer,
            msg: new Date(initObj.user.time).toLocaleString(),
            avatar: initObj.user.avatar,
        })
        for (const user of initObj.users) {
            userList.add({
                status: "green",
                issuer: user.issuer,
                msg: new Date(user.time).toLocaleString(),
                avatar: user.avatar,
            })
        }
        createMessageInput((msg, maxMessageSize) => {
            console.info("#Send message: " + msg)
            if (msg.length > maxMessageSize) {
                chatManager.add({
                    bg: "green",
                    status: "orange",
                    pos: "right",
                    msg: "Message was not delivered!\nIt was to huge...",
                    time: Date.now(),
                    issuer: "System",
                })
            }
            client.sfws.send({
                msg: msg
            })
            chatManager.add({
                bg: "green",
                status: "green",
                pos: "right",
                issuer: "You",
                time: Date.now(),
                msg: msg,
            })
        })

        const loading: HTMLDivElement = document.getElementById("loading") as any
        const container: HTMLDivElement = document.getElementById("container") as any
        loading.style.display = "none"
        container.style.display = "block"

        chatManager.add({
            bg: "dark",
            status: "green",
            pos: "center",
            issuer: "System",
            time: Date.now(),
            msg: "You have connected to node " + (initObj.node.id + 1) + ".",
        })
    },
    onDebug: (client, msg, type, ...messages) => {
        const messages2: any[] = []
        for (const message of messages) {
            messages2.push(message)
            messages2.push("\n")
        }
        let logFunction: any
        if (type === "error") {
            logFunction = console.error
        } else if (type === "warning") {
            logFunction = console.warn
        } else {
            logFunction = console.info
        }
        logFunction(
            "SFC " + msg + " [" + type + "]:\n",
            ...messages2
        )
    }
})
sfClient.start()