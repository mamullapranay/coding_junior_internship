
Advanced Coding Copilot VS Code Extension
Overview
The Advanced Coding Copilot VS Code Extension provides a powerful coding assistant integrated directly within Visual Studio Code. This extension leverages the Llama model to offer context-aware code suggestions, completions, and improvements based on the current code and user queries. It also supports an enhanced user interface for interacting with the AI.

Features
Chat with AI: Engage in a conversation with the AI to get code suggestions, corrections, and completions.
Code Insertion: Insert AI-generated code snippets directly into the editor.
Code Surrounding Context: Fetch code snippets based on the surrounding context of the selected code.
Dark Mode: Toggle between light and dark themes for the chat interface.
Autocompletion and Autosuggestions: Show real-time code suggestions and completions.
Installation
Clone the Repository

bash
Copy code
git clone https://github.com/vsuraj08/CodingJr-copilot.git
Navigate to the Project Directory

bash
cd your-repository
Install Dependencies

bash
npm install
Build and Run the Extension

To build the extension and start the development server:

bash
npm run build
code --extensionDevelopmentPath=.
Usage
Open the Chat Panel

Open the command palette (Ctrl+Shift+P or Cmd+Shift+P on macOS) and run the command Open Chat.
This will open the AI chat panel where you can start interacting with the AI.
Send Code or Queries

Type your query or code into the input field and click "Send".
The AI will respond with code suggestions or corrections.
Insert Code

When the AI provides a code snippet, click "Insert Code" to add it directly to your open file.
Toggle Dark Mode

Use the theme toggle button in the chat header to switch between light and dark themes.
Configuration
API Key: Replace the placeholder API key in the getCodeSnippet function with your actual API key.
Development
To contribute or make changes to the extension:

Make Your Changes

Edit the source code as needed. The main files to modify are located in the src directory.

Test Your Changes

Run the extension in the development environment to test your changes.

Build the Extension

Build the extension to prepare it for packaging:


npm run build
Package and Publish

Follow the official VS Code documentation to package and publish your extension.

License
This project is licensed under the MIT License.

Contact
For issues or inquiries, please contact your-vsurajk7@gmail.com

