import selfStorage from "./storage";

class Interval {

    key: string = "initInterValId"

    interValId: number | undefined

    latestOpTime:number = 0; //mills seconds

    constructor(key:string) {
        this.interValId = selfStorage.getItem(this.key)
        this.key = key;
    }

    start(fn: Function, t: number,breakFlag:boolean = false) {
        fn();
        this.stop();
        if(breakFlag){
            this.latestOpTime = Date.now();
            this.interValId = window.setInterval(() => {
                if(Date.now() - this.latestOpTime  < 3 * 60 * 1000){
                    fn()
                }
            }, t)
        }else{
            this.interValId = window.setInterval(() => {
                fn()
            }, t)
        }
        selfStorage.setItem(this.key, this.interValId);
    }

    stop() {
        if (this.interValId) {
            selfStorage.removeItem(this.key)
            clearInterval(this.interValId)
        }

    }
}

export const interVarBalance = new Interval("interVarBalance");