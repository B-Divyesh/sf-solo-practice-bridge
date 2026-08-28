import './style.css';
import { createPlan, FREE_ACTIVE_LIMIT, nextRevisit, SESSION_TARGET, sessionProgress, toCsv, validateImport } from './domain';
import { loadData, replaceData, savePlan, saveSession } from './db';
import { cachedLicense, captureLicenseFromUrl, checkoutUrl, clearLicense, isUnlocked, storeToken, verifyLicense } from './license';
import type { BridgeData, PracticePlan, PracticeSession } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;

let plans: PracticePlan[] = [];
let sessions: PracticeSession[] = [];
let loadError = '';
let timer: {
  plan: PracticePlan;
  phase: 'drill' | 'piece';
  remaining: number;
  elapsed: number;
  running: boolean;
  interval?: number;
} | undefined;

const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);
const formatDate = (value: string): string => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
const formatDateTime = (value: string): string => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const activePlans = (): PracticePlan[] => plans.filter((plan) => !plan.archived).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

function markup(): string {
  return `
    <header class="site-header">
      <nav class="shell nav" aria-label="Main navigation">
        <a class="brand" href="/" aria-label="Solo Practice Bridge, home"><span class="brand-mark" aria-hidden="true"></span><span>Solo Practice Bridge</span></a>
        <a href="#workspace">Practice</a>
        <a href="#history">History</a>
        <a href="#your-data">Your data</a>
        <span id="offline-flag" class="offline-flag" hidden>● Offline · changes stay here</span>
      </nav>
    </header>
    <main id="main">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow">A private practice workbook — no AI, no listening</p>
          <h1 id="hero-title">Make the drill meet the music.</h1>
          <p class="lede">Name one snag in a piece you care about. Build a short drill for it, alternate back into the piece, and keep the transfer you actually noticed.</p>
          <div class="actions">
            <button class="primary" type="button" data-action="new-plan">Build a practice bridge</button>
            <a href="#how" class="button">See the four-part loop</a>
          </div>
        </div>
        <div class="hero-visual">
          <img src="/assets/bridge-hero.webp" width="1440" height="960" alt="Two rehearsal cards on concrete slabs joined by a small patch of moss" fetchpriority="high" decoding="async" />
          <p class="image-note">A small bridge, not a new syllabus. You write every musical instruction.</p>
        </div>
      </section>

      <section id="workspace" class="workspace shell" aria-labelledby="workspace-title">
        <div class="section-heading">
          <div><p class="eyebrow">Your practice bench</p><h2 id="workspace-title">Current bridges</h2></div>
          <button class="primary" type="button" data-action="new-plan">+ Build another</button>
        </div>
        <div id="status-strip" class="status-strip"></div>
        <div id="workspace-content" aria-live="polite"></div>
      </section>

      <section id="history" class="history" aria-labelledby="history-title">
        <div class="shell">
          <div class="section-heading">
            <div><p class="eyebrow">Teacher-ready record</p><h2 id="history-title">What transferred</h2></div>
            <button type="button" data-action="print">Print history</button>
          </div>
          <div id="history-content"></div>
        </div>
      </section>

      <section id="how" class="ownership" aria-labelledby="ownership-title">
        <div class="shell ownership-grid">
          <div id="your-data">
            <p class="eyebrow">Local by default</p>
            <h2 id="ownership-title">Your notes stay yours.</h2>
            <p>Plans and reflections live in this browser’s private storage. There is no account, microphone access, analytics, or cloud sync. Export a backup whenever you like.</p>
            <div class="utility-row">
              <button type="button" data-action="export-json">Export backup</button>
              <button type="button" data-action="export-csv">Export CSV</button>
              <label class="button file-button" for="import-file">Import backup<input id="import-file" type="file" accept="application/json,.json" /></label>
            </div>
          </div>
          <aside id="unlock-panel" class="unlock-panel" aria-labelledby="unlock-title"></aside>
        </div>
      </section>
    </main>
    <footer class="site-footer">
      <div class="shell footer-grid">
        <p>Solo Practice Bridge is a planning and reflection tool, not a teacher or a pedagogical diagnosis. Generated editorial imagery is disclosed in the project’s design record.</p>
        <nav class="footer-links" aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav>
      </div>
    </footer>
    <dialog id="plan-dialog" aria-labelledby="plan-dialog-title">
      <div class="dialog-head"><div><h2 id="plan-dialog-title">Build one bridge</h2><p>Keep it modest: one piece, one observed obstacle, one loop.</p></div><button class="icon-button" type="button" data-close="plan-dialog" aria-label="Close plan form">×</button></div>
      <form id="plan-form" class="form-body">
        <div class="field"><label for="plan-piece">Piece or passage <span aria-hidden="true">*</span></label><input id="plan-piece" name="piece" maxlength="100" required autocomplete="off" /><p class="hint">Example: “Blue Bossa, bars 9–12” or “Chopin Op. 28 No. 4 ending”</p></div>
        <div class="field"><label for="plan-title">What do you want to become easier? <span aria-hidden="true">*</span></label><input id="plan-title" name="title" maxlength="140" required autocomplete="off" /></div>
        <div class="field"><label for="plan-obstacle">What do you observe getting in the way? <span aria-hidden="true">*</span></label><textarea id="plan-obstacle" name="obstacle" maxlength="400" required></textarea><p class="hint">Describe what you hear, feel, or see. This is an observation, not a diagnosis.</p></div>
        <div class="field"><label for="plan-drill">Your small drill <span aria-hidden="true">*</span></label><textarea id="plan-drill" name="drill" maxlength="400" required></textarea><p class="hint">Name the notes/shape, tempo, range, rhythm, or phrasing constraint you chose.</p></div>
        <div class="field"><label for="plan-cue">Success cue <span aria-hidden="true">*</span></label><input id="plan-cue" name="successCue" maxlength="180" required /><p class="hint">Something you can notice without a score: “three relaxed repeats at 72 bpm.”</p></div>
        <div class="field-pair">
          <div class="field"><label for="drill-minutes">Drill minutes</label><input id="drill-minutes" name="drillMinutes" type="number" min="1" max="30" value="3" required inputmode="numeric" /></div>
          <div class="field"><label for="piece-minutes">Return-to-piece minutes</label><input id="piece-minutes" name="pieceMinutes" type="number" min="1" max="30" value="4" required inputmode="numeric" /></div>
        </div>
        <p id="plan-error" class="form-error" role="alert"></p>
        <div class="form-actions"><button type="button" class="quiet" data-close="plan-dialog">Cancel</button><button type="submit" class="primary">Save this bridge</button></div>
      </form>
    </dialog>
    <dialog id="timer-dialog" aria-labelledby="timer-title">
      <div class="dialog-head"><div><h2 id="timer-title">Practice loop</h2><p id="timer-piece"></p></div><button class="icon-button" type="button" data-close="timer-dialog" aria-label="Close timer">×</button></div>
      <div id="timer-content"></div>
    </dialog>
    <dialog id="license-dialog" aria-labelledby="license-dialog-title">
      <div class="dialog-head"><div><h2 id="license-dialog-title">Studio unlock</h2><p>Keep more than one bridge active at a time.</p></div><button class="icon-button" type="button" data-close="license-dialog" aria-label="Close unlock details">×</button></div>
      <div class="form-body"><p>Your free bridge and all its sessions remain available. Archive it to start another, or unlock unlimited active bridges for a one-time <strong>$12 purchase</strong>.</p><a class="button primary" href="${checkoutUrl}">Buy Studio unlock — $12 once</a><button type="button" class="quiet" data-close="license-dialog">Keep using free</button></div>
    </dialog>
    <div id="live-region" class="visually-hidden" aria-live="polite" aria-atomic="true"></div>
    <div id="toast" class="toast" hidden></div>`;
}

