const clientId = import.meta.env.VITE_CLIENT_ID;
const redirectUri = 'https://wrapped-365.vercel.app/';
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

document.getElementById('log-in-btn').addEventListener('click', async () => {
  document.querySelector('.landing').style.display = 'none';
  document.getElementById('loading-spinner').style.display = 'block';

  if (!code) {
    redirectToAuthCodeFlow(clientId);
  } else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    const artist = await getArtistData(accessToken);
    const track = await getTrackData(accessToken);
    populateUI(profile, artist, track);
  }
});

if (code) {
  (async () => {
    document.querySelector('.landing').style.display = 'none';
    document.getElementById('loading-spinner').style.display = 'block';

    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    const artist = await getArtistData(accessToken);
    const track = await getTrackData(accessToken);
    populateUI(profile, artist, track);
  })();
}

async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", redirectUri);
  params.append("scope", "user-read-private user-read-email user-top-read");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
};

function generateCodeVerifier(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);

  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("code_verifier", verifier);

  try {
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });

    if (!result.ok) {
      throw new Error("Couldn't get access token");
    }

    const { access_token } = await result.json();
    return access_token;

  } catch (error) {
    console.log(`There was an ${error.title}: ${error.message} with the getAccessToken function`);
  }
};

async function fetchProfile(token) {
  try {
    const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!result.ok) {
      throw new Error("Couldn't get profile");
    }

    return await result.json();

  } catch (error) {
    console.log(`There was an ${error.title}: ${error.message} with the fetchProfile function`);
  }
};

async function getArtistData(token) {
  try {
    const result = await fetch("https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=50&offset=0",{
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!result.ok) {
      throw new Error("Couldn't get artist data");
    }

    return await result.json();

  } catch (error) {
    console.log(`There was an ${error.title}: ${error.message} with the getArtistData function`);
  }
};

async function getTrackData(token) {
  try {
    const result = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50&offset=0",{
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!result.ok) {
      throw new Error("Couldn't get track data");
    }

    return await result.json();

  } catch (error) {
    console.log(`There was an ${error.title}: ${error.message} with the getTrackData function`);
  }
};

function populateUI(profile, artist, track) {
  document.getElementById('profile-name').innerText = profile.display_name;
  document.querySelector('.top-track-cover').setAttribute('src', track.items[0].album.images[1].url);

  if (artist.items.length > 0) {
    for (let i = 0; i < artist.items.length; i++) {
      const newArtistEntry = document.createElement('li');
      newArtistEntry.classList.add('top-artist');
      newArtistEntry.innerText = `${i + 1}. ${artist.items[i].name}`;
      document.querySelector('.top-artists-list').append(newArtistEntry);
    }
  } else {
    const noArtistEntry = document.createElement('li');
    noArtistEntry.classList.add('top-artist');
    noArtistEntry.innerText = 'Oh no! Looks like we couldn\'t find anything. Music makes life better, don\'t be scared to enjoy it!';
    document.querySelector('.top-artists-list').append(noArtistEntry);
  }

  if (track.items.length > 0) {
    for (let i = 0; i < track.items.length; i++) {
      const newTrackEntry = document.createElement('li');
      newTrackEntry.classList.add('top-track');
      newTrackEntry.innerText = `${i + 1}. ${track.items[i].name} by ${track.items[i].artists[0].name}`;
      document.querySelector('.top-tracks-list').append(newTrackEntry);
    }
  } else {
    const noTrackEntry = document.createElement('li');
    noTrackEntry.classList.add('top-artist');
    noTrackEntry.innerText = 'Oh no! Looks like we couldn\'t find anything. Music makes life better, don\'t be scared to enjoy it!';
    document.querySelector('.top-artists-list').append(noTrackEntry);
  }

  document.getElementById('loading-spinner').style.display = 'none';
  document.querySelector('.app').style.display = 'flex';
};