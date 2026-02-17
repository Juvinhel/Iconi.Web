namespace Views.Info
{
    export class InfoElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());
        }

        private previewImageElement: HTMLImageElement;
        private fileElement: HTMLHeadingElement;

        private build()
        {
            return [
                <h2 class="title">Info</h2>,
                this.fileElement = <h3 class="file"></h3> as HTMLHeadingElement,
                <div class="preview">
                    { this.previewImageElement = <img class="preview-image" /> as HTMLImageElement }
                </div>,
                <div />,
                <div class="actions">
                    <button onclick={ this.downloadClick }>Download</button>
                    { Data.Bridge ? <button onclick={ this.copyToClipboard }>Copy to Clipboard</button> : null }
                </div>
            ];
        }

        public files: Data.File[];

        public showFiles(files: Data.File[])
        {
            this.files = files;

            this.fileElement.textContent = this.files.length == 0 ? "" : (this.files.length == 1 ? this.files[0].name : "multiple files");
            this.previewImageElement.src = files[0]?.url;
        }

        private downloadClick = function (this: InfoElement, event: Event)
        {
            if (this.files.length == 1)
            {
                const file = this.files[0];
                DownloadHelper.downloadUrl(file.name + "." + file.extension, file.url);
            }
            else
                UI.Dialog.download({ title: "Download Files", files: this.files, zipName: "icons.zip", allowClose: true });
        }.bind(this);

        public copyToClipboard = async function (this: InfoElement)
        {
            const progressDialog = this.files.length > 1 ? await UI.Dialog.progress({ title: "Copy files to clipboard", displayType: "Percent", max: this.files.length, value: 0 }) : null;
            try
            {
                const fileNames: string[] = [];
                const datas: string[] = [];
                for (let i = 0; i < this.files.length; ++i)
                {
                    fileNames.push(this.files[i].name + "." + this.files[i].extension);
                    const response = await fetch(this.files[i].url);
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
        }.bind(this);
    }

    customElements.define("my-info", InfoElement);
};