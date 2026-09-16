import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, updateQty, removeItem, totalPrice, totalSavings, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any snacks yet.</p>
          <Link to="/shop" className="btn btn-gold">Start Shopping</Link>
        </div>
      </div>
    );
  }

  const shipping = totalPrice >= 499 ? 0 : 49;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="hindi-accent hindi-accent-light">आपकी टोकरी</span>
          <div className="breadcrumb">Home / Cart</div>
          <h1>Your Cart</h1>
        </div>
      </div>

      <div className="container section">
        <div className="cart-table-wrap">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.lineId}>
                  <td>
                    <div className="cart-item-name">
                      <img src={item.image} alt={item.name} className="cart-item-icon" />
                      <div>
                        <div>{item.name}</div>
                        <small style={{ color: "#8a7862" }}>{item.weight}</small>
                      </div>
                    </div>
                  </td>
                  <td>₹{item.price}</td>
                  <td>
                    <div className="qty-control">
                      <button onClick={() => updateQty(item.lineId, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.lineId, item.qty + 1)}>+</button>
                    </div>
                  </td>
                  <td>₹{item.price * item.qty}</td>
                  <td>
                    <button className="remove-btn" onClick={() => removeItem(item.lineId)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <Link to="/shop" className="btn btn-outline" style={{ color: "var(--maroon)", border: "2px solid var(--maroon)" }}>
            Continue Shopping
          </Link>
          <button className="remove-btn" onClick={clearCart}>Clear Cart</button>
        </div>

        <div className="cart-summary">
          {totalSavings > 0 && (
            <div className="summary-row savings-row">
              <span>You saved</span>
              <span>₹{totalSavings}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{totalPrice}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₹{totalPrice + shipping}</span>
          </div>
          <button
            className="btn btn-gold"
            style={{ width: "100%", justifyContent: "center", marginTop: 14 }}
            onClick={() => alert("This is a demo storefront — checkout is not connected to payments yet.")}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
}
