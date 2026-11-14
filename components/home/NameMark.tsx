/**
 * The name for the home page and the intro. For a two-word "Firstname Lastname" name, the
 * first letter of the last name uses the mark font (Oswald, same as the RM logo).
 */
export default function NameMark({ headline }: { headline: string }) {
  const words = headline.trim().split(/\s+/).filter(Boolean);
  if (words.length === 2) {
    return (
      <>
        {words[0]} <span className="font-mark font-bold">{words[1][0]}</span>
        {words[1].slice(1)}
      </>
    );
  }
  return <>{headline}</>;
}
