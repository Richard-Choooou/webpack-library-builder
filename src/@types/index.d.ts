
export declare global {
    interface Window {
        webkit: {
            messageHandlers: {
                senguoJsBridge: {
                    postMessage: (params: any) => void
                }
            }
        }

        senguoBridge: {
            [key: string]: (...args: any) => void
        }
    }
}
