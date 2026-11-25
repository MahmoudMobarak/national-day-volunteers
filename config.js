// ---------------------------------------------------------------------------
// Live sync (Firebase Realtime Database)
// ---------------------------------------------------------------------------
// Fill this in once and every phone/computer that opens the site sees the same
// roster, updated live. Leave it empty and the site still works, but each
// device keeps its own copy (nothing is shared).
//
// Steps (about 3 minutes, free):
//   1. https://console.firebase.google.com -> Add project (any name).
//   2. In the project: Build -> Realtime Database -> Create Database
//      -> pick a location -> start in "Test mode".
//   3. Project settings (gear icon) -> "Your apps" -> Web app (</>) icon
//      -> nickname (anything, e.g. "volunteers") -> Register app.
//      Copy each value from the firebaseConfig block into the object below,
//      quotes included. What they look like:
//        apiKey:            starts with "AIza"
//        authDomain:        <project-id>.firebaseapp.com
//        databaseURL:       https://<name>.firebaseio.com            (us-central1)
//                        or https://<name>.<region>.firebasedatabase.app
//        projectId:         your project id, e.g. national-day-volunteers
//        storageBucket:     <project-id>.appspot.com
//        messagingSenderId: a long number, quoted
//        appId:             "1:<number>:web:<hex>"
//      If databaseURL is missing from the snippet, open Realtime Database and
//      copy the URL printed at the top of that page.
//      None of these are secret - it is safe to commit this file publicly.
//   4. Realtime Database -> Rules -> replace with:
//        { "rules": { "students": { ".read": true, ".write": true } } }
//      and press Publish.
//   5. Commit this file and push. That's it.
// ---------------------------------------------------------------------------

export const FIREBASE = {
  apiKey: "AIzaSyAFai_IQiYPEvyqpVckP2_ZTcjWS15tQvk",
  authDomain: "national-day-volunteers.firebaseapp.com",
  databaseURL: "https://national-day-volunteers-default-rtdb.firebaseio.com",
  projectId: "national-day-volunteers",
  storageBucket: "national-day-volunteers.firebasestorage.app",
  messagingSenderId: "497139914967",
  appId: "1:497139914967:web:6474a55c26bbbc37813892",
};
