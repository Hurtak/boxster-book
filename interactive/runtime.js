import './styles.css';

// A chapter exports mount(host, { state, signal }) -> cleanup (optionally async).
// State survives leaving the viewport; WebGL resources do not.
export function boot(registry) {
  const records = new Map();
  const release = (record) => {
    if (record.element.classList.contains('diagram-ready')) {
      // Disposing an offscreen scene must not pull later paragraphs upwards.
      record.element.style.setProperty('--diagram-reserved-height', `${record.element.getBoundingClientRect().height}px`);
    }
    record.controller?.abort();
    record.cleanup?.();
    record.controller = record.cleanup = null;
    record.view?.remove();
    record.view = null;
    record.fallback.forEach((node) => { node.hidden = false; });
    record.element.classList.remove('diagram-ready');
  };
  const activate = async (record) => {
    if (record.controller || record.failed) return;
    const controller = new AbortController();
    record.controller = controller;
    const view = document.createElement('div');
    view.className = 'diagram-interactive';
    record.view = view;
    record.element.append(view);
    try {
      const load = registry[record.element.dataset.diagram];
      if (!load) throw new Error('Unknown diagram');
      const module = await load();
      if (controller.signal.aborted) return;
      const cleanup = await module.mount(view, { state: record.state, signal: controller.signal });
      if (controller.signal.aborted) { cleanup?.(); return; }
      record.cleanup = cleanup;
      record.fallback.forEach((node) => { node.hidden = true; });
      record.element.classList.add('diagram-ready');
      record.element.style.removeProperty('--diagram-reserved-height');
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error(`Diagram ${record.element.dataset.diagram}:`, error);
      release(record);
      record.failed = true;
      const notice = document.createElement('p');
      notice.className = 'diagram-notice';
      notice.textContent = 'The interactive view is unavailable. The static diagram is shown below. ';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = 'Try again';
      retry.addEventListener('click', () => {
        notice.remove();
        record.failed = false;
        activate(record);
      }, { once: true });
      notice.append(retry);
      record.element.prepend(notice);
    }
  };
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const record = records.get(entry.target);
      if (entry.isIntersecting) activate(record);
      else release(record);
    }
  }, { rootMargin: '200px' });
  for (const element of document.querySelectorAll('[data-diagram]')) {
    const fallback = [...element.children];
    fallback.forEach((node) => node.classList.add('diagram-static'));
    const record = { element, fallback, state: {}, failed: false };
    records.set(element, record);
    observer.observe(element);
  }
  addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    observer.disconnect();
    records.forEach(release);
  });
}
