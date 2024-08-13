import { Request } from 'express'

export type IReqUserData = { userId: number }

export type IReqUser = Request & { user?: IReqUserData }

export type IUser = {
    id: number
    username: string
}

export interface IWeather {
    temperature: number
    condition: string
}
