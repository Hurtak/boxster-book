function retag(heading, name) {
  if (heading.tagName.toLowerCase() === name) return;
  const replacement = document.createElement(name);
  for (const attribute of heading.attributes) replacement.setAttribute(attribute.name, attribute.value);
  replacement.append(...heading.childNodes);
  heading.replaceWith(replacement);
}

// The manuscript remains a complete document without JavaScript. Enhancement
// presents one chapter at a time, while preserving Pandoc's existing deep links.
export function mountReader() {
  const book = document.querySelector('#book');
  const cover = document.querySelector('#title');
  const sidebar = document.querySelector('.book-sidebar');
  if (!book || !cover || !sidebar) return;
  const chapters = [...book.querySelectorAll(':scope > section.level2')].map((element, index) => ({
    element, index, title: element.querySelector(':scope > h2').textContent,
    planned: element.children.length === 1,
    words: element.textContent.trim().split(/\s+/).length,
  }));
  if (!chapters.length) return;
  const start = document.querySelector('[data-start-reading]');
  const written = chapters.filter((chapter) => !chapter.planned);
  // Start with the first drafted chapter while the manuscript is growing.
  const sample = written.find((chapter) => `#${chapter.element.id}` === start.hash) ?? written[0];
  if (sample) start.href = `#${sample.element.id}`;
  else start.hidden = true;
  const available = document.querySelector('[data-written-chapters]');
  available.hidden = !written.length;
  available.querySelector('h2').textContent = written.length === chapters.length ? 'Contents' : 'Available chapters';
  const list = available.querySelector('ul');
  for (const chapter of written) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${chapter.element.id}`;
    link.textContent = chapter.title;
    item.append(link);
    list.append(item);
  }
  document.querySelector('[data-draft-status]').textContent = written.length === chapters.length
    ? `All ${chapters.length} chapters drafted, with illustrations and source notes.`
    : `${written.length} of ${chapters.length} chapters drafted. Other chapters are planned.`;

  // Put each endnote beside the chapter that references it, keeping both the
  // original note ID and backlink. This also makes note deep links routable.
  const endnotes = book.querySelector('.footnotes');
  const noteLists = new Map();
  for (const note of [...(endnotes?.querySelectorAll('ol > li') ?? [])]) {
    const reference = [...book.querySelectorAll('a.footnote-ref')].find((link) => link.hash === `#${note.id}`);
    const owner = reference?.closest('section.level2');
    if (!owner) continue;
    if (!noteLists.has(owner)) {
      const section = document.createElement('details');
      section.className = 'chapter-notes';
      section.id = `${owner.id}--notes`;
      const summary = document.createElement('summary');
      const heading = document.createElement('h2');
      heading.textContent = 'Notes and sources';
      const list = document.createElement('ol');
      summary.append(heading);
      section.append(summary, list);
      owner.append(section);
      noteLists.set(owner, list);
    }
    // Preserve Pandoc's document-wide note numbering across chapter lists.
    note.value = Number(note.id.replace(/^fn/, ''));
    noteLists.get(owner).append(note);
  }
  if (endnotes && !endnotes.querySelector('li')) endnotes.remove();

  // Include every source in print, then restore the reader's disclosure choices.
  const notes = [...noteLists.values()].map((list) => list.parentElement);
  let printStates = null;
  const setPrinting = (printing) => {
    if (printing && !printStates) {
      printStates = notes.map((section) => section.open);
      for (const section of notes) section.open = true;
    } else if (!printing && printStates) {
      notes.forEach((section, index) => { section.open = printStates[index]; });
      printStates = null;
    }
  };
  const printMedia = matchMedia('print');
  printMedia.addEventListener('change', (event) => setPrinting(event.matches));
  addEventListener('beforeprint', () => setPrinting(true));
  addEventListener('afterprint', () => setPrinting(false));
  setPrinting(printMedia.matches);

  const chapterLinks = [...sidebar.querySelectorAll('nav a')];
  for (const chapter of chapters) {
    // A standalone chapter starts at h1; its manuscript subsections start at h2.
    for (const heading of chapter.element.querySelectorAll('h3, h4, h5, h6')) {
      retag(heading, `h${Number(heading.tagName.slice(1)) - 1}`);
    }
    const meta = document.createElement('p');
    meta.className = 'chapter-meta';
    meta.textContent = `Chapter ${chapter.index + 1} of ${chapters.length} · ${chapter.planned ? 'Planned' : `${Math.max(1, Math.ceil(chapter.words / 220))} min read`}`;
    chapter.element.firstElementChild.after(meta);
    if (chapter.planned) {
      chapter.element.classList.add('planned-chapter');
      const message = document.createElement('p');
      message.className = 'planned-message';
      message.textContent = 'This chapter is planned. ';
      if (sample) {
        const link = document.createElement('a');
        link.href = `#${sample.element.id}`;
        link.textContent = 'Read the complete sample chapter.';
        message.append(link);
      }
      chapter.element.append(message);
    }
  }

  const outline = document.querySelector('.chapter-outline');
  const pagination = document.querySelector('.chapter-pagination');
  const dialog = document.querySelector('.contents-dialog');
  const navigation = sidebar.querySelector('nav');
  const openContents = document.querySelector('.contents-toggle');
  openContents.addEventListener('click', () => {
    dialog.querySelector('.dialog-navigation').append(navigation);
    dialog.showModal();
    dialog.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'center' });
  });
  document.querySelector('[data-close-contents]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => sidebar.querySelector('h2').after(navigation));
  dialog.addEventListener('click', (event) => {
    if (event.target.closest('a')) dialog.close();
    if (event.target === dialog && event.clientX < dialog.getBoundingClientRect().left) dialog.close();
  });

  let active = null;
  let outlineItems = [];
  const adjacentLink = (chapter, label) => {
    const link = document.createElement('a');
    link.href = chapter ? `#${chapter.element.id}` : '#title';
    const direction = document.createElement('span');
    direction.textContent = label;
    link.append(direction, chapter?.title ?? 'Book cover');
    return link;
  };
  const updateProgress = () => {
    if (!active) return;
    const box = active.element.getBoundingClientRect();
    const distance = Math.max(1, box.height - innerHeight + 96);
    const percent = Math.round(Math.max(0, Math.min(1, (96 - box.top) / distance)) * 100);
    outline.querySelector('.reading-progress').textContent = `${percent}% of chapter`;
    let current = outlineItems[0];
    for (const item of outlineItems) if (item.section.getBoundingClientRect().top < 160) current = item;
    for (const item of outlineItems) {
      if (item === current) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    }
  };
  for (const section of notes) section.addEventListener('toggle', updateProgress);
  const showLocation = ({ initial = false } = {}) => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = ''; }
    const target = document.getElementById(id);
    // Footnote and outline links must reveal their destination before scrolling.
    const noteSection = target?.closest('details.chapter-notes');
    if (noteSection) noteSection.open = true;
    const owner = target?.closest('section.level2');
    const next = id === 'book' ? active : chapters.find((chapter) => chapter.element === owner) ?? null;
    const changed = active !== next;
    active = next;
    cover.hidden = !!active;
    retag(cover.firstElementChild, active ? 'h2' : 'h1');
    for (const chapter of chapters) {
      chapter.element.hidden = chapter !== active;
      retag(chapter.element.firstElementChild, chapter === active ? 'h1' : 'h2');
    }
    for (const link of chapterLinks) {
      if (active && link.hash === `#${active.element.id}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    if (changed || initial) {
      const currentLink = chapterLinks.find((link) => link.getAttribute('aria-current') === 'page');
      if (currentLink && sidebar.clientHeight) {
        const bounds = sidebar.getBoundingClientRect();
        const linkBounds = currentLink.getBoundingClientRect();
        if (linkBounds.top < bounds.top + 48 || linkBounds.bottom > bounds.bottom) {
          sidebar.scrollTop += linkBounds.top - bounds.top - 64;
        }
      }
      document.title = active ? `${active.title} — Porsche Boxster 2.9` : 'Porsche Boxster 2.9';
      const nav = outline.querySelector('nav');
      nav.replaceChildren();
      const sections = active ? [...active.element.querySelectorAll(':scope > .level3, :scope > .chapter-notes')] : [];
      outlineItems = sections.map((section) => {
        const link = document.createElement('a');
        link.href = `#${section.id}`;
        link.textContent = section.firstElementChild.textContent;
        nav.append(link);
        return { section, link };
      });
      outline.hidden = !outlineItems.length;
      pagination.hidden = !active;
      pagination.replaceChildren();
      if (active) pagination.append(adjacentLink(chapters[active.index - 1], '← Previous'), adjacentLink(chapters[active.index + 1], 'Next →'));
    }
    // Fragment scrolling happens after the formerly hidden chapter is laid out.
    requestAnimationFrame(() => {
      if (active && target) {
        const focus = target === owner ? owner.firstElementChild : target === noteSection ? noteSection.firstElementChild : target;
        focus.scrollIntoView({ block: 'start' });
        if (focus.tagName !== 'SUMMARY') focus.setAttribute('tabindex', '-1');
        focus.focus({ preventScroll: true });
      } else if (!id || id === 'title') {
        scrollTo(0, 0);
        if (!initial) {
          cover.firstElementChild.tabIndex = -1;
          cover.firstElementChild.focus({ preventScroll: true });
        }
      }
      updateProgress();
    });
  };
  let readingSize;
  try { readingSize = Number(localStorage.getItem('boxster-reading-size')); } catch { /* file or private mode */ }
  const buttons = [...document.querySelectorAll('[data-text-size]')];
  const applySize = () => {
    document.documentElement.style.setProperty('--reading-size', `${readingSize}px`);
    for (const button of buttons) button.disabled = Number(button.dataset.textSize) < 0 ? readingSize <= 17 : readingSize >= 24;
  };
  if (readingSize >= 17 && readingSize <= 24) applySize();
  else readingSize = parseFloat(getComputedStyle(document.body).fontSize);
  for (const button of buttons) button.addEventListener('click', () => {
    readingSize = Math.max(17, Math.min(24, readingSize + Number(button.dataset.textSize)));
    applySize();
    try { localStorage.setItem('boxster-reading-size', String(readingSize)); } catch { /* optional preference */ }
  });
  document.documentElement.classList.add('reader-enhanced');
  addEventListener('hashchange', () => showLocation());
  let pendingScroll = false;
  addEventListener('scroll', () => {
    if (pendingScroll) return;
    pendingScroll = true;
    requestAnimationFrame(() => { pendingScroll = false; updateProgress(); });
  }, { passive: true });
  showLocation({ initial: true });
}
