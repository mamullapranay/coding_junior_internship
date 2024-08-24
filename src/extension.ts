








import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';

// Define the expected structure of the response data
interface AIResponse {
    choices: { message: { content: string } }[];
}

async function getCodeSnippet(prompt: string): Promise<string> {
    try {
        console.time('API Call');

        // Make the API call and explicitly define the expected response type
        const response: AxiosResponse<AIResponse> = await Promise.race([
            axios.post<AIResponse>('https://api.together.xyz/v1/chat/completions', {
                model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", // Use the 8B model
                messages: [
                    {
                        role: "system",
                        content: "You are an AI coding assistant based on the Llama model. Your task is to help users by providing clear and accurate code snippets in response to their queries. When a user asks for a specific programming task, generate a well-structured code snippet that they can easily copy and paste into their code editor. Use new lines to correct the format of code."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 522,
                temperature: 0.1,
                top_p: 1,
                top_k: 50,
                repetition_penalty: 1,
                // stop: [""]
            }, {
                headers: {
                    'Authorization': `Bearer 60a54901fb28276d68ec60ffa896a5c11ec513b59ad4e4edb0093d6ded52e31e`, // Replace with your actual API key
                    'Content-Type': 'application/json'
                }
            }),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 10000) // 10 second timeout
            )
        ]);

        console.timeEnd('API Call');

        // Log the full response content
        console.log('Full API Response:', response.data.choices[0].message.content);

        // Return the content from the response
        return response.data.choices[0].message.content;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error making API request:', error.response ? error.response.data : error.message);
            vscode.window.showErrorMessage('Error: ' + (error.response ? error.response.data : error.message));
        } else {
            console.error('Unknown error:', error);
        }
        return 'Error: Unable to fetch response.';
    }
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.openChat', () => {
        const panel = vscode.window.createWebviewPanel(
            'chat', // Identifies the type of the webview. Used internally
            'Chat with AI', // Title of the panel displayed to the user
            vscode.ViewColumn.Two, // Open in the second column (right side)
            {
                enableScripts: true, // Enable JavaScript in the webview
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, 'media') // Specify allowed local resources
                ]
            }
        );

        // Set the webview's HTML content
        panel.webview.html = getWebviewContent();

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'ask':
                        const response = await getCodeSnippet(message.text);
                        panel.webview.postMessage({ command: 'response', text: response });
                        break;
                    case 'insert':
                        insertCodeIntoEditor(message.text);
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    }));
}

