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
    }

    customElements.define("my-info", InfoElement);
};