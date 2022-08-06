import { Node } from 'statefull-api/dist/types'

export interface BaseEvent {
    action: string,
    time: number,
    issuer: string,
}

export interface MessageEvent extends BaseEvent {
    action: "msg",
    msg: string,
}

export interface InitEvent extends BaseEvent {
    action: "init",
    node: Node,
    users: UserJoinEvent[],
    user: UserJoinEvent
}

export interface UserJoinEvent extends BaseEvent {
    action: "user.join",
    avatar: string,
}

export interface UserLeaveEvent extends BaseEvent {
    action: "user.leave",
}

export interface InitData {
    node: Node,
    users: UserJoinEvent[],
}

export type AnyEvent = MessageEvent | UserJoinEvent | UserLeaveEvent
