// Small drawings of each option's first screen, used as card thumbnails.

export function PitchSketch() {
  return (
    <svg viewBox="0 0 400 210" role="img" aria-label="Sketch: big headline on the left, a green pitch on the right">
      <rect width="400" height="210" fill="#F5F4EF" />
      <g fill="#1D1D1B">
        <rect x="24" y="52" width="104" height="24" rx="2" />
        <rect x="24" y="84" width="118" height="24" rx="2" />
        <rect x="24" y="116" width="150" height="24" rx="2" />
        <rect x="24" y="160" width="70" height="18" rx="9" />
      </g>
      <rect x="200" y="46" width="176" height="110" rx="3" fill="#489D60" />
      <g fill="none" stroke="#F5F4EF" strokeWidth="2">
        <rect x="200" y="46" width="176" height="110" />
        <path d="M288 46v110" />
        <circle cx="288" cy="101" r="15" />
      </g>
      <path d="M376 46V34" stroke="#1D1D1B" strokeWidth="2" />
      <path d="M376 34l9 3-9 3z" fill="#ED1C24" />
      <g fill="#1D1D1B">
        {[[216, 101], [244, 78], [250, 126], [276, 96]].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="5" />)}
      </g>
      <g fill="#D17F2D" stroke="#1D1D1B">
        {[[360, 101], [330, 80], [326, 128], [304, 110]].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="5" />)}
      </g>
    </svg>
  );
}

export function WorldSketch() {
  return (
    <svg viewBox="0 0 400 210" role="img" aria-label="Sketch: huge headline on green above a day and night band">
      <defs>
        <linearGradient id="dn">
          <stop offset=".17" stopColor="#1D1D1B" />
          <stop offset=".26" stopColor="#D17F2D" />
          <stop offset=".38" stopColor="#3CB1EA" />
          <stop offset=".66" stopColor="#3CB1EA" />
          <stop offset=".78" stopColor="#D17F2D" />
          <stop offset=".9" stopColor="#1D1D1B" />
        </linearGradient>
      </defs>
      <rect width="400" height="210" fill="#489D60" />
      <g fill="#1D1D1B">
        <rect x="24" y="24" width="250" height="34" rx="2" />
        <rect x="24" y="66" width="190" height="34" rx="2" />
      </g>
      <rect x="24" y="118" width="352" height="74" rx="6" fill="url(#dn)" stroke="#1D1D1B" strokeWidth="2" />
      <g fill="#F5F4EF" stroke="#1D1D1B" strokeWidth="1.5">
        <rect x="250" y="126" width="62" height="13" rx="6.5" />
        <rect x="196" y="143" width="54" height="13" rx="6.5" />
        <rect x="112" y="160" width="70" height="13" rx="6.5" />
        <rect x="84" y="176" width="58" height="13" rx="6.5" />
      </g>
      <g fill="#ED1C24" stroke="#1D1D1B">
        <circle cx="318" cy="132.5" r="4" />
        <circle cx="256" cy="149.5" r="4" />
      </g>
    </svg>
  );
}

const THREE = [77, 200, 323];

export function BoardSketch() {
  return (
    <svg viewBox="0 0 400 210" role="img" aria-label="Sketch: three large numbers above a grid of small green pitches on a dark screen">
      <rect width="400" height="210" fill="#1D1D1B" />
      <g fontFamily="Bahianita,Impact,sans-serif" fontSize="64">
        <text x="24" y="76" fill="#88C59B">19</text>
        <text x="150" y="76" fill="#F5F4EF">38</text>
        <text x="276" y="76" fill="#3CB1EA">220</text>
      </g>
      <path d="M24 90h352" stroke="#F5F4EF" strokeWidth="2" />
      <g fill="#489D60">{THREE.map((c) => <rect key={c} x={c - 53} y="106" width="106" height="84" rx="3" />)}</g>
      <g fill="none" stroke="#F5F4EF" strokeWidth="1.5">
        <path d="M77 106v84M200 106v84M323 106v84" />
        {THREE.map((c) => <circle key={c} cx={c} cy="148" r="10" />)}
      </g>
      <g fill="#1D1D1B">
        {[[44, 140], [60, 166], [170, 130], [182, 162], [292, 150], [306, 124]].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="4" />)}
      </g>
      <g fill="#D17F2D">
        {[[98, 132], [112, 160], [222, 140], [236, 170], [344, 136], [356, 164]].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="4" />)}
      </g>
    </svg>
  );
}

export function SiteSketch() {
  const words = [
    [24, 22, 60, '#F5F4EF'], [90, 22, 26, '#D17F2D'], [122, 22, 70, '#F5F4EF'], [198, 22, 26, '#D17F2D'], [230, 22, 110, '#F5F4EF'],
    [24, 48, 20, '#D17F2D'], [50, 48, 90, '#F5F4EF'], [146, 48, 18, '#D17F2D'], [170, 48, 80, '#F5F4EF'],
  ];
  return (
    <svg viewBox="0 0 400 210" role="img" aria-label="Sketch: a sentence with orange numbers above a grid of dark outlined pitches">
      <rect width="400" height="210" fill="#10190F" />
      <g>{words.map(([x, y, w, fill]) => <rect key={`${x}-${y}`} x={x} y={y} width={w} height="18" rx="2" fill={fill} />)}</g>
      <g fill="#16241A" stroke="#88C59B" strokeWidth="1.5">{THREE.map((c) => <rect key={c} x={c - 53} y="100" width="106" height="72" rx="3" />)}</g>
      <g fill="none" stroke="#88C59B" strokeWidth="1.5">
        <path d="M77 100v72M200 100v72M323 100v72" />
        {THREE.map((c) => <circle key={c} cx={c} cy="136" r="9" />)}
      </g>
      <g fill="#F5F4EF">
        {[[42, 124], [58, 152], [168, 120], [180, 150], [290, 138], [304, 116]].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="4" />)}
      </g>
      <g fill="#3CB1EA">
        {[[98, 122], [112, 150], [222, 128], [236, 156], [344, 124], [356, 152]].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="4" />)}
      </g>
      <g fill="#D17F2D">{[112, 235, 358].map((x) => <rect key={x} x={x} y="84" width="16" height="10" rx="2" />)}</g>
    </svg>
  );
}
