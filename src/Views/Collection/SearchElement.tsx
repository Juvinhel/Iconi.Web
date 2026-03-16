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
                this.textInputElement = <input class="search-text" onkeyup={ this.textKeyUp.bind(this) } onblur={ this.textBlur.bind(this) } onkeypress={ this.doInput.bind(this) } onpaste={ this.doInput.bind(this) } oninput={ this.doInput.bind(this) } /> as HTMLInputElement,
                <button class="search-clear-button" type="text" onclick={ this.clear.bind(this) }><color-icon src="img/icons/close.svg" /></button>,
                <button class="search-go-button" type="text" onclick={ this.goClick.bind(this) }><color-icon src="img/icons/search.svg" /></button>,
            ];
        }

        private doInput()
        {
            this.classList.toggle("searched", false);
        }

        private textKeyUp(event: KeyboardEvent)
        {
            if (event.code == "Enter")
            {
                const querychangedEvent = new CustomEvent("querychanged", { bubbles: true, detail: { query: this.query } });
                this.dispatchEvent(querychangedEvent);

                this.search();
            }
        }

        private goClick()
        {
            const querychangedEvent = new CustomEvent("querychanged", { bubbles: true, detail: { query: this.query } });
            this.dispatchEvent(querychangedEvent);

            this.search();
        }

        private textBlur()
        {
            const querychangedEvent = new CustomEvent("querychanged", { bubbles: true, detail: { query: this.query } });
            this.dispatchEvent(querychangedEvent);
        }

        private searchText;
        private search()
        {
            if (this.searchText != this.textInputElement.value)
            {
                this.searchText = this.textInputElement.value;

                const searchEvent = new CustomEvent("search", { bubbles: true, detail: { query: this.query } });
                this.dispatchEvent(searchEvent);
            }
            this.classList.toggle("searched", true);
        }

        private clear()
        {
            this.textInputElement.value = "";
            const querychangedEvent = new CustomEvent("querychanged", { bubbles: true, detail: { query: this.query } });
            this.dispatchEvent(querychangedEvent);

            this.search();
        }

        public get query(): string[]
        {
            const ret = [];
            for (let part of this.textInputElement.value.split(" "))
            {
                part = part.replaceAll("_", " ");
                while (part.contains("  ")) part.replace("  ", " ");
                part = part.trim().toLowerCase();
                const negate = part.startsWith("!");
                if (negate) part = part.trimLeft("!").trim();
                if (part && !(ret.includes(part) || ret.includes("!" + part)))
                    ret.push(negate ? "!" + part : part);
            }
            return ret;
        }

        public toggleTag(tag: string)
        {
            this.classList.toggle("searched", false);

            tag = tag.toLowerCase();

            const tags = this.query;
            if (tags.includes(tag))
                tags[tags.indexOf(tag)] = "!" + tag;
            else if (tags.includes("!" + tag))
                tags.remove("!" + tag);
            else
                tags.push(tag);

            this.textInputElement.value = tags.map(x => x.replace(" ", "_")).join(" ");

            const querychangedEvent = new CustomEvent("querychanged", { bubbles: true, detail: { query: this.query } });
            this.dispatchEvent(querychangedEvent);
        }
    }

    customElements.define("my-search", SearchElement);
}