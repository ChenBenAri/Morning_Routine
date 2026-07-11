#!/usr/bin/env python3
"""Generate the 12 "Gori!" crowd voice clips with Edge TTS.

Produces audio/gori-play-1.mp3 ... audio/gori-play-12.mp3 — enthusiastic,
human-sounding Hebrew shouts (~1-2s each), alternating between the two
Hebrew neural voices with varied elongation, rate and pitch so that layering
7 of them sounds like a real stadium crowd rather than one robot.

Runs in CI (GitHub Actions) because this repo's dev sandbox has no egress
to speech.platform.bing.com. Falls back to gTTS if Edge TTS is unavailable.

Usage: pip install edge-tts gtts mutagen && python generate_audio.py
"""

import asyncio
import sys
from pathlib import Path

AUDIO_DIR = Path(__file__).parent / "audio"
CLIP_COUNT = 12

# (text, voice, rate, pitch) — elongated spellings + slower rates stretch the
# shout well past robotic sub-second TTS, and pitch spread makes the layered
# crowd sound like different people.
VARIANTS = [
    ("גּוֹרִי!",          "he-IL-HilaNeural", "-25%", "+0Hz"),
    ("גּוֹרִיי!",         "he-IL-AvriNeural", "-25%", "-15Hz"),
    ("גּוֹרִייי!",        "he-IL-HilaNeural", "-30%", "+20Hz"),
    ("גּוֹרִיייי!",       "he-IL-AvriNeural", "-30%", "+0Hz"),
    ("גּוֹרִי! גּוֹרִי!", "he-IL-HilaNeural", "-15%", "+10Hz"),
    ("גּוֹרִי! גּוֹרִי!", "he-IL-AvriNeural", "-15%", "-25Hz"),
    ("גּוֹרִיי!",         "he-IL-HilaNeural", "-35%", "-10Hz"),
    ("גּוֹרִייי!",        "he-IL-AvriNeural", "-35%", "+15Hz"),
    ("גּוֹרִיייי!",       "he-IL-HilaNeural", "-20%", "+30Hz"),
    ("גּוֹרִי!",          "he-IL-AvriNeural", "-30%", "+20Hz"),
    ("גּוֹרִיי! גּוֹרִי!", "he-IL-HilaNeural", "-20%", "-20Hz"),
    ("גּוֹרִייי!",        "he-IL-AvriNeural", "-20%", "+5Hz"),
]


async def edge_generate(idx: int, text: str, voice: str, rate: str, pitch: str) -> Path:
    import edge_tts

    out = AUDIO_DIR / f"gori-play-{idx}.mp3"
    for attempt in range(3):
        try:
            tts = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
            await tts.save(str(out))
            if out.stat().st_size > 1000:
                return out
            raise RuntimeError("suspiciously small output")
        except Exception as exc:  # noqa: BLE001
            if attempt == 2:
                raise
            print(f"  clip {idx}: retry after {exc}", file=sys.stderr)
            await asyncio.sleep(2 * (attempt + 1))
    return out


def gtts_generate(idx: int, text: str, slow: bool) -> Path:
    from gtts import gTTS

    out = AUDIO_DIR / f"gori-play-{idx}.mp3"
    gTTS(text=text.replace("!", "!!"), lang="iw", slow=slow).save(str(out))
    return out


def report_durations() -> None:
    try:
        from mutagen.mp3 import MP3
    except ImportError:
        return
    for i in range(1, CLIP_COUNT + 1):
        f = AUDIO_DIR / f"gori-play-{i}.mp3"
        dur = MP3(f).info.length
        print(f"  {f.name}: {dur:.2f}s")
        if dur < 0.5:
            raise SystemExit(f"{f.name} is only {dur:.2f}s — too short/robotic, aborting")


async def main() -> None:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    try:
        print("Generating clips with Edge TTS...")
        for idx, (text, voice, rate, pitch) in enumerate(VARIANTS, start=1):
            await edge_generate(idx, text, voice, rate, pitch)
            print(f"  clip {idx}/12 done ({voice}, rate {rate}, pitch {pitch})")
    except Exception as exc:  # noqa: BLE001
        print(f"Edge TTS failed ({exc}); falling back to gTTS", file=sys.stderr)
        for idx, (text, _voice, rate, _pitch) in enumerate(VARIANTS, start=1):
            gtts_generate(idx, text, slow=int(rate.rstrip("%")) <= -30)
            print(f"  clip {idx}/12 done (gTTS)")

    print("Durations:")
    report_durations()
    print("All 12 clips ready.")


if __name__ == "__main__":
    asyncio.run(main())
