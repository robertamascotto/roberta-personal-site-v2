import { Fragment } from "react";

/**
 * The home headline split into one span per word, so the white intro can fly each
 * word from the middle of the screen to its place in the hero.
 *
 * Brand detail kept from before: for a two-word "Firstname Lastname" headline, the
 * first letter of the last name uses the mark font (Oswald, same as the RM logo).
 * Any other headline shape just renders its words plainly.
 */
export default function HeadlineWords({
  headline,
  wordClassName,
  wordData,
}: {
  headline: string;
  /** Extra class for every word span. */
  wordClassName?: string;
  /** A data attribute put on every word, e.g. { "data-intro-word": "" }, so it can be found. */
  wordData?: Record<`data-${string}`, string>;
}) {
  const words = headline.trim().split(/\s+/).filter(Boolean);
  const twoWords = words.length === 2;

  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          {/* The space keeps the text reading "Roberta Mascotto" for search engines and
              screen readers; in a flex row it takes no room (the gap does the spacing). */}
          {i > 0 ? " " : null}
          <span {...wordData} className={`block${wordClassName ? ` ${wordClassName}` : ""}`}>
            {twoWords && i === 1 ? (
              <>
                <span className="font-mark font-bold">{word[0]}</span>
                {word.slice(1)}
              </>
            ) : (
              word
            )}
          </span>
        </Fragment>
      ))}
    </>
  );
}
