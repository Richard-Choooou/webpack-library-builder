export function generateRandomKey(length: number = 16): string {
    const arr = ['1', '2', '3', '4', '5', '6', '7', '8',
        '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
        'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y',
        'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
        'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    let str = ''
    for (let i = 0; i < length; i++) {
        str += arr[Math.floor(Math.random() * arr.length)]
    }

    return str
}

export function transferData(data: any): any {
    if (Object.prototype.toString.call(data) === "[object Object]") {
        if ('$$senguoBridgePrivate' in data) { // jsbridge 需要转换类型的数据
            if (data['$$type'] === 'file') { // 文件类型
                return base64ToFile(data.name, data.mimeType, data.base64)
            }
        } else {
            for (let i in data) {
                data[i] = transferData(data[i])
            }
        }
    } else if (Object.prototype.toString.call(data) === "[object Array]") {
        for (let i = 0; i < data.lenght; i++) {
            data[i] = transferData(data[i])
        }
    }

    return data
}

const userAgent = navigator.userAgent

export const isIos = !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)

export const isAndroid = userAgent.indexOf('Android') > -1 || userAgent.indexOf('Adr') > -1;

function base64ToFile(fileName: string, mimeType: string, base64: string) {
    let bstr = atob(base64)
    let n = bstr.length
    let u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
    return new File([u8arr], fileName, {type: mimeType});
}