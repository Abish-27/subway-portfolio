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
      { x: 700, y: 810, station: 'mindgate' },
      { x: 700, y: 710, station: 'bacsa' },
      { x: 700, y: 620 },
      { x: 700, y: 540, station: 'central' },
    ],
  },
  // Journey work spur removed — mindgate + bacsa now sit on the main
  // journey line's vertical arm.
  // ─── BUILDS & VENTURES LINE — NYC/NJ TRANSIT — BOLD RED ──────
  {
    id: 'founders',
    name: 'Builds & Ventures Line',
    short: 'L4',
    color: COLOR_FOUND,
    colorDim: COLOR_FOUND_D,
    city: 'Ventures / Hardware',
    cityInspiration: 'MTA · NJ Transit',
    cityFont: "'Oswald', sans-serif",
    direction: 'Southwest — Ventures & Builds',
    waypoints: [
      { x: 700, y: 540, station: 'central' },
      { x: 560, y: 620, station: 'tides' },
      { x: 360, y: 735, station: 'prototype-lab' },
      { x: 165, y: 830, station: 'hardware-projects' },
      { x: 45,  y: 715, station: 'hackathons' },
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
      { x: 280, y: 188, station: 'shade' },
      { x: 470, y: 188, station: 'green-slot-1' },
      { x: 660, y: 188, station: 'stock-trader' },
      { x: 800, y: 230, station: 'timetable-builder' },
      { x: 920, y: 305 },
      LOOP_STATIONS['banger-generator'],
      LOOP_STATIONS['ghostnote'],
    ],
  },
  // ─── TECH LINE — BOTTOM TRACK — GAME DEV ─────────────────────
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
      { x: 660, y: 418, station: 'trial-in-error' },
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
    ticketBlurb: 'Main interchange for the whole portfolio: education, projects, games, ventures, hackathons, and creative work branch out from here.',
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
      about: 'Hey! I’m Abish, a CS Specialist + Cognitive Science Major at the University of Toronto. I love building things and have extensive experience across the full stack: mobile, game dev, data tools, audio/ML, Java/JSP internship work, React Native mobile, Godot game jams, and the occasional Arduino contraption. Shoot me a message/email if you wanna talk!',
      image: {
        src: 'portfolio-content/me.JPG',
        caption: 'Station operator',
      },
      socials: [
        { label: 'GitHub',   icon: 'GH',   tone: 'github',   value: 'Abish-27',                url: 'https://github.com/Abish-27' },
        { label: 'LinkedIn', icon: 'in',   tone: 'linkedin', value: 'abish-kulkarni',          url: 'https://www.linkedin.com/in/abish-kulkarni-83b666231/' },
        { label: 'itch.io',  icon: 'itch', tone: 'itch',     value: 'abush27.itch.io',         url: 'https://abush27.itch.io/' },
        { label: 'Email',    icon: '@',    tone: 'email',    value: 'abishkulkarni@gmail.com', url: 'mailto:abishkulkarni@gmail.com' },
      ],
      personalTags: [
        { label: 'Fav show', value: 'Game of Thrones' },
        { label: 'Fav sport', value: 'Badminton' },
        { label: 'Fav sport to watch', value: 'Formula 1, Ferrari fan' },
        { label: 'Currently listening to', value: 'Malcolm Todd' },
        { label: 'Current fav food', value: 'Malatang' },
        { label: 'Fav game', value: 'The Legend of Zelda: BOTW' },
        { label: 'Fav superhero', value: 'Spider-Man' },
        { label: 'Fav city', value: 'Can\'t decide' },
        { label: 'Fav transit', value: 'Singapore MRT' },
        { label: 'Fav movie', value: 'Whiplash' },
      ],
    },
  },

  // ══ JOURNEY LINE (Toronto TTC) ══════════════════════════════
  'education': {
    name: 'Volunteering',
    lineIds: ['journey'],
    city: 'Toronto',
    ticketBlurb: 'Service work across Qifa Primary School in Singapore and Shree Mangal DVIP in Nepal, including childcare, tutoring, events, and fundraising.',
    content: {
      kind: 'list',
      items: [
        { title: 'Shree Mangal DVIP, Nepal',
          subtitle: 'Fundraising lead — supporting children\'s education in Kathmandu',
          meta: 'Volunteering',
          body: 'Visited and volunteered at Shree Mangal DVIP, a non-profit boarding school for students in Kathmandu, Nepal. Organized fundraisers, events, and merchandise sales in Singapore, raising over $10,000 toward the school.',
          images: [
            { src: 'portfolio-content/BlueLine/him.png', caption: 'Himalayan Global Concern' },
          ] },
        { title: 'Qifa Primary School',
          subtitle: 'Childcare volunteer — Singapore',
          meta: 'Volunteering',
          body: 'Volunteered at an after-school childcare service for primary-school students in Singapore. Organized weekly activities, sessions, and games, building stronger communication, patience, and group-management skills throughout my IB years.',
          images: [
            { src: 'portfolio-content/BlueLine/qifa.png', caption: 'Qifa Primary School' },
            { src: 'portfolio-content/BlueLine/qifa2.png', caption: 'Qifa Primary School' },
          ] },
      ],
    },
  },
  'mindgate': {
    name: 'Mindgate Solutions',
    lineIds: ['journey'],
    city: 'Finance Tool',
    ticketBlurb: 'Java software developer internship building a bank admin portal with JSP, MySQL, CRUD workflows, and secure data access.',
    content: {
      kind: 'project',
      title: 'Java Software Developer Intern',
      tagline: 'Mindgate Solutions · Mumbai',
      meta: 'Jul 2023 — Aug 2023',
      stack: ['Java', 'JSP', 'HTML/CSS', 'MySQL', 'SQL'],
      body: 'Developed a Java-based admin portal for bank employees, supporting CRUD operations across customer and operational data. Built full-stack features with JSP front ends and MySQL-backed data layers, enabling secure retrieval, updates, and management across relational tables.',
      featuresTitle: 'Internship Work',
      featureSections: [
        {
          title: 'Bank Admin Portal',
          items: [
            { label: 'CRUD workflows', detail: 'Built screens and backend logic for creating, reading, updating, and managing customer and operational records.' },
            { label: 'Database connectivity', detail: 'Integrated SQL access through the Java backend to fetch and update relational data securely.' },
            { label: 'Security exposure', detail: 'Worked with encryption and security measures for safer transmission and storage of sensitive information.' },
            { label: 'Full-stack practice', detail: 'Gained hands-on experience across Java/JSP, HTML/CSS, database-backed workflows, and system design basics.' },
          ],
        },
      ],
      images: [
        { src: 'portfolio-content/BlueLine/mg1.png', caption: 'Mindgate Solutions' },
        { src: 'portfolio-content/BlueLine/mg2.png', caption: 'Mindgate Solutions' },
      ],
    },
  },
  'bacsa': {
    name: 'BACSA',
    lineIds: ['journey'],
    city: 'Toronto',
    ticketBlurb: 'UofT Biotechnology & CS Association leadership: VP of Computer Science, hackathon planning, technical challenge design, and sponsorship work.',
    content: {
      kind: 'project',
      title: 'Biotechnology & CS Association',
      tagline: 'Vice President of Computer Science · University of Toronto',
      meta: 'Sep 2025 — Present',
      stack: ['Python', 'Biopython', 'OpenCV', 'Google Gemini API', 'Event Operations', 'Sponsorship'],
      body: 'Serving as Vice President of Computer Science after first leading BACSA\'s hackathon portfolio. I oversee the CS department, coordinate with the association\'s other teams, and help turn biotech ideas into technical programming, workshops, and flagship events.',
      links: [
        { label: 'BACSA Website', url: 'https://www.bacsauoft.ca/' },
      ],
      images: [
        { src: 'portfolio-content/RedLine/bacsahacks.jpeg', caption: 'BACSA' },
        { src: 'portfolio-content/BlueLine/bacsa2.jpeg', caption: 'BACSA' },
        { src: 'portfolio-content/BlueLine/bacsa3.jpeg', caption: 'BACSA' },
      ],
      featuresTitle: 'Leadership Work',
      featureSections: [
        {
          title: 'Vice President, Computer Science',
          items: [
            { label: 'May 2026 - Present', detail: 'Overseeing the CS department, managing a team of 6-8, and coordinating with 6 other departments across BACSA.' },
            { label: 'Technical programming', detail: 'Helping shape the association\'s CS-facing workshops, technical programming, and flagship event support.' },
          ],
        },
        {
          title: 'Director of Hackathon',
          items: [
            { label: 'Sep 2025 - May 2026', detail: 'Led planning and execution for an interdisciplinary Forensics & Biotech Hackathon with 100+ participants, with planning scaled toward 250+ participants.' },
            { label: 'Challenge design', detail: 'Designed technical tracks in DNA sequence analysis, fingerprint identification, and microbiome data analysis using Python, Biopython, and OpenCV.' },
            { label: 'Operations', detail: 'Owned logistics, budgeting, marketing, sponsorship packages, and event operations.' },
            { label: 'Partnerships', detail: 'Secured MLH sponsorship, Google Gemini API access, judges, industry mentors, and technical support through targeted outreach.' },
          ],
        },
      ],
    },
  },
  'shree-mangal': {
    name: 'Education',
    lineIds: ['journey'],
    city: 'Singapore',
    ticketBlurb: 'IB Diploma at UWCSEA, following IGCSE studies at OFS in Singapore.',
    content: {
      kind: 'list',
      items: [
        {
          title: 'United World College of South East Asia (UWCSEA)',
          subtitle: 'IB Diploma · Grades 11–12 · Singapore',
          meta: '2022–2024',
          extra: '41/45',
          body: `
            <span class="level-block">
              <strong class="level-label level-hl">Higher Level</strong>
              Mathematics: Analysis and Approaches, Computer Science, and Physics
            </span>
            <span class="level-block">
              <strong class="level-label level-sl">Standard Level</strong>
              Business Management, French B, and Language and Literature
            </span>`,
        },
        {
          title: 'Overseas Family School (OFS)',
          subtitle: 'IGCSE · Grades 9–10 · Singapore',
          meta: '2020–2022',
          extra: '7 A*s',
          body: 'Completed the IGCSE programme with <strong class="result-highlight">seven A* grades</strong>. Received the <strong>Principal’s Award</strong> in both Grade 9 and Grade 10.',
        },
        {
          title: 'Extracurricular Activities',
          subtitle: 'UWCSEA · Singapore',
          meta: 'Student Life',
          body: `
            <span class="activity-grid">
              <span class="activity-chip activity-sport"><strong>Varsity Badminton</strong><small>School team</small></span>
              <span class="activity-chip activity-leadership"><strong>Psychology Society</strong><small>Executive</small></span>
              <span class="activity-chip activity-academic"><strong>Model United Nations</strong><small>Club member · Multiple conferences</small></span>
              <span class="activity-chip activity-sport"><strong>Cross Country</strong><small>School team</small></span>
              <span class="activity-chip activity-creative"><strong>Percussion Ensemble</strong><small>Ensemble member</small></span>
            </span>`,
        },
        {
          title: 'Community Service & Volunteering',
          subtitle: 'Singapore & Nepal',
          meta: 'Service',
          stationLink: {
            stationId: 'education',
            label: 'Continue to the VOL station',
          },
          body: `
            <span class="service-entry">
              <strong>Qifa Primary School</strong>
              <span>Supported an after-school childcare service for primary-school students in Singapore.</span>
            </span>
            <span class="service-entry">
              <strong>Himalayan Global Concern</strong>
              <span>Helped raise funds for Shree Mangal DVIP School, supporting underprivileged youth in Nepal.</span>
            </span>`,
        },
      ],
    },
  },
  'qifa': {
    name: 'UofT',
    lineIds: ['journey'],
    city: 'Toronto',
    ticketBlurb: 'University of Toronto CS Specialist and Cognitive Science student, ASIP co-op, Dean\'s List Scholar, with coursework mapped by subject.',
    content: {
      kind: 'project',
      title: 'University of Toronto',
      tagline: 'BSc, Computer Science Specialist · ASIP Co-op',
      meta: 'Sep 2024 — May 2028',
      body: 'Studying Computer Science Specialist with Cognitive Science at the University of Toronto. Dean\'s List Scholar (2025); CGPA: 3.57.',
      coursework: [
        {
          group: 'Computer Science',
          sections: [
            {
              status: 'Completed',
              items: [
                ['CSC110Y1', 'Foundations of Computer Science I'],
                ['CSC111H1', 'Foundations of Computer Science II'],
                ['CSC207H1', 'Software Design'],
                ['CSC209H1', 'Software Tools & Systems Programming'],
                ['CSC236H1', 'Introduction to the Theory of Computation'],
                ['CSC258H1', 'Computer Organization'],
                ['CSC263H1', 'Data Structures & Analysis'],
              ],
            },
            {
              status: 'In progress',
              items: [
                ['CSC311H1', 'Introduction to Machine Learning'],
                ['CSC384H1', 'Introduction to Artificial Intelligence'],
              ],
            },
            {
              status: 'Transfer credit',
              items: [
                ['CSC1***', 'Computer Science transfer credit from IB Computer Science Higher Level'],
              ],
            },
          ],
        },
        {
          group: 'Statistics / Mathematics',
          sections: [
            {
              status: 'Completed',
              items: [
                ['MAT137Y1', 'Calculus with Proofs'],
                ['MAT223H1', 'Linear Algebra I'],
                ['MAT235Y1', 'Multivariable Calculus'],
                ['STA130H1', 'Statistical Reasoning'],
                ['STA237H1', 'Probability, Statistics and Data Analysis I'],
              ],
            },
            {
              status: 'Transfer credit',
              items: [
                ['MAT1***', 'Mathematics transfer credit from IB Mathematics: Analysis and Approaches Higher Level'],
              ],
            },
          ],
        },
        {
          group: 'Psychology / Cognitive Science',
          sections: [
            {
              status: 'Completed',
              items: [
                ['PSY100H1', 'Introduction to Psychology'],
                ['PSY270H1', 'Introduction to Cognitive Psychology'],
                ['COG250Y1', 'Cognitive Science'],
                ['PSY290H1', 'Behavioural Neuroscience'],
              ],
            },
          ],
        },
        {
          group: 'Other',
          sections: [
            {
              status: 'Completed',
              items: [
                ['PHY199H1', 'Dark Matter and Dark Energy'],
                ['POL101H1', 'The Real World of Politics: An Introduction'],
                ['PDC220H1', 'Arts & Science Internship Program: Maximizing Your Experience'],
                ['PDC221H1', 'Arts & Science Internship Program: Essential Skills for ASIP Success'],
              ],
            },
            {
              status: 'Transfer credit',
              items: [
                ['PHY1***', 'Two Physics transfer credits from IB Physics Higher Level'],
              ],
            },
          ],
        },
      ],
    },
  },

  // ══ FOUNDER LINE (NYC/NJ Transit) ═══════════════════════════
  'hackathon-director': {
    name: 'Hackathon Director',
    lineIds: ['founders'],
    city: 'Toronto',
    ticketBlurb: 'BACSA Hacks organizer station: biotech, health, and forensic reasoning challenges with technical tracks and event operations.',
    content: {
      kind: 'project',
      title: 'BACSA Hacks',
      tagline: 'Organizer · BACSA, University of Toronto',
      meta: '100+ participants',
      body: 'Organizing BACSA Hacks, a biotech and health-focused hackathon with open product-building tracks and a closed forensic reasoning challenge. Owning logistics, sponsorship, challenge design, and outreach end-to-end.',
      links: [
        { label: 'Devpost', url: 'https://bacsa-hacks26.devpost.com/' },
      ],
      featuresTitle: 'Challenge Tracks',
      featureSections: [
        {
          title: 'Open Challenge',
          items: [
            { label: 'Themes', detail: 'Teams can build products around disease detection or health improvement, including DNA tools, image recognition, body scans, nutrition trackers, or medication trackers.' },
          ],
        },
        {
          title: 'Closed Challenge',
          items: [
            { label: 'Forensics system', detail: 'Teams build a support system that takes biological crime-scene evidence and outputs ranked suspects, confidence scores, and a reasoning analysis.' },
            { label: 'Judging focus', detail: 'Success depends on uncertainty modeling, assumptions, and forensic interpretation, not only picking one correct answer.' },
          ],
        },
      ],
      images: [
        { src: 'portfolio-content/RedLine/bacsahacks.jpeg', caption: 'BACSA Hacks' },
      ],
    },
  },
  'sutd-hackathon': {
    name: 'What The Hack 2023',
    lineIds: ['founders'],
    city: 'Singapore',
    ticketBlurb: 'What The Hack 2023 project: Smart Cane, a sensor and feedback based mobility prototype for visually impaired users.',
    content: {
      kind: 'project',
      title: 'What The Hack 2023 — Smart Cane',
      tagline: 'Singapore University of Technology & Design',
      stack: ['Sensors', 'Motors', 'Buzzers', 'Arduino'],
      body: 'Built Smart Cane, a modified walking cane for visually impaired users. The prototype used sensors, motors, buzzers, and trigger feedback to help with navigation and make mobility support more inclusive.',
      images: [
        { src: 'portfolio-content/RedLine/sutd.png', caption: 'What The Hack 2023' },
      ],
    },
  },
  'uwc-hacks': {
    name: 'UWC Hacks',
    lineIds: ['founders'],
    interchange: ['journey'],
    splitDot: [COLOR_FOUND, COLOR_JOURN],
    crossRef: { stationId: 'shree-mangal', label: 'See: Education on Journey Line' },
    city: 'Singapore',
    ticketBlurb: 'UWCHacks winning project: Thrive, a BMI, meal-plan, and workout-planning platform built for the “Making everyday life better” prompt.',
    content: {
      kind: 'list',
      items: [
        { title: 'UWCHacks',
          subtitle: '1st Place · United World College SEA',
          extra: '1st',
          body: 'Built Thrive with Team Serial Coders for the prompt "Making everyday life better." Thrive helps overweight and obese adults calculate BMI, get meal-plan suggestions, and receive workout plans based on their target weight and physique.',
          images: [
            { src: 'portfolio-content/RedLine/thrive.png', caption: 'Thrive' },
          ],
          imagesLayout: 'beside-text' },
      ],
    },
  },
  'utra-hacks': {
    name: 'UTRA Hacks',
    lineIds: ['founders'],
    city: 'Toronto',
    ticketBlurb: 'UTRAHacks builds including TrusToken, a blockchain credential platform, and autonomous robot car prototypes with sensors and claw control.',
    content: {
      kind: 'list',
      items: [
        { title: 'UTRAHacks 2026 — TrusToken & Autonomous Vehicle',
          subtitle: '3rd Place · University of Toronto Robotics',
          extra: '3rd',
          body: 'Built TrusToken, a blockchain-powered trust verification platform where achievements and roles can be issued, claimed, and verified as NFT credentials. Also prototyped a two-wheel autonomous vehicle with path following, colour sensing, ultrasonic detection, and a simple arm mechanism.',
          url: 'https://devpost.com/software/dontgotoneyet',
          images: [
            { src: 'portfolio-content/RedLine/trus.png', caption: 'TrusToken' },
          ],
          imagesLayout: 'beside-text' },
        { title: 'UTRAHacks 2025 — Robot Car',
          subtitle: '3rd Place',
          extra: '3rd',
          body: 'Built an autonomous car that could drive by itself, open and close a claw, detect coloured tiles, and avoid obstacles. The build used a TCS230/TCS3200 colour sensor, ultrasonic sensor, 2 DC motors, 1 servo motor, a motor driver, a 9V battery, and an Arduino Uno R4 Minima.',
          url: 'https://devpost.com/software/lightning-mcqueen',
          images: [
            { src: 'portfolio-content/RedLine/utra1.PNG', caption: 'UTRAHacks 2025 Robot Car' },
          ],
          imagesLayout: 'beside-text' },
      ],
    },
  },
  'tides': {
    name: 'Tides',
    lineIds: ['founders'],
    city: 'Co-Founder & CTO',
    ticketBlurb: 'Pre-launch booking marketplace helping entertainment venues fill off-peak slots with targeted local deals.',
    markerLogo: 'portfolio-content/RedLine/tides-logo.png',
    postcardImage: 'portfolio-content/RedLine/tides-logo.png',
    postcardKicker: 'venture station',
    postcardTitle: 'Tides',
    funFactLabel: 'Current Status',
    funFact: 'The live public site is up at tides.deals while the booking marketplace, vendor tools, recommendation engine, and mobile app continue toward launch.',
    galleryImages: [
      { src: 'portfolio-content/RedLine/tides1.png', caption: 'Live Tides website at tides.deals' },
      { src: 'portfolio-content/RedLine/tides2.png', caption: 'Consumer home feed with venues, discounts, and offers' },
      { src: 'portfolio-content/RedLine/tides3.png', caption: 'Pick For Me AI recommendation flow' },
      { src: 'portfolio-content/RedLine/tides4.png', caption: 'Map-based discovery for nearby activities' },
      { src: 'portfolio-content/RedLine/tides5.png', caption: 'Vendor dashboard for creating and managing discounts' },
      { src: 'portfolio-content/RedLine/tides6.png', caption: 'Sample redeemable coupon experience' },
    ],
    content: {
      kind: 'project',
      title: 'Tides',
      tagline: 'Booking marketplace for off-peak entertainment deals at venues like bowling alleys, golf venues, and escape rooms.',
      meta: 'Co-Founder & CTO · Jul 2025 to Present',
      stack: ['React Native', 'TypeScript', 'Expo', 'Supabase', 'PostgreSQL', 'Maps', 'AI Recommendations'],
      body: 'I am the sole engineer architecting and building Tides across the website, app experience, backend infrastructure, business onboarding flow, and deal-management system. The product helps activity businesses fill quieter time slots by offering targeted deals to nearby customers, with discovery built around venue offers, availability, maps, and personalized picks.',
      links: [
        { label: 'Live Site', url: 'https://tides.deals' },
      ],
      featureLayout: 'below-media',
      featuresTitle: 'What I Am Building',
      featureSections: [
        {
          title: 'Marketplace Core',
          items: [
            { label: 'Off-peak deals', detail: 'Venue partners can create targeted discounts for slower time slots instead of leaving capacity unused.' },
            { label: 'Booking flow', detail: 'The app experience is built around finding an activity, choosing an offer, and redeeming a coupon cleanly.' },
            { label: 'Mobile and web', detail: 'The system is being designed across consumer mobile screens, the public website, and partner-facing tools.' },
          ],
        },
        {
          title: 'Engineering Ownership',
          items: [
            { label: 'Sole engineer', detail: 'I am owning the architecture and implementation across React Native, Expo, TypeScript, Supabase, and PostgreSQL.' },
            { label: 'Backend design', detail: 'Designed the schema and backend integrations that power venue offers, availability, customer discovery, and partner workflows.' },
            { label: 'Partner requirements', detail: 'Translate feedback from prospective venues into product features and engineering decisions across the stack.' },
          ],
        },
        {
          title: 'Discovery Intelligence',
          items: [
            { label: 'Pick For Me', detail: 'Built a custom recommendation flow that selects the best option based on preferences and swipe history.' },
            { label: 'Map discovery', detail: 'Users can explore nearby activity deals geographically instead of only scrolling through a flat list.' },
            { label: 'Discount optimization', detail: 'Working on AI-assisted discount optimization so offers can better match demand, timing, and user intent.' },
          ],
        },
      ],
    },
  },

  // ══ TECH LINE — TOP (Software Projects) ═════════════════════
  'tech-skills': {
    name: 'Technical Skills & Libraries',
    lineIds: ['tech-top', 'tech-bottom'],
    type: 'terminus',
    city: 'Tech Stack',
    bgSketch: 'cn-tower',
    ticketBlurb: 'Technical stack station covering languages, frameworks, databases, libraries, developer tools, game engines, and local AI tooling.',
    content: {
      kind: 'skills',
      groups: [
        { label: 'Languages',  items: ['Python','Java','TypeScript','JavaScript','C','C++','C#','SQL','HTML/CSS','GDScript','R'] },
        { label: 'Frameworks & Databases', items: ['React','React Native','Expo','Node.js','Flask','FastAPI','Django','Java Servlet','PostgreSQL','MySQL','Supabase'] },
        { label: 'Libraries',  items: ['pandas','NumPy','scikit-learn','TensorFlow','OpenCV','Matplotlib','googleTTS','yfinance','Spleeter','Biopython'] },
        { label: 'Developer Tools', items: ['Git/GitHub','Docker','VS Code','IntelliJ','PyCharm','Eclipse','Figma','Godot','Unity','Arduino','Blender','Ollama'] },
      ],
    },
  },
  'stock-trader': {
    name: 'Stock Trader',
    lineIds: ['tech-top'],
    city: 'Finance Tool',
    ticketBlurb: 'Decision-tree stock screener and backtesting tool using historical market data, engineered features, and an interactive pygame UI.',
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
      links: [
        { label: 'GitHub', url: 'https://github.com/Abish-27/Stock-Decision-Trees' },
      ],
    },
  },
  'shade': {
    name: 'SHADE',
    lineIds: ['tech-top'],
    city: 'Local AI Assistant',
    ticketBlurb: 'Self-hosted local LLM assistant with Ollama, FastAPI, tool calling, SQLite tasks and calendar state, streaming, and local TTS.',
    postcardImage: 'portfolio-content/GreenLine/Stations/yonge.png',
    postcardKicker: 'station reference',
    postcardTitle: 'Sheppard-Yonge',
    funFactLabel: 'Fun fact about Sheppard-Yonge',
    funFact: 'Sheppard-Yonge was built for a network that never came. SHADE was built for a future where your computer just listens. One of us is still waiting.',
    galleryImages: [
      {
        src: 'portfolio-content/GreenLine/software-projects/shadellm.png',
        caption: 'SHADE local LLM dashboard',
      },
    ],
    content: {
      kind: 'project',
      title: 'SHADE',
      tagline: 'Self-hosted AI assistant running a local 14B model with real tools, voice, memory plans, and a PWA dashboard.',
      stack: ['Python 3.12', 'FastAPI', 'Ollama', 'Qwen3-14B', 'SQLite', 'SSE', 'PWA', 'Kokoro TTS', 'Tailscale', 'CUDA'],
      body: 'SHADE is a self-hosted assistant that runs Qwen3-14B locally, calls tools against a SQLite task and calendar database, streams replies into a PWA dashboard, and speaks through local neural TTS. The deeper build story is below.',
      featureLayout: 'below-media',
      featuresTitle: 'System Breakdown',
      featureSections: [
        {
          title: 'Agent Core',
          items: [
            { label: 'Tool loop', detail: 'The model can create, query, and complete tasks and calendar events instead of only chatting.' },
            { label: 'Streaming', detail: 'Replies stream to the browser over Server-Sent Events, so the UI feels alive while the model is still generating.' },
            { label: 'Data layer', detail: 'SQLite stores real assistant state for tasks, events, and tool results.' },
          ],
        },
        {
          title: 'Local Runtime',
          items: [
            { label: 'Model', detail: 'Qwen3-14B for chat and tool calling, plus nomic-embed-text for embedding work.' },
            { label: 'Backend', detail: 'FastAPI, Uvicorn, httpx, and OpenAI-compatible APIs during the runtime migration.' },
            { label: 'Voice', detail: 'Kokoro handles local neural speech, with Edge-TTS available as a fallback.' },
          ],
        },
        {
          title: 'Latency Work',
          items: [
            { label: 'Migration', detail: 'Moved the runtime from LM Studio to Ollama after testing both approaches.' },
            { label: 'Debugging story', detail: 'Tracked a 29s response delay to an API behavior around the thinking flag, then reworked the app around Ollama native calls.' },
            { label: 'Tuning', detail: 'GPU offload, KV-cache quantization, context sizing, and prompt-cache tuning brought responses under 1s.' },
          ],
        },
        {
          title: 'App Surface',
          items: [
            { label: 'Frontend', detail: 'Installable vanilla HTML/CSS/JS PWA with chat, live status core, and data panels.' },
            { label: 'Network', detail: 'Reachable from trusted devices through Tailscale/WireGuard instead of an exposed public port.' },
            { label: 'Security', detail: 'Layered access with a device IP allowlist and scoped Windows Firewall rule.' },
          ],
        },
        {
          title: 'Architecting Next',
          items: [
            { label: 'Memory', detail: 'Typed long-term memory planned on an Obsidian vault: episodic, semantic, procedural, preferences, people, and projects.' },
            { label: 'Retrieval', detail: 'Embedding-based semantic search and RAG are being designed around that vault.' },
            { label: 'Skills', detail: 'Routed skill system planned for faster-whisper, Canvas, portfolio tracking, and project management.' },
          ],
        },
        {
          title: 'What It Shows',
          items: [
            { label: 'System design', detail: 'A real assistant architecture with model calls, tools, database state, frontend streaming, and voice.' },
            { label: 'Edge AI', detail: 'A 14B model running on consumer hardware with practical latency engineering.' },
            { label: 'Architecture taste', detail: 'Specs for memory, skills, and context management came before building the next layer.' },
          ],
        },
      ],
    },
  },
  'timetable-builder': {
    name: 'Timetable Builder',
    lineIds: ['tech-top'],
    city: 'Schedule Tool',
    ticketBlurb: 'Schedule-planning utility for laying out classes, commitments, and weekly time blocks cleanly.',
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
    ticketBlurb: 'C program that generates randomized backing tracks with concurrent child processes, Unix pipes, and raw MIDI construction.',
    postcardImage: 'portfolio-content/GreenLine/software-projects/bg1.png',
    galleryImages: [
      {
        src: 'portfolio-content/GreenLine/software-projects/bg1.png',
        caption: 'Banger Generator parameters',
      },
      {
        src: 'portfolio-content/GreenLine/software-projects/bg2.png',
        caption: 'Generated track output',
      },
    ],
    content: {
      kind: 'project',
      title: 'Banger Generator',
      tagline: 'A C program that builds randomized backing tracks with child processes and raw MIDI.',
      stack: ['C', 'Unix Pipes', 'fork', 'Raw MIDI', 'TiMidity++'],
      body: 'Banger Generator creates backing tracks without using external music libraries. The parent process reads parameters like BPM, genre, key, and bar count, then coordinates separate instrument generators and stitches their output into one playable track.',
      mediaLayout: 'side-by-side',
      featureSections: [
        {
          title: 'How It Works',
          items: [
            { label: 'Parent process', detail: 'Reads the user settings and owns the final song assembly.' },
            { label: '3 child processes', detail: 'Spawns one concurrent child per instrument so tracks are generated independently.' },
            { label: 'Pipes', detail: 'Each child sends its MIDI track data back to the parent over a pipe.' },
            { label: 'Raw MIDI output', detail: 'The parent merges the tracks into a single .mid file by constructing the MIDI data directly.' },
            { label: 'OGG render', detail: 'The generated .mid is rendered to .ogg with TiMidity++.' },
          ],
        },
      ],
    },
  },
  'ghostnote': {
    name: 'Ghostnote',
    lineIds: ['tech-top', 'creative'],
    interchange: ['creative'],
    splitDot: [COLOR_TECH, COLOR_CREAT],
    city: 'Audio Tool',
    ticketBlurb: 'Flask and Spleeter app for isolating vocals or instruments from songs, then previewing and downloading the separated track.',
    postcardImage: 'portfolio-content/GreenLine/software-projects/gh1.png',
    galleryImages: [
      {
        src: 'portfolio-content/GreenLine/software-projects/gh1.png',
        caption: 'Ghostnote upload and separation flow',
      },
      {
        src: 'portfolio-content/GreenLine/software-projects/gh2.png',
        caption: 'Ghostnote generated track view',
      },
    ],
    content: {
      kind: 'project',
      title: 'Ghostnote',
      tagline: 'A Flask app for isolating vocals and instruments from any song.',
      stack: ['Python', 'Flask', 'Spleeter'],
      body: 'Ghostnote lets a user upload a song, choose which vocals or instruments they want to isolate, then play and download the generated track. The backend runs in Python with Flask, using Spleeter for the audio separation work.',
      mediaLayout: 'side-by-side',
      featureSections: [
        {
          title: 'Workflow',
          items: [
            { label: 'Upload', detail: 'Start with any song file.' },
            { label: 'Choose stems', detail: 'Select the vocals or instruments to extract.' },
            { label: 'Preview', detail: 'Play the generated track in the app before saving it.' },
            { label: 'Download', detail: 'Export the separated audio once it is ready.' },
          ],
        },
      ],
    },
  },

  // ══ TECH LINE — BOTTOM (Reserved Future Stations) ═══════════
  'green-slot-1': {
    name: 'Watchtower',
    lineIds: ['tech-top'],
    city: 'Observability',
    postcardImage: 'portfolio-content/GreenLine/software-projects/watchtower1.png',
    galleryImages: [
      {
        src: 'portfolio-content/GreenLine/software-projects/watchtower1.png',
        caption: 'Watchtower',
      },
      {
        src: 'portfolio-content/GreenLine/software-projects/watchtower2.png',
        caption: 'Watchtower',
      },
      {
        src: 'portfolio-content/GreenLine/software-projects/watchtower3.png',
        caption: 'Watchtower',
      },
      {
        src: 'portfolio-content/GreenLine/software-projects/watchtower4.png',
        caption: 'Watchtower',
      },
    ],
    ticketBlurb: 'Production-grade observability and incident response platform built on top of a URL shortener service.',
    content: {
      kind: 'project',
      title: 'Watchtower',
      tagline: 'Real-time monitoring, intelligent alerts, chaos testing, and self-healing incident response.',
      meta: 'MLH Production Engineering Hackathon · Incident Response Quest Track',
      stack: ['Flask', 'Peewee ORM', 'PostgreSQL', 'Discord Webhooks', 'psutil'],
      body: 'Built on top of a URL shortener service, Watchtower monitors the application in real time, fires alerts when incidents happen, injects chaos to prove resilience, and automatically heals itself when things go wrong.',
      links: [
        { label: 'GitHub', url: 'https://github.com/kikotc/pe-watchtower' },
        { label: 'Devpost', url: 'https://devpost.com/software/pe-watchtower' },
      ],
      featureSections: [
        {
          title: 'Monitoring & Alerting',
          items: [
            { label: 'Health checks', detail: 'Polls /health every 15s and detects service downtime and recovery.' },
            { label: 'Error rate monitoring', detail: 'Watches for 5xx spikes above 50% in a 2-minute window.' },
            { label: 'SLO burn rate alerting', detail: 'Calculates error budget burn using Google SRE\'s 14.4x threshold.' },
            { label: 'Discord alerts', detail: 'Sends rich embeds with role pings for downtime, recovery, high error rate, and burn-rate incidents.' },
            { label: 'Request tracing', detail: 'Adds a unique X-Request-ID header to every request for correlation.' },
          ],
        },
        {
          title: 'Chaos Engineering',
          items: [
            { label: 'Latency Injection', detail: 'Adds configurable delay to user-facing requests.' },
            { label: 'Error Storm', detail: 'Randomly returns 500 errors at a configurable rate.' },
            { label: 'Database Kill', detail: 'Severs the PostgreSQL connection and prevents reconnection.' },
            { label: 'CPU Stress', detail: 'Burns CPU cycles for a configurable duration.' },
            { label: 'Process Kill', detail: 'Sends SIGTERM to the Flask process to trigger self-healing.' },
            { label: 'Traffic Generator', detail: 'Creates synthetic traffic so chaos effects are visible in metrics.' },
          ],
        },
        {
          title: 'Self-Healing',
          items: [
            { label: 'Auto restart', detail: 'Detects consecutive health-check failures and restarts the Flask process.' },
            { label: 'Guardrails', detail: 'Respects a 30s cooldown and a 5-attempt retry limit.' },
            { label: 'Remediation alerts', detail: 'Sends Discord updates for each recovery attempt and final exhaustion state.' },
            { label: 'Action log', detail: 'Records remediation events to a ring buffer visible on the dashboard.' },
          ],
        },
        {
          title: 'Dashboard',
          items: [
            { label: 'Overview', detail: 'Live status, CPU/RAM/response-time/error-rate rings, SLO widget, incident history, recent failures, and error classification.' },
            { label: 'Data', detail: 'Top endpoints, active URLs, live JSON log feed, and events table.' },
            { label: 'Chaos', detail: 'Experiment controls, real-time chaos status, traffic generator, and remediation log.' },
            { label: 'Polling', detail: 'Password-protected panels update every 2s for near real-time operations.' },
          ],
        },
        {
          title: 'Public Status Page',
          items: [
            { label: '30-day history', detail: 'GitHub-style uptime bars for API Server, Database, and URL Shortener.' },
            { label: 'Live status', detail: 'Shows operational state, uptime percentage, and incident timeline with detection/resolution duration.' },
            { label: 'Out-of-band uptime', detail: 'Runs at / on port 5002 so it stays online even when the main app is down.' },
          ],
        },
        {
          title: 'Incident Runbook',
          items: [
            { label: 'Interactive guide', detail: 'Step-by-step response procedures at /dashboard/runbook.' },
            { label: 'Coverage', detail: 'Includes Service Down, High Error Rate, Database Unreachable, and Port Conflict procedures.' },
            { label: 'Operator aids', detail: 'Adds log-reading guidance and a severity classification table.' },
          ],
        },
      ],
    },
  },
  'green-slot-2': {
    name: 'Future Stop 2',
    lineIds: ['tech-bottom'],
    city: 'Reserved',
    ticketBlurb: 'Reserved green-line station. Project details can be dropped in later.',
    content: { kind: 'placeholder', note: 'Reserved for a future project station.' },
  },
  'green-slot-3': {
    name: 'Future Stop 3',
    lineIds: ['tech-bottom'],
    city: 'Reserved',
    ticketBlurb: 'Reserved green-line station. Project details can be dropped in later.',
    content: { kind: 'placeholder', note: 'Reserved for a future project station.' },
  },
  'green-slot-4': {
    name: 'Future Stop 4',
    lineIds: ['tech-bottom'],
    city: 'Reserved',
    ticketBlurb: 'Reserved green-line station. Project details can be dropped in later.',
    content: { kind: 'placeholder', note: 'Reserved for a future project station.' },
  },

  // ══ GAMES & BUILDS LINE (Game Dev) ═════════════════════════
  'graviton': {
    name: 'Graviton',
    lineIds: ['tech-bottom'],
    city: 'Physics Game',
    ticketBlurb: 'Godot game where Graviton Bob shifts gravity to route through a maze and survive hostile particle reactions.',
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
      tagline: 'Play as Graviton Bob and bend gravity to survive a maze of hostile particles.',
      meta: 'Godot Game Jam 80 · Top 30% globally',
      stack: ['Godot', 'GDScript'],
      body: 'Graviton is a maze survival game where you play as Graviton Bob, a little blob with one job: reach the end without dying. Instead of moving normally, you use the arrow keys to shift gravity around you. That changes how you fall, dodge, weave through routes, and deal with particles floating nearby.',
      featureSections: [
        {
          title: 'How It Plays',
          items: [
            { label: 'Arrow keys', detail: 'Control the direction of gravity around Graviton Bob.' },
            { label: 'Maze routing', detail: 'Find paths through obstacles by changing how you move through the space.' },
            { label: 'Survival', detail: 'Reach the end while avoiding particle collisions that can ruin a run.' },
          ],
        },
        {
          title: 'Controlled Chaos',
          items: [
            { label: 'Particle reactions', detail: 'Different enemies react differently when they touch you, including bouncing, exploding, and stabbing.' },
            { label: 'Theme fit', detail: 'Gravity affects both the player and nearby particles, creating chaos that feels unpredictable but still learnable.' },
            { label: 'Route planning', detail: 'The best path is not always obvious. You have to read the room, change gravity, and commit.' },
          ],
        },
      ],
      url: 'https://abush27.itch.io/graviton',
      playLabel: 'Play on itch.io',
    },
  },
  'hunters-hollow': {
    name: "Hunter's Hollow",
    lineIds: ['tech-bottom'],
    city: 'Exploration Game',
    ticketBlurb: 'Wave-based forest bounty game with rifle shots, ammo pressure, upgrade shopping, innocent animals, and timed bounty rushes.',
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
      tagline: 'A forest bounty game about picking the right target before your ammo runs dry.',
      stack: ['Godot', 'GDScript'],
      body: 'Hunter\'s Hollow is a wave-based hunting game set in a bright forest. You clear bounty animals with a rifle, earn cash, and buy stronger weapons in the shop. The catch is simple: innocent animals are off-limits, ammo is limited, and each wave gives you less room to waste shots.',
      featureSections: [
        {
          title: 'How It Plays',
          items: [
            { label: 'Left click', detail: 'Shoot with the rifle.' },
            { label: 'Esc', detail: 'Pause the game. Depending on focus, it may need a second press.' },
            { label: 'Shop', detail: 'Use bounty cash to buy weapon upgrades between waves.' },
          ],
        },
        {
          title: 'Wave Pressure',
          items: [
            { label: 'Bounty list', detail: 'Each wave has a set of animals you need to clear before moving on.' },
            { label: 'Escalation', detail: 'Later waves add more bounty spawns, faster animals, and tighter ammo conservation.' },
            { label: 'Bounty rush', detail: 'Every fourth wave switches you to a faster machine gun for a 10 to 15 second burst of target clearing.' },
          ],
        },
      ],
      url: 'https://abush27.itch.io/hunter-hollow',
      playLabel: 'Play on itch.io',
    },
  },
  'trial-in-error': {
    name: 'Trial in Error',
    lineIds: ['tech-bottom'],
    city: 'Paradox Game',
    postcardImage: './portfolio-content/GreenLine/gamedev-projects/tie.png?v=trial-in-error',
    galleryImages: [
      {
        src: './portfolio-content/GreenLine/gamedev-projects/tie.png?v=trial-in-error',
        caption: 'Trial in Error',
      },
      {
        src: './portfolio-content/GreenLine/gamedev-projects/tie2.png?v=trial-in-error',
        caption: 'Trial in Error',
      },
      {
        src: './portfolio-content/GreenLine/gamedev-projects/tie3.png?v=trial-in-error',
        caption: 'Trial in Error',
      },
    ],
    ticketBlurb: 'A time-loop game about trying to fix one miserable day and somehow making the timeline even worse.',
    content: {
      kind: 'project',
      title: 'Trial in Error',
      tagline: 'Paradox game about time travel, bad luck, and increasingly questionable choices.',
      meta: 'GDDC Summer 2026 Game Jam · Theme: Paradox · Built in ~4 days',
      stack: ['Godot', 'GDScript'],
      body: 'After a really bad day, you get the convenient ability to time travel and change your past decisions. Each run lets you alter the sequence of events and try for a better outcome, but time is a paradox: most fixes spiral into even worse endings. Somewhere in the mess is a strange path to a 5-star day.',
      url: 'https://abush27.itch.io/trial-in-error',
      playLabel: 'Play on itch.io',
    },
  },
  'lunch-brake': {
    name: 'Lunch Brake',
    lineIds: ['tech-bottom'],
    city: 'Assembly Puzzle Game',
    ticketBlurb: 'MIPS Assembly falling-gem puzzle game with matching, cascades, combo scoring, sound effects, and a persistent leaderboard.',
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
      tagline: 'A falling-gem puzzle game built entirely in MIPS Assembly.',
      stack: ['MIPS Assembly', 'Bitmap Display', 'Memory-Mapped I/O'],
      body: 'Lunch Brake is a match-three puzzle game made with zero libraries. Gems fall from the top of an 8 by 16 board in stacks of three. Match three or more of the same color horizontally, vertically, or diagonally to clear them, trigger cascades, build combo multipliers, and keep the board from filling up.',
      featureSections: [
        {
          title: 'Puzzle System',
          items: [
            { label: '8 by 16 board', detail: 'Rendered at 512 by 512 pixels using a bitmap display.' },
            { label: 'Gem matching', detail: 'Clears horizontal, vertical, and diagonal runs of three or more.' },
            { label: 'Cascading gravity', detail: 'Gems fall after clears, which can set up chain reactions.' },
            { label: 'Combo multiplier', detail: 'Consecutive clears multiply your score.' },
          ],
        },
        {
          title: 'Arcade Polish',
          items: [
            { label: 'Hotdog gem', detail: 'A special piece that destroys full rows, columns, and diagonals.' },
            { label: 'Explosion animation', detail: 'A four-frame blast plays when gems clear.' },
            { label: 'Sound effects', detail: 'Includes clear sounds, drops, horn honks, and a loss jingle.' },
            { label: 'Next preview', detail: 'Shows the next piece so you can plan ahead.' },
          ],
        },
        {
          title: 'Persistence',
          items: [
            { label: 'Pause support', detail: 'The game can be paused mid-run.' },
            { label: 'Leaderboard', detail: 'Top three scores are saved to disk and shown on the title screen.' },
            { label: 'Name entry', detail: 'Players can enter initials after setting a new high score.' },
          ],
        },
      ],
    },
  },
  'prototype-lab': {
    name: 'Prototype Lab',
    lineIds: ['founders'],
    city: 'Current Work',
    widePanel: true,
    ticketBlurb: 'Current-build station for experiments, prototypes, and ideas still being shaped into full projects.',
    content: {
      kind: 'lab',
      intro: 'Active prototypes, experiments, and half-polished tools. This station is built to hold multiple projects as they move from idea to something real.',
      projects: [
        {
          title: 'Scrat',
          kicker: 'Chrome Extension',
          tagline: 'Course-enrolment helper for UofT ACORN.',
          meta: 'Prototype',
          stack: ['Chrome Extension', 'JavaScript', 'HTML/CSS', 'UofT ACORN'],
          body: 'Scrat helps UofT students organize and stash course-enrolment data from ACORN, then view richer details about their courses in one place. It is built for the messy part of enrolment: comparing classes, keeping track of course stats, and checking Rate My Prof context before committing.',
          features: [
            {
              label: 'ACORN course stash',
              detail: 'Save course-enrolment information while browsing ACORN so it is easier to compare later.',
            },
            {
              label: 'Course detail view',
              detail: 'Surface more detailed information about selected courses, including useful stats for planning.',
            },
            {
              label: 'Professor context',
              detail: 'Bring Rate My Prof-style context into the enrolment flow so choices are less blind.',
            },
          ],
          images: [
            {
              src: 'portfolio-content/RedLine/scrat1.png',
              caption: 'Scrat course overview',
              alt: 'Scrat Chrome extension course overview',
            },
            {
              src: 'portfolio-content/RedLine/scrat2.png',
              caption: 'Saved course details',
              alt: 'Scrat saved course detail view',
            },
            {
              src: 'portfolio-content/RedLine/scrat3.png',
              caption: 'Course stats and professor context',
              alt: 'Scrat course stats and professor context',
            },
          ],
        },
      ],
    },
  },
  'hardware-projects': {
    name: 'Hardware Projects',
    lineIds: ['founders'],
    city: 'Under Construction',
    ticketBlurb: 'Under construction.',
    content: {
      kind: 'project',
      title: 'Under Construction',
      body: 'Under construction.',
      images: [
        { src: 'portfolio-content/RedLine/traffic.jpg' },
        { src: 'portfolio-content/RedLine/sutd.png' },
        { src: 'portfolio-content/RedLine/robo.jpg' },
        { src: 'portfolio-content/RedLine/car.JPG' },
      ],
    },
  },
  'hackathons': {
    name: 'Hackathons',
    lineIds: ['founders'],
    city: 'Singapore / Toronto',
    bgSketch: 'empire-state',
    ticketBlurb: 'Hackathon building, placing, and organizing across high school, university, robotics, and biotech.',
    content: {
      kind: 'list',
      items: [
        {
          title: 'BACSA Hacks',
          subtitle: 'Organizer · BACSA, University of Toronto',
          meta: '100+ participants',
          extra: 'Organizer',
          body: 'Organizing open health product tracks and a closed forensic support-system challenge. Teams either build around disease detection or health improvement, or model uncertain biological evidence into ranked suspects with confidence scores and reasoning.',
          url: 'https://bacsa-hacks26.devpost.com/',
          images: [
            { src: 'portfolio-content/RedLine/bacsahacks.jpeg', caption: 'BACSA Hacks' },
          ],
          imagesLayout: 'beside-text',
        },
        {
          title: 'HackathonX',
          subtitle: 'Runner-up · Strive Education & Crimson Education',
          meta: '500 participants · p5.js · SDG 9 / 11 / 17',
          extra: '2nd',
          body: 'A free 48-hour virtual student hackathon focused on defining a real problem and building an innovative solution with peer and mentor support. The event centered on sustainability and innovation through SDG 9, SDG 11, and SDG 17, with participants coding in p5.js and using p5 widgets.',
          images: [
            { src: 'portfolio-content/RedLine/strive.png', caption: 'HackathonX' },
          ],
          imagesLayout: 'beside-text',
        },
        {
          title: 'UTRAHacks 2026 — TrusToken & Autonomous Vehicle',
          subtitle: '3rd Place · University of Toronto Robotics',
          extra: '3rd',
          body: 'Built TrusToken, a blockchain-powered credential platform for verifiable trust badges, alongside a two-wheel autonomous vehicle prototype using colour sensing, ultrasonic detection, and an arm mechanism.',
          url: 'https://devpost.com/software/dontgotoneyet',
          images: [
            { src: 'portfolio-content/RedLine/trus.png', caption: 'TrusToken' },
          ],
          imagesLayout: 'beside-text',
        },
        {
          title: 'UTRAHacks 2025 — Robot Car',
          subtitle: '3rd Place',
          extra: '3rd',
          body: 'Built an autonomous car that could drive by itself, open and close a claw, detect coloured tiles, and avoid obstacles. The build used a TCS230/TCS3200 colour sensor, ultrasonic sensor, 2 DC motors, 1 servo motor, a motor driver, a 9V battery, and an Arduino Uno R4 Minima.',
          url: 'https://devpost.com/software/lightning-mcqueen',
          images: [
            { src: 'portfolio-content/RedLine/utra1.PNG', caption: 'UTRAHacks 2025 Robot Car' },
          ],
          imagesLayout: 'beside-text',
        },
        {
          title: 'UWCHacks',
          subtitle: '1st Place · United World College SEA',
          extra: '1st',
          body: 'Built Thrive with Team Serial Coders for the prompt "Making everyday life better." Thrive helps overweight and obese adults calculate BMI, get meal-plan suggestions, and receive workout plans based on their target weight and physique.',
          images: [
            { src: 'portfolio-content/RedLine/thrive.png', caption: 'Thrive' },
          ],
          imagesLayout: 'beside-text',
        },
        {
          title: 'Production Engineering Hackathon',
          subtitle: 'MLH · Site Reliability Engineering',
          meta: 'Chaos engineering · Load testing · Incident response',
          body: 'A virtual hackathon about building code that survives production. Teams started from a project template, then kept their service alive through simulated outages, heavy load tests, and chaos engineering challenges.',
          stationLink: {
            stationId: 'green-slot-1',
            label: 'View the Watchtower project',
          },
          images: [
            { src: 'portfolio-content/GreenLine/software-projects/watchtower1.png', caption: 'Watchtower' },
          ],
          imagesLayout: 'beside-text',
        },
        {
          title: 'What The Hack 2023 — Smart Cane',
          subtitle: 'Singapore University of Technology & Design',
          meta: 'Sensors · Motors · Buzzers · Arduino',
          body: 'Built a modified walking cane for visually impaired users, using sensors, motors, buzzers, and trigger feedback to support navigation and improve inclusivity.',
          images: [
            { src: 'portfolio-content/RedLine/sutd.png', caption: 'What The Hack 2023' },
          ],
          imagesLayout: 'beside-text',
        },
        {
          title: 'What The Hack 2022 — Operation Traffic Control',
          subtitle: 'Singapore University of Technology & Design',
          meta: 'RFID · NFC · Traffic Systems',
          body: 'Built a traffic-control prototype that used RFID scanners under the road to count cars and adapt traffic lights. Cars carried NFC stickers, and stored emergency-vehicle IDs let the system recognize and prioritize emergency access.',
          images: [
            { src: 'portfolio-content/RedLine/traffic.jpg', caption: 'Operation Traffic Control' },
          ],
          imagesLayout: 'beside-text',
        },
      ],
    },
  },

  // ══ CREATIVE LINE (Singapore Circle Line) ═══════════════════
  'music-portfolio': {
    name: 'Music Portfolio',
    lineIds: ['creative'],
    locked: true,
    city: 'Singapore',
    content: { kind: 'placeholder', note: 'Recordings & arrangements being mastered.' },
  },
  'drumming': {
    name: 'Drumming & Performances',
    lineIds: ['creative'],
    locked: true,
    city: 'Singapore',
    content: { kind: 'placeholder', note: 'Track listing being chartered.' },
  },
  'bands': {
    name: 'Bands',
    lineIds: ['creative'],
    locked: true,
    city: 'Singapore',
    content: { kind: 'placeholder', note: 'Set lists & band rosters being soundchecked.' },
  },
  'certifications': {
    name: 'Certifications',
    lineIds: ['creative'],
    locked: true,
    city: 'Singapore',
    content: { kind: 'placeholder', note: 'Grades and certifications being filed.' },
  },

  // BACSA Hacks station removed along with the special-service stub.
};

// ─── SERVICE ALERTS ─────────────────────────────────────────────
const ALERTS = [
  { severity: 'good',  text: 'Good service on all lines. Engineer is on board.' },
  { severity: 'minor', text: 'Minor delays on the Creative Line — extended drum solo at the loop apex.' },
  { severity: 'minor', text: 'Tech Line dual-track operating normally. Software runs express above; games run local below.' },
  { severity: 'info',  text: 'Builds & Ventures Line: Tides, Prototype Lab, hardware, and hackathon trains share the red track.' },
  { severity: 'minor', text: 'Journey Line delayed by a 3.57 GPA recalculation. Southbound only.' },
  { severity: 'info',  text: 'Lost & Found: one badminton racket reported at Central Station.' },
  { severity: 'info',  text: 'Tech Line lower track: trains gravity-assisted, expect occasional respawn.' },
  { severity: 'good',  text: 'Fresh chai detected on Journey Line trains. Service unaffected.' },
  { severity: 'info',  text: 'Creative Line is a loop. Trains run continuously; mind the doors.' },
];

window.MAP_DATA = { LINES, STATIONS, CENTRAL, ALERTS, LOOP, LOOP_STATIONS };
