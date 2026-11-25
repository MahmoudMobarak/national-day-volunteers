# National Day Volunteers

A mobile-friendly duty board for the National Day volunteers. Static files only — no build step, no server.

- 34 volunteers from the finalized roster, 6 duty spots, batch timetable built in.
- Each volunteer has **On duty** and **On shift** checkboxes, a **Location** picker (only while on duty), and a **phone** field.
- **Assign replacement** on anyone who is not on duty sends another volunteer to their spot; both cards show who covers whom.
- **Add** new volunteers at any time (name, spot, batch, phone).
- Search by name, spot or phone, filter by status.

## Publish on GitHub Pages

1. Create a repository and upload every file in this folder (`index.html`, `styles.css`, `app.js`, `data.js`, `config.js`, `sync.js`, `.nojekyll`, `package.json`, `serve.js` — `serve.js`/`package.json` are only for local preview).
2. Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → **Save**.
3. The site appears at `https://<username>.github.io/<repo>/` in a minute or two.

## Turn on live updates

Without configuration the site saves on each device only (the badge says "Local only"). To share one live roster:

1. <https://console.firebase.google.com> → **Add project**.
2. **Build → Realtime Database → Create Database** → choose a location → **Start in test mode**.
3. **Project settings → Your apps → Web (`</>`)** → register the app and copy the `firebaseConfig` values.
4. Paste them into `config.js` and push.
5. In **Realtime Database → Rules**, publish:

```json
{ "rules": { "students": { ".read": true, ".write": true } } }
```

Every open tab and phone then updates instantly, and the badge reads "Live · updates for everyone".

## Local preview

```bash
node serve.js      # http://127.0.0.1:5173
```

## Phone numbers

Three ways:

- Type a number straight into the **Phone** field on a card.
- Add it with the person in the **Add** sheet.
- **Paste phone numbers** (button under the filters): copy the name and number columns from your other sheet and paste them in. Tabs, commas, or just a space before the number all work; a header row is ignored. Matched names get their number, and anything unmatched is listed so you can fix the spelling.
