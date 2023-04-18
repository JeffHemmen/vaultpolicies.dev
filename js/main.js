// document.addEventListener('DOMContentLoaded', () => {
//     const inputBox = document.getElementById('input-box');
//     const outputBox = document.getElementById('output-box');

    
//     function showError(message) {
//         const errorMessageContainer = document.getElementById('error-message-container');
//         errorMessageContainer.innerHTML = `<div id="error-message">${message}</div>`;
//     }

//     function parse_policy(ptree, policyText) {
//         const regex = /path\s*"(.*)"\s*{\s*capabilities\s*=\s*(\[\s*".*"\s*\])\s*}/g;
//         let match;
//         while ((match = regex.exec(policyText)) !== null) {
//             const path = match[1];
//             const capabilityList = JSON.parse(match[2]);
//             const capabilities = new Set(capabilityList);
//             ptree.add_path(path, capabilities);
//         }
//     }

//     // Instantiate PolicyTree
//     // PolicyTree = new PolicyTree();

//     inputBox.addEventListener('input', () => {
//         try {
//             const pt = new PolicyTree();

//             // Build the tree by calling add_path with the input in the left box
//             const policyText = inputBox.value;
//             parse_policy(pt, policyText);

//             // Populate the right box with the evaluated examples
//             let result = '';
//             for (const example of pt.examples()) {
//                 result += `${example} ${pt.evaluate(example)}\n`;
//             }
//             outputBox.value = result;

//             // Remove error message if present
//             if (document.getElementById('error-message')) {
//                 document.getElementById('error-message').remove();
//             }
//         } catch (error) {
//             // Display error message
//             showError('Invalid input');
//         }
//     });
// });


document.addEventListener('DOMContentLoaded', () => {
    const inputBox = document.getElementById('input-box');
    const outputBox = document.getElementById('output-box');
    const errorBubble = document.getElementById('errorBubble');
    const lightDarkToggle = document.getElementById('themeToggle');

    const processInput = () => {
        const input = inputBox.value;
        if (input.includes('!')) {
            errorBubble.classList.remove('hidden');
        } else {
            errorBubble.classList.add('hidden');
            const pt = new PolicyTree();
            parsePolicy(pt, input);
            let output = "";
            for (let p of pt.examples()) {
                output += p + " " + pt.evaluate(p) + "\n";
            }
            outputBox.value = output;
        }
    };

    inputBox.addEventListener('input', processInput);

    lightDarkToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
});