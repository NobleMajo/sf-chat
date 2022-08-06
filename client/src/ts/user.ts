export function createHtmlUser(
    user: UserDate
): HTMLLIElement {
    const userElement: HTMLLIElement = document.createElement("li");
    userElement.innerHTML =
        `<li>` +
        `<img height="55px" width="55px" src="${user.avatar}" alt="">` +
        `<div>` +
        `<h2>${user.issuer}</h2>` +
        `<h3>` +
        `<span class="status ${user.status}"></span>` +
        `${user.msg}` +
        `</h3>` +
        `</div>` +
        `</li>`
    return userElement
}

export interface UserDate {
    issuer: string,
    avatar: string,
    msg: string,
    status: "green" | "orange" | "yellow" | "blue",
}

export interface UserListData {
    [key: string]: {
        data: UserDate,
        element: HTMLLIElement
    }
}

export interface UserList {
    add(user: UserDate): void
    remove(user: UserDate | string): void
    get(user: UserDate | string): undefined | { data: UserDate, element: HTMLLIElement }
    list(): UserListData
    clear(): void
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

export function getUserList(
    elementId: string = "user-holder"
): UserList {
    let userListData: UserListData = {}
    const userListElement = document.getElementById(elementId)
    if (!userListElement) {
        throw new Error(
            "Cant find html element with id: '" +
            elementId + "'"
        )
    }
    return {
        get: (user) => {
            if (typeof user === "object") {
                user = user.issuer
            }
            return userListData[user]
        },
        add: (data) => {
            const autoScroll = isElementScrolledToBottom(userListElement)
            const element = createHtmlUser(data)
            element.setAttribute("id", "user-" + data.issuer)
            userListData[data.issuer] = {
                data: data,
                element: element,
            }
            userListElement.append(element)
            if (autoScroll) {
                scrollToBottom(userListElement)
            }
        },
        remove: (user) => {
            if (typeof user === "object") {
                user = user.issuer
            }
            if (userListData[user] === undefined) {
                return
            }
            userListData[user].element.remove()
            delete userListData[user]
        },
        list: () => userListData,
        clear: () => {
            userListData = {}
            userListElement.innerHTML = ""
        },
    }
}