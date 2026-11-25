# National Day Volunteers

A mobile-friendly duty board for the National Day volunteers. Static files only — no build step, no server.

- 34 volunteers from the finalized roster, 6 duty spots, batch timetable built in.
- Each volunteer has **On duty** and **On shift** checkboxes, a **Location** picker (only while on duty), a **Batch** picker and a **phone** field.
- Ticking **On duty** also turns **On shift** on, since they are working. Untick **On shift** on its own to keep them at the venue but on a break — the card then reads *Off shift*.
- The bar at the top of the page puts a whole batch **on** or **off shift** in one tap (Batch 1, Batch 2, or the volunteers with no batch).
- **Assign replacement** on anyone who is not on duty sends another volunteer to their spot; both cards show who covers whom.
- **Add** new volunteers at any time (name, spot, batch, phone).
- Search by name, spot, batch or phone; filter by status.

## Where it lives

The site is published from this repository with GitHub Pages:

**https://mahmoudmobarak.github.io/national-day-volunteers/**

Pages is set to **Deploy from a branch → `main` → `/ (root)`**, so every push to `main` republishes the site within a minute or two. No build step is involved.

## Live updates

Live sync is already configured: `config.js` holds the Firebase project `national-day-volunteers`, and the badge reads "Live · updates for everyone". Without those values the site still works but saves on each device only (badge: "Local only").

To point the site at a different Firebase project:

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
