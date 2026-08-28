# Demo sandbox

Demo URL: <https://bird-sighting-proof-card.sociobot.in/demo/>

Alternate URL: <https://bird-sighting-proof-card.sociobot.in/?demo=1>

The demo opens a filled “Distant wader at Deerness” record. It includes a marsh image, a short WAV sample, observation time, broad place, rounded coordinates, field marks, notes, and two possible species.

Demo drafts use the IndexedDB database `demo:bird-proof-card`. Real drafts use `bird-proof-card`; demo code selects one database before any read or write.

“Reset demo” deletes only `demo:bird-proof-card` and reseeds the sample. “Start for real” deletes that demo database and opens the real blank-record route.

The service worker precaches `/demo/` and the sample image. After one online visit, the filled sample reloads offline from demo storage.
