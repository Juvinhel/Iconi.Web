namespace Views.Collection
{
    export class SearchElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());
        }

        private textInputElement: HTMLInputElement;

        private build()
        {
            return [
                this.textInputElement = <input class="search-text" onkeyup={ this.textKeyUp.bind(this) } onblur={ this.textBlur.bind(this) } /> as HTMLInputElement,
                <button class="search-clear-button" type="text" onclick={ this.clear.bind(this) }><color-icon src="img/icons/close.svg" /></button>,
                <button class="search-go-button" type="text" onclick={ this.goClick.bind(this) }><color-icon src="img/icons/search.svg" /></button>,
            ];
        }

        private textKeyUp(event: KeyboardEvent)
        {
            if (event.code == "Enter")
                this.search();
        }

        private textBlur()
        {
            this.search();
        }

        private goClick()
        {
            this.search();
        }

        private searchText;
        private search()
        {
            if (this.searchText != this.textInputElement.value)
            {
                this.searchText = this.textInputElement.value;

                const event = new CustomEvent("search", { bubbles: true, detail: { query: this.query } });
                this.dispatchEvent(event);
            }
        }

        private clear()
        {
            this.textInputElement.value = "";
            this.search();
        }

        public get query(): string[]
        {
            return [...this.getQuery()];
        }

        private * getQuery()
        {
            for (let part of this.textInputElement.value.split(" "))
            {
                part = part.replaceAll("_", " ");
                while (part.contains("  ")) part.replace("  ", " ");
                part = part.trim();
                if (part) yield part.toLowerCase();
            }
        }

        public toggleTag(tag: string)
        {
            tag = tag.toLowerCase().replaceAll(" ", "_");
            if (this.textInputElement.value.contains(tag))
            {
                this.textInputElement.value = this.textInputElement.value.replace(tag, "");
                while (this.textInputElement.value.contains("  ")) this.textInputElement.value.replace("  ", " ");
                this.textInputElement.value = this.textInputElement.value.trim();
            }
            else
            {
                const addWhitespace = this.textInputElement.value.length > 0 && this.textInputElement.value[this.textInputElement.value.length - 1] != " ";
                this.textInputElement.value += (addWhitespace ? " " : "") + tag;
            }

            this.search();
        }
    }

    customElements.define("my-search", SearchElement);
}