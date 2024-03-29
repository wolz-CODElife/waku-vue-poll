# WAKU VUE POLL

Welcome to the poll app built with Waku and Vue3! This poll app is a simple spin-off of the popular [Kahoot](https://kahoot.com/) with short-lived sessions/storage of the poll.

## How the app works

### 1. Authentication
When a new user comes to the [app](https://waku-vue-poll.vercel.app), they need to connect their wallet to be able to create or vote a poll.

![Alt text](image.png)

After a successfull wallet connection, the navbar interface will change displaying part of the user's wallet address and a button to "Create Poll".
![Alt text](image-1.png)

### 2. Creating a poll
To create a new poll, you need to be authenticated (logged in). After logging, click the button on the right of the navbar(a modal will pop up).
![Alt text](image-2.png)

Fill the form, by providing a question in the textbox and click "Create Poll". You'd be asked to sign the new poll using your wallet. After a successfully signing, you'd be redirected to the "/polls" route where all the polls are listed.

### 3. Voting
To vote, navigate to the "/polls" route, where you'd find a list of polls created by other users, if there's no poll then you're the newest user in the session. Proceed by sharing the site link to anotehr user and creating a new poll. Other's should be able to vote your poll as long as the session is live.

![Alt text](image-3.png)

### Logging out
To end your session or disconnect your wallet from the app and clear the poll list, simple click the cloud button at the center of the navbar
![Alt text](image-1.png)

## Customizing the app

### 1. Clone the Project
Before cloning this project, fork the repository first then run the following command:
```bash
git clone https://github.com/your-username/waku-vue-poll.git
cd your-vue-app
```

### 2. Install Dependencies
We'll use npm to install these dependencies. Make sure you have Node.js and npm installed on your computer:
```bash
npm install
```

### 3. Run the App
To start the app in development mode, run:
```bash
npm run dev
```
This will start the development server, and you can view your Vue app at `http://localhost:3000`. Any changes you make will automatically trigger hot module replacement, making the development process smooth and efficient.

### Recommended IDE Setup
For an enhanced development experience, we recommend using Visual Studio Code with the following extensions:

1. [VS Code](https://code.visualstudio.com/)
2. [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur if enabled)
3. [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

### Type Support For .vue Imports in TS
To handle type information for .vue imports, we use vue-tsc for type checking instead of the default tsc CLI. In your editor, ensure you have the TypeScript Vue Plugin (Volar) installed to make the TypeScript language service aware of .vue types.

If you find the standalone TypeScript plugin not performant enough, you can enable Volar's Take Over Mode for a more efficient development experience.

### Additional Information
For more information on using Vue 3 \<script setup\> SFCs, check out the [script setup docs](v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup).

Feel free to explore the template, customize it to fit your project, and start building awesome Vue.js applications! If you have any questions or run into issues, refer to the documentation or open an issue on GitHub. Happy coding!