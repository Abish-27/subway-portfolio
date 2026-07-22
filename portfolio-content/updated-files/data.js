// ─────────────────────────────────────────────────────────────────────
//  Transit map data — lines, stations, waypoints, content
// ─────────────────────────────────────────────────────────────────────
//  Coordinate system: viewBox 1600 × 1000
//  Central station at (640, 540)
//  Creative Loop (yellow, Singapore Circle Line) centred at (1170, 540)
// ─────────────────────────────────────────────────────────────────────

const CENTRAL = { x: 700, y: 540 };

// ── Colours, inspired by real transit systems ───────────────────
// Tech ← TTC Bloor–Danforth (Toronto)        ─ bold green
// Journey ← Mumbai Metro Line 1               ─ deep blue, double-stripe
// Creative ← Singapore MRT Circle Line       ─ warm amber/orange
// Founder ← NYC Subway / NJ Transit           ─ bold red
const COLOR_TECH    = '#00923F';   // TTC green
const COLOR_TECH_D  = '#006a2c';
const COLOR_FOUND   = '#E03A36';   // NYC/NJ Transit red
const COLOR_FOUND_D = '#9c1f1d';
const COLOR_CREAT   = '#F4A024';   // Singapore Circle Line amber-orange
const COLOR_CREAT_D = '#b3741a';
const COLOR_JOURN   = '#1B6FCB';   // Mumbai Metro blue
const COLOR_JOURN_D = '#0F4E92';
const COLOR_STUB    = '#1a1815';   // black stub (unused now)
const COLOR_STUB_A  = '#C8881C';

// ── Creative Loop geometry ───────────────────────────────────────
const LOOP = { cx: 1130, cy: 550, rx: 230, ry: 175 };
// Helper: a point on a (slightly noisy) oval at angle θ (radians, 0 = east, CCW)
function loopPt(deg, rOffsetX = 0, rOffsetY = 0) {
  const rad = deg * Math.PI / 180;
  const x = LOOP.cx + (LOOP.rx + rOffsetX) * Math.cos(rad);
  const y = LOOP.cy + (LOOP.ry + rOffsetY) * Math.sin(rad);
  return { x: +x.toFixed(1), y: +y.toFixed(1) };
}

// Loop station positions (the "organic oval" — slight perturbations).
// Each entry includes the station id so renderStations() picks it up.
const LOOP_STATIONS = {
  'music-portfolio':    { ...loopPt(180,  6,  0), station: 'music-portfolio' },
  'banger-generator':   { ...loopPt(240, -4, -4), station: 'banger-generator' },
  'ghostnote':          { ...loopPt(300,  0, -6), station: 'ghostnote' },
  'drumming':           { ...loopPt(0,    8,  0), station: 'drumming' },
  'bands':              { ...loopPt(60,   2,  6), station: 'bands' },
  'certifications':     { ...loopPt(120, -2,  4), station: 'certifications' },
};

