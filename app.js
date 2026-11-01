const DOCUMENT_ITEMS = [
  'GPA / academic minimum', 'Language tests and English-medium degree', 'Transcripts', 'Diploma / expected graduation',
  'Thesis / writing sample', 'Research proposal / study plan', 'Contact with an advisor', 'Personal statement',
  'Recommendation letters', 'CV / résumé', 'Passport or ID', 'Application fee', 'Translations of documents',
  'Authentication / apostille / legalization', 'Other requirements'
];

const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

function safeURL(value) {
  if (!value) return '';
  try {
    const parsed = new URL(value, window.location.href);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
  } catch { return ''; }
}

function externalLink(label, href) {
  const safe = safeURL(href);
  return safe ? `<a href="${escapeHTML(safe)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)} ↗</a>` : '';
}

function imageCreditMarkup(program) {
  const credit = program.imageCredit || 'Image source not recorded';
  const source = program.imageSourceUrl || program.imageCreditLink;
  const creditLink = source ? externalLink(credit, source) : escapeHTML(credit);
  const licenseLink = program.imageLicenseUrl ? externalLink(program.imageLicenseLabel || 'License', program.imageLicenseUrl) : '';
  return [creditLink, licenseLink].filter(Boolean).join(' · ');
}

function fundingBadge(program) {
  const name = String(program.fundingBadge || 'Funding details pending').toLowerCase();
  if (name.includes('full')) return '<span class="funding-badge funding-full">FULL PACKAGE</span>';
  if (name.includes('part')) return '<span class="funding-badge funding-partial">PARTLY FUNDED</span>';
  return '<span class="funding-badge funding-unknown">Funding details pending</span>';
}

function programSummary(program) {
  return program.description || program.sourceNote || 'Programme details are not stated.';
}

function cardTemplate(program) {
  const image = safeURL(program.image);
  const creditMarkup = imageCreditMarkup(program);
  const location = [program.city, program.country].filter(Boolean).join(', ') || 'Location not stated';
  return `<article class="program-card" data-id="${escapeHTML(program.id)}">
    <div class="card-image-wrap">${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(program.imageAlt || `${program.university} campus`)}" loading="lazy">` : `<div class="image-placeholder" role="img" aria-label="University image not yet available">University image not yet available</div>`}<span class="image-credit">${creditMarkup}</span></div>
    <div class="card-body"><div class="card-meta"><span class="card-region">${escapeHTML(program.region)}</span></div>
      <h3>${escapeHTML(program.program)}</h3><p class="card-university">${escapeHTML(program.university)}</p>
      <div>${fundingBadge(program)}</div><p class="card-summary">${escapeHTML(programSummary(program))}</p>
      <div class="card-footer"><span class="card-location">${escapeHTML(location)}</span><button class="open-profile" type="button" data-open-profile="${escapeHTML(program.id)}">Open profile ↗</button></div>
      <p class="verify-line">Official source pages checked ${escapeHTML(program.lastChecked || 'date not recorded')}. Confirm the latest application cycle with the linked pages.</p></div>
  </article>`;
}

function renderDirectories(programs) {
  document.querySelectorAll('[data-program-grid]').forEach(grid => {
    const region = grid.dataset.programGrid;
    const entries = programs.filter(program => program.region === region);
    grid.innerHTML = entries.length ? entries.map(cardTemplate).join('') : '<p class="not-found">No candidates in this region.</p>';
  });
}

function tableText(program, key, defaultValue = 'Not stated') {
  const value = program[key];
  return value === null || value === undefined || value === '' ? defaultValue : value;
}

function renderTable(programs) {
  const query = document.getElementById('program-search').value.trim().toLowerCase();
  const region = document.getElementById('region-filter').value;
  const filtered = programs.filter(program => {
    const text = `${program.university} ${program.program} ${program.city} ${program.country}`.toLowerCase();
    return (!query || text.includes(query)) && (region === 'all' || program.region === region);
  });
  document.getElementById('comparison-body').innerHTML = filtered.map(program => {
    const href = safeURL(program.programUrl);
    const name = href ? `<a class="row-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(program.program)}</a>` : `<span class="row-link">${escapeHTML(program.program)}</span>`;
    const localSupport = program.funding?.localSupportSnapshot || program.funding?.stipend || 'Not stated';
    return `<tr><td>${name}<span class="row-school">${escapeHTML(program.university)}</span></td>
      <td>${escapeHTML(program.region)}</td><td>${escapeHTML(tableText(program, 'degree'))}</td>
      <td>${fundingBadge(program)}</td><td>${escapeHTML(localSupport)}<small class="table-subvalue">${escapeHTML(tableText(program, 'stipendNtwd', 'Not stated'))}</small></td>
      <td>${escapeHTML(tableText(program, 'applicationFeeLocal', tableText(program, 'applicationFee', 'Not stated')))}<small class="table-subvalue">${escapeHTML(tableText(program, 'applicationFeeNTD', 'Not stated'))}</small></td><td>${escapeHTML(tableText(program, 'greGmat', 'Not stated'))}</td>
      <td>${escapeHTML(tableText(program, 'applicationDeadline', 'Not stated'))}</td></tr>`;
  }).join('') || '<tr><td colspan="8">No programmes match those filters.</td></tr>';
}

