import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { flavorPollEntries } from "../data/staticContent";

const FALLBACK_COUPON = "MEERAV10";

function readVotes() {
  try {
    return JSON.parse(localStorage.getItem("meerav_flavor_votes")) || {};
  } catch {
    return {};
  }
}

export default function FlavorPoll() {
  const { getProduct, coupons } = useCatalog();
  const couponCode = coupons[0]?.code || FALLBACK_COUPON;
  const [customVotes, setCustomVotes] = useState(readVotes);
  const [userVoted, setUserVoted] = useState(() => {
    try {
      return localStorage.getItem("meerav_user_voted_flavor");
    } catch {
      return null;
    }
  });

  const flavors = useMemo(
    () => flavorPollEntries.map((f) => ({ ...f, product: getProduct(f.id) })).filter((f) => f.product),
    [getProduct]
  );

  if (flavors.length === 0) return null;

  const items = flavors.map((f) => ({ ...f, votes: f.baseVotes + (customVotes[f.id] || 0) }));
  const total = items.reduce((sum, f) => sum + f.votes, 0);

  function castVote(flavorId) {
    if (userVoted) return;
    const next = { ...customVotes, [flavorId]: (customVotes[flavorId] || 0) + 1 };
    setCustomVotes(next);
    setUserVoted(flavorId);
    try {
      localStorage.setItem("meerav_flavor_votes", JSON.stringify(next));
      localStorage.setItem("meerav_user_voted_flavor", flavorId);
    } catch {
      /* ignore storage errors */
    }
  }

  return (
    <section className="section poll-section">
      <div className="container">
        <div className="section-head">
          <div className="section-eyebrow">Cast Your Vote</div>
          <h2>Which Crunch Wins Your Heart?</h2>
          <p>
            Vote for the iconic Meerav flavour you love most and unlock an instant coupon —
            <strong> {couponCode}</strong>.
          </p>
        </div>

        <div className="poll-grid">
          {items.map((f) => {
            const pct = total > 0 ? Math.round((f.votes / total) * 100) : 0;
            const voted = userVoted === f.id;
            return (
              <div key={f.id} className={`poll-card ${voted ? "voted" : ""}`}>
                <div className="poll-card-top">
                  <span className="poll-tag">{f.tag}</span>
                </div>
                <h4>{f.product.name}</h4>
                <p>{f.product.description}</p>
                <div className="poll-bar-track">
                  <div className="poll-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="poll-stats">
                  <span>{pct}% ({f.votes.toLocaleString()} votes)</span>
                  {voted && <span className="poll-voted-tag">Your Vote</span>}
                </div>
                <div className="poll-actions">
                  <button
                    className="btn-details poll-vote-btn"
                    disabled={!!userVoted}
                    onClick={() => castVote(f.id)}
                  >
                    {voted ? "Voted" : "Vote This"}
                  </button>
                  <Link to={`/product/${f.product.id}`} className="add-btn">
                    Order Pack
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
