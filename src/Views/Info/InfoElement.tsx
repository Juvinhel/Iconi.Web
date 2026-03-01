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
                    <button onclick={ () => { Collection.downloadFiles(this.files); } }>Download</button>
                    { Collection.openInInkscape ? <button onclick={ () => { Collection.openInInkscape(this.files); } }>Open Files in InkScape</button> : null }
                    { Collection.copySVGsToClipboard ? <button onclick={ () => { Collection.copySVGsToClipboard(this.files); } }>Copy Images to Clipboard</button> : null }
                    { Collection.copyFilesToClipboard ? <button onclick={ () => { Collection.copyFilesToClipboard(this.files); } }>Copy Files to Clipboard</button> : null }
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
    }

    customElements.define("my-info", InfoElement);
};