# inplus
"Eu cred că știm cu toții cine e în plus" — Bovarius

# SvelteFire

[SvelteFire Documentation (fireship.io)](https://sveltefire.fireship.io/guide/start)
+ Setup Anonymous authentication provider at https://console.firebase.google.com/u/0/project/inplus-game/authentication/providers
+ Setup default Firestore database at https://console.firebase.google.com/u/0/project/inplus-game/firestore
  + with one collection "posts" and a single document with the id "id" and properties
    - title: "Hello World!"
    - content: "A simple document in a collection."

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
