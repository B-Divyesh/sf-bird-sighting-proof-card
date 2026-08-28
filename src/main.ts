import './styles.css';
import { deleteDraft, getDrafts, saveDraft } from './db';
import { jpegCapturedAt } from './exif';
import { importedDraft, jsonBlob, pdfBlob } from './export';
import { bytesLabel, exportIssues, localDateTime, precisionLabels, sharedCoordinates } from './privacy';
import { newDraft, type Candidate, type Confidence, type Precision, type SightingDraft } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <header class="site-head">
    <a class="brand" href="/" aria-label="Bird Sighting Proof Card home"><img src="/icon.svg" alt="" width="36" height="36"><span>Bird Sighting<br><strong>Proof Card</strong></span></a>
    <nav aria-label="Main navigation"><a href="#builder">Builder</a><a href="#drafts">Saved cards</a><a href="/privacy/">Privacy</a></nav>
  </header>
  <main id="main">
    <section class="hero" aria-labelledby="page-title">
      <div class="hero-copy"><p class="eyebrow">Local field utility · no account</p><h1 id="page-title">Bring the evidence.<br><em>Blur the coordinates.</em></h1><p class="lede">Package an uncertain bird observation for useful review—with photo, sound, field marks and honest confidence. You decide how much location to reveal.</p><a class="button primary" href="#builder">Build a proof card <span aria-hidden="true">↓</span></a></div>
      <figure class="hero-plate"><picture><source type="image/avif" srcset="/assets/hero-field-map-768.avif 768w, /assets/hero-field-map-1280.avif 1280w" sizes="(max-width: 760px) 100vw, 52vw"><source type="image/webp" srcset="/assets/hero-field-map-768.webp 768w, /assets/hero-field-map-1280.webp 1280w" sizes="(max-width: 760px) 100vw, 52vw"><img src="/assets/hero-field-map-1280.webp" alt="A distant shorebird in a misty marsh crossed by faint topographic contour lines" width="1280" height="853" fetchpriority="high" decoding="async"></picture><figcaption><span>Plate 01</span> Certainty belongs in the notes, not the picture.</figcaption></figure>
    </section>
    <div class="trust-strip" aria-label="Privacy and connection status"><span class="status-dot" aria-hidden="true"></span><strong id="connection-label">Ready offline</strong><span>Evidence stays in this browser until you export.</span><button class="link-button" id="storage-help" type="button">How storage works</button></div>
    <section class="builder-intro" id="builder"><div><p class="eyebrow">New evidence route</p><h2>Record what another birder needs.</h2></div><p>Required for a useful card: time, share-safe place, one evidence file and one candidate with confidence. Drafts can be incomplete.</p></section>
    <div id="error-summary" class="error-summary" role="alert" tabindex="-1" hidden></div>
    <div class="workbench">
      <form id="proof-form" novalidate>
        <section class="waypoint" aria-labelledby="evidence-title"><div class="waypoint-mark" aria-hidden="true">01</div><div class="waypoint-body"><p class="overline">Evidence</p><h2 id="evidence-title">Add what you captured</h2><p class="hint">Photos and audio stay on this device. JSON exports bundle originals; PDF exports list their names.</p><label class="file-drop" for="evidence-files"><strong>Add photo or audio</strong><span>JPEG, PNG, WebP, M4A, MP3 or WAV · 25 MB each</span></label><input class="visually-hidden" id="evidence-files" type="file" accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/mp4,audio/wav,audio/x-wav" multiple><div id="file-error" class="field-error" role="alert"></div><ul id="evidence-list" class="evidence-list"></ul></div></section>
        <section class="waypoint" aria-labelledby="time-title"><div class="waypoint-mark" aria-hidden="true">02</div><div class="waypoint-body"><p class="overline">Time</p><h2 id="time-title">When did you observe it?</h2><div class="field"><label for="observed-at">Date and local time <span aria-hidden="true">*</span></label><input id="observed-at" name="observedAt" type="datetime-local" required><p class="hint" id="time-hint">We’ll use photo metadata when available; you can correct it.</p></div></div></section>
        <section class="waypoint" aria-labelledby="place-title"><div class="waypoint-mark" aria-hidden="true">03</div><div class="waypoint-body"><p class="overline">Place</p><h2 id="place-title">Share the place, not the nest</h2><div class="field"><label for="place-label">Place or region name <span aria-hidden="true">*</span></label><input id="place-label" name="placeLabel" autocomplete="off" placeholder="e.g. Deerness coast, Orkney" required><p class="hint">Use a broad, recognizable name. Never put coordinates in this field.</p></div><div class="coordinate-grid"><div class="field"><label for="latitude">Latitude <span class="optional">optional</span></label><input id="latitude" name="latitude" type="number" min="-90" max="90" step="any" inputmode="decimal" placeholder="58.95"></div><div class="field"><label for="longitude">Longitude <span class="optional">optional</span></label><input id="longitude" name="longitude" type="number" min="-180" max="180" step="any" inputmode="decimal" placeholder="-2.75"></div></div><button type="button" class="button secondary" id="use-location"><span aria-hidden="true">⌖</span> Use my current location</button><p class="hint" id="geo-status" aria-live="polite">Location permission is only requested when you press this button.</p><fieldset class="precision"><legend>Precision in exports</legend><div class="precision-options">${(Object.entries(precisionLabels) as [Precision,string][]).map(([value,label]) => `<label><input type="radio" name="precision" value="${value}" ${value === 'region' ? 'checked' : ''}><span><strong>${label.split(' — ')[0]}</strong><small>${label.split(' — ')[1]}</small></span></label>`).join('')}</div></fieldset><label class="check-line"><input id="sensitive" type="checkbox"><span><strong>Sensitive site or nesting area</strong><small>Adds a visible share-with-care warning.</small></span></label><div id="exact-warning" class="exact-warning" hidden><p><strong>Exact means exact.</strong> This can expose a nest, roost, private property or your home. The unrounded coordinates will appear in exports.</p><label class="check-line danger"><input id="exact-ack" type="checkbox"><span>I understand and choose to include exact coordinates.</span></label></div></div></section>
        <section class="waypoint" aria-labelledby="marks-title"><div class="waypoint-mark" aria-hidden="true">04</div><div class="waypoint-body"><p class="overline">Field marks</p><h2 id="marks-title">Write what the suggestion can’t know</h2><fieldset><legend class="visually-hidden">Observed field marks</legend><div class="check-grid">${['Size & shape','Bill','Plumage','Flight','Voice','Behaviour','Habitat','Flock context'].map(mark => `<label><input type="checkbox" name="fieldMark" value="${mark}"><span>${mark}</span></label>`).join('')}</div></fieldset><div class="field"><label for="field-notes">Observation notes <span class="optional">optional</span></label><textarea id="field-notes" rows="5" placeholder="e.g. stiff-winged glide, pale rump, call not heard…"></textarea></div></div></section>
        <section class="waypoint" aria-labelledby="candidate-title"><div class="waypoint-mark" aria-hidden="true">05</div><div class="waypoint-body"><p class="overline">Candidates</p><h2 id="candidate-title">Keep uncertainty visible</h2><p class="hint">These are possibilities for review—not identifications.</p><div id="candidate-list"></div><button type="button" class="button secondary" id="add-candidate">+ Add another candidate</button></div></section>
        <section class="waypoint" aria-labelledby="finish-title"><div class="waypoint-mark" aria-hidden="true">06</div><div class="waypoint-body"><p class="overline">File and finish</p><h2 id="finish-title">Name this field card</h2><div class="field"><label for="card-title">Card title <span class="optional">optional</span></label><input id="card-title" maxlength="90" placeholder="e.g. Distant seabird at Deerness"></div><div class="form-actions"><button type="button" class="button primary" id="save-card">Save on this device</button><button type="button" class="button text" id="new-card">Start a new card</button></div><p class="save-status" id="save-status" aria-live="polite">Not saved yet.</p></div></section>
      </form>
      <aside class="proof-sheet" aria-labelledby="preview-title"><div class="sheet-top"><div><p class="overline">Share-safe preview</p><h2 id="preview-title">Uncertain bird sighting</h2></div><span class="sheet-stamp">UNVERIFIED</span></div><div id="preview-content"></div><div class="export-actions"><button class="button primary" type="button" id="export-pdf">Download PDF</button><button class="button secondary" type="button" id="export-json">Export JSON + media</button></div><p class="export-note">Review the visible place and precision before sharing. JSON may be large because it contains your evidence files.</p></aside>
    </div>
    <section class="drafts" id="drafts" aria-labelledby="drafts-title"><div class="section-heading"><div><p class="eyebrow">Local archive</p><h2 id="drafts-title">Saved proof cards</h2></div><label class="button secondary import-button" for="import-file">Import JSON</label><input class="visually-hidden" id="import-file" type="file" accept="application/json,.json"></div><div id="draft-list"></div></section>
    <dialog id="storage-dialog"><form method="dialog"><button class="dialog-close" aria-label="Close storage explanation">×</button><p class="eyebrow">Local means local</p><h2>Nothing is uploaded.</h2><p>Drafts and evidence live in this browser’s private storage. Clear site data or uninstall the app and they can disappear, so export JSON for a portable backup.</p><p>PDF is a lightweight review sheet. JSON includes the original media as embedded data.</p><button class="button primary" value="close">Got it</button></form></dialog>
    <div class="toast" id="update-toast" role="status" hidden><span>An app update is ready.</span><button class="button secondary" id="reload-app">Reload</button></div>
    <div class="sr-live" id="live-status" aria-live="polite"></div>
  </main>
  <footer><div><img src="/icon.svg" alt="" width="32" height="32"><p><strong>Bird Sighting Proof Card</strong><br>Evidence for review, not an identification.</p></div><nav aria-label="Footer"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-bird-sighting-proof-card">Source</a></nav><p class="art-credit">Original field illustration created with AI assistance · No tracking</p></footer>`;

