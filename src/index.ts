import * as d3 from "d3"
import 'toolcool-color-picker'

type DrawAreaEventListener = (event: {
    type: "pointDown" | "pointMove" | "pointUp",
    data: {
        x: number,
        y: number,
        button: 1 | 2
    }
}) => void

class DrawArea {
    util: CanvasDrawUtil | null = null
    eventListeners: Set<DrawAreaEventListener> = new Set()
    svgSelector: d3.Selection<d3.BaseType, unknown, HTMLElement, any>
    controlSelector: HTMLDivElement
    scale: number = 1
    transformX: number = 0
    transformY: number = 0
    isPointDown = false
    lastX = 0
    lastY = 0
    viewBoxWidth = 0
    viewBoxHeight = 0

    constructor(controlSelector: string, svgSelector: string) {
        // const start: any = d3.drag().on("start", this._onPointDown).on("drag", this._onPointMove).on("end", this._onPointUp)
        this.svgSelector = d3.select(svgSelector)
        // this.controlSelector = d3.select(controlSelector)
        this.controlSelector = document.querySelector(controlSelector) as HTMLDivElement
        // this.controlSelector.call(start)
        this.initEventListener()
    }

    private initEventListener() {
        this.controlSelector!.addEventListener('mousedown', this.onMouseDown.bind(this))
        this.controlSelector!.addEventListener('contextmenu', event => {
            event.preventDefault()
        })
        this.controlSelector!.addEventListener('mousemove', this.onMouseMove.bind(this))
        // this.controlSelector!.addEventListener('mouseup', this.onMouseUp.bind(this))
        // this.controlSelector!.addEventListener('mouseleave', this.onMouseUp.bind(this))
        // this.controlSelector!.addEventListener('touchstart', this.onTouchStart.bind(this))
        // this.controlSelector!.addEventListener('touchmove', this.onTouchMove.bind(this))
        // this.controlSelector!.addEventListener('touchend', this.onTouchEnd.bind(this))
        // this.controlSelector!.addEventListener('touchcancel', this.onTouchEnd.bind(this))
    }

    // private onTouchStart(event: TouchEvent) {
    //     // console.log(event)
    //     if (event.targetTouches.length > 1) return
    //     this.isPointDown = true
    //     const rect = this.controlSelector!.getBoundingClientRect();
    //     const x = event.targetTouches[0].pageX - rect.left;
    //     const y = event.targetTouches[0].pageY - rect.top;
    //     this.lastX = x
    //     this.lastY = y
    //     this.dispatchEvent("pointDown", {
    //         x: x,
    //         y: y
    //     })
    // }

    // private onTouchMove(event: TouchEvent) {
    //     // console.log(event)
    //     if (event.targetTouches.length > 1) {
    //         this.isPointDown = false
    //         return
    //     }
    //     const rect = this.controlSelector!.getBoundingClientRect();
    //     const x = event.targetTouches[0].pageX - rect.left;
    //     const y = event.targetTouches[0].pageY - rect.top;
    //     this.isPointDown = true
    //     this.lastX = x
    //     this.lastY = y
    //     if (this.isPointDown) {
    //         this.dispatchEvent("pointMove", {
    //             x: x,
    //             y: y
    //         })
    //     }
    // }

    // private onTouchEnd(event: TouchEvent) {
    //     // console.log(event)
    //     // const rect = this.controlSelector!.getBoundingClientRect();
    //     // const x = event.targetTouches[0].pageX - rect.left;
    //     // const y = event.targetTouches[0].pageY - rect.top;
    //     if (this.isPointDown) {
    //         this.isPointDown = false
    //         this.dispatchEvent("pointUp", {
    //             x: this.lastX,
    //             y: this.lastY
    //         })
    //     }
    // }

