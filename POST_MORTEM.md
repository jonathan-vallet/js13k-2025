# Postmortem – Witchcat (JS13K 2025)

## Idea / Game Design

For this 2025 edition, I initially wanted to make a 3D game.  
But since I didn’t have time to prepare for it before the jam, I decided instead to build on the engine I had created in 2024, which already allowed me to manage assets in a fairly optimized way.  
The challenge: turn this engine into a small **open world** rather than simple fixed levels.

The idea of **seasons** came quickly: with my system, changing the color palette of an asset was very easy.  
Zelda _Oracle of Seasons_ was a huge inspiration. I reused the concept of seasons blocking/unblocking paths, with my own variations:

- **Winter**: snow blocks the way, but water freezes and becomes walkable.
- **Autumn**: mushrooms grow, and pits are covered with leaves.
- **Summer**: roots block the way, but vines allow climbing.
- **Spring**: stone flowers bloom and can be destroyed.

Spring is the last unlocked season, so it only acts as an _unlocker_.  
A side effect became a feature: once a stone flower is destroyed, it stays gone in every season. This opened new puzzle possibilities (especially the southern cat, the hardest one to get).

---

## Assets / Images

The final project contains **30 different assets**, some animated, for a total of **57 tiles (16×16 px)** – huge for a 13kb game.

I reused a Node script I had written last year. Images are limited to 5 colors: white (transparent), black, red, green, and blue. Each pixel is encoded with a custom **RLE format**, where one character can represent up to 16 consecutive pixels.  
Example:

- `a` = 1 blue
- `b` = 2 blues
- `A` = 1 green
- `D` = 4 greens

For the map, I adapted my level editor to export a large JSON alternating _empty tiles / filled tiles_.  
Example: `10,5,1,2` = 10 empty, 5 filled, 1 empty, 2 filled.

At startup:

- decode assets and layers,
- generate a large image per season for all static elements (trees, rocks, roots, walls…),
- create a collision map.

Seasonal variations are handled dynamically: water becomes ice in winter, pits become leaves in autumn, etc.

