
export declare global {
    interface Window {
        webkit: {
            messageHandlers: {
                senguoBridge: {
                    postMessage: (params: any) => void
                }
            }
        }

        senguoBridge: {
            [key: string]: (...args: any) => void
        }

        senguoJsBridgeWebSide: any
    }
}
