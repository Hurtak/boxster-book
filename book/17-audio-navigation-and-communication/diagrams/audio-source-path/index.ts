import { svgDiagram } from '../../../../interactive/svg.ts';
import { initializeState, type DiagramContext } from '../../../../interactive/types';
import { panel } from '../../../../interactive/ui.ts';

const sourceLabels = {
  radio: 'FM radio',
  cd: 'Audio / MP3 CD',
  aux: 'External player · AUX',
  usb: 'USB / period iPod',
  dvd: 'Discrete 5.1 DVD',
};
const soundLabels = { standard: 'Standard speakers', plus: 'Sound Package Plus', bose: 'BOSE' };

function pathFor(state: {
  headUnit: string;
  source: keyof typeof sourceLabels;
  sound: keyof typeof soundLabels;
  audioInterface: boolean;
}) {
  const pcm = state.headUnit === 'pcm';
  let missing = '',
    blockedAt = '';
  if (state.source === 'usb' && !pcm) {
    missing =
      'USB / iPod control needs PCM 3.0 and its version of interface 870. In the January 2010 UK catalogue, the CDR-30 version supplies AUX only.';
    blockedAt = 'source';
  } else if (['aux', 'usb'].includes(state.source) && !state.audioInterface) {
    missing =
      'The selected external source needs the optional universal audio interface (870). The sound package does not add this input.';
    blockedAt = 'source';
  } else if (state.source === 'dvd' && !pcm) {
    missing =
      'CDR-30 reads CDs, not DVDs. This recorded 5.1 example needs the PCM 3.0 CD/DVD drive and BOSE; adding BOSE alone does not add a DVD drive.';
    blockedAt = 'source';
  } else if (state.source === 'dvd' && state.sound !== 'bose') {
    missing =
      'The selected example is discrete DVD 5.1, which needs BOSE with PCM. PCM’s single CD/DVD drive is sufficient: the optional six-disc changer is not required. Other playback modes are outside this example.';
    blockedAt = 'amplifier';
  }
  const source = {
    radio: ['FM broadcast', 'Aerial receives the radio signal'],
    cd: ['Audio / MP3 CD', 'Disc read inside the head unit'],
    aux: ['External player · AUX', 'Player decodes its own music'],
    usb: ['USB / period iPod', 'Compatible device and cable'],
    dvd: ['Discrete 5.1 DVD', '5 main channels + LFE'],
  }[state.source];
  const input = {
    radio: ['Radio signal to tuner'],
    cd: ['Disc information to decoder'],
    aux: ['870 · analogue left/right audio'],
    usb: ['870 · programme to PCM', 'PCM track commands to device'],
    dvd: ['Disc information to decoder'],
  }[state.source];
  const signal = {
    standard: 'Internal audio signal',
    plus: 'Analogue audio',
    bose: pcm ? 'MOST · programme data' : 'Programme signal',
  }[state.sound];
  const amplifier = {
    standard: ['Head-unit output stages', pcm ? 'Inside PCM · standard sound' : 'Inside CDR-30 · 2 × 25 W'],
    plus: ['Separate Plus amplifier', 'Fully active · 185 W total'],
    bose: ['Separate BOSE amplifier', '7-channel digital · 385 W total'],
  }[state.sound];
  const speakers = {
    standard: ['4 speakers', '2 dashboard tweeters', '+ 2 door woofers'],
    plus: ['7 speakers', '2 dash tweeters + centre', '2 door midrange + 2 woofers'],
    bose: ['11 speakers', 'Includes centre + active subwoofer'],
  }[state.sound];
  return { pcm, missing, blockedAt, source, input, signal, amplifier, speakers };
}

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, {
    headUnit: 'cdr',
    source: 'radio',
    sound: 'standard',
    audioInterface: false,
  });
  state.headUnit ??= 'cdr';
  state.source ??= 'radio';
  state.sound ??= 'standard';
  state.audioInterface ??= false;
  if (!['cdr', 'pcm'].includes(state.headUnit)) state.headUnit = 'cdr';
  if (!Object.hasOwn(sourceLabels, state.source)) state.source = 'radio';
  if (!Object.hasOwn(soundLabels, state.sound)) state.sound = 'standard';
  const { stage, controls, explanation } = panel(host, {
    title: 'Follow one programme through the system',
    description:
      'Follow programme information into the head unit, then electrical power out to the speakers. Interface 870 and the sound package do different jobs.',
    note: 'MY2010 UK Boxster 2.9 · functional paths, not cable routing or a complete factory configurator. “DVD” means a compatible recorded 5.1 programme with PCM + BOSE. Device compatibility is equipment-specific. Grey marks an inactive programme path, not disconnected vehicle power.',
  });
  stage.style.height = '650px';
  explanation.setAttribute('aria-live', 'polite');
  const redraw = svgDiagram(
    stage,
    'Audio information, source control, amplifier power and speaker sound',
    (svg, { width }) => {
      svg.selectAll('*').remove();
      const route = pathFor({
        ...state,
        source: state.source as keyof typeof sourceLabels,
        sound: state.sound as keyof typeof soundLabels,
      });
      const active = !route.missing;
      const sourceActive = route.blockedAt !== 'source';
      const centre = width / 2;
      const ink = '#203e33',
        green = '#176b53',
        rust = '#a4412b',
        power = '#966827';
      svg.append('title').text('Selected audio programme and its equipment dependencies');
      svg
        .append('desc')
        .text(
          `${sourceLabels[state.source as 'radio' | 'cd' | 'aux' | 'usb' | 'dvd']} through ${route.pcm ? 'PCM 3.0' : 'CDR-30'} and ${soundLabels[state.sound as 'standard' | 'plus' | 'bose']}. ${route.missing || 'Programme information controls an amplifier powered by the vehicle; its output current moves the speakers to make sound.'}`,
        );
      const fitText = (node: SVGTextElement | null, size: number, available: number) => {
        const measured = node?.getComputedTextLength() ?? 0;
        if (node && measured > available) node.setAttribute('font-size', String((size * available) / measured));
      };
      const text = (
        x: number,
        y: number,
        label: string,
        size = 19,
        colour: string = ink,
        anchor = 'middle',
        available = anchor === 'middle' ? width - 24 : width - x - 12,
      ) => {
        const labelText = svg
          .append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', anchor)
          .attr('font-size', size)
          .attr('fill', colour)
          .text(label);
        fitText(labelText.node(), size, available);
        return labelText;
      };
      const card = (y: number, h: number, lines: (string | number)[], enabled = true, fill = '#fff') => {
        const group = svg.append('g').attr('opacity', enabled ? 1 : 0.52);
        group
          .append('rect')
          .attr('x', 12)
          .attr('y', y)
          .attr('width', width - 24)
          .attr('height', h)
          .attr('rx', 5)
          .attr('fill', fill)
          .attr('stroke', '#72887b')
          .attr('stroke-width', 1.5);
        lines.forEach((line: string | number, i: number) =>
          group
            .append('text')
            .attr('x', centre)
            .attr('y', y + 28 + i * 25)
            .attr('text-anchor', 'middle')
            .attr('font-size', i ? 17 : 21)
            .attr('fill', ink)
            .attr('font-weight', i ? 400 : 600)
            .text(line)
            .each(function () {
              fitText(this, i ? 17 : 21, width - 48);
            }),
        );
        return group;
      };
      const down = (
        top: number,
        bottom: number,
        labels: string[],
        enabled = true,
        colour: string = green,
        thick = false,
      ) => {
        const x = 31;
        svg
          .append('path')
          .attr('d', enabled ? `M${x},${top}V${bottom}m-5,-6l5,6l5,-6` : `M${x},${top}V${bottom}`)
          .attr('stroke', enabled ? colour : rust)
          .attr('stroke-width', thick ? 4 : 2)
          .attr('stroke-dasharray', enabled ? null : '4 4')
          .attr('fill', 'none');
        if (!enabled)
          svg
            .append('path')
            .attr('d', `M${x - 6},${(top + bottom) / 2 - 6}l12,12m0,-12l-12,12`)
            .attr('stroke', rust)
            .attr('stroke-width', 3);
        labels.forEach((label: string, i: number) =>
          text(
            49,
            (top + bottom) / 2 + (labels.length > 1 ? -6 : 6) + i * 23,
            label,
            17,
            enabled ? colour : rust,
            'start',
            width - 49 - (state.source === 'usb' && sourceActive ? 42 : 12),
          ),
        );
      };
      text(centre, 22, active ? 'PROGRAMME PATH AVAILABLE' : 'SELECTED ROUTE UNAVAILABLE', 16, active ? green : rust);
      card(38, 76, route.source);
      const inputLabels = sourceActive
        ? route.input
        : [
            state.source === 'usb' && !route.pcm
              ? 'Needs PCM + interface 870'
              : state.source === 'dvd'
                ? 'CDR-30 cannot read DVDs'
                : 'Interface 870 not fitted',
          ];
      down(114, 174, inputLabels, sourceActive);
      if (state.source === 'usb' && sourceActive) {
        // A functional return-command path, without assigning an unverified device transport.
        svg
          .append('path')
          .attr('d', `M${width - 27},174V114m-5,6l5,-6l5,6`)
          .attr('stroke', green)
          .attr('stroke-width', 2)
          .attr('fill', 'none');
      }
      card(
        174,
        76,
        [
          route.pcm ? 'PCM 3.0' : 'CDR-30',
          state.source === 'radio' ? 'Tune · select · set volume' : 'Select programme · set volume',
        ],
        sourceActive,
      );
      down(250, 312, route.blockedAt === 'amplifier' ? ['Needs BOSE for discrete 5.1'] : [route.signal], active);
      const amp = card(312, 119, route.amplifier, active, '#faf7ef');
      // Supply energy and programme information are different inputs to amplification.
      amp.append('text').attr('x', 29).attr('y', 405).attr('font-size', 17).attr('fill', power).text('Vehicle power');
      const gainX = Math.max(205, width - 78);
      amp
        .append('path')
        .attr('d', `M155,399H${gainX}m-6,-4l6,4l-6,4M${gainX},384l27,15l-27,15Z`)
        .attr('fill', 'none')
        .attr('stroke', power)
        .attr('stroke-width', 2);
      down(431, 490, ['Speaker-driving current'], active, power, true);
      card(490, route.speakers.length > 2 ? 98 : 84, route.speakers, active);
      // Generic loudspeaker symbol and outgoing pressure waves; no mounting geometry.
      const speakerY = 615;
      const sound = svg.append('g');
      sound
        .append('path')
        .attr(
          'd',
          `M${centre - 58},${speakerY - 7}h10l15,-10v34l-15,-10h-10Z M${centre - 21},${speakerY - 12}q12,12 0,24 M${centre - 13},${speakerY - 20}q20,20 0,40`,
        )
        .attr('stroke', active ? green : '#72887b')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('opacity', active ? 1 : 0.52);
      ['Cone motion', '→ sound waves'].forEach((label, i) =>
        sound
          .append('text')
          .attr('x', centre + 59)
          .attr('y', speakerY - 2 + i * 23)
          .attr('text-anchor', 'middle')
          .attr('font-size', 18)
          .attr('fill', active ? ink : '#72887b')
          .text(label),
      );
      const soundBounds = sound.node()!.getBBox();
      sound.attr('transform', `translate(${centre - soundBounds.x - soundBounds.width / 2},0)`);
      const details =
        state.sound === 'bose'
          ? `${route.pcm ? 'PCM sends programme data over MOST to the' : 'The selected programme feeds the'} digital BOSE amplifier. Its output stages supply speaker-driving current; eleven speakers do not imply eleven programme channels.`
          : state.sound === 'plus'
            ? 'Analogue audio feeds the separate, fully active Plus amplifier. It drives two dashboard tweeters and a centre speaker, plus a midrange and bass driver in each door. The head unit does not retain the speaker-driving role.'
            : 'The output stages are inside the head unit, rather than a separate amplifier. They drive two dashboard tweeters and two door woofers; four drivers can reproduce a two-channel stereo programme.';
      const sourceDetails = {
        radio: 'The tuner recovers audio from the aerial’s radio signal.',
        cd: 'The drive and decoder recover audio from the disc.',
        aux: 'AUX carries analogue left/right sound through interface 870. Choose tracks on the external player; AUX adds no track-control return path.',
        usb: 'Interface 870 connects a supported USB or period iPod device. Programme audio goes to PCM, with supported selection commands returning to the device. Connector and device support still matter.',
        dvd: 'A compatible audio/video DVD supplies five recorded main channels plus low-frequency effects. PCM’s single CD/DVD drive is sufficient; the optional six-disc changer is not required. This is recorded surround, unlike surround derived from stereo by BOSE Centerpoint.',
      }[state.source];
      explanation.textContent = route.missing || `${sourceDetails} ${details}`;
      host.dataset.audioHeadUnit = state.headUnit;
      host.dataset.audioSource = state.source;
      host.dataset.audioSound = state.sound;
      host.dataset.audioAvailable = String(active);
      host.dataset.audioInterface = String(state.audioInterface);
    },
    signal,
  );
  const selectControl = (label: string, key: 'headUnit' | 'source' | 'sound', values: Record<string, string>) => {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:grid;gap:6px;margin-bottom:14px;font:inherit';
    const caption = document.createElement('label');
    caption.textContent = label;
    const select = document.createElement('select');
    select.id = `${stage.getAttribute('aria-labelledby')}-${key}`;
    caption.htmlFor = select.id;
    select.style.cssText =
      'font:inherit;min-height:44px;width:100%;max-width:100%;background:#fff;color:#203e33;border:1px solid #72887b;padding:6px';
    for (const [value, name] of Object.entries(values)) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = name;
      select.append(option);
    }
    select.value = state[key];
    select.addEventListener(
      'change',
      () => {
        state[key] = select.value;
        redraw();
      },
      { signal },
    );
    wrapper.append(caption, select);
    controls.append(wrapper);
  };
  selectControl('Head unit', 'headUnit', { cdr: 'CDR-30', pcm: 'PCM 3.0 / navigation' });
  selectControl('Programme source', 'source', sourceLabels);
  selectControl('Sound system', 'sound', soundLabels);
  const interfaceLabel = document.createElement('label');
  interfaceLabel.style.cssText = 'display:flex;align-items:center;gap:10px;min-height:44px';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = state.audioInterface;
  checkbox.addEventListener(
    'change',
    () => {
      state.audioInterface = checkbox.checked;
      redraw();
    },
    { signal },
  );
  interfaceLabel.append(checkbox, document.createTextNode('Universal audio interface (870) fitted'));
  controls.append(interfaceLabel);
  redraw();
  return () => {};
}
