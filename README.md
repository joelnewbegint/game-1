# Aethrava - 3D Fantasy Open World

A realistic-looking 3D fantasy open-world puzzle and quest game running directly in modern web browsers on desktop and mobile devices without requiring a backend.

## Engine Choice
**Three.js** is chosen for Aethrava.
1. **Lightweight & Modular**: High performance on mobile devices with zero engine bloat, allowing swift initial loading and custom shader pipelines (essential for Kaelen's "Eye Vision" realm-shifting).
2. **Mobile Optimized**: Native support for lightweight PBR materials, instancing, LOD, and standard WebGL2/WebGPU readiness across iOS and Android browsers.
3. **Ecosystem & Data Pipelines**: Clean integration with modern bundlers (Vite), glTF workflows, and procedural generation for seamless open-world streaming.

---

## Architecture & Project Structure
```text
├── assets/                  # Raw 3D assets, textures, and audio
├── public/                  # Static web assets & icons
└── src/
    ├── data/                # Data-driven definitions (clans, quests, dialogue, items, lore)
    │   ├── clans.js         # The 5 elemental clans & their deities
    │   ├── gameConfig.js    # Character physics, camera tuning, render settings
    │   ├── items.js         # The 5 Elemental Stones & key inventory items
    │   ├── lorePages.js     # 20 lore pages & contradiction topics for The Book of Fractured Truths
    │   ├── quests.json      # Data-driven quest database with objectives and rewards
    │   └── dialogue.json    # Branching dialogue trees with conditional choices, lies, and trust shifts
    ├── engine/              # Engine primitives
    │   ├── Engine.js        # Three.js renderer, scene, camera, resize lifecycle, tick loop
    │   └── Time.js          # Clamped delta-time and FPS counter
    ├── world/               # Environmental systems & entities
    │   ├── Lighting.js      # Directional sun with soft shadows & hemisphere ambient bounce
    │   ├── SkyDome.js       # Physical Rayleigh/Mie atmospheric sky with distance fog
    │   ├── Terrain.js       # Procedural textured terrain with analytical heightmap & ancient ruins
    │   ├── World.js         # World orchestrator
    │   ├── NPC.js           # Lorekeeper Elara NPC with animated fire staff
    │   ├── PickupItem.js    # Floating, rotating Ancient Fire Fragment with point light
    │   ├── LorePagePickup.js # Normal & hidden lore page manuscripts
    │   └── SpiritPath.js    # Luminous runic stepping stones revealed under Eye Vision
    ├── player/              # Player & camera systems
    │   ├── Player.js        # Kaelen (with pulsing magic eye light and procedural gait bobbing)
    │   └── ThirdPersonCamera.js # Damped orbit camera with ground & obstacle collision
    ├── systems/             # Gameplay & cross-cutting systems
    │   ├── GameState.js     # Central reactive state (clan trust, inventory, quests, flags)
    │   ├── EyeVisionSystem.js # Energy meter, desaturation filter, lie unmasking, spirit reveal
    │   ├── SaveSystem.js    # Browser localStorage auto-save, load, and save previews
    │   ├── InteractionSystem.js # 3D screen-space projected interaction prompts (E / ACT)
    │   └── InputManager.js  # Unified desktop (WASD/Mouse) + Touch input auto-detection
    ├── ui/                  # User interface modals & HUD
    │   ├── LoadingScreen.js # Atmospheric fantasy loading screen with lore quote
    │   ├── MainMenu.js      # Title screen with Continue, New Journey, and Settings
    │   ├── PauseMenu.js     # In-game pause menu (Resume, Save, Journal, Settings, Title)
    │   ├── DialogueBox.js   # Branching conversation box with choices, lie detection alert
    │   ├── LoreBookUI.js    # Dual-page grimoire with 3D page flip and Contradictions comparison
    │   ├── JournalUI.js     # Grimoire modal (Quests, 5 Elemental Stones, Items, Lore, Clans)
    │   ├── SettingsUI.js    # Volume slider, graphics quality (Low/Med/High), touch toggle
    │   ├── NotificationToast.js # Floating banners for trust, quest, and item events
    │   ├── TouchControls.js # On-screen virtual joystick, look-pad, sprint, jump, eye & interact
    │   └── DebugOverlay.js  # Real-time FPS, coordinates, speed, state, eye status & diagnostics
    ├── main.js              # Game bootstrap & loop
    └── style.css            # Cinematic UI styles, glassmorphism & responsive layouts
```

---

## How to Run

### 1. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

### 2. Run on Mobile (Same Local Network)
```bash
npm run dev -- --host
```
Open the displayed local network URL (e.g. `http://192.168.x.x:5173`) in Chrome or Safari on your phone.

---

## Controls

### Desktop (Keyboard & Mouse)
- **Move**: `W`, `A`, `S`, `D` or Arrow keys
- **Look Around**: Move mouse (click canvas to lock mouse pointer, or hold Right-Click)
- **Toggle Eye Vision**: `V` (Pierces lies, reveals spirit paths and hidden relics)
- **Open The Book of Fractured Truths**: `B` (Antique tome with 3D page flip)
- **Interact / Talk / Collect**: `E`
- **Sprint**: Hold `Shift`
- **Jump**: `Space`
- **Open Grimoire / Journal**: `J`
- **Open Inventory**: `I`
- **Pause Game / Settings**: `Escape`
- **Toggle Debug HUD**: `~` (Backquote) or `F3` key
- **Toggle Touch UI on Desktop**: Click `TOUCH UI` in the top-right corner

### Mobile / Touchscreen
- **Movement**: Virtual analog joystick on bottom-left
- **Camera Look**: Drag finger on right half of screen
- **Toggle Eye Vision**: Tap `EYE` button
- **Interact**: Tap `ACT` button when near an NPC or item
- **Sprint**: Tap `RUN` button
- **Jump**: Tap `JUMP` button
- **Open Book**: Tap `BOOK (B)` pill in the top-right corner
- **Journal & Inventory**: Tap `JOURNAL (J)` pill in the top-right corner
- **Pause Menu**: Tap `PAUSE` pill in the top-right corner
- **Toggle Debug HUD**: Tap `DEBUG` pill in the top-right corner

---

## Phase 3 Test Walkthrough

1. **Test Normal Lore Page Collection**:
   - On the central ceremonial dais, look to the left (`(X: -2.8, Z: 1.2)`).
   - An illuminated manuscript page with a golden aura is floating above the stone.
   - Walk up to it and press `E`: **Page 1: "The First Spark" (Embercrest Tradition)** is collected.
2. **Open The Book of Fractured Truths**:
   - Press `B` (or click `BOOK (B)` at the top).
   - The dual-page antique grimoire opens with medieval parchment styling and drop caps.
   - Click **NEXT SPREAD ›** / **‹ PREVIOUS SPREAD** to see the smooth 3D page turn animation.
   - Click the **CONTRADICTIONS** tab: it currently shows that more conflicting accounts are needed to unlock comparison analysis.
3. **Test Eye Vision Mode & Energy Meter**:
   - Close the book and press `V` (or tap the `EYE` button on touch/HUD).
   - Notice:
     - The screen enters a glowing celestial chromatic desaturation filter.
     - The bottom-left **EYE VISION** HUD meter begins draining energy smoothly.
     - Kaelen's right magic eye illuminates with radiant cyan light.
4. **Follow the Spirit Path to the Hidden Page**:
   - While in Eye Vision mode, look toward the ground west of the dais.
   - A trail of glowing cyan celestial runes (the **Spirit Path**) materializes on the terrain!
   - Follow the spirit path around the ancient monoliths to `(X: -21.0, Z: 5.0)`.
   - At the end of the path, a veiled manuscript with an ethereal rotating ocular rune appears: **Page 4: "The Primordial Depths" (Tidewrought Tradition)**!
   - Press `E` while in Eye Vision to collect it.
5. **View the Unlocked Contradictions Tab**:
   - Press `B` to open the Book of Fractured Truths.
   - The **CONTRADICTIONS** tab is now glowing with badge `1` unlocked!
   - Click the **CONTRADICTIONS** tab:
     - **Left Column**: Displays the *Embercrest Account* ("Ignareth ignited the void with sacred fire").
     - **Right Column**: Displays the *Tidewrought Account* ("Nerivael the infinite ocean was the original state; fire was merely a spark").
     - **Center Card**: Displays **FRACTURED TRUTH ANALYSIS**, exposing the deliberate contradiction planted by the Order of the Open Eye.
6. **Test Dialogue Lie Detection**:
   - Activate Eye Vision (`V`).
   - Approach Lorekeeper Elara at `(X: 4.2, Z: 2.2)` and press `E`.
   - Select *"What is this place, Lorekeeper?"*.
   - Elara claims: *"Ignareth willingly shattered the celestial lens out of pure divine love..."*.
   - Because Eye Vision is active, a glowing purple/cyan border surrounds the dialogue card and an alert box appears:
     **[DECEIT PIERCED BY THE FIRST EYE]:** *Ignareth did not shatter the eye out of love; the gods tore the First Eye apart in a desperate panic...*
   - A new dialogue option unlocks: *"[Eye Vision] You speak of holy sacrifice, yet your words ring hollow, Elara."*
   - Selecting it causes Elara to break character and confess that the Order hid the truth because the gods are dying!
