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
                    <button onclick={ () => { Collection.downloadFiles([this.file]); } }>Download</button>
                    { Collection.openInInkscape ? <button onclick={ () => { Collection.openInInkscape([this.file]); } }>Open Files in InkScape</button> : null }
                    { Collection.copySVGsToClipboard ? <button onclick={ () => { Collection.copySVGsToClipboard([this.file]); } }>Copy Images to Clipboard</button> : null }
                    { Collection.copyFilesToClipboard ? <button onclick={ () => { Collection.copyFilesToClipboard([this.file]); } }>Copy Files to Clipboard</button> : null }
                </div>
            ];
        }

        public file: Data.Library.File;

        public showFile(file: Data.Library.File)
        {
            this.file = file;

            this.fileElement.textContent = this.file?.name ?? "";
            this.previewImageElement.src = this.file?.url ?? "";
        }
    }

    customElements.define("my-info", InfoElement);
};