function statusMarkup(): string {
  const active = activePlans();
  const completed = sessions.length;
  const due = active.filter((plan) => nextRevisit(plan) === new Date().toISOString().slice(0, 10)).length;
  return `
    <div><span class="status-label">Active bridges</span><span class="status-value">${active.length}${isUnlocked() ? ' · unlimited' : ' / 1 free'}</span></div>
    <div><span class="status-label">Sessions recorded</span><span class="status-value">${completed} / ${SESSION_TARGET} first target</span></div>
    <div><span class="status-label">Due today</span><span class="status-value">${due || 'None'}</span></div>`;
}

function planMarkup(plan: PracticePlan): string {
  const count = sessionProgress(sessions, plan.id);
  const progress = Math.min(100, (count / SESSION_TARGET) * 100);
  return `
    <article class="plan-card" data-plan-id="${plan.id}">
      <div class="plan-head">
        <div><span class="step-label">Piece / passage</span><h3>${escapeHtml(plan.piece)}</h3><p>${escapeHtml(plan.title)}</p></div>
        <div class="plan-tools"><span class="badge">Next · ${formatDate(nextRevisit(plan) ?? plan.createdAt)}</span><button class="icon-button" type="button" data-action="archive" data-id="${plan.id}" aria-label="Archive ${escapeHtml(plan.piece)}">×</button></div>
      </div>
      <div class="bridge-grid">
        <div class="bridge-side">
          <div class="step"><span class="step-label">01 · Observed obstacle</span><p class="step-text">${escapeHtml(plan.obstacle)}</p></div>
          <div class="step"><span class="step-label">02 · Drill for ${plan.drillMinutes} min</span><p class="step-text">${escapeHtml(plan.drill)}</p></div>
        </div>
        <div class="bridge-joint"><span class="bridge-arrow" aria-hidden="true">→</span><span class="visually-hidden">Then return to the piece</span></div>
        <div class="bridge-side">
          <div class="step"><span class="step-label">03 · Return for ${plan.pieceMinutes} min</span><p class="step-text">Play the same passage in context. Keep the drill’s single idea in view.</p></div>
          <div class="step"><span class="step-label">04 · Success cue</span><p class="step-text">${escapeHtml(plan.successCue)}</p></div>
          <ul class="revisits" aria-label="Planned revisit dates">${plan.revisitDates.map((date) => `<li>${formatDate(date)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="practice-bar">
        <div class="progress-wrap"><div class="progress-copy"><span>${count} sessions logged</span><span>${Math.min(count, SESSION_TARGET)} / ${SESSION_TARGET}</span></div><div class="progress-track" role="progressbar" aria-label="Sessions toward first target" aria-valuemin="0" aria-valuemax="8" aria-valuenow="${Math.min(count, SESSION_TARGET)}"><span class="progress-fill" style="width:${progress}%"></span></div></div>
        <button class="primary" type="button" data-action="practice" data-id="${plan.id}">Start ${plan.drillMinutes + plan.pieceMinutes} min loop</button>
      </div>
    </article>`;
}

function renderWorkspace(): void {
  const strip = document.querySelector('#status-strip');
  const content = document.querySelector('#workspace-content');
  if (!strip || !content) return;
  strip.innerHTML = statusMarkup();
  if (loadError) {
    content.innerHTML = `<div class="empty-state"><div class="empty-copy"><p class="eyebrow">Storage unavailable</p><h3>Your records could not be opened.</h3><p>${escapeHtml(loadError)} Check this browser’s site-storage settings, then reload. Nothing was sent elsewhere.</p><button type="button" data-action="reload">Reload the workbook</button></div></div>`;
    return;
  }
  const active = activePlans();
  content.innerHTML = active.length ? `<div class="plan-list">${active.map(planMarkup).join('')}</div>` : `
    <div class="empty-state"><div class="empty-copy"><p class="eyebrow">Start with something real</p><h3>No bridge on the bench yet.</h3><p>Choose a passage you already want to play. You’ll write one observed obstacle, one small drill, and a cue that tells you when it is transferring.</p><button class="primary" type="button" data-action="new-plan">Build your first bridge</button></div><div class="bridge-sketch" aria-hidden="true"><div class="sketch-line"><span class="sketch-moss"></span></div></div></div>`;
}

function renderHistory(): void {
  const content = document.querySelector('#history-content');
  if (!content) return;
  const ordered = [...sessions].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  if (!ordered.length) {
    content.innerHTML = `<p class="empty-history">No transfer notes yet. Complete a drill-to-piece loop and record what changed—even “nothing yet” is useful.</p>`;
    return;
  }
  content.innerHTML = `<ol class="history-list">${ordered.map((session) => {
    const plan = plans.find((item) => item.id === session.planId);
    const label = session.cueMet === 'yes' ? 'Cue met' : session.cueMet === 'almost' ? 'Almost' : 'Not yet';
    return `<li class="history-item"><time class="history-date" datetime="${session.completedAt}">${formatDateTime(session.completedAt)}</time><div><div class="history-piece">${escapeHtml(plan?.piece ?? 'Archived piece')}</div><span class="badge">${label}</span></div><p class="history-note">${escapeHtml(session.transferNote)}</p></li>`;
  }).join('')}</ol>`;
}

function renderUnlock(): void {
  const panel = document.querySelector('#unlock-panel');
  if (!panel) return;
  const state = cachedLicense();
  if (isUnlocked()) {
    panel.innerHTML = `<p class="eyebrow">Studio unlocked</p><h3 id="unlock-title">Unlimited active bridges</h3><p>Your cached license is active. The free experience and your local data never depend on this check.</p><button type="button" data-action="remove-license" class="quiet">Remove license from this device</button>`;
    return;
  }
  panel.innerHTML = `<p class="eyebrow">Optional one-time unlock</p><h3 id="unlock-title">Keep several pieces in motion.</h3><p>Free includes one active bridge, unlimited sessions, printing, and all exports. Studio adds unlimited active bridges.</p><p class="price">$12 · once</p>${state && !state.valid && state.checkedAt > 0 ? '<p class="form-error">This license is no longer active. Your records are safe.</p>' : ''}<a class="button primary" href="${checkoutUrl}">Buy Studio unlock</a><form id="restore-form" class="restore-form"><label for="license-token">Have a license?</label><div class="field-inline"><input id="license-token" name="license" autocomplete="off" required aria-describedby="license-hint" /><button type="submit">Verify license</button></div><p id="license-hint" class="hint">Paste the token from your receipt. Verification uses Sociobot’s billing service.</p><p id="license-error" class="form-error" role="alert"></p></form>`;
}

function renderAll(): void {
  renderWorkspace();
  renderHistory();
  renderUnlock();
}

function announce(message: string): void {
  const region = document.querySelector('#live-region');
  if (region) region.textContent = message;
}

function showToast(html: string, duration = 5000): void {
  const toast = document.querySelector<HTMLElement>('#toast');
  if (!toast) return;
  toast.innerHTML = html;
  toast.hidden = false;
  if (duration) window.setTimeout(() => { toast.hidden = true; }, duration);
}

function openDialog(id: string): void {
  document.querySelector<HTMLDialogElement>(`#${id}`)?.showModal();
}

function closeDialog(id: string): void {
  const dialog = document.querySelector<HTMLDialogElement>(`#${id}`);
  if (dialog?.open) dialog.close();
  if (id === 'timer-dialog') stopTimer();
}

function openNewPlan(): void {
  if (!isUnlocked() && activePlans().length >= FREE_ACTIVE_LIMIT) {
    openDialog('license-dialog');
    return;
  }
  const form = document.querySelector<HTMLFormElement>('#plan-form');
  form?.reset();
  const error = document.querySelector('#plan-error');
  if (error) error.textContent = '';
  openDialog('plan-dialog');
}

async function submitPlan(form: HTMLFormElement): Promise<void> {
  const data = new FormData(form);
  const error = document.querySelector('#plan-error');
  try {
    const plan = createPlan({
      piece: String(data.get('piece') ?? '').trim(),
      title: String(data.get('title') ?? '').trim(),
      obstacle: String(data.get('obstacle') ?? '').trim(),
      drill: String(data.get('drill') ?? '').trim(),
      successCue: String(data.get('successCue') ?? '').trim(),
      drillMinutes: Number(data.get('drillMinutes')),
      pieceMinutes: Number(data.get('pieceMinutes'))
    });
    if (![plan.piece, plan.title, plan.obstacle, plan.drill, plan.successCue].every(Boolean)) throw new Error('Complete every musical field before saving.');
    if (![plan.drillMinutes, plan.pieceMinutes].every((value) => Number.isFinite(value) && value >= 1 && value <= 30)) throw new Error('Choose between 1 and 30 minutes for each part.');
    await savePlan(plan);
    plans.push(plan);
    renderAll();
    closeDialog('plan-dialog');
    document.querySelector(`[data-plan-id="${plan.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    announce(`Practice bridge for ${plan.piece} saved.`);
  } catch (cause) {
    if (error) error.textContent = cause instanceof Error ? cause.message : 'The bridge could not be saved. Try again.';
  }
}

async function archivePlan(id: string): Promise<void> {
  const plan = plans.find((item) => item.id === id);
  if (!plan || !window.confirm(`Archive “${plan.piece}”? Its session history will stay in your record.`)) return;
  plan.archived = true;
  plan.updatedAt = new Date().toISOString();
  await savePlan(plan);
  renderAll();
  showToast(`Archived <strong>${escapeHtml(plan.piece)}</strong>.<br><button type="button" data-action="undo-archive" data-id="${plan.id}">Undo archive</button>`, 8000);
  announce(`${plan.piece} archived. You can undo this action.`);
}

async function undoArchive(id: string): Promise<void> {
  const plan = plans.find((item) => item.id === id);
  if (!plan) return;
  plan.archived = false;
  plan.updatedAt = new Date().toISOString();
  await savePlan(plan);
  renderAll();
  const toast = document.querySelector<HTMLElement>('#toast');
  if (toast) toast.hidden = true;
  announce(`${plan.piece} restored.`);
}

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
}

function renderTimer(showReflection = false): void {
  if (!timer) return;
  const content = document.querySelector('#timer-content');
  const piece = document.querySelector('#timer-piece');
  if (!content || !piece) return;
  piece.textContent = timer.plan.piece;
  if (showReflection) {
    content.innerHTML = `<form id="reflection-form" class="reflection">
      <div><p class="eyebrow">Close the loop</p><h3>What transferred back into the piece?</h3></div>
      <div class="field"><label for="transfer-note">Your observation <span aria-hidden="true">*</span></label><textarea id="transfer-note" name="transferNote" required maxlength="500" placeholder="Example: The shift felt lighter twice, but tightened again at full tempo."></textarea><p class="hint">“Nothing yet” is a valid observation. Keep it concrete for your future self or teacher.</p></div>
      <fieldset><legend class="legend">Did you notice your success cue?</legend><div class="choice-group"><label><input type="radio" name="cueMet" value="yes" required />Yes</label><label><input type="radio" name="cueMet" value="almost" />Almost</label><label><input type="radio" name="cueMet" value="not-yet" />Not yet</label></div></fieldset>
      <p id="reflection-error" class="form-error" role="alert"></p><div class="form-actions"><button type="button" class="quiet" data-close="timer-dialog">Discard this session</button><button type="submit" class="primary">Record transfer note</button></div>
    </form>`;
    document.querySelector<HTMLTextAreaElement>('#transfer-note')?.focus();
    return;
  }
  const instruction = timer.phase === 'drill' ? timer.plan.drill : `Return to ${timer.plan.piece}. Keep this cue in view: ${timer.plan.successCue}`;
  content.innerHTML = `<div class="timer-panel"><p class="timer-phase">${timer.phase === 'drill' ? 'Drill first' : 'Now return to the piece'}</p><div class="timer-clock" role="timer" aria-label="${timer.remaining} seconds remaining">${formatClock(timer.remaining)}</div><p class="timer-instruction">${escapeHtml(instruction)}</p><div class="timer-controls"><button class="primary" type="button" data-action="timer-toggle">${timer.running ? 'Pause' : timer.elapsed ? 'Resume' : 'Start timer'}</button><button type="button" data-action="timer-next">${timer.phase === 'drill' ? 'Move to piece' : 'Finish and reflect'}</button></div></div>`;
}

function openTimer(id: string): void {
  const plan = plans.find((item) => item.id === id);
  if (!plan) return;
  stopTimer();
  timer = { plan, phase: 'drill', remaining: plan.drillMinutes * 60, elapsed: 0, running: false };
  renderTimer();
  openDialog('timer-dialog');
}

function tick(): void {
  if (!timer?.running) return;
  timer.remaining -= 1;
  timer.elapsed += 1;
  if (timer.remaining <= 0) advanceTimer();
  else renderTimer();
}

function toggleTimer(): void {
  if (!timer) return;
  timer.running = !timer.running;
  if (timer.running && !timer.interval) timer.interval = window.setInterval(tick, 1000);
  renderTimer();
}

function advanceTimer(): void {
  if (!timer) return;
  if (timer.phase === 'drill') {
    timer.phase = 'piece';
    timer.remaining = timer.plan.pieceMinutes * 60;
    timer.running = false;
    announce(`Drill interval complete. Return to ${timer.plan.piece}.`);
    renderTimer();
  } else {
    timer.running = false;
    if (timer.interval) window.clearInterval(timer.interval);
    timer.interval = undefined;
    renderTimer(true);
  }
}

function stopTimer(): void {
  if (timer?.interval) window.clearInterval(timer.interval);
  if (timer) timer.running = false;
}

async function submitReflection(form: HTMLFormElement): Promise<void> {
  if (!timer) return;
  const data = new FormData(form);
  const transferNote = String(data.get('transferNote') ?? '').trim();
  const cueMet = String(data.get('cueMet') ?? '') as PracticeSession['cueMet'];
  const error = document.querySelector('#reflection-error');
  if (!transferNote || !['yes', 'almost', 'not-yet'].includes(cueMet)) {
    if (error) error.textContent = 'Write one observation and choose how the success cue felt.';
    return;
  }
  try {
    const session: PracticeSession = { id: crypto.randomUUID(), planId: timer.plan.id, completedAt: new Date().toISOString(), transferNote, cueMet, durationSeconds: timer.elapsed };
    await saveSession(session);
    sessions.push(session);
    closeDialog('timer-dialog');
    renderAll();
    document.querySelector('#history')?.scrollIntoView({ behavior: 'smooth' });
    announce('Transfer note recorded in your history.');
  } catch (cause) {
    if (error) error.textContent = cause instanceof Error ? cause.message : 'This session could not be saved.';
  }
}

function download(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportJson(): void {
  const data: BridgeData = { version: 1, exportedAt: new Date().toISOString(), plans, sessions };
  download(`solo-practice-bridge-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json');
  announce('JSON backup exported.');
}

async function importFile(file: File): Promise<void> {
  try {
    const imported = validateImport(JSON.parse(await file.text()));
    if (!window.confirm(`Replace this browser’s records with ${imported.plans.length} plans and ${imported.sessions.length} sessions from the backup? Export first if you need the current records.`)) return;
    await replaceData(imported);
    plans = imported.plans;
    sessions = imported.sessions;
    renderAll();
    announce('Backup imported. Your previous browser records were replaced.');
  } catch (cause) {
    showToast(`<strong>Import did not work.</strong><br>${escapeHtml(cause instanceof Error ? cause.message : 'Choose a Solo Practice Bridge JSON backup.')}`);
  }
}

async function restoreLicense(form: HTMLFormElement): Promise<void> {
  const token = String(new FormData(form).get('license') ?? '').trim();
  const error = document.querySelector('#license-error');
  if (!token) return;
  storeToken(token);
  if (error) error.textContent = 'Checking…';
  try {
    const state = await verifyLicense(true);
    if (!state?.valid) throw new Error('That license is not active for Solo Practice Bridge. Check the token and try again.');
    renderAll();
    announce('Studio unlock restored on this device.');
  } catch (cause) {
    if (error) error.textContent = cause instanceof Error ? cause.message : 'The license could not be checked.';
  }
}

function bindEvents(): void {
  document.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action], [data-close]');
    if (!target) return;
    const close = target.dataset.close;
    if (close) return closeDialog(close);
    const action = target.dataset.action;
    const id = target.dataset.id ?? '';
    if (action === 'new-plan') openNewPlan();
    else if (action === 'practice') openTimer(id);
    else if (action === 'archive') void archivePlan(id);
    else if (action === 'undo-archive') void undoArchive(id);
    else if (action === 'timer-toggle') toggleTimer();
    else if (action === 'timer-next') advanceTimer();
    else if (action === 'print') window.print();
    else if (action === 'export-json') exportJson();
    else if (action === 'export-csv') download(`solo-practice-history-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(plans, sessions), 'text/csv');
    else if (action === 'reload') window.location.reload();
    else if (action === 'remove-license') { if (window.confirm('Remove the Studio license from this device? Your practice records will not be changed.')) { clearLicense(); renderAll(); } }
  });
  document.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (form.id === 'plan-form') void submitPlan(form);
    else if (form.id === 'reflection-form') void submitReflection(form);
    else if (form.id === 'restore-form') void restoreLicense(form);
  });
  document.addEventListener('change', (event) => {
    const input = event.target as HTMLInputElement;
    if (input.id === 'import-file' && input.files?.[0]) void importFile(input.files[0]);
  });
  document.querySelectorAll<HTMLDialogElement>('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(dialog.id); });
  });
}

function setNetworkStatus(): void {
  const flag = document.querySelector<HTMLElement>('#offline-flag');
  if (!flag) return;
  flag.hidden = navigator.onLine;
  if (!navigator.onLine) announce('You are offline. Existing plans and new practice notes still work on this device.');
}

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.register('/sw.js');
  if (registration.waiting) showUpdate(registration);
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(registration); });
  });
}

function showUpdate(registration: ServiceWorkerRegistration): void {
  showToast('<strong>An update is ready.</strong><br>Your local notes are safe.<br><button type="button" id="apply-update">Update now</button>', 0);
  document.querySelector('#apply-update')?.addEventListener('click', () => registration.waiting?.postMessage({ type: 'SKIP_WAITING' }));
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
}

async function init(): Promise<void> {
  captureLicenseFromUrl();
  app.innerHTML = markup();
  bindEvents();
  setNetworkStatus();
  window.addEventListener('online', setNetworkStatus);
  window.addEventListener('offline', setNetworkStatus);
  try {
    ({ plans, sessions } = await loadData());
  } catch (cause) {
    loadError = cause instanceof Error ? cause.message : 'Local storage is unavailable.';
  }
  renderAll();
  void verifyLicense().then(() => renderAll()).catch(() => { /* cached access and free practice stay available */ });
  void registerServiceWorker().catch(() => { /* PWA install is an enhancement */ });
}

void init();
