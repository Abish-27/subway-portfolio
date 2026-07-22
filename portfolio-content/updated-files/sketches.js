// ─────────────────────────────────────────────────────────────────────
//  Station background sketches
//  Faint, hand-drawn pencil "brainstorm" drawings that sit behind a
//  station's content — a nod to the city or the work it represents.
//  Each entry is an inline SVG (stroke = currentColor, fill = none) so it
//  adapts to day/night ink and is tinted + faded by CSS, not here.
//  Keep them loose and sketchy — they should whisper, not shout.
// ─────────────────────────────────────────────────────────────────────
window.STATION_SKETCHES = {

  // Toronto · CN Tower — for the Technical Skills terminus (TTC line)
  'cn-tower': `
    <svg viewBox="0 0 360 620" fill="none" xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMax meet">
      <defs>
        <filter id="pencil-cn" x="-6%" y="-4%" width="112%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.028 0.032"
                        numOctaves="2" seed="5" result="t"/>
          <feDisplacementMap in="SourceGraphic" in2="t" scale="2.6"/>
        </filter>
      </defs>

      <!-- faint construction / brainstorm marks -->
      <g stroke="currentColor" stroke-width="0.8" stroke-linecap="round"
         opacity="0.5" filter="url(#pencil-cn)">
        <line x1="234" y1="598" x2="234" y2="20" stroke-dasharray="3 6"/>
        <line x1="198" y1="248" x2="270" y2="248" stroke-dasharray="2 5"/>
        <line x1="204" y1="222" x2="264" y2="222" stroke-dasharray="2 5"/>
        <line x1="218" y1="160" x2="250" y2="160" stroke-dasharray="2 5"/>
        <line x1="228" y1="72" x2="240" y2="72" stroke-dasharray="2 5"/>
        <path d="M34 598 H326"/>
        <path d="M48 598 V560 Q102 508 166 560 V598" stroke-dasharray="4 7"/>
      </g>

      <!-- main pencil linework -->
      <g stroke="currentColor" fill="none" stroke-width="1.7"
         stroke-linecap="round" stroke-linejoin="round" filter="url(#pencil-cn)">

        <!-- ground + Rogers Centre-style dome, matching the reference composition -->
        <path d="M18 598 H342"/>
        <path d="M48 598 V560 Q106 512 166 560 V598"/>
        <path d="M76 598 V574 H140 V598"/>

        <!-- CN Tower legs: two clean, continuous sloped sides to the saucer -->
        <path d="M204 598 L224 270"/>
        <path d="M270 598 L244 270"/>
        <path d="M235 598 V270" stroke-width="1.15"/>
        <path d="M224 270 H244"/>

        <!-- SkyPod / observation deck: round saucer with stacked horizontal bands -->
        <path d="M202 260
                 C198 246 204 235 234 232
                 C264 235 270 246 266 260
                 C260 273 208 273 202 260 Z"/>
        <path d="M196 248 C203 238 216 233 234 233 C252 233 265 238 272 248
                 L266 260 C255 266 213 266 202 260 Z"/>
        <path d="M204 236 L208 220 H260 L264 236"/>
        <path d="M210 220 H258"/>
        <path d="M202 252 C212 256 256 256 266 252" stroke-width="1"/>
        <path d="M201 244 H267 M200 250 H268 M204 258 H264" stroke-width="0.9"/>
        <path d="M206 242 l12 -6 M218 245 l14 -8 M232 246 l14 -9 M248 245 l12 -7"
              stroke-width="0.7" opacity="0.68"/>

        <!-- narrow upper shaft and collar above the saucer -->
        <path d="M226 220 V172 H242 V220"/>
        <path d="M222 172 H246 V158 H222 Z"/>
        <path d="M226 158 V140 H242 V158"/>

        <!-- small flared pod below the antenna, like the reference -->
        <path d="M218 140 C222 132 246 132 250 140
                 L242 148 H226 Z"/>
        <path d="M222 140 C226 144 242 144 246 140" stroke-width="0.9"/>

        <!-- tapered antenna body + long thin tip -->
        <path d="M226 140 L230 56 H238 L242 140 Z"/>
        <path d="M230 56 V22 Q234 12 238 22 V56 Z"/>
        <path d="M232 56 V22 M236 56 V22" stroke-width="0.85"/>
        <path d="M228 112 H240 M229 84 H239" stroke-width="0.8"/>
      </g>
    </svg>`,

  // Space scene · for Graviton — physics game where you are the graviton particle.
  // Tightly clustered around the central particle so it hugs the station node.
  'graviton-space': `
    <svg viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="pencil-grav" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03 0.034"
                        numOctaves="2" seed="6" result="t"/>
          <feDisplacementMap in="SourceGraphic" in2="t" scale="2.3"/>
        </filter>
      </defs>

      <!-- faint orbital / gravity / motion marks -->
      <g stroke="currentColor" fill="none" stroke-width="1" stroke-linecap="round"
         opacity="0.55" filter="url(#pencil-grav)">
        <!-- gravity rings around the particle (the node) -->
        <circle cx="180" cy="180" r="20" stroke-dasharray="3 6"/>
        <circle cx="180" cy="180" r="34" stroke-dasharray="3 7"/>
        <circle cx="180" cy="180" r="50" stroke-dasharray="2 8"/>
        <!-- trajectory from planet toward particle -->
        <path d="M118 118 Q150 150 168 170" stroke-dasharray="4 6"/>
        <!-- rock motion trails -->
        <path d="M236 92 L246 99 M232 104 L243 110" stroke-dasharray="3 4"/>
        <path d="M120 244 L131 248 M119 257 L132 260" stroke-dasharray="3 4"/>
        <!-- comet tail -->
        <path d="M295 65 L320 50 M298 74 L324 63 M293 70 L318 59" stroke-dasharray="4 5"/>
        <!-- scattered star dots -->
        <circle cx="180" cy="70" r="1.5"/><circle cx="120" cy="150" r="1.4"/>
        <circle cx="300" cy="250" r="1.6"/><circle cx="150" cy="252" r="1.4"/>
        <circle cx="212" cy="118" r="1.4"/><circle cx="44" cy="206" r="1.5"/>
        <circle cx="328" cy="112" r="1.4"/>
      </g>

      <!-- main pencil linework -->
      <g stroke="currentColor" fill="none" stroke-width="1.6"
         stroke-linecap="round" stroke-linejoin="round" filter="url(#pencil-grav)">

        <!-- planet + orbit ring + little moon (upper-left) -->
        <circle cx="96" cy="98" r="28"/>
        <path d="M72 92 Q96 85 120 92" stroke-width="1"/>
        <path d="M70 108 Q96 117 122 107" stroke-width="1"/>
        <ellipse cx="96" cy="98" rx="48" ry="16" transform="rotate(-22 96 98)"
                 stroke-dasharray="5 5"/>
        <circle cx="140" cy="84" r="4.5"/>

        <!-- asteroid rocks (irregular) with craters -->
        <path d="M248 104 L254 92 L268 86 L283 94 L289 108 L283 122 L268 128 L253 122 L248 114 Z"/>
        <circle cx="262" cy="104" r="3"/><circle cx="276" cy="116" r="2.3"/>

        <path d="M282 202 L287 193 L298 192 L305 201 L303 213 L293 219 L284 212 Z"/>
        <circle cx="291" cy="204" r="2.2"/>

        <path d="M78 250 L84 238 L98 234 L112 242 L114 256 L104 267 L88 265 L78 258 Z"/>
        <circle cx="91" cy="250" r="2.8"/><circle cx="101" cy="259" r="1.8"/>

        <path d="M240 284 L245 277 L257 277 L263 286 L256 294 L245 294 Z"/>

        <!-- comet head (upper-right) -->
        <circle cx="300" cy="70" r="6"/>

        <!-- the graviton particle — sits on the node -->
        <circle cx="180" cy="180" r="9"/>
        <circle cx="180" cy="180" r="2.6" fill="currentColor" stroke="none"/>
        <path d="M180 166 V160 M180 200 V194 M166 180 H160 M200 180 H194" stroke-width="0.9"/>

        <!-- foreground sparkles -->
        <path d="M138 52 V64 M132 58 H144 M134 54 L142 62" stroke-width="0.9"/>
        <path d="M316 150 V162 M310 156 H322" stroke-width="0.9"/>
        <path d="M58 150 V162 M52 156 H64" stroke-width="0.9"/>
        <path d="M60 300 V310 M55 305 H65" stroke-width="0.9"/>
      </g>
    </svg>`,

  // Woods scene · for Hunter's Hollow — atmospheric exploration game, quiet woods
  'hunters-forest': `
    <svg viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="pencil-hunt" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03 0.034"
                        numOctaves="2" seed="8" result="t"/>
          <feDisplacementMap in="SourceGraphic" in2="t" scale="2.2"/>
        </filter>
      </defs>

      <!-- faint atmosphere: moon, sky dots, falling leaves -->
      <g stroke="currentColor" fill="none" stroke-width="1" stroke-linecap="round"
         opacity="0.5" filter="url(#pencil-hunt)">
        <circle cx="286" cy="92" r="18"/>
        <path d="M280 86 q4 5 9 4 M282 98 q5 3 9 -1" stroke-width="0.8"/>
        <circle cx="120" cy="78" r="1.6"/><circle cx="180" cy="62" r="1.4"/>
        <circle cx="238" cy="120" r="1.4"/><circle cx="70" cy="120" r="1.5"/>
        <!-- a few falling leaves -->
        <path d="M206 150 q5 -5 10 0 q-5 5 -10 0 M211 150 l3 -3" stroke-width="0.8"/>
        <path d="M150 132 q4 -4 9 0 q-4 4 -9 0 M155 132 l3 -3" stroke-width="0.8"/>
      </g>

      <!-- main pencil linework -->
      <g stroke="currentColor" fill="none" stroke-width="1.6"
         stroke-linecap="round" stroke-linejoin="round" filter="url(#pencil-hunt)">

        <!-- ground -->
        <path d="M44 244 Q180 234 320 244"/>
        <path d="M70 244 l-3 -9 m3 9 l0 -11 m0 11 l3 -9" stroke-width="0.9"/>
        <path d="M232 244 l-3 -9 m3 9 l0 -11 m0 11 l3 -9" stroke-width="0.9"/>
        <path d="M300 244 l-3 -8 m3 8 l0 -10 m0 10 l3 -8" stroke-width="0.9"/>

        <!-- pine tree (left) -->
        <path d="M104 244 L104 226 M112 244 L112 226"/>
        <path d="M84 228 L108 178 L132 228 Z"/>
        <path d="M88 200 L108 158 L128 200 Z"/>
        <path d="M92 176 L108 142 L124 176 Z"/>

        <!-- pine tree (right, smaller) -->
        <path d="M255 244 L255 230 M261 244 L261 230"/>
        <path d="M240 230 L258 192 L276 230 Z"/>
        <path d="M244 208 L258 176 L272 208 Z"/>
        <path d="M247 190 L258 162 L269 190 Z"/>

        <!-- little round bush (far right) -->
        <path d="M300 244 L300 232 M306 244 L306 232"/>
        <path d="M290 232 Q286 216 300 212 Q302 200 314 205 Q326 202 324 216
                 Q332 224 322 232 Z"/>

        <!-- mushroom by the left tree -->
        <path d="M126 240 Q133 230 140 240 Z"/>
        <path d="M131 240 L131 246 M136 240 L136 246" stroke-width="0.9"/>
        <circle cx="131" cy="236" r="0.9"/><circle cx="136" cy="237" r="0.8"/>

        <!-- rabbit (centre) -->
        <path d="M196 232 C202 210 188 196 175 198 C160 200 154 216 160 230
                 C170 236 188 238 196 232 Z"/>
        <circle cx="161" cy="204" r="9"/>
        <path d="M157 196 C151 175 153 165 157 165 C161 165 161 178 159 196"/>
        <path d="M164 196 C164 177 168 167 171 169 C174 171 169 184 167 196"/>
        <circle cx="158" cy="203" r="1.2" fill="currentColor" stroke="none"/>
        <path d="M152 207 h-3" stroke-width="0.8"/>
        <circle cx="197" cy="224" r="4.5"/>
        <path d="M166 234 h9 M180 234 h8" stroke-width="0.9"/>
      </g>
    </svg>`,

  // Finance chart · for Stock Trader — decision-tree stock screener
  'stock-charts': `
    <svg viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="pencil-stock" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03 0.034"
                        numOctaves="2" seed="9" result="t"/>
          <feDisplacementMap in="SourceGraphic" in2="t" scale="2.1"/>
        </filter>
      </defs>

      <!-- faint grid, trend line, volume -->
      <g stroke="currentColor" fill="none" stroke-width="1" stroke-linecap="round"
         opacity="0.5" filter="url(#pencil-stock)">
        <path d="M70 210 H300 M70 250 H300 M70 290 H300" stroke-dasharray="3 7"/>
        <!-- volume bars under the axis -->
        <path d="M100 316 V326 M135 316 V330 M170 316 V322 M205 316 V332 M240 316 V328"/>
        <!-- moving-average / trend dots -->
        <circle cx="128" cy="280" r="1.5"/><circle cx="205" cy="250" r="1.5"/>
        <circle cx="244" cy="224" r="1.5"/>
      </g>

      <!-- main pencil linework -->
      <g stroke="currentColor" fill="none" stroke-width="1.6"
         stroke-linecap="round" stroke-linejoin="round" filter="url(#pencil-stock)">

        <!-- axes + arrowheads -->
        <path d="M70 176 L70 314 L300 314"/>
        <path d="M70 176 l-4 8 m4 -8 l4 8" stroke-width="1"/>
        <path d="M300 314 l-8 -4 m8 4 l-8 4" stroke-width="1"/>

        <!-- candlesticks -->
        <path d="M100 266 V304"/><path d="M94 274 h12 v22 h-12 Z"/>
        <path d="M135 250 V300"/><path d="M129 262 h12 v24 h-12 Z"/>
        <path d="M131 266 l8 16 M131 276 l8 6" stroke-width="0.8" opacity="0.7"/>
        <path d="M170 262 V300"/><path d="M164 272 h12 v18 h-12 Z"/>
        <path d="M205 232 V290"/><path d="M199 244 h12 v24 h-12 Z"/>
        <path d="M240 214 V276"/><path d="M234 226 h12 v22 h-12 Z"/>
        <path d="M236 230 l8 14 M236 240 l8 6" stroke-width="0.8" opacity="0.7"/>

        <!-- upward trend line with arrow -->
        <path d="M92 300 L128 280 L165 286 L205 250 L244 224"/>
        <path d="M244 224 l-12 2 m12 -2 l-3 12" stroke-width="1.1"/>

        <!-- little up-arrow badge -->
        <path d="M276 196 V212 M276 196 l-6 7 m6 -7 l6 7" stroke-width="1"/>
      </g>
    </svg>`,

  // New York · Empire State Building — for Hackathons on the red line.
  // Same pencil-sketch language as CN Tower: faint construction marks,
  // loose skyline context, and linework that rises out of the station node.
  'empire-state': `
    <svg viewBox="0 0 360 620" fill="none" xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMax meet">
      <defs>
        <filter id="pencil-empire" x="-6%" y="-4%" width="112%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.028 0.034"
                        numOctaves="2" seed="14" result="t"/>
          <feDisplacementMap in="SourceGraphic" in2="t" scale="2.5"/>
        </filter>
      </defs>

      <!-- faint construction / alignment marks -->
      <g stroke="currentColor" fill="none" stroke-width="0.8" stroke-linecap="round"
         opacity="0.5" filter="url(#pencil-empire)">
        <line x1="180" y1="598" x2="180" y2="-28" stroke-dasharray="3 6"/>
        <line x1="40" y1="562" x2="320" y2="562" stroke-dasharray="3 7"/>
        <line x1="82" y1="474" x2="278" y2="474" stroke-dasharray="3 7"/>
        <line x1="108" y1="236" x2="252" y2="236" stroke-dasharray="3 7"/>
        <line x1="132" y1="196" x2="228" y2="196" stroke-dasharray="3 7"/>
        <line x1="150" y1="132" x2="210" y2="132" stroke-dasharray="3 7"/>
        <path d="M54 598 Q180 584 306 598" stroke-dasharray="4 8"/>
      </g>

      <!-- main pencil linework -->
      <g stroke="currentColor" fill="none" stroke-width="1.7"
         stroke-linecap="round" stroke-linejoin="round" filter="url(#pencil-empire)">

        <!-- one continuous outer silhouette, traced from the reference shape -->
        <path d="
          M38 598 H322 V562 H292 V520 H276 V476 H252 V236 H228 V196 H216
          V168 H204 V136 H194 L188 78 H186 V52 H174 V78 H172 L166 136
          H156 V168 H144 V196 H132 V236 H108 V476 H84 V520 H68 V562
          H38 Z"/>

        <!-- tier / setback lines from the reference -->
        <path d="M38 562 H322"/>
        <path d="M68 520 H84 M276 520 H292"/>
        <path d="M84 476 H132 M228 476 H276"/>
        <path d="M108 236 H132 M228 236 H252"/>
        <path d="M132 196 H228"/>
        <path d="M144 168 H216"/>
        <path d="M156 136 H204"/>
        <path d="M166 136 L172 78 M188 78 L194 136"/>
        <path d="M174 78 H186"/>
        <path d="M180 52 V-30"/>
        <path d="M177 -30 H183"/>

        <!-- lower facade divisions / base panels -->
        <path d="M112 562 V598 M146 562 V598 M214 562 V598 M248 562 V598"/>
        <path d="M132 476 V562 M228 476 V562"/>
        <path d="M108 236 V476 M252 236 V476"/>

        <!-- long vertical window bays, drawn as continuous skinny outlines -->
        <g stroke-width="1.15" opacity="0.9">
          <path d="M114 268 H126 V446 H114 Z"/>
          <path d="M138 268 H150 V446 H138 Z"/>
          <path d="M172 214 H188 V446 H172 Z"/>
          <path d="M210 268 H222 V446 H210 Z"/>
          <path d="M234 268 H246 V446 H234 Z"/>
          <path d="M152 490 H164 V552 H152 Z"/>
          <path d="M174 490 H186 V552 H174 Z"/>
          <path d="M196 490 H208 V552 H196 Z"/>
          <path d="M218 490 H230 V552 H218 Z"/>
        </g>

        <!-- light pencil scuffing inside the mass -->
        <path d="M54 580 l34 -16 M144 538 l20 -38 M180 530 l24 -48 M232 540 l26 -42"
              stroke-width="0.8" opacity="0.58"/>
        <path d="M162 152 q18 -8 36 0" stroke-width="0.9" opacity="0.68"/>
      </g>
    </svg>`,

};

// Per-sketch map placement: how the artwork sits relative to the station node.
window.STATION_SKETCH_PLACEMENT = {
  'cn-tower':       { w: 190, h: 320, anchor: 'bottom' },  // tower rises from node
  'empire-state':   { w: 162, h: 290, anchor: 'bottom', ox: 26, oy: -6 }, // rises from Hackathons
  'graviton-space': { w: 188, h: 188, anchor: 'center' },  // cluster centred on node
  'hunters-forest': { w: 180, h: 180, anchor: 'center', oy: 44 }, // around/below node, clears label
  'stock-charts':   { w: 150, h: 150, anchor: 'center', oy: -52 }, // smaller, around top of node
};
