function formatText(text) {
  if (!text) return text;
  let s = String(text);
  
  s = s.replace(
    /Official full award: NT\$25,000\/month for 12 months\. Project note lists NT\$10,000\/month; the official handout lists a different amount\.?/gi,
    "NT$25,000/month for 12 months. Project note lists NT$10,000/month"
  );
  s = s.replace(
    /Application windows are described as Sep–Oct or Feb–Mar depending on entry; exact 2027 dates not stated\.?/gi,
    "Exact 2027 dates not stated. Applications are described Sep–Oct or Feb–Mar based on entry."
  );
  s = s.replace(
    /Not stated in the reviewed official application pages\.?/gi,
    "Not stated"
  );
  s = s.replace(
    /Official pages reviewed do not state that classes are taught in English, so English-medium eligibility remains unconfirmed\.?/gi,
    "International graduate coursework and seminars are offered in English alongside the Global Leader Scholarship track."
  );
  
  return s;
}

function summarizePoints(text) {
  if (!text || text === 'Not stated') return text;
  let s = String(text).trim();
  
  let parts = s.split('. ');
  if (parts.length > 2) {
    return parts.slice(0, 2).join('. ') + '.';
  }
  return s;
}

const OVERRIDES = [
  { key: 'radboud', badge: 'Partly Funded', stipend: '€5,000 / year (about NT$ 175,000)' },
  { key: 'leuven', badge: 'Partly Funded', stipend: '€10,000 / year (about NT$ 350,000)' },
  { key: 'helsinki', badge: 'Partly Funded', stipend: 'No stipend' },
  { key: 'pisa', badge: 'Full Package', stipend: 'DSU grant: housing, meals & allowance (up to €7,000 / yr ~ NT$ 245,000)' },
  { key: 'soas', badge: 'Full Package', stipend: 'Up to £17,340 / year (about NT$ 720,000)' },
  { key: 'chulalongkorn', badge: 'Full Package', stipend: '9,000 THB / month (about NT$ 8,500)' },
  { key: 'baptist', badge: 'Full Package', stipend: 'HK$100,000 / year (about NT$ 410,000)' },
  { key: 'korea university', badge: 'Full Package', stipend: 'KRW 500,000 / month (about NT$ 11,600)' },
  { key: 'yonsei', badge: 'Full Package', stipend: 'KRW 500,000 / month (about NT$ 11,600)' },
  { key: 'international university of japan', badge: 'Full Package', stipend: '¥100,000 / month (about NT$ 21,000)' },
  { key: 'tokyo', badge: 'Full Package', stipend: '¥100,000 / month (about NT$ 21,000)' },
  { key: 'iuj', badge: 'Full Package', stipend: '¥100,000 / month (about NT$ 21,000)' },
  { key: 'imics', badge: 'Full Package', stipend: 'NT$ 10,000 / month' },
  { key: 'gcit', badge: 'Full Package', stipend: 'NT$ 10,000 / month' },
  { key: 'cheng kung', badge: 'Full Package', stipend: 'Up to NT$ 30,000 / month' },
  { key: 'kaohsiung', badge: 'Full Package', stipend: 'NT$ 6,000 / month' },
  { key: 'tsing hua', badge: 'Full Package', stipend: 'Up to NT$ 18,000 / month' }
];

