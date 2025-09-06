import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
type AsyncThunkResponseType = {
    axiosInstance: AxiosInstance,
    value?:any,
    componentType: string
    id?:any
} 

type AsyncThunkPublicResponseType = {
    value?:any,
    componentType: string
    id?:any
} 


type ReturnErrorType = {
    componentType:string,
    status:number,
    statusText: string,
    msg:string,
    name: string,
    message: string
}

export  type {AsyncThunkResponseType, AsyncThunkPublicResponseType,ReturnErrorType}