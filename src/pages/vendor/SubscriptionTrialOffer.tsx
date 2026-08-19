import React from "react";
import "./SubscriptionTrialOffer.css";

function App(): React.ReactElement {

  const handleStartTrial = (): void => {
    alert("7-Day Free Trial Started!");
  };

  const handleBack = (): void => {
    alert("Back button clicked");
  };

  return (
    <div className="app">

      {/* Page title */}
      <div className="page-title">
        Subscription Trial Offer
      </div>


      {/* Mobile screen */}
      <div className="phone">


        {/* Header */}
        <header className="header">

          <button
            className="back-button"
            onClick={handleBack}
          >
            ←
          </button>


          <div className="header-content">

            <div className="header-icon">
              S
            </div>

            <span>
              Subscription Plans
            </span>

          </div>

        </header>


        {/* Main Content */}
        <main className="main-content">


          {/* Trial badge */}
          <div className="trial-offer">
            ⭐ First 7 days FREE
          </div>


          {/* Main heading */}
          <h1>
            Elevate Your Business
          </h1>


          <p className="intro-text">
            Try our Basic Subscription and reach
            <br />
            thousands of daily commuters.
          </p>


          {/* Subscription Card */}
          <section className="subscription-card">


            {/* Plan information */}
            <div className="plan-info">

              <p className="plan-name">
                Basic Subscription
              </p>

              <p className="plan-price">
                ₦5,000
                <span>/month</span>
              </p>

            </div>


            {/* Dates */}
            <div className="dates-card">

              <div className="date-row">

                <span>
                  Trial Start
                </span>

                <strong>
                  Today, Aug 11
                </strong>

              </div>


              <div className="date-row">

                <span>
                  Trial Ends
                </span>

                <strong>
                  Aug 18
                </strong>

              </div>


              <div className="date-row">

                <span>
                  First Payment
                </span>

                <strong>
                  Aug 19
                </strong>

              </div>

            </div>


            {/* What's included */}
            <div className="included-section">

              <h2>
                WHAT'S INCLUDED
              </h2>


              <ul>

                <li>
                  <span className="check">
                    ✓
                  </span>

                  Create and promote business listings
                </li>


                <li>
                  <span className="check">
                    ✓
                  </span>

                  Reach commuters near busy transport
                  <br />
                  routes
                </li>


                <li>
                  <span className="check">
                    ✓
                  </span>

                  Access listing performance insights
                </li>


                <li>
                  <span className="check">
                    ✓
                  </span>

                  Manage and renew promotions
                </li>

              </ul>

            </div>

          </section>


          {/* Trial disclaimer */}
          <p className="disclaimer">

            You won't be charged during your 7-day trial.
            Your monthly
            <br />

            subscription will begin after the trial unless you cancel
            <br />

            before the trial ends.

          </p>


        </main>


        {/* Bottom button */}
        <div className="bottom-action">

          <button
            className="start-button"
            onClick={handleStartTrial}
          >
            Start 7-Day Free Trial
            <span>
              →
            </span>
          </button>

        </div>


      </div>

    </div>
  );
}

export default App;