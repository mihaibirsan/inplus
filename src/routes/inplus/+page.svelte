<script lang="ts">
  import { onMount } from 'svelte';
  import { SignedIn, SignedOut, collectionStore, docStore, getFirebaseContext, userStore } from 'sveltefire';
  const { auth, firestore } = getFirebaseContext();
  import { signInAnonymously } from "firebase/auth";
	import { doc, getDoc, setDoc } from 'firebase/firestore';
	import Secret from './Secret.svelte';
  import { SETS } from './sets.ts';

  const YOU_RE_IT = "Tu ești";
  const SET_INDEX = 0;

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

  const users = collectionStore(firestore!, 'users');
  function username(userId: string) {
    return $users && $users.find(({ id }) => id === userId)?.username || userId;
  }

  let playerScores = [];
  $: playerScores = $lobbyData && $lobbyData.scoresheet && $lobbyData.players.map(player => {
    console.log(`Recalculating score for ${player}`);
    const score = $lobbyData.scoresheet.map(scoresheet => {
      const playerIndexInScoresheet = scoresheet.players.findIndex(p => p === player);
      if (playerIndexInScoresheet !== -1) {
        return scoresheet.playerWinners[playerIndexInScoresheet] ? 1 : 0;
      } else {
        return 0;
      }
    }).reduce((a, b) => a + b, 0);
    return score;
  });

  async function startGame() {
    if ($lobbyData) {
      const selectedCommonSecret = SETS[SET_INDEX].items[Math.floor(Math.random() * SETS[SET_INDEX].items.length)];
      const playerWhoIsIt = $lobbyData.players[Math.floor(Math.random() * $lobbyData.players.length)];
      const playerSecrets = $lobbyData.players.map(player => {
        if (player === playerWhoIsIt) {
          return YOU_RE_IT;
        } else {
          return selectedCommonSecret;
        }
      });
      const updatedLobbyData = { gameStarted: true, gameStartedAt: Date.now(), playerSecrets };
      await setDoc(doc(firestore, `lobbies/${lobbyId}`), updatedLobbyData, { merge: true });
    }
  }

  let endGameTriggered: boolean = false;
  let playerWinners: boolean[] = [];

  async function endGame() {
    if ($lobbyData) {
      const updatedScoresheet = [ ...($lobbyData.scoresheet || []), {
        gameStartedAt: $lobbyData.gameStartedAt || Date.now(),
        gameEndedAt: Date.now(),
        players: $lobbyData.players,
        playerSecrets: $lobbyData.playerSecrets,
        playerWinners: $lobbyData.players.map((player, i) => playerWinners[i] || false),
      } ];
      const updatedLobbyData = { gameStarted: false, scoresheet: updatedScoresheet, playersReady: [] };
      console.log(updatedLobbyData)
      await setDoc(doc(firestore, `lobbies/${lobbyId}`), updatedLobbyData, { merge: true });
    }
  }

  let mySecret: string | null = null;
  $: mySecret = $lobbyData && $user && $lobbyData.playerSecrets[$lobbyData.players.indexOf($user.uid)];
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
          {#if !$lobbyData.gameStarted}
            <p>Lobby: {$lobbyData.name} ({lobbyId})</p>
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Ready</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {#each $lobbyData.players as player, i (player)}
                  <tr>
                    <td>{username(player)}</td>
                    <td>{($lobbyData.playersReady.includes(player) ? 'Yes' : 'No')}</td>
                    <td>{playerScores && playerScores[i]}</td>
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
          {:else}
            <p>Game started!</p>
            <Secret>{mySecret}</Secret>
            {#if userIsHost}
              {#if !endGameTriggered}
                <button on:click={() => endGameTriggered = true}>End game</button>
              {:else}
                <form>
                  {#each $lobbyData.players as player, i (player)}
                    <label>
                      <input type="checkbox" bind:checked={playerWinners[i]} />
                      {username(player)}
                    </label>
                  {/each}
                  <button on:click={endGame}>End game</button>
                </form>
                <button on:click={() => endGameTriggered = false}>Cancel end game</button>
              {/if}
            {/if}
          {/if}
        {/if}
    {/if}
    <p on:click={signOut}>UID {user.uid}</p>
</SignedIn>

<SignedOut let:auth>
    <button on:click={() => signInAnonymously(auth)}>Sign In</button>
</SignedOut>