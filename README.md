# Fool the Table 🦃

A Thanksgiving bluffing game for teams. Each round shows a real Thanksgiving fact with a blank. Teams write a **fake** answer on their phone, then everyone votes for the one they think is **real**.

- +1,000 points for finding the real answer
- +500 points for every team that picks your fake
- The last question is the double-points round 🍗

**Files**

| File | What it is |
|---|---|
| `host.html` | The big screen. Open this on your laptop and project it. |
| `index.html` | The phone page. Students go here. |
| `questions.js` | The questions, answers, fun facts, and timer settings. Edit freely. |
| `config.js` | Where you paste your Firebase settings (step 4). |
| everything else | Game code. You don't need to touch it. |

---

## Setup (about 15 minutes, one time only)

### 1. Create a Firebase project
1. Go to **https://console.firebase.google.com** and sign in with a Google account.
2. Click **Create a project** (or **Add project**). Name it something like `fool-the-table`.
3. You can turn **off** Google Analytics. Click **Create project**.

### 2. Create the Realtime Database
1. In the left menu, open **Build → Realtime Database** and click **Create Database**.
2. Pick any location (Singapore is closest if you're in Southeast Asia), then click **Next**.
3. Choose **Start in test mode** and click **Enable**.

### 3. Set the database rules
Test mode turns itself off after 30 days. To keep the game working, open the **Rules** tab, replace everything with this, and click **Publish**:

```json
{
  "rules": {
    "rooms": {
      "$room": { ".read": true, ".write": true }
    }
  }
}
```

(The game stores only team names, animals, fake answers, and scores. Nothing private.)

### 4. Connect the game to Firebase
1. Click the **gear icon ⚙️ → Project settings**.
2. Scroll down to **Your apps** and click the **web icon `</>`**.
3. Type any nickname, leave "Firebase Hosting" unchecked, and click **Register app**.
4. You'll see a block of code with `const firebaseConfig = { ... }`. Copy everything between the `{ }`.
5. Open `config.js` and replace the example values with yours.
6. **Check that `databaseURL` is there.** If it's missing, copy the URL shown at the top of the Realtime Database page (it looks like `https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app`) and add it as `databaseURL: "..."`.

(It's normal for this key to be public in a web game. The rules from step 3 control access.)

### 5. Put the game on GitHub Pages
1. On **https://github.com**, click **New repository**. Name it something like `fool-the-table` and make it **Public**.
2. Click **uploading an existing file**, drag in **all** the game files (including your edited `config.js`), and click **Commit changes**.
3. Go to **Settings → Pages**. Under **Branch**, choose **main** and **/ (root)**, then click **Save**.
4. Wait 1–2 minutes. Your game is now live at:
   - Big screen: `https://YOUR-USERNAME.github.io/fool-the-table/host.html`
   - Phones: `https://YOUR-USERNAME.github.io/fool-the-table/` (or they scan the QR code)

### 6. Test it before class
Open `host.html` on your laptop, click **Start a new game**, and join from two phones. Test on the **school Wi-Fi** if you can, since some school networks block things.

---

## Running the game in class
1. Open `host.html` on the projector and click **Start a new game**.
2. One phone per team scans the QR code or types the web address, enters the 4-letter room code, names their team, and picks an animal.
3. To remove a team (for example a duplicate), click their animal at the bottom of the screen while you're in the lobby.
4. Choose how many questions, then click **Start the game**.

Controls during the game:
- **Go to voting now / Stop voting and reveal**: skip the timer when everyone is ready. (It also moves on automatically once every team is done.)
- **Remove a fake answer**: during voting, hover over an answer card and click the small ✕. Use this for anything inappropriate.
- **Skip animation**: jump straight to the fun fact.
- **🔊**: sound on or off.
- If a phone refreshes or the browser closes, the team rejoins automatically when they reopen the page. If your laptop refreshes, click **Continue game** within 30 seconds.
- **Close room** (small gray text next to the room code): ends the game and sends every phone back to the join screen. Use it if something goes wrong and you need a fresh room. Starting a new game also closes the old room.
- If you close the big-screen tab, phones show a "waiting" message and leave the game automatically after 30 seconds.
- **Leave** (small gray text in the top corner of each phone): lets a team leave the game on its own.

## Editing questions
Open `questions.js`. Each question has:
- `prompt`: the sentence, with `______` where the blank goes
- `answer`: the real answer
- `accept`: other spellings of the real answer. If a team types one of these, their phone tells them it's the real answer and asks for a fake instead.
- `decoys`: the game's own fakes, added when teams don't write enough answers
- `fact`: the "Did you know?" card

You can also change the timer lengths and points at the top of the file.

## Troubleshooting
- **"Almost ready!" screen**: `config.js` still has the example values.
- **Green dot is red**: the device lost its connection. It reconnects automatically.
- **Phone says "There's no game with that code"**: check the code on the big screen, or make sure the host page is open.
- **Nothing happens after joining**: make sure the database rules from step 3 were published.