function insertCodeIntoEditor(code: string) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const position = editor.selection.active;
        editor.edit(editBuilder => {
            editBuilder.insert(position, code);
        });
    }
}
function getWebviewContent() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodingJr Copilot</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #282c34;
            color: #abb2bf;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        #header {
            background: linear-gradient(90deg, #8e9f9e, #a5b4b5);
            color: #fff;
            padding: 15px;
            text-align: center;
            font-size: 1.8em;
            font-weight: bold;
            border-bottom: 2px solid #a5b4b5;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        #chat {
            height: calc(100vh - 140px);
            overflow-y: auto;
            border: 1px solid #444851;
            border-radius: 10px;
            padding: 15px;
            background-color: #1e1e1e;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
            max-width: 100%;
            box-sizing: border-box;
        }
        #input-container {
            display: flex;
            flex-direction: column;
            position: fixed;
            bottom: 0;
            width: 100%;
            background-color: #1e1e1e;
            padding: 15px;
            border-top: 1px solid #444851;
            box-sizing: border-box;
        }
        #input {
            width: calc(100% - 160px);
            padding: 10px;
            border: 1px solid #444851;
            border-radius: 5px;
            background-color: #2c313c;
            color: #abb2bf;
            box-sizing: border-box;
            font-size: 1em;
        }
        #send, #theme-toggle {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            background: linear-gradient(90deg, #a0c4ff, #c9d8f4);
            color: #333;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.3s, box-shadow 0.3s;
            margin-top: 10px;
            font-size: 1em;
        }
        #send:hover, #theme-toggle:hover {
            background: linear-gradient(90deg, #c9d8f4, #a0c4ff);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        #model-selector {
            margin-bottom: 10px;
            padding: 8px;
            border: 1px solid #444851;
            border-radius: 5px;
            background-color: #2c313c;
            color: #abb2bf;
            font-size: 1em;
        }
        #theme-toggle {
            margin-top: 10px;
        }
        .user-message, .ai-message {
            margin: 10px 0;
            padding: 15px;
            border-radius: 5px;
            font-family: "Courier New", Courier, monospace;
            overflow-wrap: break-word;
            position: relative;
        }
        .user-message {
            background-color: #36454f;
            color: #ffffff;
        }
        .ai-message {
            background-color: #2c313c;
            color: #e5c07b;
            border: 1px solid #444851;
            padding: 15px;
            white-space: pre-wrap;
            overflow-wrap: break-word;
        }
        .code-container {
            background-color: #2c313c;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #444851;
            margin-bottom: 10px;
            position: relative;
        }
        .copy-code-btn {
            position: absolute;
            right: 10px;
            top: 10px;
            background: linear-gradient(90deg, #b0e57c, #9bce7b);
            color: #333;
            border: none;
            padding: 5px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.3s, box-shadow 0.3s;
            font-size: 1em;
            text-align: center;
        }
        .copy-code-btn:hover {
            background: linear-gradient(90deg, #9bce7b, #b0e57c);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        .copy-code-btn.copied {
            background: #4caf50;
            color: #fff;
        }
        .copy-code-btn.copied:hover {
            background: #388e3c;
        }
        .loading-message {
            color: #c678dd;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div id="header">CodingJr Copilot</div>
    <div id="chat"></div>
    <div id="input-container">
        <select id="model-selector">
            <option value="gemini">Gemini</option>
            <option value="llama">Llama</option>
            <option value="gpt">GPT</option>
        </select>
        <input type="text" id="input" placeholder="Ask a question..." />
        <button id="send">Send</button>
        <button id="theme-toggle">Toggle Theme</button>
    </div>
    <script>
        const chat = document.getElementById('chat');
        const input = document.getElementById('input');
        const sendButton = document.getElementById('send');
        const modelSelector = document.getElementById('model-selector');
        const themeToggle = document.getElementById('theme-toggle');

        const vscode = acquireVsCodeApi();

        let darkMode = true;

        sendButton.onclick = () => {
            const text = input.value;
            const model = modelSelector.value;
            if (text.trim() === '') return;
            appendMessage('user', text);
            input.value = '';
            chat.innerHTML += '<div class="loading-message">AI: ... (waiting for response)</div>';
            vscode.postMessage({ command: 'ask', text: model + "::" + text });
            chat.scrollTop = chat.scrollHeight;
        };

        themeToggle.onclick = () => {
            darkMode = !darkMode;
            document.body.style.backgroundColor = darkMode ? '#282c34' : '#ffffff';
            document.body.style.color = darkMode ? '#abb2bf' : '#000000';
            chat.style.backgroundColor = darkMode ? '#1e1e1e' : '#f5f5f5';
            chat.style.borderColor = darkMode ? '#444851' : '#dddddd';
            input.style.backgroundColor = darkMode ? '#2c313c' : '#ffffff';
            input.style.color = darkMode ? '#abb2bf' : '#000000';
            sendButton.style.background = darkMode ? 'linear-gradient(90deg, #a0c4ff, #c9d8f4)' : 'linear-gradient(90deg, #c9d8f4, #a0c4ff)';
            themeToggle.style.background = darkMode ? 'linear-gradient(90deg, #a0c4ff, #c9d8f4)' : 'linear-gradient(90deg, #c9d8f4, #a0c4ff)';
        };

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'response':
                    document.querySelector('.loading-message').remove();
                    appendMessage('ai', message.text);
                    break;
            }
        });

        function appendMessage(type, text) {
            const messageElement = document.createElement('div');
            messageElement.classList.add(type + '-message');

            if (type === 'ai') {
                const codeContainer = document.createElement('div');
                codeContainer.classList.add('code-container');
                codeContainer.textContent = text;

                const copyButton = document.createElement('button');
                copyButton.textContent = 'C';
                copyButton.classList.add('copy-code-btn');
                copyButton.onclick = () => {
                    navigator.clipboard.writeText(text).then(() => {
                        copyButton.textContent = 'Copied!';
                        copyButton.classList.add('copied');
                        setTimeout(() => {
                            copyButton.textContent = 'C';
                            copyButton.classList.remove('copied');
                        }, 2000);
                    }).catch(err => {
                        console.error('Could not copy code: ', err);
                    });
                };

                codeContainer.appendChild(copyButton);
                messageElement.appendChild(codeContainer);
            } else {
                messageElement.textContent = text;
            }

            chat.appendChild(messageElement);
            chat.scrollTop = chat.scrollHeight;
        }
    </script>
</body>
</html>

`;
}



export function deactivate() {}






