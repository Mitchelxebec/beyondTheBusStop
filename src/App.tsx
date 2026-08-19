import React from "react";
import "./index.css";
function App(): React.ReactElement {
  const handleManageSubscription = (): void => {
    alert("Manage Subscription clicked");
  };

  const handleCancelSubscription = (): void => {
    alert("Cancel Subscription clicked");
  };

  const handleContactSupport = (): void => {
    alert("Contact Support clicked");
  };

  return (
    <div className="app">

      {/* Page heading */}
      <div className="page-heading">
        Subscription Management
      </div>

      {/* Mobile screen */}
      <div className="phone">

        {/* Header */}
        <header className="header">

          <button className="back-button">
            ←
          </button>

          <div className="header-brand">
            <div className="brand-icon">
              S
            </div>

            <span>
              Subscription Management
            </span>
          </div>

          <button className="notification-button">
            ♧
          </button>

        </header>


        {/* Main content */}
        <main className="main-content">

          {/* Subscription Card */}
          <section className="subscription-card">

            <div className="subscription-header">

              <div>
                <p className="subscription-name">
                  Basic Subscription
                </p>

                <p className="business-portal">
                  ♧ Business Portal
                </p>
              </div>

              <div className="trial-badge">
                <span className="trial-dot"></span>
                Trial: 5 days left
              </div>

            </div>


            <div className="subscription-line"></div>


            <div className="billing-info">

              <div className="billing-item">
                <span className="billing-label">
                  NEXT BILLING
                </span>

                <span className="billing-value">
                  Oct 24, 2023
                </span>
              </div>


              <div className="billing-item">
                <span className="billing-label">
                  MONTHLY PRICE
                </span>

                <span className="billing-value">
                  ₦5,000/mo
                </span>
              </div>

            </div>

          </section>


          {/* Payment Method */}
          <section className="payment-section">

            <h2>
              Payment Method
            </h2>

            <div className="payment-card">

              <div className="card-type">
                CARD
              </div>

              <div className="card-details">

                <strong>
                  •••• 1234
                </strong>

                <span>
                  Expires 12/25
                </span>

              </div>

              <button className="edit-button">
                ✎
              </button>

            </div>

          </section>


          {/* Buttons */}
          <section className="subscription-actions">

            <button
              className="manage-button"
              onClick={handleManageSubscription}
            >
              ⚙ Manage Subscription
            </button>


            <button
              className="cancel-button"
              onClick={handleCancelSubscription}
            >
              ⊗ Cancel Subscription
            </button>

          </section>


          {/* Help section */}
          <section className="help-card">

            <div className="help-icon">
              ♙
            </div>

            <h3>
              Need help?
            </h3>

            <p>
              Our support team is available 24/7 to assist
              <br />
              with billing inquiries.
            </p>

            <button
              className="contact-button"
              onClick={handleContactSupport}
            >
              Contact Support →
            </button>

          </section>

        </main>


        {/* Bottom navigation */}
        <nav className="bottom-navigation">

          <button className="navigation-item">
            <span className="navigation-icon">
              ▦
            </span>

            <span>
              RATINGS
            </span>
          </button>


          <button className="navigation-item">
            <span className="navigation-icon">
              ▤
            </span>

            <span>
              LISTINGS
            </span>
          </button>


          <button className="navigation-item">
            <span className="navigation-icon">
              ▥
            </span>

            <span>
              ANALYTICS
            </span>
          </button>


          <button className="navigation-item">
            <span className="navigation-icon">
              ♙
            </span>

            <span>
              PROFILE
            </span>
          </button>

        </nav>

      </div>

    </div>
  );
}

export default App;