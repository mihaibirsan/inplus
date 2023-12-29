<script lang="ts">
  import { onMount } from 'svelte';
  import { SignedIn, SignedOut, docStore, getFirebaseContext, userStore } from 'sveltefire';
  const { auth, firestore } = getFirebaseContext();
  import { signInAnonymously } from "firebase/auth";
	import { doc, setDoc } from 'firebase/firestore';

  const user = userStore(auth);
  let userData;
  $: userData = $user && docStore(firestore!, `users/${$user.uid}`);

  let inputUsername: string = "";
  
  function updateUsername() {
    setDoc(userData.ref, { username: inputUsername });
    inputUsername = "";
  }

  let lobbyId: string | null = null;

  // Load lobbyId from localStorage when the component is initialized
  onMount(() => {
      const savedLobbyId = localStorage.getItem('lobbyId');
      if (savedLobbyId) {
        lobbyId = savedLobbyId;
      }
  })

  // Save lobbyId to localStorage whenever it changes
  $: {
    if (lobbyId) {
      localStorage.setItem('lobbyId', lobbyId);
    }
  }

  let inputLobbyId: string = "";
  let lobbyData;
  $: lobbyData = docStore(firestore!, `lobbies/${lobbyId}`);

  function updateLobbyId() {
    lobbyId = inputLobbyId.toUpperCase();
    inputLobbyId = "";
  }

  function createLobbyId() {
    lobbyId = Array.from((Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).matchAll(/[a-z]/ig))
      .slice(0, 4).join("").toUpperCase();
    setDoc(doc(firestore, `lobbies/${lobbyId}`), { players: [$user.uid], playersReady: [], host: $user.uid, name: `${$userData.username}'s lobby` });
  }

  let userIsHost: boolean = false;
  $: userIsHost = $lobbyData && $user && $lobbyData.host === $user.uid;

  let userIsInLobby: boolean = false;
  $: userIsInLobby = $lobbyData && $user && $lobbyData.players.includes($user.uid);

  async function joinLobby() {
    if ($user && $lobbyData) {
      const updatedPlayers = [...$lobbyData.players, $user.uid];
      const updatedLobbyData = { players: updatedPlayers };
      await setDoc(doc(firestore, `lobbies/${lobbyId}`), updatedLobbyData, { merge: true });
    }
  }

  let userIsReady: boolean = false;
  $: userIsReady = $lobbyData && $user && $lobbyData.playersReady.includes($user.uid);

  async function setUserReady() {
    if ($user && $lobbyData) {
      const updatedPlayersReady = [...$lobbyData.playersReady, $user.uid];
      const updatedLobbyData = { playersReady: updatedPlayersReady };
      await setDoc(doc(firestore, `lobbies/${lobbyId}`), updatedLobbyData, { merge: true });
    }
  }

  async function setUserNotReady() {
    if ($user && $lobbyData) {
      const updatedPlayersReady = $lobbyData.playersReady.filter(player => player !== $user.uid);
      const updatedLobbyData = { playersReady: updatedPlayersReady };
      await setDoc(doc(firestore, `lobbies/${lobbyId}`), updatedLobbyData, { merge: true });
    }
  }

  let allPlayersReady: boolean = false;
  $: allPlayersReady = $lobbyData && $lobbyData.players.length > 2 && $lobbyData.players.length === $lobbyData.playersReady.length;

  async function startGame() {
    if ($lobbyData) {
      const updatedLobbyData = { gameStarted: true };
      await setDoc(doc(firestore, `lobbies/${lobbyId}`), updatedLobbyData, { merge: true });
    }
  }
</script>

<SignedIn let:user let:signOut>
    {#if !$userData || !$userData.username}
        <p>Enter a username:</p>
        <form on:submit={updateUsername}>
          <input type="text" bind:value={inputUsername} />
          <button>Submit</button>
        </form>
    {:else}
        <p>Username: {$userData.username}</p>
        {#if !$lobbyData}
          {#if lobbyId}
            <p>Invalid lobby ID {lobbyId}</p>
          {/if}
          <p>Enter a lobby ID:</p>
          <form on:submit={updateLobbyId}>
            <input type="text" bind:value={inputLobbyId} />
            <button>Submit</button>
          </form>
          <form on:submit={createLobbyId}>
            <button>Create new lobby</button>
          </form>
        {:else}
          <p>Lobby: {$lobbyData.name} ({lobbyId})</p>
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Ready</th>
              </tr>
            </thead>
            <tbody>
              {#each $lobbyData.players as player (player)}
                <tr>
                  <td>{player}</td>
                  <td>{($lobbyData.playersReady.includes(player) ? 'Yes' : 'No')}</td>
                </tr>
              {/each}
            </tbody>
          </table>
          {#if !userIsInLobby}
            <button on:click={joinLobby}>Join this lobby</button>
          {:else}
            {#if !userIsReady}
              <button on:click={setUserReady}>Ready</button>
            {:else}
              <button on:click={setUserNotReady}>Unready</button>
            {/if}
          {/if}
          {#if userIsHost}
            <p>You are the host</p>
            {#if allPlayersReady}
              <button on:click={startGame}>Start game</button>
            {:else}
              <p>Waiting for all players to be ready. A minimum of 3 players is necessary.</p>
            {/if}
          {:else}
            {#if allPlayersReady}
              <p>Waiting for host to start the game.</p>
            {:else}
              <p>Waiting for all players to be ready. A minimum of 3 players is necessary.</p>
            {/if}
          {/if}
        {/if}
    {/if}
    <p on:click={signOut}>UID {user.uid}</p>
</SignedIn>

<SignedOut let:auth>
    <button on:click={() => signInAnonymously(auth)}>Sign In</button>
</SignedOut>