let draft = newDraft();
let drafts: SightingDraft[] = [];
let saveTimer = 0;
let previewUrls: string[] = [];
const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const input = (id: string) => byId<HTMLInputElement>(id);
const announce = (message: string) => { byId('live-status').textContent = message; };
const escapeHtml = (text: string) => text.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]!));

function updateFromForm() {
  draft.title = input('card-title').value;
  draft.observedAt = input('observed-at').value;
  draft.placeLabel = input('place-label').value;
  draft.latitude = input('latitude').value === '' ? null : Number(input('latitude').value);
  draft.longitude = input('longitude').value === '' ? null : Number(input('longitude').value);
  draft.precision = (document.querySelector<HTMLInputElement>('input[name="precision"]:checked')?.value || 'region') as Precision;
  draft.sensitive = input('sensitive').checked;
  draft.exactAcknowledged = input('exact-ack').checked;
  draft.fieldMarks = [...document.querySelectorAll<HTMLInputElement>('input[name="fieldMark"]:checked')].map(el => el.value);
  draft.fieldNotes = byId<HTMLTextAreaElement>('field-notes').value;
  draft.updatedAt = new Date().toISOString();
  renderPreview();
  scheduleSave();
}

function populateForm() {
  input('card-title').value = draft.title;
  input('observed-at').value = draft.observedAt.slice(0, 19);
  input('place-label').value = draft.placeLabel;
  input('latitude').value = draft.latitude?.toString() ?? '';
  input('longitude').value = draft.longitude?.toString() ?? '';
  document.querySelectorAll<HTMLInputElement>('input[name="precision"]').forEach(el => el.checked = el.value === draft.precision);
  input('sensitive').checked = draft.sensitive;
  input('exact-ack').checked = draft.exactAcknowledged;
  byId<HTMLTextAreaElement>('field-notes').value = draft.fieldNotes;
  document.querySelectorAll<HTMLInputElement>('input[name="fieldMark"]').forEach(el => el.checked = draft.fieldMarks.includes(el.value));
  byId('time-hint').textContent = draft.timeSource === 'entered' ? 'We’ll use photo metadata when available; you can correct it.' : `Filled from ${draft.timeSource}; you can correct it.`;
  renderExactWarning(); renderEvidence(); renderCandidates(); renderPreview();
}

