# WeekWise - An AI-Powered Weekly Planner

WeekWise is a modern, offline-first, and AI-enhanced weekly planner built with Next.js and Firebase. It's designed to help you organize your tasks and notes efficiently, with intelligent features to make planning easier.

This project was built inside Firebase Studio, an AI-powered IDE for building and deploying web applications on Google Cloud.

![WeekWise Planner Screenshot](https://placehold.co/800x600.png?text=WeekWise+App+Screenshot)

## ✨ Key Features

*   **Weekly Planner View:** Organize your tasks and notes across a 7-day week.
*   **AI Task Suggestions:** Get intelligent task suggestions based on your past activities.
*   **AI Weekly Summaries:** Generate a summary of your week's accomplishments and pending tasks.
*   **Offline First:** Thanks to Firestore's offline persistence, the app works seamlessly without an internet connection. Your data syncs automatically when you reconnect.
*   **Progressive Web App (PWA):** Install WeekWise on your mobile or desktop device for a native-app-like experience.
*   **Secure Authentication:** Sign in easily and securely with Google or email/password.
*   **Responsive Design:** A clean, modern UI that works on all screen sizes.

## 🚀 Getting Started

To run this project locally, you'll first need a Firebase project.

### 1. Firebase Setup

1.  Create a new project in the [Firebase Console](https://console.firebase.google.com/).
2.  In your new project, go to **Authentication** -> **Sign-in method** and enable `Email/Password` and `Google` as providers.
3.  Go to **Firestore Database** and create a new database. Start in `production mode`.
4.  Go to **Project Settings** (click the gear icon ⚙️) and under the "General" tab, find your "Web app" and its configuration.

### 2. Local Setup

1.  Clone the repository.
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Run the application in development mode:
    ```bash
    npm run dev
    ```
4.  Open your browser to `http://localhost:9002/setup`.
5.  Paste the entire Firebase config object from your Firebase project settings into the text area and save. This will store your configuration securely in your browser's local storage.
6.  You will be redirected to the login page, where you can now sign up and start using the app.

## 📦 Deployment

To create a production-ready version of your application, you can run the build command:

```bash
npm run build
```

This command compiles the application and optimizes it for performance. The output will be in the `.next` directory. You can then deploy this directory to any hosting service that supports Next.js, such as Firebase App Hosting or Vercel.

If you want to create a zip file of the project to share, you can run this command after the build (on macOS/Linux):

```bash
zip -r WeekWise.zip . -x ".next/*" "node_modules/*" ".DS_Store"
```

This will create a `WeekWise.zip` file with all your project code, excluding the large build and dependency folders.

## 🤝 How to Contribute

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to get started, our code of conduct, and the process for submitting pull requests.

## 📄 License

This project is open source and licensed under the [MIT License](./LICENSE).
