/**
 * Showing a patient what "Right 45°" actually means.
 *
 * The slot names come from the clinic's own vocabulary and are read by
 * somebody holding a phone at arm's length who has never heard them before.
 * "Right 45°" on its own gets you a guess, and a guessed angle is worse than
 * no photograph: it lands in the comparison row next to the one staff took,
 * where the whole point is that the two are the same view.
 *
 * ⚠️ THE CONVENTION, and it is the thing to get right here:
 * "Right 45°" means the patient's RIGHT side faces the camera — the standard
 * in aesthetics photography, and what the clinic's own Before photos are shot
 * to. To show their right cheek, the patient turns their head towards their
 * LEFT shoulder. That reads backwards written down, which is exactly why
 * there is a picture: the diagram is unambiguous where the words are not.
 *
 * Told as "towards your left shoulder" rather than "to your left", because a
 * shoulder is a thing you can find and a direction is one you have to work
 * out while looking at a mirrored preview of yourself.
 *
 * Drawn from ABOVE. A front-on drawing of a rotated head is a drawing of a
 * face, and faces are hard to read as angles; from above, rotation is the
 * only thing in the picture.
 */

export interface Guide {
  /** Degrees to rotate the head in the diagram. SVG rotation is clockwise, so
   *  a NEGATIVE turn swings the nose to the right of the picture, which is the
   *  patient turning towards their own left shoulder. null = no diagram. */
  turn: number | null;
  how: string;
}

/** Normalise "Right 45°", "right 45", "RIGHT 45 degrees" to one key. */
function key(slot: string): string {
  return slot
    .toLowerCase()
    .replace(/°|degrees?/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function angleGuide(slot: string): Guide {
  const k = key(slot);

  if (k === "front") {
    return { turn: 0, how: "Look straight into the camera, with your chin level." };
  }
  if (k === "front hairline") {
    return {
      turn: 0,
      how: "Look straight into the camera and tip your chin down a little, so we can see your hairline.",
    };
  }
  if (k === "top") {
    return {
      turn: null,
      how: "Tip your head forward and hold the phone above you, looking down at the top of your head.",
    };
  }

  // Their right side towards the camera means turning towards the LEFT
  // shoulder. See the note at the top of this file before changing it.
  if (k === "right 45") {
    return {
      turn: -45,
      how: "We need the right side of your face. Turn your head towards your left shoulder, about halfway.",
    };
  }
  if (k === "right 90" || k === "right side" || k === "right") {
    return {
      turn: -90,
      how: "Turn your head towards your left shoulder until you are looking straight sideways — a full profile of your right side.",
    };
  }
  if (k === "left 45") {
    return {
      turn: 45,
      how: "We need the left side of your face. Turn your head towards your right shoulder, about halfway.",
    };
  }
  if (k === "left 90" || k === "left side" || k === "left") {
    return {
      turn: 90,
      how: "Turn your head towards your right shoulder until you are looking straight sideways — a full profile of your left side.",
    };
  }

  // Anything the clinic added by hand — "Left hand", "Injection Site", "left
  // arm". No diagram rather than a misleading one; they were told in the room
  // what this is.
  return {
    turn: null,
    how: `Photograph the ${slot.toLowerCase()}, filling most of the frame and in good light.`,
  };
}

/** Where the guide arc sits — outside the head (r=24) and outside the nose
 *  (tip at r=31), so it traces the turn without colliding with either. */
const ARC_R = 38;

/** A point on that arc, `deg` from "pointing straight at the camera".
 *  POSITIVE deg is counter-clockwise on screen, which is the direction the
 *  face travels when it turns towards the patient's LEFT shoulder. */
function arcPoint(deg: number): [number, number] {
  const r = (deg * Math.PI) / 180;
  return [60 + ARC_R * Math.sin(r), 45 + ARC_R * Math.cos(r)];
}

/** The head, seen from above, with the camera below it. */
export default function AngleGuide({ slot }: { slot: string }) {
  const { turn, how } = angleGuide(slot);

  /**
   * The arrow traces where the NOSE goes, not some abstract spin.
   *
   * It used to be an arc over the top of the head, and it pointed the wrong
   * way: the head rotates counter-clockwise on screen for a right-side shot,
   * and the arrow swept clockwise. Even drawn correctly, an arc over the top
   * is the crown of the head moving, which travels opposite to the face — so
   * it reads as a contradiction of the very thing it is describing.
   *
   * Starting just off the camera line and ending where the nose lands, it
   * says one thing: your face goes here.
   */
  const travel = turn === null ? 0 : -turn;
  const [ax, ay] = arcPoint(Math.sign(travel) * 6);
  const [bx, by] = arcPoint(travel);
  const sweep = travel > 0 ? 0 : 1;

  return (
    <div className="mb-4 flex items-start gap-4 rounded-xl bg-cream-100 px-4 py-3">
      {turn !== null && (
        <svg
          viewBox="0 0 120 110"
          className="h-24 w-24 shrink-0"
          role="img"
          aria-label={`Diagram: head seen from above, turned for ${slot}`}
        >
          {/* The camera, and the line of sight up to the face. Without the
              camera in the picture the rotation has nothing to be relative
              to, and "turned 45°" is not a direction. */}
          <line
            x1="60"
            y1="92"
            x2="60"
            y2="62"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="text-gray-400"
          />
          <rect x="47" y="90" width="26" height="17" rx="4" className="fill-gray-400" />
          <circle cx="60" cy="98" r="4.5" className="fill-cream-100" />

          <g transform={`rotate(${turn} 60 45)`}>
            {/* Head from above: a circle, two ears, and a nose that points at
                whatever the face is pointing at. The nose is the whole
                diagram — everything else is there so it reads as a head. */}
            <circle cx="60" cy="45" r="24" className="fill-white stroke-plum-900" strokeWidth="2" />
            <ellipse cx="36.5" cy="45" rx="3" ry="6" className="fill-white stroke-plum-900" strokeWidth="2" />
            <ellipse cx="83.5" cy="45" rx="3" ry="6" className="fill-white stroke-plum-900" strokeWidth="2" />
            <path d="M54 66 L60 76 L66 66 Z" className="fill-plum-900" />

            {/* Which side is whose. Seen from above with the face pointing at
                the camera, the patient's RIGHT is on the LEFT of the picture —
                true, and the single most confusing thing about this drawing
                until it is labelled. Counter-rotated so it stays upright as
                the head turns, and it is the marker you watch: for a right
                45°, R swings down towards the camera. */}
            <text
              x="26"
              y="48"
              transform={`rotate(${-turn} 26 45)`}
              className="fill-gray-500"
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
            >
              R
            </text>
            <text
              x="94"
              y="48"
              transform={`rotate(${-turn} 94 45)`}
              className="fill-gray-500"
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
            >
              L
            </text>
          </g>

          {turn !== 0 && (
            <path
              d={`M${ax.toFixed(1)} ${ay.toFixed(1)} A ${ARC_R} ${ARC_R} 0 0 ${sweep} ${bx.toFixed(1)} ${by.toFixed(1)}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-brand-600"
              markerEnd="url(#angle-arrow)"
            />
          )}
          <defs>
            <marker
              id="angle-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" className="fill-brand-600" />
            </marker>
          </defs>
        </svg>
      )}
      <p className="text-sm text-gray-700 self-center">{how}</p>
    </div>
  );
}