    private onMouseDown(event: MouseEvent) {
        console.log(event)
        if ([1, 2].includes(event.buttons)) {
            this.isPointDown = true
            event.preventDefault()
            // const x = event.offsetX
            // const y = event.offsetY
            // const rect = this.controlSelector!.getBoundingClientRect();
            const x = event.offsetX // event.pageX - rect.left;
            const y = event.offsetY // event.pageY - rect.top;
            this.dispatchEvent("pointDown", {
                x: x,
                y: y,
                button: event.buttons as 1 | 2
            })
        }
    }

    private onMouseMove(event: MouseEvent) {
        // console.log(event)
        // const rect = this.controlSelector!.getBoundingClientRect();
        const x = event.offsetX // event.pageX - rect.left;
        const y = event.offsetY // event.pageY - rect.top;
        if (this.isPointDown) {
            this.dispatchEvent("pointMove", {
                x: x,
                y: y,
                button: 1
            })
        }
    }

    // private onMouseUp(event: MouseEvent) {
    //     console.log(event)
    //     if (this.isPointDown) {
    //         this.isPointDown = false
    //         const rect = this.controlSelector!.getBoundingClientRect();
    //         const x = event.pageX - rect.left;
    //         const y = event.pageY - rect.top;
    //         this.dispatchEvent("pointUp", {
    //             x: x,
    //             y: y,
    //         })
    //     }
    // }


    clear() {
        this.svgSelector.selectChildren("*").remove()
    }

    addEventListener(listener: DrawAreaEventListener) {
        this.eventListeners.add(listener)

        return () => {
            this.eventListeners.delete(listener)
        }
    }

    dispatchEvent(event: "pointDown" | "pointMove" | "pointUp", data: {
        x: number,
        y: number,
        button: 1 | 2
    }) {
        this.eventListeners.forEach(fn => fn({
            type: event,
            data
        }))
    }

    toCanvas(): Promise<HTMLCanvasElement> {
        const svg = this.svgSelector.node() as HTMLElement
        const { width, height } = svg.getBoundingClientRect(); // 方法返回一个对象，该DOMRect对象提供有关元素大小及其相对于视口的位置的信息。
        const serializer = new XMLSerializer();
        const copy = svg.cloneNode(true);
        const data = serializer.serializeToString(copy); // 返回字符串的序列化子树。
        const image = new Image();
        const blob = new Blob([data], {
            type: 'image/svg+xml;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);

        return new Promise(resolve => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            ctx!.fillStyle = '#ffffff'
            ctx!.strokeStyle = '#ffffff'
            ctx?.fillRect(0, 0, width, height)
            image.addEventListener('load', () => {
                ctx && ctx.drawImage(image, 0, 0, width, height);
                URL.revokeObjectURL(url);
                resolve(canvas);
            }, { once: true });
            image.src = url;
        })
    }

    toBase64() {
        return this.toCanvas().then(canvas => {
            return canvas.toDataURL('image/jpeg')
        })
    }
}

interface CanvasDrawUtil {
    onPointDown(x: number, y: number, button: 1 | 2): void
    onPointMove(x: number, y: number): void
    // onPointUp(x: number, y: number): void
    // cancel(): void
}

class PolylineManager implements CanvasDrawUtil {
    polylines: Polyline[] = []
    private drawArea: DrawArea
    color = 'rgb(255, 0, 0)'

    constructor(drawArea: DrawArea) {
        this.drawArea = drawArea
    }
    onPointMove(x: number, y: number): void {
        if (this.polylines.length > 0) {
            const polyline = this.polylines[this.polylines.length - 1]
            if (!polyline.isClose) {
                polyline.onPointMove(x, y)
            }
        }
    }

    updateAllColor(color: string) {
        this.color = color
        this.polylines.forEach(polyline => polyline.updateColor(color))
    }

    clear() {
        this.polylines = []
        this.onSave()
    }

    getAllClosedPolylineInfo() {
        return this.polylines.filter(polyline => polyline.isClose).map(val => {
            return {
                path: val.linePath,
                color: val.color
            }
        })
    }

