namespace Views.Collection
{
    export function showContextMenu(this: FileTileElement, event: PointerEvent)
    {
        const fileTile = this;
        const listElement = this.closest("my-list") as ListElement;
        let fileTileElements = [...listElement.querySelectorAll("my-file-tile.selected") as NodeListOf<FileTileElement>];
        if (!fileTileElements.includes(fileTile))
            fileTileElements = [fileTile];

        const menuButtons: Node[] = [];

        menuButtons.push(<menu-button title="Select Folder" onclick={ () =>
        {
            const selectedEvent = new CustomEvent("selectfolder", { bubbles: true, detail: { folder: fileTile.file.parent } });
            fileTile.dispatchEvent(selectedEvent);
        } }><span>Show Folder</span></menu-button>,
        );

        menuButtons.push(<menu-button title="Download" onclick={ async () =>
        {
            await downloadFiles(fileTileElements.map(x => x.file));
        } }><span>Download</span></menu-button>);

        if (openInInkscape)
        {
            menuButtons.push(<menu-button title="Open in InkScape" onclick={ async () =>
            {
                await openInInkscape(fileTileElements.map(x => x.file));
            } }><span>Open in InkScape</span></menu-button>);
        }

        if (copySVGsToClipboard)
        {
            menuButtons.push(<menu-button title="Copy as Image" onclick={ async () =>
            {
                await copySVGsToClipboard(fileTileElements.map(x => x.file));
            } }><span>Copy as Image</span></menu-button>);
        }

        if (copyFilesToClipboard)
        {
            menuButtons.push(<menu-button title="Copy as File" onclick={ async () =>
            {
                await copyFilesToClipboard(fileTileElements.map(x => x.file));
            } }><span>Copy as File</span></menu-button>);
        }

        UI.ContextMenu.show(event, ...menuButtons);
        event.stopPropagation();
        event.preventDefault();
    }

    export async function downloadFiles(files: Data.File[])
    {
        if (files.length == 1)
        {
            const file = files[0];
            DownloadHelper.downloadUrl(file.name + "." + file.extension, file.url);
        }
        else
            UI.Dialog.download({ title: "Download Files", files, zipName: "icons.zip", allowClose: true });
    }

    export const openInInkscape: ((files: Data.File[]) => Promise<void>) | null = Data.Bridge ?
        async function (files: Data.File[])
        {
            const progressDialog = files.length > 1 ? await UI.Dialog.progress({ title: "Opening Files in InkScape", displayType: "Percent", max: files.length, value: 0 }) : null;
            try
            {
                const fileNames: string[] = [];
                const datas: string[] = [];
                for (let i = 0; i < files.length; ++i)
                {
                    fileNames.push(files[i].name + "." + files[i].extension);
                    const response = await fetch(files[i].url);
                    const blob = await response.blob();
                    const dataUri = await new Promise<string>(callback =>
                    {
                        let reader = new FileReader();
                        reader.onload = function () { callback(this.result as string); };
                        reader.readAsDataURL(blob);
                    });
                    console.log("dataUri", dataUri);
                    const base64 = dataUri.splitFirst("base64,")[1];
                    console.log(base64);
                    datas.push(base64);
                    if (progressDialog) ++progressDialog.value;
                }
                await Data.Bridge.OpenInInkScape(fileNames, datas);
                progressDialog?.close();
            }
            catch (ex)
            {
                progressDialog?.close();
                UI.Dialog.error(ex);
            }
        } : null;

    export const copySVGsToClipboard: ((files: Data.File[]) => Promise<void>) | null = ("supports" in window.ClipboardItem) && window.ClipboardItem.supports("image/svg+xml") ?
        async function (files: Data.File[])
        {
            try
            {
                const items: ClipboardItem[] = [];
                for (const file of files)
                {
                    const blob = await fetch(file.url).then((response) => response.blob());
                    items.push(new ClipboardItem({ [blob.type]: blob }));
                }

                await navigator.clipboard.write(items);
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }
        } : null;

    export const copyFilesToClipboard: ((files: Data.File[]) => Promise<void>) | null = Data.Bridge ?
        async function (files: Data.File[])
        {
            const progressDialog = files.length > 1 ? await UI.Dialog.progress({ title: "Copy files to clipboard", displayType: "Percent", max: files.length, value: 0 }) : null;
            try
            {
                const fileNames: string[] = [];
                const datas: string[] = [];
                for (let i = 0; i < files.length; ++i)
                {
                    fileNames.push(files[i].name + "." + files[i].extension);
                    const response = await fetch(files[i].url);
                    const blob = await response.blob();
                    const dataUri = await new Promise<string>(callback =>
                    {
                        let reader = new FileReader();
                        reader.onload = function () { callback(this.result as string); };
                        reader.readAsDataURL(blob);
                    });
                    console.log("dataUri", dataUri);
                    const base64 = dataUri.splitFirst("base64,")[1];
                    console.log(base64);
                    datas.push(base64);
                    if (progressDialog) ++progressDialog.value;
                }
                await Data.Bridge.CopyToClipboard(fileNames, datas);
                progressDialog?.close();
            }
            catch (ex)
            {
                progressDialog?.close();
                UI.Dialog.error(ex);
            }
        } : null;
}