// ── Line definitions ────────────────────────────────────────────
const LINES = [
  // ─── JOURNEY LINE — TORONTO TTC — GOLD/AMBER (single L-shape) ──
  // Horizontal arm at the bottom holds education stops + Volunteering
  // at the corner; vertical arm holds the work stops before joining Central.
  {
    id: 'journey',
    name: 'Journey Line',
    short: 'L1',
    color: COLOR_JOURN,
    colorDim: COLOR_JOURN_D,
    city: 'Tech Stack',
    cityInspiration: 'Mumbai Metro Line 1',
    cityFont: "'Hind', sans-serif",
    direction: 'West ↻ North',
    doubleStripe: true,
    waypoints: [
      { x: 280, y: 905, station: 'shree-mangal' },
      { x: 490, y: 905, station: 'qifa' },
      { x: 700, y: 905, station: 'education' },
      { x: 700, y: 780, station: 'mindgate' },
      { x: 700, y: 660, station: 'bacsa' },
      { x: 700, y: 540, station: 'central' },
    ],
  },
  // Journey work spur removed — mindgate + bacsa now sit on the main
  // journey line's vertical arm.
  // ─── FOUNDER LINE — NYC/NJ TRANSIT — BOLD RED ────────────────
  {
    id: 'founders',
    name: 'Founder Line',
    short: 'L4',
    color: COLOR_FOUND,
    colorDim: COLOR_FOUND_D,
    city: 'New York / NJ',
    cityInspiration: 'MTA · NJ Transit',
    cityFont: "'Oswald', sans-serif",
    direction: 'Southwest',
    waypoints: [
      { x: 700, y: 540, station: 'central' },
      { x: 610, y: 600 },
      { x: 510, y: 620, station: 'hackathon-director' },
      { x: 410, y: 690 },
      { x: 360, y: 790, station: 'sutd-hackathon' },
      { x: 290, y: 835 },
      { x: 170, y: 830, station: 'uwc-hacks' },
      { x: 60,  y: 820, station: 'utra-hacks' },
      { x: 35,  y: 700, station: 'tides' },
    ],
  },
  // ─── TECH LINE — TOP TRACK — MUMBAI METRO — BLUE ─────────────
  {
    id: 'tech-top',
    name: 'Tech Line',
    short: 'L2',
    color: COLOR_TECH,
    colorDim: COLOR_TECH_D,
    city: 'Toronto',
    cityInspiration: 'TTC Bloor–Danforth',
    cityFont: "'IBM Plex Sans', sans-serif",
    direction: 'East — Software',
    techTrack: 'top',
    waypoints: [
      { x: 90,  y: 295, station: 'tech-skills' },
      { x: 175, y: 220 },
      { x: 280, y: 188, station: 'stock-trader' },
      { x: 470, y: 188, station: 'meal-planner' },
      { x: 660, y: 188, station: 'shade' },
      { x: 800, y: 230, station: 'timetable-builder' },
      { x: 920, y: 305 },
      LOOP_STATIONS['banger-generator'],
      LOOP_STATIONS['ghostnote'],
    ],
  },
  // ─── TECH LINE — BOTTOM TRACK — GAME DEV ────────────────────
  {
    id: 'tech-bottom',
    name: 'Tech Line — Games',
    short: 'L2·G',
    color: COLOR_TECH,
    colorDim: COLOR_TECH_D,
    city: 'Toronto',
    cityFont: "'IBM Plex Sans', sans-serif",
    direction: 'East — Game Dev',
    techTrack: 'bottom',
    waypoints: [
      { x: 90,  y: 295, station: 'tech-skills' },
      { x: 175, y: 370 },
      { x: 280, y: 418, station: 'graviton' },
      { x: 470, y: 418, station: 'hunters-hollow' },
      { x: 660, y: 418, station: 'midnight-assassin' },
      { x: 815, y: 418, station: 'lunch-brake' },
      { x: 800, y: 490 },
      { x: 700, y: 540, station: 'central' },
    ],
  },
  // ─── CREATIVE LINE — SINGAPORE CIRCLE — YELLOW LOOP ─────────
  {
    id: 'creative',
    name: 'Creative Line',
    short: 'L3',
    color: COLOR_CREAT,
    colorDim: COLOR_CREAT_D,
    city: 'Singapore',
    cityInspiration: 'MRT Circle Line',
    cityFont: "'Cormorant Garamond', serif",
    direction: 'Loop',
    isLoop: true,
    loopGeom: LOOP,
    // The actual loop arc is rendered by app.js as elliptical arcs between stations.
    // Connector from Central to Music Portfolio is rendered separately.
    waypoints: [
      // a) connector stub from Central
      { x: 700, y: 540, station: 'central' },
      LOOP_STATIONS['music-portfolio'],
      // b) loop (clockwise)
      LOOP_STATIONS['banger-generator'],
      LOOP_STATIONS['ghostnote'],
      LOOP_STATIONS['drumming'],
      LOOP_STATIONS['bands'],
      LOOP_STATIONS['certifications'],
      LOOP_STATIONS['music-portfolio'],   // closes
    ],
  },
  // ─── SPECIAL SERVICE — BACSA Hacks stub removed at user request ─
  // Previously a black + gold dashed connector between BACSA (Journey) and
  // Hackathon Director (Founder). Removed to keep those two lines visually
  // independent.
];