function renderRanking(programs) {
  const ordered = programs.filter(program => Number.isFinite(program.score) && program.rankingEligible !== false)
    .sort((a, b) => (a.rank || 99) - (b.rank || 99)).slice(0, 10);
  const container = document.getElementById('tier-list');
  if (!ordered.length) return;
  const tiers = [
    {name:'Tier S · strongest options', entries:ordered.slice(0, 3)},
    {name:'Tier A · strong candidates', entries:ordered.slice(3, 7)},
    {name:'Tier B · further comparison', entries:ordered.slice(7, 10)}
  ];
  container.innerHTML = tiers.map(tier => {
    const entries = tier.entries;
    if (!entries.length) return '';
    return `<h3 class="tier-label">${escapeHTML(tier.name)}</h3>${entries.map(program => {
      const rank = program.rank || ordered.indexOf(program) + 1;
      const url = safeURL(program.programUrl);
      const image = safeURL(program.image);
      const universityUrl = safeURL(program.universityUrl);
      const imageMarkup = image ? `<img class="rank-image" src="${escapeHTML(image)}" alt="${escapeHTML(program.imageAlt || `${program.university} campus`)}" loading="lazy">` : '<div class="rank-image rank-image-fallback" aria-hidden="true">IBSC</div>';
      const links = `${url ? externalLink('Programme page', url) : ''}${universityUrl ? ` ${externalLink('University website', universityUrl)}` : ''}`;
      const breakdown = program.scoreBreakdown || {};
      const scoreDetails = `Funding ${breakdown.financial ?? 0}/40 · Fit ${breakdown.course_and_field_fit ?? 0}/25 · English ${breakdown.english_medium_points_out_of_10 ?? 0}/10 · Readiness ${breakdown.application_readiness_out_of_25 ?? 0}/25`;
      const scoreBasisNote = program.scoreCashBasisNote ? `<p class="rank-score-source-note">${escapeHTML(program.scoreCashBasisNote)}</p>` : '';
      return `<article class="rank-card"><div class="rank-no">#${String(rank).padStart(2,'0')}</div>${imageMarkup}<div class="rank-content"><div class="card-meta">${fundingBadge(program)}</div><h3>${escapeHTML(program.program)}</h3><p>${escapeHTML(program.university)} · ${escapeHTML(program.city || '')}, ${escapeHTML(program.country || '')}</p><p>${escapeHTML(program.rankingSummary || program.description || '')}</p><p class="rank-score-breakdown">${escapeHTML(scoreDetails)}</p>${scoreBasisNote}<div class="rank-links">${links}</div></div><div class="rank-score"><strong>${escapeHTML(program.score)}</strong><span>out of 100</span></div></article>`;
    }).join('')}`;
  }).join('');
  const rankedIds = new Set(ordered.map(program => program.id));
  const excluded = programs.filter(program => !rankedIds.has(program.id));
  if (excluded.length) document.getElementById('not-ranked-list').innerHTML = excluded.map(program => `<article><strong>${escapeHTML(program.university)} — ${escapeHTML(program.program)}</strong><p>${escapeHTML(program.rankReason || 'See the profile for programme details and linked sources.')}</p></article>`).join('');
  const scoreParts = program => program.scoreBreakdown || {};
  const fundingWinner = [...ordered].sort((a, b) => Number(scoreParts(b).financial || 0) - Number(scoreParts(a).financial || 0) || Number(b.score || 0) - Number(a.score || 0))[0];
  const educationWinner = [...ordered].sort((a, b) => (Number(scoreParts(b).course_and_field_fit || 0) + Number(scoreParts(b).english_medium_points_out_of_10 || 0)) - (Number(scoreParts(a).course_and_field_fit || 0) + Number(scoreParts(a).english_medium_points_out_of_10 || 0)) || Number(b.score || 0) - Number(a.score || 0))[0];
  if (fundingWinner) {
    document.getElementById('best-funding').textContent = fundingWinner.program;
    const copy = document.getElementById('best-funding-copy');
    if (copy) copy.textContent = `Highest financial subscore among the Top 10 (${fundingWinner.scoreBreakdown.financial}/40), based on tuition, source-backed living support and funded duration.`;
  }
  if (educationWinner) {
    document.getElementById('best-education').textContent = educationWinner.program;
    const copy = document.getElementById('best-education-copy');
    if (copy) copy.textContent = `Highest course/field fit plus English-medium score among the Top 10 (${educationWinner.scoreBreakdown.course_and_field_fit + educationWinner.scoreBreakdown.english_medium_points_out_of_10}/35).`;
  }
}

function checklistFor(program) {
  const byName = new Map((program.requirements || []).map(item => [String(item.item || '').toLowerCase(), item]));
  return DOCUMENT_ITEMS.map(name => {
    const normalized = name.toLowerCase();
    const item = (program.requirements || []).find(entry => normalized.includes(String(entry.item || '').toLowerCase()) || String(entry.item || '').toLowerCase().includes(normalized.split(' / ')[0]));
    return {item: name, status: item?.status || 'Not stated', details: item?.details || 'Not stated on the official pages reviewed.'};
  });
}

function sourceLinks(program) {
  const sources = Array.isArray(program.officialSources) ? program.officialSources : [];
  return sources.filter(source => safeURL(source.url)).map(source => `<li>${externalLink(source.label || 'Official source', source.url)}</li>`).join('') || '<li>No official links recorded yet.</li>';
}

function screenshotPanel(program) {
  const shots = Array.isArray(program.officialScreenshots) ? program.officialScreenshots : [];
  const funding = shots.find(shot => /fund/i.test(shot.kind || ''));
  const requirements = shots.find(shot => /require/i.test(shot.kind || ''));
  const format = (shot, title) => shot?.path
    ? `<figure><img src="${escapeHTML(shot.path)}" alt="${escapeHTML(shot.alt || title)}"><figcaption>${escapeHTML(title)} · captured ${escapeHTML(shot.capturedAt || 'date not recorded')} · ${externalLink(shot.pageTitle || 'Open official page', shot.sourceUrl)}</figcaption></figure>`
    : `<p><strong>${title}:</strong> No screenshot file is attached to this source yet.</p>`;
  return `${format(funding, 'Funding source screenshot')}${format(requirements, 'Requirements screenshot')}`;
}

function profileHTML(program) {
  const image = safeURL(program.image);
  const loc = [program.city, program.country].filter(Boolean).join(', ');
  const fund = program.funding || {};
  const checklist = checklistFor(program);
  const courseMarkup = (program.courses || []).length ? `<ul>${program.courses.map(course => `<li>${escapeHTML(course.title || course)}${course.url ? ` — ${externalLink('source', course.url)}` : ''}</li>`).join('')}</ul>` : '<p>Related course titles and links are not stated in the profile data.</p>';
  const displayLabels = {'GPA / academic minimum':'Minimum GPA','Language tests and English-medium degree':'Language test / English-medium degree waiver','Diploma / expected graduation':'Diploma / expected-graduation letter','Contact with an advisor':'Advisor contact','CV / résumé':'CV / resume'};
  const items = checklist.map(item => `<article class="detail-row"><strong>${escapeHTML(displayLabels[item.item] || item.item)}</strong><span class="check-status">${escapeHTML(item.status)}</span><p>${escapeHTML(item.details)}</p></article>`).join('');
  const sources = sourceLinks(program);
  const desc = program.description || program.sourceNote || 'Description awaiting official-source review.';
  const appDeadline = tableText(program, 'applicationDeadline');
  const awardDeadline = tableText(program, 'scholarshipDeadline');
  const localStipend = fund.localSupportSnapshot || fund.monthlyLocal || fund.stipendLocal || fund.stipend || 'Not stated';
  const ntdStipend = fund.ntdSupportSnapshot || fund.monthlyStipendNTD || program.stipendNtwd || 'NT$ equivalent not stated';
  const isTwdSupport = /^(NT\$|TWD\b|NTD\b)/i.test(String(localStipend).trim());
  const stipendSummary = fund.snapshotStipend || (isTwdSupport ? localStipend : `${localStipend} · ${ntdStipend}`);
  const stipendNote = fund.snapshotNote || '';
  const showNTD = value => !value || /not calculated/i.test(String(value)) ? 'Not stated yet' : String(value);
  const localFee = program.applicationFeeLocal || program.applicationFee || 'Not stated';
  const ntdFee = showNTD(program.applicationFeeNTD);
  const universityLink = externalLink('Official university website', program.universityUrl);
  const programLink = externalLink('Official programme page', program.programUrl);
  const imageCredit = imageCreditMarkup(program);
  return `<div class="dialog-head">${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(program.imageAlt || program.university)}">` : ''}<div><h2 id="dialog-title">${escapeHTML(program.program)}</h2><p>${escapeHTML(program.university)} · ${escapeHTML(loc)}</p>${imageCredit ? `<p class="small-note">Image credit: ${imageCredit}</p>` : ''}<div class="profile-links">${programLink}${universityLink}</div></div></div>
    <section class="dialog-section profile-quick-funding"><h3>Funding Details</h3><div class="quick-funding-badge">${fundingBadge(program)}</div><div class="fact-grid quick-fact-grid"><div class="fact-item quick-stipend"><span>Stipend / living support</span><strong>${escapeHTML(stipendSummary)}</strong>${stipendNote ? `<small class="quick-stipend-note">${escapeHTML(stipendNote)}</small>` : ''}</div><div class="fact-item"><span>Application Fee</span><strong>${escapeHTML(localFee)}</strong></div><div class="fact-item"><span>Application Fee (NT$)</span><strong>${escapeHTML(ntdFee)}</strong></div><div class="fact-item"><span>GRE / GMAT</span><strong>${escapeHTML(program.greGmat || 'Not stated')}</strong></div><div class="fact-item quick-deadline"><span>Application Deadline</span><strong>${escapeHTML(appDeadline)}</strong></div></div><p class="small-note">NT$ equivalents are approximate, using indicative ECB/CBC cross-rates dated 30 October 2026. Annual and one-time awards show their totals, not assumed monthly payments.</p></section>
    <section class="dialog-section profile-checklist"><h3>Required Documents Checklist</h3><p>Every checklist line uses a rubric status: Required, Optional, Not required, or Not stated.</p><div class="detail-list">${items}</div><p><strong>GRE / GMAT / local-language tests:</strong> ${escapeHTML(program.optionalTests?.length ? program.optionalTests.map(test => `${test.name}: ${test.status}${test.details ? ` — ${test.details}` : ''}`).join('; ') : 'Not stated')}</p></section>
    <section class="dialog-section"><h3>Programme and IBSC fit</h3><div class="fact-grid"><div class="fact-item"><span>Degree</span><strong>${escapeHTML(tableText(program,'degree'))}</strong></div><div class="fact-item"><span>Length</span><strong>${escapeHTML(program.duration || 'Not stated')}</strong></div><div class="fact-item"><span>Location</span><strong>${escapeHTML(loc || 'Not stated')}</strong></div><div class="fact-item"><span>Language</span><strong>${escapeHTML(program.language || 'Not stated')}</strong></div><div class="fact-item"><span>Field fit</span><strong>${escapeHTML(program.fieldFit || 'Not stated')}</strong></div><div class="fact-item"><span>Source review date</span><strong>${escapeHTML(program.lastChecked || 'Not recorded')}</strong></div></div><p style="margin-top:12px">${escapeHTML(desc)}</p><p><strong>Why it fits IBSC:</strong> ${escapeHTML(program.ibscFit || 'The profile does not yet include a source-backed explanation of its fit with IBSC.')}</p><h4>Related courses</h4>${courseMarkup}</section>
    <section class="dialog-section"><h3>Full funding terms</h3><div class="fact-grid"><div class="fact-item"><span>Funding source</span><strong>${escapeHTML(fund.source || 'Not stated')}</strong></div><div class="fact-item"><span>Tuition covered</span><strong>${escapeHTML(fund.tuition || 'Not stated')}</strong></div><div class="fact-item"><span>Funding duration</span><strong>${escapeHTML(fund.duration || 'Not stated')}</strong></div><div class="fact-item"><span>Guaranteed or competitive</span><strong>${escapeHTML(fund.guarantee || 'Not stated')}</strong></div><div class="fact-item"><span>Eligibility</span><strong>${escapeHTML(fund.eligibility || 'Not stated')}</strong></div><div class="fact-item"><span>Separate scholarship deadline</span><strong>${escapeHTML(fund.deadline || awardDeadline)}</strong></div></div><p><strong>Why this funding badge:</strong> ${escapeHTML(fund.rubricBasis || 'See the official scholarship terms linked below.')}</p><p><strong>Project-supplied award note:</strong> ${escapeHTML(fund.projectNote || 'No separate funding note was supplied.')}</p><p><strong>Exchange rate and date:</strong> ${escapeHTML(program.exchangeRate || 'Not stated.')}</p></section>
    <section class="dialog-section"><h3>Deadlines and contact</h3><div class="fact-grid"><div class="fact-item"><span>Application deadline</span><strong>${escapeHTML(appDeadline)}</strong></div><div class="fact-item"><span>Scholarship deadline</span><strong>${escapeHTML(awardDeadline)}</strong></div><div class="fact-item"><span>Programme start</span><strong>${escapeHTML(tableText(program,'startDate'))}</strong></div><div class="fact-item"><span>Application fee</span><strong>${escapeHTML(program.applicationFee || 'Not stated')}</strong></div><div class="fact-item"><span>Admissions contact</span><strong>${escapeHTML(program.admissionsContact || 'Not stated')}</strong></div></div></section>
    <section class="dialog-section"><h3>Official-page screenshots</h3><div class="detail-list">${screenshotPanel(program)}</div></section>
    <section class="dialog-section"><h3>Official sources</h3><ul class="source-links">${sources}</ul><p class="small-note">Use the linked programme and scholarship pages to confirm cycle-specific details. Source review date: ${escapeHTML(program.lastChecked || 'Not recorded')}.</p></section>`;
}

function setupDialog(programs) {
  const dialog = document.getElementById('profile-dialog');
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-open-profile]');
    if (button) {
      const program = programs.find(item => item.id === button.dataset.openProfile);
      if (!program) return;
      document.getElementById('dialog-content').innerHTML = profileHTML(program);
      dialog.showModal();
    }
  });
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}

function renderSources(programs) {
  const unique = new Map();
  programs.forEach(program => {
    const imageSources = [];
    if (program.imageSourceUrl) imageSources.push({label: `Campus image: ${program.imageCredit || 'source page'}`, url: program.imageSourceUrl});
    if (program.imageLicenseUrl) imageSources.push({label: program.imageLicenseLabel || 'Campus image license', url: program.imageLicenseUrl});
    [...(program.officialSources || []), ...imageSources].forEach(source => {
    if (source.url && safeURL(source.url)) unique.set(source.url, {label:source.label || source.url, url:source.url, university:program.university});
    });
  });
  const list = [...unique.values()];
  document.getElementById('source-register-body').innerHTML = list.length
    ? `<ul class="source-list">${list.map(source => `<li><strong>${escapeHTML(source.university)}:</strong> ${externalLink(source.label, source.url)}</li>`).join('')}</ul>`
    : '<p>Official programme, admissions, curriculum, and scholarship sources will appear here as records are checked.</p>';
  const dates = programs.map(program => program.lastChecked).filter(date => date && date !== 'Not checked' && date !== 'Not recorded');
  document.getElementById('last-updated').textContent = dates.length ? dates.sort().at(-1) : 'Source review in progress';
}

async function init() {
  try {
    const response = await fetch('./data/programs.json');
    if (!response.ok) throw new Error(`Program data unavailable (${response.status})`);
    const programs = await response.json();
    renderDirectories(programs);
    renderTable(programs);
    renderRanking(programs);
    renderSources(programs);
    setupDialog(programs);
    ['program-search','region-filter'].forEach(id => document.getElementById(id).addEventListener('input', () => renderTable(programs)));
  } catch (error) {
    console.error(error);
    document.querySelectorAll('[data-program-grid]').forEach(grid => grid.innerHTML = `<p class="not-found">Programme data could not be loaded. Please refresh the page.</p>`);
    document.getElementById('comparison-body').innerHTML = '<tr><td colspan="8">Programme data could not be loaded.</td></tr>';
  }
}

document.addEventListener('DOMContentLoaded', init);