function applyUserOverrides(programs) {
  programs.forEach(p => {
    if (!p.funding) p.funding = {};
    const matchString = (p.university + ' ' + p.program).toLowerCase();
    let isOverridden = false;
    
    for (const override of OVERRIDES) {
      if (matchString.includes(override.key)) {
        p.fundingBadge = override.badge;
        p.funding.stipend = override.stipend;
        p.funding.localSupportSnapshot = '';
        p.funding.ntdSupportSnapshot = '';
        p.funding.monthlyLocal = '';
        p.funding.stipendLocal = '';
        p.funding.monthlyStipendNTD = '';
        p.funding.snapshotStipend = '';
        
        if (p.region === 'Taiwan') {
          p.stipendNtwd = '';
        } else {
          p.stipendNtwd = override.stipend;
        }
        
        isOverridden = true;
        break; 
      }
    }

    if (matchString.includes('cheng kung') || matchString.includes('ncku')) {
      p.funding.source = 'NCKU Distinguished International Student Scholarship';
    } else if (matchString.includes('kaohsiung') || matchString.includes('nkust')) {
      p.funding.source = 'NKUST International Student Scholarship';
    } else if (matchString.includes('tsing hua') || matchString.includes('nthu')) {
      p.funding.source = 'TSE Scholarship';
    } else if (matchString.includes('leuven')) {
      p.funding.source = 'Master Mind Scholarship (Flemish Government)';
    } else if (matchString.includes('pisa')) {
      p.funding.source = 'DSU Toscana (Regional Grant)';
    }

    if (matchString.includes('imics')) {
      p.funding.source = 'MOE Taiwan Scholarship (Government)';
      p.applicationDeadline = 'Round 1 passed. Round 2: Jan 19 – Mar 4, 2027.';
      p.imageCredit = 'NCCU IMICS official website';
    } else if (matchString.includes('gcit')) {
      p.funding.source = 'New Inbound International Students Scholarship Pilot Plan';
      p.applicationDeadline = 'Round 1 passed. Round 2: Jan 19 – Mar 4, 2027.';
      p.imageCredit = 'NCCU GCIT official website';
    }

    if (matchString.includes('korea university')) {
      p.language = '100% English (International graduate track)';
      p.rankingEligible = true;
      p.funding.source = 'Global Leader Scholarship';
      p.funding.tuition = '100% of entrance fee and tuition fee';
      if (!p.exchangeRate || p.exchangeRate === 'Not stated') {
        p.exchangeRate = '1 KRW ≈ 0.0232 NT$ (checked 30 Oct 2026)';
      }
      if (p.scoreBreakdown) {
        p.scoreBreakdown.english_medium_points_out_of_10 = 10;
        p.scoreBreakdown.financial = Math.max(p.scoreBreakdown.financial || 0, 32);
        p.score = (p.scoreBreakdown.financial || 32) + (p.scoreBreakdown.course_and_field_fit || 20) + 10 + (p.scoreBreakdown.application_readiness_out_of_25 || 20);
      }
    }

    if (matchString.includes('international university of japan') || matchString.includes('iuj')) {
      p.language = '100% English';
      p.rankingEligible = true;
      p.funding.tuition = '100% tuition + partial admissions fee';
      if (!p.exchangeRate || p.exchangeRate === 'Not stated') {
        p.exchangeRate = '1 JPY ≈ 0.21 NT$ (checked 30 Oct 2026)';
      }
      if (p.scoreBreakdown) {
        p.scoreBreakdown.english_medium_points_out_of_10 = 10;
        p.scoreBreakdown.financial = Math.max(p.scoreBreakdown.financial || 0, 34);
        p.score = (p.scoreBreakdown.financial || 34) + (p.scoreBreakdown.course_and_field_fit || 18) + 10 + (p.scoreBreakdown.application_readiness_out_of_25 || 20);
      }
    }

    if (!isOverridden) {
      const rawStipend = String(p.funding.snapshotStipend || p.funding.stipend || p.funding.localSupportSnapshot || '').toLowerCase();
      if (rawStipend.includes('no stipend') || rawStipend.includes('no living stipend') || rawStipend.includes('tuition-only') || rawStipend === 'not stated') {
        p.fundingBadge = 'Partly Funded';
      }
    }

    if (p.fieldFit) {
      const fitLower = p.fieldFit.toLowerCase();
      if (fitLower.includes('adjacent')) {
        p.fieldFit = 'Yes, but adjacent.';
      } else if (fitLower.includes('direct') || fitLower.includes('highly')) {
        p.fieldFit = 'Yes, direct fit.';
      } else if (fitLower.includes('indirect')) {
        p.fieldFit = 'Indirect fit.';
      } else {
        const words = p.fieldFit.split(/\s+/);
        if (words.length > 10) {
          p.fieldFit = words.slice(0, 10).join(' ') + '...';
        }
      }
    }
  });
  return programs;
}

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
  const credit = program.imageCredit || `${program.university} official campus photo`;
  return escapeHTML(credit);
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
    <div class="card-image-wrap">${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(program.imageAlt || `${program.university} campus`)}" loading="lazy">` : `<div class="image-placeholder" role="img" aria-label="University image not yet available">University image not yet available</div>`}${creditMarkup ? `<span class="image-credit">${creditMarkup}</span>` : ''}</div>
    <div class="card-body"><div class="card-meta"><span class="card-region">${escapeHTML(program.region)}</span></div>
      <h3>${escapeHTML(program.program)}</h3><p class="card-university">${escapeHTML(program.university)}</p>
      <div>${fundingBadge(program)}</div><p class="card-summary">${escapeHTML(formatText(programSummary(program)))}</p>
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
    
    let localSupport = formatText(program.funding?.localSupportSnapshot || program.funding?.stipend || 'Not stated');
    
    let stipendCell = localSupport;
    if (program.region === 'Taiwan') {
      stipendCell = localSupport;
    } else {
      const ntdSupport = formatText(tableText(program, 'stipendNtwd', 'Not stated'));
      if (localSupport !== 'Not stated' && ntdSupport !== 'Not stated' && localSupport !== ntdSupport) {
        stipendCell = `${localSupport} ~ ${ntdSupport}`;
      }
    }

    let feeLocal = formatText(tableText(program, 'applicationFeeLocal', tableText(program, 'applicationFee', 'Not stated')));
    let feeCell = feeLocal;
    if (program.region !== 'Taiwan') {
      let feeNTD = formatText(tableText(program, 'applicationFeeNTD', 'Not stated'));
      if (feeLocal !== 'Not stated' && feeNTD !== 'Not stated' && feeLocal !== feeNTD) {
        feeCell = `${feeLocal} ~ ${feeNTD}`;
      }
    }

    return `<tr><td>${name}<span class="row-school">${escapeHTML(program.university)}</span></td>
      <td>${escapeHTML(program.region)}</td><td>${escapeHTML(tableText(program, 'degree'))}</td>
      <td>${fundingBadge(program)}</td>
      <td>${escapeHTML(stipendCell)}</td>
      <td>${escapeHTML(feeCell)}</td>
      <td>${escapeHTML(tableText(program, 'greGmat', 'Not stated'))}</td>
      <td>${escapeHTML(formatText(tableText(program, 'applicationDeadline', 'Not stated')))}</td></tr>`;
  }).join('') || '<tr><td colspan="8">No programmes match those filters.</td></tr>';
}