    drawPolylines(info: {
        path: [number, number][],
        color: string
    }[]) {
        this.polylines = info.map(val => {
            const polyline = new Polyline(this.drawArea, {
                color: val.color
            })
            polyline.renderByPath(val.path)
            return polyline
        })
    }

    onSave() {

    }

    onPointDown(x: number, y: number, button: 1 | 2): void {
        let polyline: Polyline | null = null
        if (this.polylines.length === 0) {
            polyline = new Polyline(this.drawArea, {
                color: this.color
            })
            polyline.onSave = () => {
                this.onSave()
            }
            this.polylines.push(polyline)
        } else {
            polyline = this.polylines[this.polylines.length - 1]
        }

        if (polyline.isClose) {
            polyline = new Polyline(this.drawArea, {
                color: this.color
            })
            polyline.onSave = () => {
                this.onSave()
            }
            this.polylines.push(polyline)
        }

        polyline.onPointDown(x, y, button)
    }
}

class Polyline implements CanvasDrawUtil {
    public linePath: [number, number][] = []
    private polylineSvg: d3.Selection<SVGPolylineElement, unknown, HTMLElement, any>
    private drawArea: DrawArea
    color = 'rgb(255, 0, 0)'
    isClose = false
    constructor(drawArea: DrawArea, options: {
        color: string
    }) {
        this.color = options.color || 'rgb(255, 0, 0)'
        this.drawArea = drawArea
        this.polylineSvg = this.drawArea.svgSelector.append("polyline")
        this.polylineSvg.attr("fill", "transparent")
    }

    renderByPath(path: [number, number][]) {
        this.linePath = path
        this.polylineSvg.attr("fill", this.color)
        this.draw()
        this.isClose = true
    }

    onPointMove(x: number, y: number): void {
        if (this.isClose) return
        if (this.linePath.length > 1) {
            this.linePath.pop()
        }
        this.linePath.push([x, y])
        this.draw()
    }

    updateColor(color: string) {
        this.color = color
        this.draw()
        if (this.isClose) {
            this.polylineSvg.attr("fill", this.color)
        }
    }

    onSave() {

    }

    public onPointDown(x: number, y: number, button: 1 | 2): void {
        if (this.isClose) return
        if (button === 2) {
            if (this.linePath.length <= 1) return
            this.isClose = true
            this.linePath.push(this.linePath[0])
            this.polylineSvg.attr("fill", this.color)
            this.onSave()
        } else {
            this.linePath.push([x, y])
        }
        this.draw()
    }

    public draw(): void {
        const pointsStr = this.linePath.map(val => val.join(",")).join(" ")
        this.polylineSvg?.attr("points", pointsStr).attr("stroke", this.color).attr("stroke-width", 2)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
    }
}

export default {
    DrawArea,
    PolylineManager
};

// export default DrawArea



// (function () {
//     const drawArea = new DrawArea("#container", "#svg")
//     const polyline = new PolylineManager(drawArea)
//     polyline.onSave = () => {
//         console.log('save')
//         console.log(polyline.getAllClosedPolylineInfo())
//         // drawArea.toCanvas().then(canvas => document.body.appendChild(canvas))
//         // drawArea.toBase64().then(base64 => {
//         //     const img = document.createElement('img')
//         //     img.src = base64
//         //     document.body.appendChild(img)
//         // })
//     }
//     let activeUtil = polyline

//     drawArea.addEventListener((event) => {
//         if (event.type === "pointDown") {
//             activeUtil.onPointDown(event.data.x, event.data.y, event.data.button)
//         } else if (event.type === "pointMove") {
//             activeUtil.onPointMove(event.data.x, event.data.y)
//         }
//     })

//     document.getElementById('color-picker')?.addEventListener('change', (event: any) => {
//         polyline.updateAllColor(event.detail.rgb)
//     })

//     window.clear.onclick = () => {
//         drawArea.clear()
//     }

//     window.draw.onclick = () => {
//         drawArea.toCanvas().then(canvas => document.body.appendChild(canvas))
//     }
// })()