At first I reused Zelda assets. But [Lylouf](https://x.com/lylouf13), a pixel artist friend, did an amazing job recreating them to give the game its own identity.

---

## Character and Collisions

The 2024 gameplay was based on _tile-by-tile_ movement. For an open world, I needed **free movement** and had to completely rewrite movement and collisions.

- The character stays centered while the background scrolls.
- At the edge of the map, the character moves while the map remains fixed.
- Subpixel rounding caused visual artifacts that I had to fix.

### Collision system

- Precise hitbox for the character.
- Objects: full-tile collisions, except for pits/water which are more permissive.
- Lots of balancing work to prevent the player from slipping _between two pits_ or getting stuck on corners.

Replaying _Oracle of Seasons_, I found a clever trick: if 50% of the hitbox is already past an obstacle and the next tile is free, the character automatically slides sideways instead of being blocked.  
This avoids frustrating micro-stucks against walls → a huge comfort boost.

---

## Traps and Enemies

Adding enemies and traps extended the collision challenges.

- **Spikes**: simple, two frames → if the player stands on them when raised, they take damage.
- **Blades**: much more complex → they must dash straight until hitting an obstacle, then return at a different speed. They should not trigger if there’s an obstacle between them and the player.
- **Seeker**: simpler → follows the player but stops if blocked, instead of bouncing back.

All dynamic objects (traps, enemies) are recalculated frame by frame with a lightweight and efficient **AABBOverlap** system.

---

## World / Level Design

At first, I imagined Zelda-like houses/caves as separate zones.  
In the end, I chose to design around **4 seasonal temples**, each granting a power, with puzzle-oriented zones in between.

- **Winter Temple**: simple, designed not to frustrate casual players → the goal is to reach the orb even after taking damage.
- **Summer Temple**: trickier → with only one season unlocked, it was impossible to build a seasonal-switch puzzle here, so I had to wait until two seasons were available.
- **Intermediary zones**: built iteratively, with the central area kept as the hub.

The southern zone, initially empty, became _endgame content_ → a cat requiring all seasonal powers to reach.

### Music and Sounds

I used [Soundbox](https://sb.bitsnbites.eu/) to compose a simple tune, heavily inspired by _Zelda: Oracle of Seasons_.  
I created fewer **sound effects** than last year, mainly due to space limitations.  
I would have liked to include sounds to help locate cats (using stereo balance) or when collecting them — and maybe a dedicated sound for fireballs.

While experimenting with audio, I accidentally changed a sound’s **length parameter**, which gave me the idea to vary it depending on the season.  
Spring and Summer have a drier, snappier tone, while Autumn and Winter have a more resonant, echoing one.

### Cat placement

I wanted to guide players without arrows or intrusive HUD.  
The idea of **signposts replaced by collected cats** proved much more diegetic and elegant. I rebalanced cat distribution across zones accordingly.

---

## Playtests and Adjustments

I managed to get quick playtests, including through two streamers, which helped fine-tune the design.

- Removed tutorial signs → discovery works better through experimentation.
- Improved water readability (color + animation).
- Blocked access to already-explored zones without cats to avoid useless backtracking.
- Added subtle guidance:
  - water close to the winter stone after the autumn temple,
  - pits shown again in the spring temple to recall their autumn interaction,
  - permanent display of the current season on screen,
  - seasonal stones got a color-shifting animation,
  - the witch’s hat color changes with the season (cosmetic detail),
  - cats turn to look at the player based on position (immersion).

---

## Cutscenes

I wanted to add a small intro and outro.  
A table of instructions controls:

- character position/visibility,
- seasonal changes,
- facing direction,
- specific animations.

This gave the impression of a **scripted camera** at very low cost.  
The little “dance” in the ending was originally a bug: a flip triggered alongside a rotation, giving a funny animation — so I kept it.

---

## Optimizations and Conclusion

I spent a huge amount of time squeezing out bytes, testing results multiple times.  
Sometimes, a helper function is not worth it: repeating small chunks of code can compress better with Roadroller and zip.

I also improved my build tool configuration, making it more efficient.  
For instance, I added automatic replacement of object properties starting with `_` into shorter versions. I did this a bit late, which caused some early bugs.

I would have loved to add mobile support with a virtual stick on the left and a button on the right, but there was no more space.  
Same for a title screen allowing “Continue” or “New Game”.

Creating a small 2D open world in only **13kb** was a real challenge, and I’m extremely proud of achieving it!  
In just **13312 bytes**, the game still contains:

- 30 assets / 57 frames of 16×16 px,
- a world of 100×62 tiles,
- in 4 seasonal variations,  
  → for a total of **24800 hand-designed tiles**.

A huge thanks to [Lylouf](https://x.com/lylouf13) for creating all the pixel art assets and color palettes!

## Feedback Analysis

The game was very well received, placing **Witchcat** in **3rd place overall** in the [JS13K](https://js13kgames.com/) competition.  
Many players were impressed by the size of the world and especially the number of different assets. That was the core of my technical challenge, and I’m really proud of how it turned out.

Everyone praised the **art direction**, **colors**, and **overall atmosphere** — Lylouf’s work was widely appreciated!

The **sound changes across seasons** were also well received, even though it was just a small code tweak I discovered while experimenting with audio. Personally, I love those subtle immersive details — like when background music slightly muffles underwater, adding depth to the experience.

The **level design** received a lot of positive feedback too.  
Thanks to early playtests, I could refine it beforehand — and that was my biggest concern. It’s not easy to balance puzzles that are accessible to casual players while still engaging for more experienced ones.

The idea of using **signposts for hints** felt right to me, as it kept everything diegetic. However, feedback was mixed.  
Some players didn’t realize they could kill enemies with fireballs, even though there’s a sign early in the game and a mummy nearby that can’t hurt you — meant as a safe way to “practice” after destroying the first flowers.  
Maybe I should have forced that mummy into the main path to ensure players understood the mechanic.

Similarly, some players thought there was **no way to locate the cats**, even though the signs were arranged in a circle and replaced by collected cats.  
Perhaps the signs’ design and interactivity weren’t obvious enough.  
I could have given them a solid black border to make them stand out — and match the destructible stone flowers’ outline (also interactive), a convention borrowed from the old Game Boy _Zelda_ titles.

Only one person reported having **trouble finding their way** and asked for a minimap.  
The map wasn’t very large and was fairly linear, so I thought it wouldn’t be necessary — but I understand that some players enjoy having one for orientation.  
A potential confusion point is right after exiting the **Autumn Temple**, where you can backtrack (notably to find a cat), even though the main path continues left across the leaf-covered pits.  
I had placed signs showing the direction of the temples, but again, I don’t think many players paid attention to them.

There were also **two comments about the seasonal stones**.  
That part had already been improved both visually and functionally: the animation makes it intuitive enough, and players naturally walk onto it and press the action button.  
A sign nearby also explains it, but again, signs were underused.  
From a level design perspective, I could have made a small dead end with the stone in the center, forcing the player to interact with it — but that would have slightly constrained the open-world layout.
