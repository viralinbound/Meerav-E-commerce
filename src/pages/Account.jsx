import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import JaaliDivider from "../components/JaaliDivider";

export default function Account() {
  const { customer, loading, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", pincode: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res =
      mode === "signin"
        ? await signIn(form.email, form.password)
        : await signUp(form);
    setBusy(false);
    if (res.error) {
      setError(res.error.message || "Something went wrong. Please try again.");
    } else if (res.needsConfirmation) {
      setError("Check your email to confirm your account, then sign in.");
      setMode("signin");
    }
  }

  if (loading) {
    return <div className="container section" style={{ textAlign: "center" }}>Loading your account…</div>;
  }

  if (customer) {
    return (
      <>
        <div className="page-header">
          <div className="container">
            <span className="hindi-accent hindi-accent-light">आपका खाता</span>
            <div className="breadcrumb">Home / Account</div>
            <h1>Your Account</h1>
          </div>
        </div>
        <JaaliDivider tone="light" />
        <div className="container section">
          <div className="account-card">
            <div className="team-initials">{customer.name?.slice(0, 2).toUpperCase()}</div>
            <h2>{customer.name}</h2>
            <p>{customer.email}</p>
            {customer.phone && <p>{customer.phone}</p>}
            {customer.address && <p>{customer.address}{customer.pincode ? ` (${customer.pincode})` : ""}</p>}
            <div className="account-actions">
              <Link to="/wishlist" className="btn btn-outline" style={{ color: "var(--maroon)", border: "2px solid var(--maroon)" }}>
                My Wishlist
              </Link>
              <Link to="/cart" className="btn btn-outline" style={{ color: "var(--maroon)", border: "2px solid var(--maroon)" }}>
                My Cart
              </Link>
              <button className="btn btn-gold" onClick={signOut}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="hindi-accent hindi-accent-light">आपका खाता</span>
          <div className="breadcrumb">Home / Account</div>
          <h1>{mode === "signin" ? "Sign In" : "Create Your Account"}</h1>
        </div>
      </div>
      <JaaliDivider tone="light" />

      <div className="container section">
        <div className="account-auth-grid">
          <form className="contact-form account-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Delivery Address"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)}
                />
              </>
            )}
            <input
              type="email"
              placeholder="Email Address"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
            {error && <p className="delivery-msg" style={{ color: "var(--terracotta)" }}>{error}</p>}
            <button type="submit" className="btn btn-gold" disabled={busy} style={{ justifyContent: "center" }}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="account-switch">
            {mode === "signin" ? (
              <>
                <p>New to Meerav?</p>
                <button className="btn-details" onClick={() => { setMode("signup"); setError(""); }}>
                  Create an Account
                </button>
              </>
            ) : (
              <>
                <p>Already have an account?</p>
                <button className="btn-details" onClick={() => { setMode("signin"); setError(""); }}>
                  Sign In Instead
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
