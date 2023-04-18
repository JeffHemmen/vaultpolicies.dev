class Capabilities {
    constructor(capabilities = null) {
        if (capabilities === null) {
            capabilities = new Set();
        }
        if (capabilities.has('deny')) {
            this.capabilities = new Set(['deny']);
        } else {
            this.capabilities = capabilities;
        }
    }

    add(capabilities) {
        if (capabilities.has('deny') || this.capabilities.has('deny')) {
            return new Capabilities(new Set(['deny']));
        } else {
            return new Capabilities(new Set([...this.capabilities, ...capabilities]));
        }
    }

    toString() {
        let res = '[';
        const capsArray = Array.from(this.capabilities);
        for (let i = 0; i < capsArray.length; i++) {
            res += '"' + capsArray[i] + '"';
            if (i < capsArray.length - 1) {
                res += ', ';
            }
        }
        res += ']';
        return res;
    }

    length() {
        return this.capabilities.size;
    }
}
