export default function JaaliDivider({ tone = "light" }) {
  return (
    <div className={`jaali-divider jaali-divider-${tone}`} aria-hidden="true">
      <svg viewBox="0 0 800 28" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 21 }).map((_, i) => {
          const x = i * 40;
          return (
            <path
              key={i}
              d={`M${x},28 L${x + 20},2 L${x + 40},28`}
              fill="none"
              strokeWidth="1.5"
            />
          );
        })}
        {Array.from({ length: 20 }).map((_, i) => (
          <circle key={`c${i}`} cx={i * 40 + 20} cy="8" r="2.5" />
        ))}
      </svg>
    </div>
  );
}