// ─── STATIONS ────────────────────────────────────────────────────
const STATIONS = {

  // ══ Central Station ═════════════════════════════════════════
  'central': {
    name: 'Central Station',
    displayNames: ['Grand Central', 'Union Station', 'City Hall', 'Victoria Terminus'],
    lineIds: ['journey', 'founders', 'tech-bottom', 'creative'],
    city: 'Portfolio Hub',
    type: 'central',
    postcardSlides: [
      {
        postmark: 'GRAND CTRL',
        kicker: 'station reference',
        title: 'Grand Central',
        stamp: 'NYC',
        factLabel: 'Fun fact about Grand Central',
        fact: 'Grand Central is the classic all-lines-converge station. This portfolio hub does the same thing: every route starts here.',
      },
      {
        postmark: 'UNION',
        kicker: 'station reference',
        title: 'Union Station',
        stamp: 'TORONTO',
        factLabel: 'Fun fact about Union Station',
        fact: 'Union Station is Toronto\'s busiest transit hub, which makes it the right reference for a station that connects every branch of the map.',
      },
      {
        postmark: 'CITY HALL',
        kicker: 'station reference',
        title: 'City Hall',
        stamp: 'CIVIC',
        factLabel: 'Fun fact about City Hall',
        fact: 'City Hall stations sit near the machinery of public life. Good systems, like good cities, should be easy to navigate.',
      },
      {
        postmark: 'VICTORIA',
        kicker: 'station reference',
        title: 'Victoria Terminus',
        stamp: 'MUMBAI',
        factLabel: 'Fun fact about Victoria Terminus',
        fact: 'Victoria Terminus, now Chhatrapati Shivaji Maharaj Terminus, is a Mumbai landmark built around movement at serious scale.',
      },
    ],
    content: {
      kind: 'central',
      tagline: 'All lines converge.',
      about: 'CS Specialist + Cognitive Science at the University of Toronto. I build across the full stack — mobile, game dev, data tools, and audio/ML. Java/JSP internship work, React Native mobile, Godot game jams, and the occasional Arduino contraption.',
      hobbies: ['Badminton', 'Drums', 'Cooking'],
      socials: [
        { label: 'GitHub',        value: 'Abish-27',                                  url: 'https://github.com/Abish-27' },
        { label: 'LinkedIn',      value: 'abish-kulkarni',                            url: 'https://www.linkedin.com/in/abish-kulkarni-83b666231/' },
        { label: 'Personal Site', value: 'sites.google.com/view/abishkulkarni',       url: 'https://sites.google.com/view/abishkulkarni' },
        { label: 'Email',         value: 'abishkulkarni@gmail.com',                   url: 'mailto:abishkulkarni@gmail.com' },
      ],
    },
  },

  // ══ JOURNEY LINE (Toronto TTC) ══════════════════════════════
  'education': {
    name: 'Volunteering',
    lineIds: ['journey'],
    city: 'Toronto',
    content: {
      kind: 'list',
      items: [
        { title: 'Shree Mangal DVIP, Nepal',
          subtitle: 'Fundraising lead — supporting children\'s education in Kathmandu',
          meta: 'Volunteering',
          body: 'Raised over $10,000 toward boarding, tuition, and supplies for displaced Himalayan children. Ran the donor-comms side and organised fundraising events on campus.' },
        { title: 'Qifa Primary School',
          subtitle: 'Childcare volunteer — Singapore',
          meta: 'Volunteering',
          body: 'After-school childcare and tutoring for primary-school students in Singapore. Recurring weekly sessions throughout my IB years.' },
      ],
    },
  },
  'mindgate': {
    name: 'Mindgate Solutions',
    lineIds: ['journey'],
    city: 'Finance Tool',
    content: {
      kind: 'project',
      title: 'Java Software Developer Intern',
      tagline: 'Mindgate Solutions · Mumbai',
      meta: 'Jul 2023 — Aug 2023',
      stack: ['Java', 'JSP', 'SQL', 'HTML/CSS'],
      body: 'Built a Java admin portal for bank staff. JSP / SQL backend, full-stack feature development across the bank workflow.',
    },
  },
  'bacsa': {
    name: 'BACSA',
    lineIds: ['journey'],
    city: 'Toronto',
    content: {
      kind: 'project',
      title: 'Biotechnology & CS Association',
      tagline: 'Director of Hackathon · University of Toronto',
      meta: 'Sep 2025 — Present',
      body: 'Leading the executive team for UofT\'s Biotech + CS student association. Programming, sponsorship outreach, and bridging the dry-lab/wet-lab divide for undergrads.',
    },
  },
  'shree-mangal': {
    name: 'UWCSEA',
    lineIds: ['journey'],
    city: 'Singapore',
    content: {
      kind: 'project',
      title: 'United World College of South East Asia',
      tagline: 'IB Diploma · Singapore',
      meta: 'Aug 2022 — May 2024',
      body: 'Completed the IB Diploma Programme at UWCSEA with a 41/45 score before starting Computer Science at the University of Toronto.',
    },
  },
  'qifa': {
    name: 'UofT',
    lineIds: ['journey'],
    city: 'Toronto',
    content: {
      kind: 'project',
      title: 'University of Toronto',
      tagline: 'BSc, Computer Science Specialist · ASIP Co-op',
      meta: 'Sep 2024 — May 2028',
      body: 'Studying Computer Science Specialist with Cognitive Science at the University of Toronto.',
    },
  },

  // ══ FOUNDER LINE (NYC/NJ Transit) ═══════════════════════════
  'hackathon-director': {
    name: 'Hackathon Director',
    lineIds: ['founders'],
    city: 'Toronto',
    content: {
      kind: 'project',
      title: 'Forensics & Biotech Hackathon',
      tagline: 'Director · BACSA, University of Toronto',
      meta: '100+ participants',
      body: 'Designing DNA-sequence analysis (Biopython) and fingerprint-ID (OpenCV) challenges, plus a crime-scene workshop. Owning logistics, sponsorship, and outreach end-to-end.',
    },
  },
  'sutd-hackathon': {
    name: 'SUTD Hackathon',
    lineIds: ['founders'],
    city: 'Singapore',
    content: {
      kind: 'project',
      title: 'SUTD Hackathon',
      tagline: 'Singapore University of Technology & Design',
      stack: ['Python', 'OpenCV', 'Arduino'],
      body: 'Multi-day collegiate hackathon at SUTD. Cross-disciplinary teams shipping prototypes against real industry-supplied briefs.',
    },
  },
  'uwc-hacks': {
    name: 'UWC Hacks',
    lineIds: ['founders'],
    interchange: ['journey'],
    splitDot: [COLOR_FOUND, COLOR_JOURN],
    crossRef: { stationId: 'shree-mangal', label: 'See: UWCSEA on Journey Line' },
    city: 'Singapore',
    content: {
      kind: 'list',
      items: [
        { title: 'UWCHacks',
          subtitle: '1st Place · United World College SEA',
          extra: '1st',
          body: 'Won the high-school hackathon during IB. The same campus where I earned my IB diploma — see UWCSEA on the Journey Line.' },
      ],
    },
  },
  'utra-hacks': {
    name: 'UTRA Hacks',
    lineIds: ['founders'],
    city: 'Toronto',
    content: {
      kind: 'list',
      items: [
        { title: 'UTRAHacks 2026 — Robot Car v2',
          subtitle: '3rd Place · University of Toronto Robotics',
          extra: '3rd',
          body: 'Iterated on last year\'s autonomous driving rig with improved obstacle avoidance.' },
        { title: 'UTRAHacks 2025 — Robot Car',
          subtitle: '3rd Place',
          extra: '3rd',
          body: 'Autonomous driving with a robotic arm, colour detection, and obstacle avoidance. Arduino Uno R4 / C++.',
          url: 'https://devpost.com/software/lightning-mcqueen' },
      ],
    },
  },
  'tides': {
    name: 'Tides',
    lineIds: ['founders'],
    city: 'New Jersey',
    content: {
      kind: 'project',
      title: 'Tides',
      tagline: 'Activity discovery platform — find local venues for discounted social experiences.',
      meta: 'Jul 2025 — Present',
      stack: ['TypeScript', 'React Native', 'Expo', 'Supabase', 'PostgreSQL'],
      body: 'Full-stack ownership: UI, database architecture, real-time backend, and the venue partnership flow. Built mobile-first with native gesture handling on both iOS and Android.',
    },
  },

  // ══ TECH LINE — TOP (Software Projects) ═════════════════════
  'tech-skills': {
    name: 'Technical Skills & Libraries',
    lineIds: ['tech-top', 'tech-bottom'],
    type: 'terminus',
    city: 'Tech Stack',
    bgSketch: 'cn-tower',
    content: {
      kind: 'skills',
      groups: [
        { label: 'Languages',  items: ['Java','Python','C++','C#','GDScript','SQL','JavaScript','HTML/CSS','R'] },
        { label: 'Frameworks', items: ['React','React Native','Flask','MySQL','Django','Java Servlet','Supabase','PostgreSQL'] },
        { label: 'Tools',      items: ['Git','VS Code','PyCharm','IntelliJ','Eclipse','Godot','Unity','Arduino','Blender'] },
        { label: 'Libraries',  items: ['pandas','NumPy','Matplotlib','TensorFlow','FastAPI','googleTTS','scikit-learn','yfinance','OpenCV','Spleeter','Biopython'] },
      ],
    },
  },
  'stock-trader': {
    name: 'Stock Trader',
    lineIds: ['tech-top'],
    city: 'Finance Tool',
    bgSketch: 'stock-charts',
    postcardImage: 'portfolio-content/GreenLine/Stations/king.png',
    postcardKicker: 'station reference',
    postcardTitle: 'King',
    funFactLabel: 'Fun fact about King Station',
    funFact: 'King Station is the closest TTC stop to the Toronto Stock Exchange. This Stock Trader app won\'t get you a Bay Street job but it will teach you why those suits are always stressed.',
    galleryImages: [
      {
        src: 'portfolio-content/GreenLine/software-projects/stock.jpg',
        caption: 'Stock Trader',
      },
      {
        src: 'portfolio-content/GreenLine/software-projects/stock2.jpg',
        caption: 'Stock Trader',
      },
    ],
    content: {
      kind: 'project',
      title: 'Stock Trader',
      tagline: 'Decision-tree stock screener with backtesting harness.',
      stack: ['Python', 'pandas', 'NumPy', 'Matplotlib', 'yfinance', 'pygame'],
      body: 'Ingest historical OHLC data, fit a decision tree on engineered features, and replay decisions over a rolling window. UI built in pygame for interactive parameter sweeps.',
    },
  },
  'meal-planner': {
    name: 'Meal Planner',
    lineIds: ['tech-top'],
    city: 'Meal Tool',
    postcardImage: 'portfolio-content/GreenLine/Stations/spadina.png',
    postcardKicker: 'station reference',
    postcardTitle: 'Spadina',
    funFactLabel: 'Fun fact about Spadina',
    funFact: 'Service notice: Spadina means \'high ground\' in Ojibwe. This Meal Planner will help you take the high ground against skipping breakfast, sad desk lunches, and 11pm cereal dinners.',
    galleryImages: [
      {
        src: 'portfolio-content/GreenLine/software-projects/mealplanner.png',
        caption: 'Meal Planner',
      },
      {
        src: 'portfolio-content/GreenLine/software-projects/mealplanner2.png',
        caption: 'Meal Planner',
      },
    ],
    content: {
      kind: 'project',
      title: 'Meal Planner',
      tagline: 'Weekly meal scheduler with pantry-aware shopping list.',
      stack: ['Java', 'JSP', 'HTML/CSS', 'MySQL'],
      body: 'Plan weeks at a time, track pantry inventory, and auto-generate consolidated shopping lists. Built as a JSP servlet app over MySQL.',
    },
  },
  'shade': {
    name: 'SHADE',
    lineIds: ['tech-top'],
    city: 'Web Assistant',
    postcardImage: 'portfolio-content/GreenLine/Stations/yonge.png',
    postcardKicker: 'station reference',
    postcardTitle: 'Sheppard-Yonge',
    funFactLabel: 'Fun fact about Sheppard-Yonge',
    funFact: 'Sheppard-Yonge was built for a network that never came. SHADE was built for a future where your computer just listens. One of us is still waiting.',
    galleryImages: [
      {
        src: 'portfolio-content/GreenLine/software-projects/shade.png',
        caption: 'SHADE',
      },
    ],
    content: {
      kind: 'project',
      title: 'SHADE',
      tagline: 'Browser-based virtual assistant — speak, ask, navigate.',
      stack: ['JavaScript', 'HTML/CSS', 'Web Speech API'],
      body: 'A lightweight assistant living in the browser. Wake-word listening, intent routing, and small built-in skills (open tabs, do quick maths, fetch weather).',
    },
  },
  'timetable-builder': {
    name: 'Timetable Builder',
    lineIds: ['tech-top'],
    city: 'Schedule Tool',
    postcardImage: 'portfolio-content/GreenLine/Stations/museum.png',
    postcardKicker: 'station reference',
    postcardTitle: 'Museum',
    funFactLabel: 'Fun fact about Museum Station',
    funFact: 'Museum Station is a certified archaeological exhibit disguised as a commute. This Timetable Builder is a survival tool disguised as an app.',
    galleryImages: [
      {
        src: 'portfolio-content/GreenLine/software-projects/timetable.png',
        caption: 'Timetable Builder',
      },
    ],
    content: {
      kind: 'project',
      title: 'Timetable Builder',
      tagline: 'Schedule-planning utility for building clean weekly timetables.',
      stack: ['JavaScript', 'HTML/CSS'],
      body: 'A timetable-building tool for laying out classes, commitments, and time blocks without turning the week into a puzzle box.',
      url: 'https://github.com/SeriousGuy888/csc207-team-project',
    },
  },
  'banger-generator': {
    name: 'Banger Generator',
    lineIds: ['tech-top', 'creative'],
    interchange: ['creative'],
    splitDot: [COLOR_TECH, COLOR_CREAT],
    city: 'Music Tool',
    content: {
      kind: 'project',
      title: 'Banger Generator',
      tagline: 'Procedural beat-pattern generator — drums in, drums out.',
      stack: ['Python', 'NumPy', 'librosa', 'MIDI'],
      body: 'Takes a seed groove and produces variations in adjacent styles. Built off Markov drum-pattern models trained on tagged stems. Interchanges with the Creative Line — this one\'s as much music as it is software.',
    },
  },
  'ghostnote': {
    name: 'Ghostnote',
    lineIds: ['tech-top', 'creative'],
    interchange: ['creative'],
    splitDot: [COLOR_TECH, COLOR_CREAT],
    city: 'Audio Tool',
    content: {
      kind: 'project',
      title: 'Ghostnote',
      tagline: 'Vocals & instrument audio separator — pull stems from any track.',
      stack: ['Python', 'Flask', 'Spleeter'],
      body: 'A friendly UI over Spleeter for amateur producers and drummers. Drop a track, get stems for vocals / drums / bass / other. Lives on the Tech Line, interchanges with the Creative Line because it\'s a music tool.',
    },
  },

  // ══ TECH LINE — BOTTOM (Game Dev) ═══════════════════════════
  'graviton': {
    name: 'Graviton',
    lineIds: ['tech-bottom'],
    city: 'Physics Game',
    bgSketch: 'graviton-space',
    postcardImage: 'portfolio-content/GreenLine/Stations/yorkdale.png',
    postcardKicker: 'station reference',
    postcardTitle: 'Yorkdale',
    funFactLabel: 'Fun fact about Yorkdale',
    funFact: 'Yorkdale has 60 metres of perfectly maintained platform that serves absolutely no one. Graviton has a single particle that controls everything. Funny how the smallest things do more than the biggest spaces.',
    galleryImages: [
      {
        src: 'portfolio-content/GreenLine/gamedev-projects/graviton.png',
        caption: 'Graviton',
      },
      {
        src: 'portfolio-content/GreenLine/gamedev-projects/graviton2.png',
        caption: 'Graviton',
      },
    ],
    content: {
      kind: 'project',
      title: 'Graviton',
      tagline: 'Physics puzzle game — you are the graviton particle.',
      meta: 'Godot Game Jam 80 · Top 30% globally',
      stack: ['Godot', 'GDScript'],
      body: 'Control gravity to navigate puzzles built from rigid-body interactions. Built in 9 days for the jam.',
      url: 'https://abush27.itch.io/graviton',
    },
  },
  'hunters-hollow': {
    name: "Hunter's Hollow",
    lineIds: ['tech-bottom'],
    city: 'Exploration Game',
    bgSketch: 'hunters-forest',
    postcardImage: 'portfolio-content/GreenLine/Stations/rosedale.png',
    postcardKicker: 'station reference',
    postcardTitle: 'Rosedale',
    funFactLabel: 'Fun fact about Rosedale',
    funFact: 'Rosedale Station is Toronto\'s best kept secret, a forest entrance that nobody uses. Hunter\'s Hollow is full of animals that made the same assumption about hunters.',
    galleryImages: [
      {
        src: 'portfolio-content/GreenLine/gamedev-projects/hunters.png',
        caption: "Hunter's Hollow",
      },
      {
        src: 'portfolio-content/GreenLine/gamedev-projects/hunters1.png',
        caption: "Hunter's Hollow",
      },
      {
        src: 'portfolio-content/GreenLine/gamedev-projects/hunters2.png',
        caption: "Hunter's Hollow",
      },
      {
        src: 'portfolio-content/GreenLine/gamedev-projects/hunters3.png',
        caption: "Hunter's Hollow",
      },
    ],
    content: {
      kind: 'project',
      title: "Hunter's Hollow",
      tagline: 'Atmospheric exploration game — quiet woods, big mood.',
      stack: ['Godot', 'GDScript'],
      url: 'https://abush27.itch.io/hunter-hollow',
    },
  },
  'midnight-assassin': {
    name: 'Midnight Assassin',
    lineIds: ['tech-bottom'],
    city: 'Stealth Game',
    postcardKicker: 'station reference',
    postcardTitle: 'Osgoode',
    funFactLabel: 'Fun fact about Osgoode',
    funFact: 'Osgoode Station is named after William Osgoode, the very first Chief Justice of Upper Canada, a man whose job was catching criminals. Midnight Assassin is a game about becoming one.',
    galleryImages: [
      {
        src: 'portfolio-content/GreenLine/gamedev-projects/midnight.png',
        caption: 'Midnight Assassin',
      },
      {
        src: 'portfolio-content/GreenLine/gamedev-projects/midnight2.png',
        caption: 'Midnight Assassin',
      },
      {
        src: 'portfolio-content/GreenLine/gamedev-projects/midnight3.png',
        caption: 'Midnight Assassin',
      },
    ],
    content: {
      kind: 'project',
      title: 'Midnight Assassin',
      tagline: 'Stealth-action prototype — patrol routes, line-of-sight, panic.',
      stack: ['Godot', 'GDScript'],
      url: 'https://abush27.itch.io/midnight-assassin',
    },
  },
  'lunch-brake': {
    name: 'Lunch Brake',
    lineIds: ['tech-bottom'],
    city: 'Runner Game',
    postcardImage: 'portfolio-content/GreenLine/Stations/college.png',
    postcardKicker: 'station reference',
    postcardTitle: 'College',
    funFactLabel: 'Fun fact about College',
    funFact: 'The most medically dense block in Canada is directly above College Station. Everyone up there skipped lunch. Lunch Brake was made for them.',
    galleryImages: [
      {
        src: 'portfolio-content/GreenLine/gamedev-projects/lunch.png',
        caption: 'Lunch Brake',
      },
      {
        src: 'portfolio-content/GreenLine/gamedev-projects/lunch2.png',
        caption: 'Lunch Brake',
      },
      {
        src: 'portfolio-content/GreenLine/gamedev-projects/lunch3.png',
        caption: 'Lunch Brake',
      },
    ],
    content: {
      kind: 'project',
      title: 'Lunch Brake',
      tagline: 'Endless-runner about getting to the cafeteria before the bell.',
      stack: ['Godot', 'GDScript'],
      body: 'Built in a weekend. Avoid teachers, snatch sandwiches, vault over backpacks. Procedural hallway generation, escalating speed.',
    },
  },

  // ══ CREATIVE LINE (Singapore Circle Line) ═══════════════════
  'music-portfolio': {
    name: 'Music Portfolio',
    lineIds: ['creative'],
    city: 'Singapore',
    content: { kind: 'placeholder', note: 'Recordings & arrangements being mastered.' },
  },
  'drumming': {
    name: 'Drumming & Performances',
    lineIds: ['creative'],
    city: 'Singapore',
    content: { kind: 'placeholder', note: 'Track listing being chartered.' },
  },
  'bands': {
    name: 'Bands',
    lineIds: ['creative'],
    city: 'Singapore',
    content: { kind: 'placeholder', note: 'Set lists & band rosters being soundchecked.' },
  },
  'certifications': {
    name: 'Certifications',
    lineIds: ['creative'],
    city: 'Singapore',
    content: { kind: 'placeholder', note: 'Grades and certifications being filed.' },
  },

  // BACSA Hacks station removed along with the special-service stub.
};

// ─── SERVICE ALERTS ─────────────────────────────────────────────
const ALERTS = [
  { severity: 'good',  text: 'Good service on all lines. Engineer is on board.' },
  { severity: 'minor', text: 'Minor delays on the Creative Line — extended drum solo at the loop apex.' },
  { severity: 'minor', text: 'Tech Line dual-track operating normally. Top track express; bottom track local.' },
  { severity: 'info',  text: 'Founder Line: expect crowding at UWC Hacks during peak hours.' },
  { severity: 'minor', text: 'Journey Line delayed by a 3.57 GPA recalculation. Southbound only.' },
  { severity: 'info',  text: 'Lost & Found: one badminton racket reported at Central Station.' },
  { severity: 'info',  text: 'Tech Line — Game Dev branch: trains gravity-assisted, expect occasional respawn.' },
  { severity: 'good',  text: 'Fresh chai detected on Journey Line trains. Service unaffected.' },
  { severity: 'info',  text: 'Creative Line is a loop. Trains run continuously; mind the doors.' },
];

window.MAP_DATA = { LINES, STATIONS, CENTRAL, ALERTS, LOOP, LOOP_STATIONS };
