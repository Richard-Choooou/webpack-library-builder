import { defines } from "./define"
import { generateRandomKey, isIos, transferData } from "./utils"
export interface ClientResult {
    success: boolean
    code?: string
    data?: any
    message?: string
}

type invokeClientMethodParams = {
    [key: string]: any
}

type invokeClientMethodCallback = (result: ClientResult) => void

abstract class BaseBridge {
    private isReady = false
    private listenReadyFn = new Set<() => void>()
    private eventMap: {
        [key: string]: Set<(params: any) => void>
    } = {}
    private callbackMap: {
        [key: string]: (params: ClientResult) => void
    } = {}

    public define = defines

    protected abstract clientInterfaceAdapter(params: {
        target: string,
        action: string,
        params?: invokeClientMethodParams,
        callbackName?: string
    }): void

    constructor() {
        this.initWebInterface()
        // this.addEventListener('invokeCallback', (result) => { // 订阅客户端执行 web 端回调函数事件
        //     if (result.data && result.data.callbackName) {
        //         this.callbackMap[result.data.callbackName](result.data.callbackData)
        //         Reflect.deleteProperty(this.callbackMap, result.data.callbackName)
        //     }
        // })

        this.addEventListener('onReady', () => this._setBridgeReady())
    }

    private initWebInterface() {
        window.senguoJsBridgeWebSide = this
    }

    public canIUse(target: string, action: string, callback: (result: ClientResult) => void) {
        this.sendEventToClient("$$bridge", "canIUse", {
            module: target,
            service: action
        }, callback)
    }
 
    public getServiceInfo(target: string, action: string, callback: (result: ClientResult) => void) {
        this.sendEventToClient("$$bridge", "getServiceInfo", {
            module: target,
            service: action
        }, callback)
    }

    public onReady(fn: () => void) {
        if (this.isReady) {
            fn()
        } else {
            this.listenReadyFn.add(fn)
        }
    }

    public addEventListener(event: string, fn: (result: ClientResult) => void) {
        this.eventMap[event] = this.eventMap[event] || new Set()
        this.eventMap[event].add(fn)

        return () => {
            this.eventMap[event].delete(fn)
        }
    }

    private _dispatchEvent(event: string, rawData: any) {
        console.log('jsBridgeRawEvent', event, rawData)
        const data = transferData(rawData)
        console.log(data)
        if (event === 'invokeCallback') { // 回调客户端函数
            if (data.callbackName) {
                const fn = this.callbackMap[data.callbackName]
                Reflect.deleteProperty(this.callbackMap, data.callbackName)
                if (fn) {
                    return fn(data.callbackData as ClientResult)
                }
            }
        } else {
            const listeners = this.eventMap[event]
            if (listeners) {
                listeners.forEach(fn => fn(data))
            }
        }
    }

    public removeEventListener(event: string, fn: (result: ClientResult) => void) {
        this.eventMap[event] = this.eventMap[event] || new Set()
        this.eventMap[event].delete(fn)
    }

    public sendEventToClient(target: string, action: string): void

    public sendEventToClient(target: string, action: string, params: invokeClientMethodParams | invokeClientMethodCallback): void

    public sendEventToClient(target: string, action: string, params: invokeClientMethodParams, callback?: invokeClientMethodCallback): void

    public sendEventToClient(target: string, action: string, params?: invokeClientMethodParams, callback?: invokeClientMethodCallback) {
        if (callback) {
            const callbackName = generateRandomKey(32)
            this.callbackMap[callbackName] = callback
            this.clientInterfaceAdapter({
                target, action, params, callbackName
            })
        } else if (params) {
            if (Object.prototype.toString.call(params) === "[object Object]") {
                this.clientInterfaceAdapter({
                    target, action, params
                })
            } else if (Object.prototype.toString.call(params) === "[object Function]") {
                const callbackName = generateRandomKey(32)
                this.callbackMap[callbackName] = params as invokeClientMethodCallback
                this.clientInterfaceAdapter({
                    target, action, params: {}, callbackName
                })
            } else {
                console.warn(`[jsBridge] 错误的参数类型：${params}，仅能传入键值对对象或者函数` )
                this.clientInterfaceAdapter({
                    target, action
                })
            }
        } else {
            this.clientInterfaceAdapter({
                target, action
            })
        }
    }

    // private _receiveClientEvent(event: string, data: ClientResult) {
    //     const params = dataAdapter(data)
    //     if (this.eventMap[event]) {
    //         this.eventMap[event].forEach(fn => fn(params))
    //     }
    // }

    private _setBridgeReady() {
        this.isReady = true
        this.listenReadyFn.forEach(fn => fn())
        this.listenReadyFn.clear()
    }
}

class IosBridge extends BaseBridge {
    constructor() {
        super()
    }

    protected clientInterfaceAdapter(params: {
        target: string,
        action: string,
        params?: invokeClientMethodParams,
        callbackName?: string
    }) {
        window.webkit.messageHandlers.senguoBridge.postMessage(params)
    }
}

class AndroidBridge extends BaseBridge {
    constructor() {
        super()
    }

    protected clientInterfaceAdapter(params: {
        target: string,
        action: string,
        params?: invokeClientMethodParams,
        callbackName?: string
    }) {
        window.senguoBridge.sendEvent(JSON.stringify(params))
    }
}

const bridge = isIos ? new IosBridge() : new AndroidBridge()


export default bridge


// export const Test