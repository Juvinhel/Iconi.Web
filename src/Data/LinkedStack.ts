namespace Data
{
    export class LinkedStack<T>
    {
        constructor ()
        {
        }

        private firstNode: Node;
        public length: number = 0;

        public unshift(...items: T[])
        {
            for (let i = items.length - 1; i >= 0; --i)
                this.singleUnshift(items[i]);
        }

        private singleUnshift(item: T)
        {
            this.firstNode = { value: item, next: this.firstNode };
            ++this.length;
        }

        public shift(): T
        {
            const item = this.firstNode.value;
            this.firstNode = this.firstNode.next;
            --this.length;
            return item;
        }

        public includes(item: T): boolean
        {
            for (const i of this)
                if (i == item) return true;
            return false;
        }

        *[Symbol.iterator]()
        {
            let current = this.firstNode;
            while (current?.value)
            {
                yield current.value;
                current = current.next;
            }
        }
    }

    type Node = {
        value?: any;
        next?: Node;
    };
}