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
        private fileTagsElement: HTMLTagList;

        private build()
        {
            return [
                <h2 class="title">Info</h2>,
                this.fileElement = <h3 class="file"></h3> as HTMLHeadingElement,
                <div class="preview">
                    { this.previewImageElement = <img class="preview-image" /> as HTMLImageElement }
                </div>,
                this.fileTagsElement = <tag-list class="file-tags" /> as HTMLTagList,
                <div />,
                <div class="actions">
                    <button onclick={ () => { Collection.downloadFiles([this.file]); } }>Download</button>
                    { Collection.openInInkscape ? <button onclick={ () => { Collection.openInInkscape([this.file]); } }>Open Files in InkScape</button> : null }
                    { Collection.copySVGsToClipboard ? <button onclick={ () => { Collection.copySVGsToClipboard([this.file]); } }>Copy Images to Clipboard</button> : null }
                    { Collection.copyFilesToClipboard ? <button onclick={ () => { Collection.copyFilesToClipboard([this.file]); } }>Copy Files to Clipboard</button> : null }
                </div>,
            ];
        }

        public file: Data.Library.File;

        public showFile(file: Data.Library.File)
        {
            this.file = file;

            this.fileElement.textContent = this.file?.name ?? "";
            this.fileElement.title = this.file?.name ?? "";
            this.previewImageElement.src = this.file?.url ?? "";

            this.fileTagsElement.tags = this.file?.tags ?? [];
            const tagschangedEvent = new CustomEvent("tagschanged", { bubbles: true, detail: { tags: this.fileTagsElement.tags } });
            this.dispatchEvent(tagschangedEvent);
        }

        public highlightTags(tags: string[])
        {
            for (const tagElement of this.fileTagsElement.shadowRoot.querySelectorAll("span") as NodeListOf<HTMLSpanElement>)
            {
                const tag = tagElement.title;
                const state = tags.includes(tag) ? "checked" : tags.includes("!" + tag) ? "negate" : null;
                tagElement.classList.remove("checked", "negate");
                if (state == "checked") tagElement.classList.toggle("checked", true);
                if (state == "negate") tagElement.classList.toggle("negate", true);
            }
        }
    }

    customElements.define("my-info", InfoElement);
};