const IMAGES = [
  "/images/ph_bhujia.svg",
  "/images/ph_roasted.svg",
  "/images/ph_mixture.svg",
  "/images/ph_mathri.svg",
  "/images/ph_sweets.svg",
  "/images/products/meerav_1.jpg",
];

export default function InstagramGallery() {
  return (
    <section className="section insta-section">
      <div className="section-head">
        <div className="section-eyebrow">Straight From the Kitchen</div>
        <h2>
          Follow Us <em>@meerav.bikaner</em>
        </h2>
      </div>
      <div className="insta-grid">
        {IMAGES.map((src) => (
          <a
            key={src}
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="insta-tile"
          >
            <img src={src} alt="Meerav on Instagram" loading="lazy" />
            <span className="insta-tile-overlay">View</span>
          </a>
        ))}
      </div>
    </section>
  );
}
