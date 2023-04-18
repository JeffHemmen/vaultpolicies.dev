class PolicyTree {
    constructor() {
        this.children = {};
        this.capabilities = new Capabilities();
    }

    add_path(path, capabilities) {
        const path_lstrip = path.replace(/^\//, ''); // Remove leading slash
        if (path.includes('/')) { // Not a leaf
            const ioslash = path_lstrip.indexOf('/');
            const first = path_lstrip.slice(0, ioslash);
            const rest  = path_lstrip.slice(ioslash + 1);
            if (!this.children.hasOwnProperty(first)) {
                this.children[first] = new PolicyTree();
            }
            this.children[first].add_path(rest, capabilities);
        } else { // Leaf
            const first = path;
            if (!this.children.hasOwnProperty(first)) {
                this.children[first] = new PolicyTree();
                this.children[first].capabilities = this.children[first].capabilities.add(capabilities);
            }
        }
    }

    toString() {
        const str_children = (indent, node) => {
            let res = '';
            for (const n in node.children) {
                res += '. . '.repeat(indent) + n + '=>' + node.children[n].capabilities.toString() + '\n';
                res += str_children(indent + 1, node.children[n]);
            }
            return res;
        };
        return str_children(0, this);
    }

    examples(sub = ['apple', 'orange']) {
        const exp_rec = (node, wip, sub) => {
            if (Object.keys(node.children).length === 0) {
                return [wip];
            }
            let res = [];
            for (const c in node.children) {
                if (c === '+') {
                    for (const s of sub) {
                        res = res.concat(exp_rec(node.children[c], wip + '/' + s, sub));
                    }
                } else if (c === '*') {
                    res.push(wip + '/');
                    for (const s of sub) {
                        res.push(wip + '/' + s);
                    }
                } else if (c.endsWith('*')) { // Leaf
                    const cs = c.replace(/\*$/, '');
                    res.push(wip + '/' + cs);
                    for (const s of sub) {
                        res.push(wip + '/' + cs + '-' + s);
                    }
                    for (const s of sub) {
                        res.push(wip + '/' + cs + '/' + s);
                    }
                } else {
                    res = res.concat(exp_rec(node.children[c], wip + '/' + c, sub));
                }
            }
            return res;
        };
        return exp_rec(this, '', sub);
    }

    evaluate(path) {
        const eval_rec = (node, path) => {
            const path_lstrip = path.replace(/^\//, ''); // Remove leading slash
            if (path_lstrip.includes('/')) { // Not at end of path
                const ioslash = path_lstrip.indexOf('/');
                const first = path_lstrip.slice(0, ioslash);
                const rest  = path_lstrip.slice(ioslash + 1);    
                if (node.children.hasOwnProperty(first)) {
                    const try_eval = eval_rec(node.children[first], rest);
                    if (try_eval.length() !== 0) {
                        return try_eval;
                    }
                }
                const star_globs = Object.keys(node.children).filter(c => c.length > 1 && c.endsWith('*') && first.startsWith(c.slice(0, -1)));
                if (star_globs.length > 0) {
                    const maxStar = star_globs.reduce((a, b) => a.length > b.length ? a : b);
                    const try_eval = node.children[maxStar].capabilities;
                    if (try_eval.length() !== 0) {
                        return try_eval;
                    }
                }
                if (node.children.hasOwnProperty('+')) {
                    const try_eval = eval_rec(node.children['+'], rest);
                    if (try_eval.length() !== 0) {
                        return try_eval;
                    }
                }
                if (node.children.hasOwnProperty('*')) {
                    const try_eval = eval_rec(node.children['*'], rest);
                    if (try_eval.length() !== 0) {
                        return try_eval;
                    }
                }
                return new Capabilities();
            } else { // At the end of the path
                const first = path;
                if (node.children.hasOwnProperty(first)) {
                    return node.children[first].capabilities;
                }
                const star_globs = Object.keys(node.children).filter(c => c.length > 1 && c.endsWith('*') && first.startsWith(c.slice(0, -1)));
                if (star_globs.length > 0) {
                    const maxStar = star_globs.reduce((a, b) => a.length > b.length ? a : b);
                    return node.children[maxStar].capabilities;
                }
                if (node.children.hasOwnProperty('+')) {
                    return node.children['+'].capabilities;
                }
                if (node.children.hasOwnProperty('*')) {
                    return node.children['*'].capabilities;
                }
                // Default
                return new Capabilities();
            }
        };

        const res = eval_rec(this, path);
        if (res.length() === 0) {
            return new Capabilities(new Set(['deny']));
        }
        return res;
    }
}
        