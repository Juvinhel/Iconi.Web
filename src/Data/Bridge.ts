namespace Data
{
    export declare const Bridge: Bridge;

    export interface Bridge
    {
        CopyToClipboard(_fileNames: string[], _datas: string[]): Promise<void>;
        OpenInInkScape(_fileNames: string[], _datas: string[]): Promise<void>;
    }
}

Object.defineProperty(Data, "Bridge", {
    get()
    {
        //@ts-ignore
        return window.chrome?.webview?.hostObjects?.bridge;
    },
});