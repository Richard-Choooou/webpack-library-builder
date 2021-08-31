import { isIos } from "./utils";

export const defines = {
    fileType: {
        image: isIos ? 'public.image' : 'image/*',
        video: isIos ? 'public.movie' : 'video/*'
    }
}