function scheduleSave() {
  window.clearTimeout(saveTimer);
  byId('save-status').textContent = 'Changes waiting to save…';
  saveTimer = window.setTimeout(() => void persist(false), 700);
}

async function persist(explicit: boolean) {
  window.clearTimeout(saveTimer);
  try {
    await saveDraft(draft);
    drafts = await getDrafts();
    renderDrafts();
    byId('save-status').textContent = `Saved locally at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
    if (explicit) announce('Proof card saved on this device.');
  } catch {
    byId('save-status').textContent = 'Could not save. Browser storage may be full or unavailable; export JSON now.';
    announce('Save failed. Export JSON to keep a copy.');
  }
}

function renderEvidence() {
  previewUrls.forEach(URL.revokeObjectURL); previewUrls = [];
  const list = byId<HTMLUListElement>('evidence-list');
  if (!draft.attachments.length) { list.innerHTML = '<li class="empty-inline">No evidence attached yet.</li>'; return; }
  list.innerHTML = draft.attachments.map(file => {
    const isImage = file.type.startsWith('image/');
    const url = URL.createObjectURL(file.blob); previewUrls.push(url);
    return `<li class="evidence-item">${isImage ? `<img src="${url}" alt="Photo evidence preview: ${escapeHtml(file.name)}">` : `<div class="audio-mark" aria-hidden="true">♪</div>`}<div><strong>${escapeHtml(file.name)}</strong><span>${isImage ? 'Photo' : 'Audio'} · ${bytesLabel(file.size)} · local only</span>${file.capturedAt ? `<small>Time found: ${escapeHtml(localDateTime(file.capturedAt))}</small>` : ''}</div><button type="button" data-remove-file="${file.id}" aria-label="Remove ${escapeHtml(file.name)}">Remove</button></li>`;
  }).join('');
  list.querySelectorAll<HTMLButtonElement>('[data-remove-file]').forEach(button => button.addEventListener('click', () => {
    draft.attachments = draft.attachments.filter(file => file.id !== button.dataset.removeFile); renderEvidence(); renderPreview(); scheduleSave(); announce('Evidence removed.');
  }));
}

function renderCandidates() {
  byId('candidate-list').innerHTML = draft.candidates.map((candidate, index) => `<fieldset class="candidate" data-candidate="${candidate.id}"><legend>Candidate ${index + 1}</legend><div class="candidate-grid"><div class="field"><label for="candidate-name-${candidate.id}">Species or working label</label><input id="candidate-name-${candidate.id}" data-key="name" value="${escapeHtml(candidate.name)}" placeholder="e.g. Northern fulmar"></div><div class="field"><label for="candidate-confidence-${candidate.id}">Confidence</label><select id="candidate-confidence-${candidate.id}" data-key="confidence">${(['low','medium','high'] as Confidence[]).map(value => `<option value="${value}" ${candidate.confidence === value ? 'selected' : ''}>${value[0].toUpperCase() + value.slice(1)}</option>`).join('')}</select></div></div><div class="field"><label for="candidate-notes-${candidate.id}">For / against <span class="optional">optional</span></label><textarea id="candidate-notes-${candidate.id}" data-key="notes" rows="2" placeholder="What supports or conflicts with this candidate?">${escapeHtml(candidate.notes)}</textarea></div>${draft.candidates.length > 1 ? `<button type="button" class="remove-candidate" data-remove-candidate="${candidate.id}">Remove candidate</button>` : ''}</fieldset>`).join('');
  document.querySelectorAll<HTMLElement>('[data-candidate] input, [data-candidate] select, [data-candidate] textarea').forEach(control => control.addEventListener('input', () => {
    const fieldset = control.closest<HTMLElement>('[data-candidate]')!;
    const candidate = draft.candidates.find(item => item.id === fieldset.dataset.candidate)!;
    const key = control.dataset.key as keyof Pick<Candidate,'name'|'confidence'|'notes'>;
    candidate[key] = (control as HTMLInputElement).value as never;
    draft.updatedAt = new Date().toISOString(); renderPreview(); scheduleSave();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-remove-candidate]').forEach(button => button.addEventListener('click', () => {
    draft.candidates = draft.candidates.filter(candidate => candidate.id !== button.dataset.removeCandidate); renderCandidates(); renderPreview(); scheduleSave();
  }));
}

function renderExactWarning() {
  const exact = draft.precision === 'exact';
  byId('exact-warning').hidden = !exact;
  if (!exact) { draft.exactAcknowledged = false; input('exact-ack').checked = false; }
}

function renderPreview() {
  const shared = sharedCoordinates(draft);
  const title = draft.title.trim() || 'Uncertain bird sighting';
  byId('preview-title').textContent = title;
  const candidates = draft.candidates.filter(candidate => candidate.name.trim());
  byId('preview-content').innerHTML = `<dl class="proof-facts"><div><dt>Observed</dt><dd>${escapeHtml(localDateTime(draft.observedAt))}</dd></div><div><dt>Place shared</dt><dd>${escapeHtml(draft.placeLabel || 'Not recorded')}</dd></div><div><dt>Coordinates</dt><dd>${shared ? `<span class="coordinates">${shared.latitude}, ${shared.longitude}</span>` : 'Withheld'}<small>${escapeHtml(precisionLabels[draft.precision])}</small></dd></div></dl>${draft.sensitive ? '<p class="sensitive-flag"><strong>Sensitive location</strong> Share only with trusted reviewers.</p>' : ''}<section class="preview-section"><h3>Field marks</h3><p>${draft.fieldMarks.length ? draft.fieldMarks.map(escapeHtml).join(' · ') : 'None recorded yet.'}</p><p>${escapeHtml(draft.fieldNotes || 'No observation notes yet.')}</p></section><section class="preview-section"><h3>Candidates</h3>${candidates.length ? `<ol>${candidates.map(candidate => `<li><strong>${escapeHtml(candidate.name)}</strong><span>${escapeHtml(candidate.confidence)} confidence</span>${candidate.notes ? `<small>${escapeHtml(candidate.notes)}</small>` : ''}</li>`).join('')}</ol>` : '<p>No candidates added yet.</p>'}</section><section class="preview-section"><h3>Evidence</h3><p>${draft.attachments.length ? draft.attachments.map(file => escapeHtml(file.name)).join(' · ') : 'No files attached yet.'}</p></section><p class="disclaimer">This packet supports review. It is not an authoritative identification.</p>`;
}

function renderDrafts() {
  const list = byId('draft-list');
  const ordered = [...drafts].sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
  if (!ordered.length) { list.innerHTML = '<div class="empty-state"><span aria-hidden="true">⌁</span><h3>No saved cards yet</h3><p>Your first locally saved field card will appear here.</p><a href="#builder" class="button secondary">Start above</a></div>'; return; }
  list.innerHTML = `<ul class="draft-list">${ordered.map(item => `<li ${item.id === draft.id ? 'class="active"' : ''}><div><span class="draft-pin" aria-hidden="true">⌖</span><div><strong>${escapeHtml(item.title || item.placeLabel || 'Untitled sighting')}</strong><span>${escapeHtml(localDateTime(item.observedAt))} · ${item.attachments.length} evidence file${item.attachments.length === 1 ? '' : 's'}</span><small>Edited ${escapeHtml(new Date(item.updatedAt).toLocaleString())}</small></div></div><div class="draft-actions"><button type="button" data-open="${item.id}">${item.id === draft.id ? 'Current' : 'Open'}</button><button type="button" class="danger-link" data-delete="${item.id}">Delete</button></div></li>`).join('')}</ul>`;
  list.querySelectorAll<HTMLButtonElement>('[data-open]').forEach(button => button.addEventListener('click', () => {
    const found = drafts.find(item => item.id === button.dataset.open); if (!found) return; draft = found; populateForm(); renderDrafts(); document.querySelector('#builder')?.scrollIntoView({ behavior: 'smooth' }); announce('Saved card opened.');
  }));
  list.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach(button => button.addEventListener('click', async () => {
    const found = drafts.find(item => item.id === button.dataset.delete); if (!found) return;
    if (!confirm(`Delete “${found.title || found.placeLabel || 'Untitled sighting'}” from this device? This cannot be undone unless you exported a copy.`)) return;
    await deleteDraft(found.id); drafts = await getDrafts(); if (draft.id === found.id) { draft = newDraft(); populateForm(); } renderDrafts(); announce('Saved card deleted.');
  }));
}

function showExportIssues() {
  updateFromForm();
  const issues = exportIssues(draft);
  const summary = byId('error-summary');
  if (!issues.length) { summary.hidden = true; return false; }
  summary.innerHTML = `<strong>Complete ${issues.length} item${issues.length === 1 ? '' : 's'} before export:</strong><ul>${issues.map(issue => `<li>${escapeHtml(issue)}</li>`).join('')}</ul>`;
  summary.hidden = false; summary.focus(); return true;
}

function download(blob: Blob, extension: string) {
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  const name = (draft.title || 'bird-sighting-proof-card').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  link.href = url; link.download = `${name || 'bird-sighting-proof-card'}.${extension}`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

byId<HTMLFormElement>('proof-form').addEventListener('input', event => {
  if ((event.target as HTMLElement).closest('[data-candidate]')) return;
  updateFromForm(); renderExactWarning();
});
byId<HTMLFormElement>('proof-form').addEventListener('change', event => {
  if ((event.target as HTMLInputElement).name === 'precision') { updateFromForm(); renderExactWarning(); renderPreview(); }
});
input('observed-at').addEventListener('input', () => { draft.timeSource = 'entered'; byId('time-hint').textContent = 'Entered by you. Check the local time zone before sharing.'; });

input('evidence-files').addEventListener('change', async event => {
  const files = [...((event.target as HTMLInputElement).files || [])]; const error = byId('file-error'); error.textContent = '';
  for (const file of files) {
    if (!/^(image\/(jpeg|png|webp)|audio\/(mpeg|mp4|wav|x-wav))$/.test(file.type)) { error.textContent = `${file.name} is not a supported photo or audio format.`; continue; }
    if (file.size > 25_000_000) { error.textContent = `${file.name} is over the 25 MB per-file limit.`; continue; }
    if (draft.attachments.length >= 10) { error.textContent = 'A card can hold up to 10 evidence files.'; break; }
    const extracted = await jpegCapturedAt(file).catch(() => undefined);
    const capturedAt = extracted || (file.lastModified ? new Date(file.lastModified).toISOString().slice(0,19) : undefined);
    draft.attachments.push({ id: crypto.randomUUID(), name: file.name, type: file.type, size: file.size, lastModified: file.lastModified, capturedAt, blob: file });
    if (!draft.observedAt && capturedAt) { draft.observedAt = capturedAt.slice(0,19); draft.timeSource = extracted ? 'photo metadata' : 'file date'; }
  }
  input('evidence-files').value = ''; populateForm(); scheduleSave(); announce(`${files.length} evidence file${files.length === 1 ? '' : 's'} processed.`);
});

byId('use-location').addEventListener('click', () => {
  const status = byId('geo-status');
  if (!navigator.geolocation) { status.textContent = 'This browser cannot provide a location. Enter coordinates manually.'; return; }
  status.textContent = 'Finding your location…';
  navigator.geolocation.getCurrentPosition(position => {
    draft.latitude = position.coords.latitude; draft.longitude = position.coords.longitude;
    input('latitude').value = draft.latitude.toFixed(6); input('longitude').value = draft.longitude.toFixed(6);
    status.textContent = `Location stored locally (accuracy about ${Math.round(position.coords.accuracy)} m). Exports still use your selected precision.`; renderPreview(); scheduleSave();
  }, error => { status.textContent = error.code === error.PERMISSION_DENIED ? 'Location permission was denied. Enter a broad place name or coordinates manually.' : 'Location was unavailable. Try again outdoors or enter it manually.'; }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
});

byId('add-candidate').addEventListener('click', () => { draft.candidates.push({ id: crypto.randomUUID(), name: '', confidence: 'low', notes: '' }); renderCandidates(); scheduleSave(); const fields = document.querySelectorAll<HTMLInputElement>('[data-candidate] input[data-key="name"]'); fields[fields.length - 1]?.focus(); });
byId('save-card').addEventListener('click', () => { updateFromForm(); void persist(true); });
byId('new-card').addEventListener('click', () => { if ((draft.title || draft.placeLabel || draft.attachments.length) && !confirm('Start a new card? Your current changes have been saved locally.')) return; void persist(false); draft = newDraft(); populateForm(); renderDrafts(); input('place-label').focus(); announce('New blank card started.'); });

byId('export-pdf').addEventListener('click', () => { if (showExportIssues()) return; download(pdfBlob(draft), 'pdf'); announce('PDF downloaded. Review it before sharing.'); });
byId('export-json').addEventListener('click', async () => { if (showExportIssues()) return; const button = byId<HTMLButtonElement>('export-json'); button.disabled = true; button.textContent = 'Packing media…'; try { download(await jsonBlob(draft), 'json'); announce('JSON and media export downloaded.'); } catch { announce('The JSON export could not be created. Try fewer or smaller files.'); } finally { button.disabled = false; button.textContent = 'Export JSON + media'; } });

input('import-file').addEventListener('change', async event => {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
  try { draft = await importedDraft(file); await saveDraft(draft); drafts = await getDrafts(); populateForm(); renderDrafts(); document.querySelector('#builder')?.scrollIntoView(); announce('Proof Card JSON imported as a new local draft.'); }
  catch (error) { announce(error instanceof Error ? error.message : 'The JSON file could not be imported.'); }
  input('import-file').value = '';
});

const storageDialog = byId<HTMLDialogElement>('storage-dialog');
byId('storage-help').addEventListener('click', () => storageDialog.showModal());
storageDialog.addEventListener('click', event => { if (event.target === storageDialog) storageDialog.close(); });

function updateConnection() {
  const online = navigator.onLine; byId('connection-label').textContent = online ? 'Ready offline' : 'Offline now'; document.querySelector('.status-dot')?.classList.toggle('offline', !online);
}
window.addEventListener('online', updateConnection); window.addEventListener('offline', updateConnection); updateConnection();

async function start() {
  try { drafts = await getDrafts(); if (drafts.length) draft = [...drafts].sort((a,b) => b.updatedAt.localeCompare(a.updatedAt))[0]; }
  catch { announce('Local storage is unavailable. You can still build a card and export it this session.'); }
  populateForm(); renderDrafts();
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.register('/sw.js');
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) byId('update-toast').hidden = false; });
    });
  }
}
byId('reload-app').addEventListener('click', () => location.reload());
void start();
