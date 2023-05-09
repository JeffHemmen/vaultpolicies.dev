document.addEventListener('DOMContentLoaded', () => {
    const inputBox = document.getElementById('input-box');
    const outputBox = document.getElementById('output-box');
    const errorBubble = document.getElementById('error-message-container');
    const lightDarkToggle = document.getElementById('theme-toggle');
    const feedbackBtn = document.getElementById('feedback-button');
    const feedbackOptions = document.getElementById("feedback-options");
    const examplesCheckbox = document.getElementById('auto-generate');
    const examplesTextbox = document.getElementById('example-paths');
    const outputTree = document.getElementById('output-tree')


    let pt;
    let examples;


/* RIGHT-HAND SIDE */
    function gen_output() {
        
        /* debug */
        debug = '';
        examples.forEach(example => {
            debug += example + ' ';
            debug += pt.evaluate(example) + '\n';
        });
        outputBox.value = debug;

        /* prod */
        outputTree.innerHTML = createTree(examples);
    }

/* INPUT */

    function processInput() {
        const input = inputBox.value;
        if (!validate_input(input)) {
            errorBubble.classList.remove('hidden');
        } else {
            errorBubble.classList.add('hidden');
            pt = new PolicyTree();
            parse_policy(pt, input);
            generateExamples();

        }
    }

    function parse_policy(ptree, policyText) {
        const regex = /path\s*"(.*)"\s*{\s*capabilities\s*=\s*(\[\s*".*"\s*\])\s*}/g;
        let match;
        while ((match = regex.exec(policyText)) !== null) {
            const path = match[1];
            const capabilityList = JSON.parse(match[2]);
            const capabilities = new Set(capabilityList);
            ptree.add_path(path, capabilities);
        }
    }

    function validate_input(input) {
        return true;
    }

/* OUTPUT TREE */

    function outputTreeNode(path) {
        this.path = path;
        this.children = new Array();
    }

    function createTree(paths) {

        paths.sort((a, b) => a.length - b.length);
        const index_map = new Map();    // maps strings to outputTreeNode instances
        const no_parents = [];          // list of outputTreeNode instances

        paths.forEach(path => {
            let has_parent = false;
            let longest_parent = "";
            for (const parent of index_map.keys()) {
                if (path.includes(parent)) {
                    has_parent = true;
                    if (parent.length > longest_parent.length) {
                        longest_parent = parent;
                    }
                }
            }
            let new_node = new outputTreeNode(path);
            index_map.set(path, new_node);
            if (!has_parent) {
                no_parents.push(new_node);
            } else {
                let parent_node = index_map.get(longest_parent);
                parent_node.children.push(new_node);
            }
        });


        console.log(no_parents);

        function path_and_cap_html(path, is_leaf) {
            cap = pt.evaluate(path).capabilities;
            res = '<div class="path-and-bits">';
            res += '<div class="path">' + path + '</div>';
            res += '<div class="bit-container">';
            res += ' <span class="' + (cap.has('list') ? 'bit L' : 'bit') + '">L</span>';
            res += ' <span class="' + (cap.has('create') ? 'bit C' : 'bit') + '">C</span>';
            res += ' <span class="' + (cap.has('read') ? 'bit R' : 'bit') + '">R</span>';
            res += ' <span class="' + (cap.has('update') ? 'bit U' : 'bit') + '">U</span>';
            res += ' <span class="' + (cap.has('delete') ? 'bit D' : 'bit') + '">D</span>';
            res += ' <span class="' + (cap.has('patch') ? 'bit P' : 'bit') + '">P</span>';
            res += ' <span class="' + (cap.has('sudo') ? 'bit S' : 'bit') + '">S</span>';
            res += '</div></div>';
            return res;
        }

        function generateHtml(node, depth = 0) {
            let html = '<li>';
            if (node.children.length == 0) {
                html += path_and_cap_html(node.path, true);
            } else {
                html += '<details open>\n<summary>' + path_and_cap_html(node.path, false) + '</summary>\n';
            
                html += '<ul>';
                node.children.forEach(child => {
                    html += generateHtml(child, depth + 1);
                });
                html += '</ul>\n</details>';
            }
            html += '</li>\n';
            return html;
        }


        let whole_tree_html = "<ul>";
        no_parents.forEach(node => {
            whole_tree_html += generateHtml(node);
        });
        whole_tree_html += '</ul>';
        console.log(whole_tree_html);
        return whole_tree_html;

    }


/* EXAMPLES*/
    
    function generateExamples() {
        if (examplesCheckbox.checked) {
            examplesTextbox.setAttribute('readonly', '');
            examples = pt.examples()
            examplesTextbox.value = examples.join('\n');
        } else {
            examplesTextbox.removeAttribute('readonly');
            examples = examplesTextbox.value.split('\n');
        }

        gen_output();
    }





/* EVENT LISTENERS */

    inputBox.addEventListener('input', processInput);

    lightDarkToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });


    feedbackBtn.addEventListener("click", function () {
        feedbackOptions.classList.toggle("hidden");
    });
    
    examplesCheckbox.addEventListener('change', generateExamples);
    examplesTextbox.addEventListener('input', generateExamples);
    

    });