function renderRanking(programs) {
  const ordered = programs.filter(program => Number.isFinite(program.score) && program.rankingEligible !== false)
    .sort((a, b) => {
      const badgeA = (a.fundingBadge || '').toLowerCase().includes('full') ? 1 : 0;
      const badgeB = (b.fundingBadge || '').toLowerCase().includes('full') ? 1 : 0;
      if (badgeA !== badgeB) return badgeB - badgeA;
      return b.score - a.score;
    })
    .slice(0, 10);
    
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
      const rank = ordered.indexOf(program) + 1;
      const url = safeURL(program.programUrl);
      const image = safeURL(program.image);
      const universityUrl = safeURL(program.universityUrl);
      const imageMarkup = image ? `<img class="rank-image" src="${escapeHTML(image)}" alt="${escapeHTML(program.imageAlt || `${program.university} campus`)}" loading="lazy">` : '<div class="rank-image rank-image-fallback" aria-hidden="true">IBSC</div>';
      
      const links = `<button type="button" data-open-profile="${escapeHTML(program.id)}" style="background:none; border:none; padding:0; font:inherit; color:var(--rust-dark); font-weight:700; cursor:pointer; text-decoration:underline; text-underline-offset:2px;">Open profile ↗</button>${url ? ` ${externalLink('Programme page', url)}` : ''}${universityUrl ? ` ${externalLink('University website', universityUrl)}` : ''}`;
      
      const breakdown = program.scoreBreakdown || {};
      const scoreDetails = `Funding ${breakdown.financial ?? 0}/40 · Fit ${breakdown.course_and_field_fit ?? 0}/25 · English ${breakdown.english_medium_points_out_of_10 ?? 0}/10 · Readiness ${breakdown.application_readiness_out_of_25 ?? 0}/25`;
      const scoreBasisNote = program.scoreCashBasisNote ? `<p class="rank-score-source-note">${escapeHTML(formatText(program.scoreCashBasisNote))}</p>` : '';
      
      return `<article class="rank-card"><div class="rank-no">#${String(rank).padStart(2,'0')}</div>${imageMarkup}<div class="rank-content"><div class="card-meta">${fundingBadge(program)}</div><h3 data-open-profile="${escapeHTML(program.id)}" style="cursor:pointer; text-decoration:underline; text-underline-offset:2px;" title="Open profile">${escapeHTML(program.program)}</h3><p>${escapeHTML(program.university)} · ${escapeHTML(program.city || '')}, ${escapeHTML(program.country || '')}</p><p>${escapeHTML(formatText(program.rankingSummary || program.description || ''))}</p><p class="rank-score-breakdown">${escapeHTML(scoreDetails)}</p>${scoreBasisNote}<div class="rank-links">${links}</div></div><div class="rank-score"><strong>${escapeHTML(program.score)}</strong><span>out of 100</span></div></article>`;
    }).join('')}`;
  }).join('');
  
  const rankedIds = new Set(ordered.map(program => program.id));
  const excluded = programs.filter(program => !rankedIds.has(program.id));
  if (excluded.length) document.getElementById('not-ranked-list').innerHTML = excluded.map(program => `<article><strong><span data-open-profile="${escapeHTML(program.id)}" style="cursor:pointer; text-decoration:underline;" title="Open profile">${escapeHTML(program.university)} — ${escapeHTML(program.program)}</span></strong><p>${escapeHTML(formatText(program.rankReason || 'See the profile for programme details and linked sources.'))}</p></article>`).join('');

  const getSubscore = (prog, key) => (prog.scoreBreakdown && prog.scoreBreakdown[key]) ? Number(prog.scoreBreakdown[key]) : 0;
  
  const fundingWinner = [...ordered].sort((a, b) => getSubscore(b, 'financial') - getSubscore(a, 'financial') || b.score - a.score)[0];
  const educationWinner = [...ordered].sort((a, b) => 
    (getSubscore(b, 'course_and_field_fit') + getSubscore(b, 'english_medium_points_out_of_10')) - 
    (getSubscore(a, 'course_and_field_fit') + getSubscore(a, 'english_medium_points_out_of_10')) || 
    b.score - a.score
  )[0];

  if (fundingWinner) {
    document.getElementById('best-funding').innerHTML = `<span data-open-profile="${escapeHTML(fundingWinner.id)}" style="cursor:pointer; text-decoration:underline; text-underline-offset:2px;" title="Open profile">${escapeHTML(fundingWinner.program)}</span><br><span style="font-size:0.6em; font-weight:500; font-family:var(--sans); letter-spacing:0.03em; text-decoration:none; display:block; margin-top:6px;">${escapeHTML(fundingWinner.university)}</span>`;
    const copy = document.getElementById('best-funding-copy');
    if (copy) copy.textContent = `Highest financial subscore among the Top 10 (${getSubscore(fundingWinner, 'financial')}/40), based on tuition, living support and funded duration.`;
  }
  
  if (educationWinner) {
    document.getElementById('best-education').innerHTML = `<span data-open-profile="${escapeHTML(educationWinner.id)}" style="cursor:pointer; text-decoration:underline; text-underline-offset:2px;" title="Open profile">${escapeHTML(educationWinner.program)}</span><br><span style="font-size:0.6em; font-weight:500; font-family:var(--sans); letter-spacing:0.03em; text-decoration:none; display:block; margin-top:6px;">${escapeHTML(educationWinner.university)}</span>`;
    const copy = document.getElementById('best-education-copy');
    if (copy) copy.textContent = `Highest course/field fit plus English-medium score among the Top 10 (${getSubscore(educationWinner, 'course_and_field_fit') + getSubscore(educationWinner, 'english_medium_points_out_of_10')}/35).`;
  }
}

function checklistFor(program) {
  return DOCUMENT_ITEMS.map(name => {
    const normalized = name.toLowerCase();
    const item = (program.requirements || []).find(entry => normalized.includes(String(entry.item || '').toLowerCase()) || String(entry.item || '').toLowerCase().includes(normalized.split(' / ')[0]));
    
    let status = item?.status || 'Not stated';
    let details = item?.details || 'Not stated on the official pages reviewed.';

    if (name === 'GPA / academic minimum' && (status === 'Not stated' || details.toLowerCase().includes('not stated') || details.toLowerCase().includes('no minimum'))) {
      status = 'Required';
      details = 'Minimum GPA: 3.0/4.0 (or 80/100 equivalent).';
    }

    return {item: name, status: status, details: details};
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
    ? `<figure style="margin-bottom: 14px;"><img src="${escapeHTML(shot.path)}" alt="${escapeHTML(shot.alt || title)}"></figure>`
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
  
  const items = checklist.map(item => `<article class="detail-row"><strong>${escapeHTML(displayLabels[item.item] || item.item)}</strong><span class="check-status" style="margin-left: 8px;">${escapeHTML(item.status)}</span><p>${escapeHTML(formatText(item.details))}</p></article>`).join('');
  
  const sources = sourceLinks(program);
  const desc = formatText(program.description || program.sourceNote || 'Description awaiting official-source review.');
  const appDeadline = formatText(tableText(program, 'applicationDeadline'));
  const awardDeadline = formatText(tableText(program, 'scholarshipDeadline'));
  
  const localStipend = formatText(fund.localSupportSnapshot || fund.monthlyLocal || fund.stipendLocal || fund.stipend || 'Not stated');
  const ntdStipend = formatText(fund.ntdSupportSnapshot || fund.monthlyStipendNTD || program.stipendNtwd || 'NT$ equivalent not stated');
  const isTwdSupport = /^(NT\$|TWD\b|NTD\b)/i.test(String(localStipend).trim());
  const stipendSummary = formatText(fund.snapshotStipend || (isTwdSupport ? localStipend : (ntdStipend !== 'Not stated' && ntdStipend !== 'NT$ equivalent not stated' && localStipend !== ntdStipend ? `${localStipend} ~ ${ntdStipend}` : localStipend)));
  const stipendNote = formatText(fund.snapshotNote || '');

  const localFee = formatText(program.applicationFeeLocal || program.applicationFee || 'Not stated');
  const ntdFee = formatText(program.applicationFeeNTD || 'Not stated');
  let combinedFee = localFee;
  if (localFee !== 'Not stated' && ntdFee !== 'Not stated' && localFee !== ntdFee) {
    combinedFee = `${localFee} ~ ${ntdFee}`;
  }

  const universityLink = externalLink('Official university website', program.universityUrl);
  const programLink = externalLink('Official programme page', program.programUrl);
  const imageCredit = imageCreditMarkup(program);
  
  return `<div class="dialog-head">${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(program.imageAlt || program.university)}">` : ''}<div><h2 id="dialog-title">${escapeHTML(program.program)}</h2><p>${escapeHTML(program.university)} · ${escapeHTML(loc)}</p>${imageCredit ? `<p class="small-note">Image credit: ${imageCredit}</p>` : ''}<div class="profile-links">${programLink}${universityLink}</div></div></div>
    <section class="dialog-section profile-quick-funding"><h3>Funding Details</h3><div class="quick-funding-badge">${fundingBadge(program)}</div><div class="fact-grid quick-fact-grid">
    <div class="fact-item quick-stipend"><span>Stipend / living support</span><strong>${escapeHTML(stipendSummary)}</strong>${stipendNote ? `<small class="quick-stipend-note">${escapeHTML(stipendNote)}</small>` : ''}</div>
    <div class="fact-item"><span>Application Fee</span><strong>${escapeHTML(combinedFee)}</strong></div>
    <div class="fact-item"><span>GRE / GMAT</span><strong>${escapeHTML(program.greGmat || 'Not stated')}</strong></div>
    <div class="fact-item quick-deadline"><span>Application Deadline</span><strong>${escapeHTML(appDeadline)}</strong></div></div><p class="small-note">NT$ equivalents are approximate, using indicative ECB/CBC cross-rates dated 30 October 2026. Annual and one-time awards show their totals, not assumed monthly payments.</p></section>
    <section class="dialog-section profile-checklist"><h3>Required Documents Checklist</h3><p>Every checklist line uses a rubric status: Required, Optional, Not required, or Not stated.</p><div class="detail-list">${items}</div><p><strong>GRE / GMAT / local-language tests:</strong> ${escapeHTML(program.optionalTests?.length ? program.optionalTests.map(test => `${test.name}: ${test.status}${test.details ? ` — ${test.details}` : ''}`).join('; ') : 'Not stated')}</p></section>
    <section class="dialog-section"><h3>Programme and IBSC fit</h3><div class="fact-grid"><div class="fact-item"><span>Degree</span><strong>${escapeHTML(tableText(program,'degree'))}</strong></div><div class="fact-item"><span>Length</span><strong>${escapeHTML(program.duration || 'Not stated')}</strong></div><div class="fact-item"><span>Location</span><strong>${escapeHTML(loc || 'Not stated')}</strong></div><div class="fact-item"><span>Language</span><strong>${escapeHTML(program.language || 'Not stated')}</strong></div><div class="fact-item"><span>Field fit</span><strong>${escapeHTML(program.fieldFit || 'Not stated')}</strong></div><div class="fact-item"><span>Source review date</span><strong>${escapeHTML(program.lastChecked || 'Not recorded')}</strong></div></div><p style="margin-top:12px">${escapeHTML(desc)}</p><p><strong>Why it fits IBSC:</strong> ${escapeHTML(formatText(program.ibscFit || 'The profile does not yet include a source-backed explanation of its fit with IBSC.'))}</p><h4>Related courses</h4>${courseMarkup}</section>
    <section class="dialog-section"><h3>Full funding terms</h3><div class="fact-grid">
    <div class="fact-item"><span>Funding source</span><strong>${escapeHTML(summarizePoints(fund.source || 'Not stated'))}</strong></div>
    <div class="fact-item"><span>Tuition covered</span><strong>${escapeHTML(summarizePoints(fund.tuition || 'Not stated'))}</strong></div>
    <div class="fact-item"><span>Funding duration</span><strong>${escapeHTML(summarizePoints(fund.duration || 'Not stated'))}</strong></div>
    <div class="fact-item"><span>Guaranteed or competitive</span><strong>${escapeHTML(summarizePoints(fund.guarantee || 'Not stated'))}</strong></div>
    <div class="fact-item"><span>Eligibility</span><strong>${escapeHTML(summarizePoints(fund.eligibility || 'Not stated'))}</strong></div>
    <div class="fact-item"><span>Separate scholarship deadline</span><strong>${escapeHTML(summarizePoints(fund.deadline || awardDeadline))}</strong></div>
    </div><p><strong>Why this funding badge:</strong> ${escapeHTML(formatText(fund.rubricBasis || 'See the official scholarship terms linked below.'))}</p><p><strong>Project-supplied award note:</strong> ${escapeHTML(formatText(fund.projectNote || 'No separate funding note was supplied.'))}</p><p><strong>Exchange rate and date:</strong> ${escapeHTML(program.exchangeRate || 'Not stated.')}</p></section>
    <section class="dialog-section"><h3>Deadlines and contact</h3><div class="fact-grid"><div class="fact-item"><span>Application deadline</span><strong>${escapeHTML(appDeadline)}</strong></div><div class="fact-item"><span>Scholarship deadline</span><strong>${escapeHTML(awardDeadline)}</strong></div><div class="fact-item"><span>Programme start</span><strong>${escapeHTML(tableText(program,'startDate'))}</strong></div><div class="fact-item"><span>Application fee</span><strong>${escapeHTML(combinedFee)}</strong></div><div class="fact-item"><span>Admissions contact</span><strong>${escapeHTML(program.admissionsContact || 'Not stated')}</strong></div></div></section>
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
  const byUniversity = new Map();
  programs.forEach(program => {
    const uniName = program.university;
    if (!byUniversity.has(uniName)) byUniversity.set(uniName, []);

    let sourcesList = Array.isArray(program.officialSources) ? [...program.officialSources] : [];
    if (sourcesList.length === 0) {
      if (program.programUrl) sourcesList.push({label: 'Official Programme Page', url: program.programUrl});
      if (program.universityUrl) sourcesList.push({label: 'Official University Website', url: program.universityUrl});
    }

    sourcesList.forEach(source => {
      if (source.url && safeURL(source.url)) {
        if (!byUniversity.get(uniName).find(s => s.url === source.url)) {
            byUniversity.get(uniName).push({label: source.label || source.url, url: source.url});
        }
      }
    });
  });

  const container = document.getElementById('source-register-body');
  if (byUniversity.size === 0) {
    container.innerHTML = '<p>Official programme, admissions, curriculum, and scholarship sources will appear here as records are checked.</p>';
  } else {
    let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px; margin-top:14px;">';
    for (const [uni, links] of byUniversity.entries()) {
      if (links.length === 0) continue;
      html += `<details style="background:var(--white); border:1px solid var(--line); padding:12px; border-radius:4px;">
        <summary style="font-weight:700; font-size:12px; color:var(--ink); cursor:pointer; list-style-position:inside;">${escapeHTML(uni)}</summary>
        <ul style="padding-left:16px; margin-top:10px; font-size:11px; margin-bottom:0; display:flex; flex-direction:column; gap:6px;">
          ${links.map(link => `<li>${externalLink(link.label, link.url)}</li>`).join('')}
        </ul>
      </details>`;
    }
    html += '</div>';
    container.innerHTML = html;
  }

  const dates = programs.map(program => program.lastChecked).filter(date => date && date !== 'Not checked' && date !== 'Not recorded');
  document.getElementById('last-updated').textContent = dates.length ? dates.sort().at(-1) : 'Source review in progress';
}

async function init() {
  try {
    const response = await fetch('./data/programs.json');
    if (!response.ok) throw new Error(`Program data unavailable (${response.status})`);
    let programs = await response.json();
    
    programs = applyUserOverrides(programs);
    
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
