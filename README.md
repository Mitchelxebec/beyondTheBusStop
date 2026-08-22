# Beyond The Bus Stop (BTBS)

### The transit information layer built for Lagos informal transport.

**Beyond The Bus Stop** is a mobile-first platform designed to help
Lagos commuters navigate the danfo and keke transport system with better
access to **routes, expected fares, community-verified fare confidence,
nearby essentials, and trip safety tools**.

> **Google Maps shows you the route. We show you the fair fare.**

Lagos has a massive informal transport network, but commuters often have
no reliable reference for what a route should cost before boarding. BTBS
is being built around that gap.

Instead of trying to replace the existing transport system, BTBS works
with it --- turning commuter experiences into useful route and fare
information for the next commuter.

------------------------------------------------------------------------

## The Problem

For many Lagos commuters, especially people travelling unfamiliar
routes:

-   Route information is fragmented.
-   Danfo and keke fares are not standardized or consistently published.
-   The same journey can attract different quoted fares.
-   New residents often depend on strangers or repeated trial and error
    to understand routes.
-   Existing navigation products do not provide a dedicated danfo/keke
    fare-verification layer.
-   Commuters also need quick access to nearby safety and essential
    services.

This creates a simple but important question:

**"How do I know I'm taking the right route and paying a reasonable
fare?"**

BTBS is designed to answer it.

------------------------------------------------------------------------

## The Solution

BTBS combines route discovery with community-driven fare information.

A commuter can:

1.  Search for a destination.
2.  See available danfo/keke route options.
3.  Compare expected fare ranges.
4.  See a confidence level based on commuter confirmations.
5.  Open the route details for boarding, transfer and drop-off
    information.
6.  Find nearby essential services.
7.  Share trip information when needed.
8.  Confirm the fare actually paid after travelling.

Each confirmation becomes another data point that helps keep route and
fare information useful over time.

------------------------------------------------------------------------

# What We Have Built --- MVP

The current product has progressed from the initial product concept into
a working MVP implementation with the core commuter experience connected
to the backend.

## 🚌 Route & Destination Search

The platform provides a route-search experience for finding relevant
danfo/keke routes within the Lagos-focused MVP.

Users can move from destination search to route options and then into
detailed route information.

## 💰 Fare Information

Route results and route details display expected fare information,
including fare ranges and average fare information where provided by the
backend.

The goal is simple:

**Know what a journey should cost before boarding.**

## 📊 Community Fare Confidence

BTBS includes a confidence system around route/fare information.

After a commuter confirms a fare, the backend processes the confirmation
and updates the route's:

-   confidence score
-   confidence level
-   total confirmations
-   latest confirmation information
-   fare information where applicable

The frontend displays these results rather than calculating the
confidence score itself.

This creates the foundation for a continuously improving community data
loop.

## 🧭 Route Details & Guidance

The route details experience provides a deeper view of a selected route,
including:

-   route overview
-   fare information
-   confidence information
-   confirmation count
-   route/corridor waypoints
-   boarding and drop-off context
-   map visualization
-   nearby essentials
-   route reporting
-   fare confirmation
-   trip-sharing entry points

## 🏥 Nearby Essentials

BTBS includes a nearby-essentials experience designed to help commuters
orient themselves around a route or destination.

The MVP safety layer covers:

-   Hospitals
-   Police stations
-   Markets

Nearby results are designed around real location/proximity information
rather than arbitrary static recommendations.

## 🛡️ Trip Safety & Sharing

The product includes trip-sharing functionality intended to allow a
commuter to share important trip information with a trusted contact
before travelling.

The MVP concept focuses on sharing route and approximate journey
information rather than attempting to become a full vehicle-tracking
platform.

## 📍 Location Awareness

BTBS uses device location where location-dependent features require it.

The platform also has backend support for reverse geocoding, allowing
GPS coordinates to be resolved into a more meaningful place/street name
instead of relying only on a generic "Current Location" label.

## 👤 Authentication & Profiles

The platform supports authenticated commuter and business experiences.

Profile management has been integrated for relevant account information,
with backend support for profile-picture uploads.

## 🔖 Saved Routes

The commuter experience includes saved-route functionality so users can
keep routes they expect to use again.

## 🏪 Local Business Listings

BTBS also creates a discovery opportunity for businesses located around
commuter corridors.

Businesses can appear as relevant local listings, with the product
designed to support clearly identified boosted/sponsored placement.

This creates a potential revenue layer without charging commuters for
the core route-information experience.

## 💳 Business Monetization

The MVP includes the foundation for boosted business placement and
payment flows.

The product model is intentionally designed around businesses paying for
visibility to commuters already travelling through relevant locations.

The PRD targets boosted placements as an early revenue engine.

------------------------------------------------------------------------

# Why This Is Different

BTBS is not trying to be another generic map.

### Google Maps

Great for roads, directions and navigation.

**BTBS adds the informal transit layer --- particularly route/fare
context for danfo and keke commuters.**

### Ride-hailing

Bolt, Uber and similar platforms solve fare uncertainty by providing a
booked and metered trip.

But they serve a different economic use case.

BTBS is designed for the everyday commuter who still relies on informal
public transport.

### Formal Transit

BRT and other formal systems cover specific corridors.

BTBS is focused on the much broader informal transport network that
commuters already use every day.

### The Opportunity

The product is positioned around a simple gap:

> **There is route information. There is transport information. There is
> fare information. But there is very little trusted, community-verified
> fare information specifically for Lagos informal transport.**

BTBS is designed to become that layer.

------------------------------------------------------------------------

# The Data Flywheel

The strongest part of the product is not just the interface --- it is
the potential data loop behind it.

``` text
Commuter searches
       ↓
BTBS provides route + fare information
       ↓
Commuter travels
       ↓
Commuter confirms actual fare
       ↓
BTBS confidence/data improves
       ↓
Next commuter gets better information
       ↓
More commuters use and contribute
```

As route coverage and confirmation volume grow, the platform can build
an increasingly useful dataset around informal transport routes and
fares.

That creates potential value beyond the consumer application.

------------------------------------------------------------------------

# Business Model

The initial revenue strategy is intentionally simple.

## 1. Boosted Business Listings

Local businesses near high-footfall transport corridors can pay for
increased visibility to commuters using BTBS.

Examples can include:

-   pharmacies
-   food businesses
-   retail shops
-   service businesses
-   other businesses located near relevant commuter corridors

Sponsored placements are intended to be clearly labelled to maintain
user trust.

## 2. Event Listings

The PRD identifies one-off event listings as another near-term revenue
opportunity.

## 3. Future B2B Data Products

Once sufficient route and fare data exists, aggregated and anonymized
data could become useful to other organizations.

Potential future customers identified in the product strategy include:

-   logistics companies
-   delivery platforms
-   real-estate companies
-   other mobility-related businesses

This is intentionally a **post-MVP opportunity**, not a dependency for
the initial product.

------------------------------------------------------------------------

# What Is Outside the MVP

The current MVP is intentionally focused. The following are part of the
longer-term roadmap rather than the core four-week MVP scope:

### 🛠️ Admin Moderation Platform

A dedicated dashboard for reviewing, approving, editing and rejecting
user-submitted fare updates and reports.

### 🏪 Self-Serve Business Onboarding

Allow businesses to register themselves, submit their listings and
manage boosted placements without manual team involvement.

### 💳 Self-Serve Business Payments

Move beyond the current team-managed business flow toward fully
self-service in-platform payment and activation.

### 📍 Broader Local Discovery

Expand beyond essential services into:

-   landmarks
-   museums
-   events
-   conferences
-   other local points of interest

### 📈 B2B Data Licensing

Turn aggregated route and fare intelligence into a potential data
product for logistics, delivery, real estate and related businesses.

### 📱 Native Mobile Applications

Dedicated iOS and Android applications beyond the current responsive
PWA.

### 🚍 Live Vehicle Tracking

Real-time vehicle/location tracking is a future capability and is
deliberately separate from the current after-trip fare-confirmation
model.

### 🌍 Multi-City Expansion

Replicate the model across other Nigerian cities and eventually other
African cities with similar informal-transit information gaps.

------------------------------------------------------------------------

# Product Vision

The long-term ambition is bigger than a route finder.

**BTBS aims to become a trusted fare and route transparency layer for
informal public transportation in Lagos --- and eventually other cities
with similar transport information gaps.**

The first product is the commuter experience.

The long-term opportunity is the **data infrastructure created by that
experience**.

As more commuters search, travel and confirm fares, BTBS can build a
structured understanding of how informal transport actually works on the
ground.

That can support:

-   better consumer information
-   better local business discovery
-   mobility intelligence
-   future B2B data products
-   expansion into additional cities

------------------------------------------------------------------------

# Current Status

**MVP --- Active development, integration and refinement.**

The core product journey has been substantially implemented:

``` text
Destination
    ↓
Route Search
    ↓
Route Options
    ↓
Fare + Confidence
    ↓
Route Details
    ↓
Nearby Essentials
    ↓
Trip / Safety Actions
    ↓
Fare Confirmation
```

The project is now focused on final integration, removing remaining
placeholder/demo content, responsive refinement, backend/frontend
alignment and end-to-end MVP testing.

------------------------------------------------------------------------

# Technology

### Frontend

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   React Router
-   TanStack Query
-   Axios
-   Leaflet

### Backend

-   Node.js
-   Express
-   MongoDB
-   REST APIs
-   JWT authentication
-   Cloudinary for profile-image storage
-   Google Maps/Places-related services where required
-   Paystack-related payment infrastructure for business monetization

------------------------------------------------------------------------

# Getting Started

## Installation

``` bash
npm install
```

## Environment

Configure the frontend API base URL:

``` env
VITE_API_BASE_URL=<backend-url>
```

## Development

``` bash
npm run dev
```

## Production Build

``` bash
npm run build
```

------------------------------------------------------------------------

# Vision

Lagos already has a transportation system that millions of people
understand through experience, word of mouth and daily repetition.

**BTBS is building the digital information layer around that system.**

The goal is not to change how Lagos moves.

**The goal is to make Lagos easier to navigate, easier to understand,
and harder to overcharge.**

------------------------------------------------------------------------

## Beyond The Bus Stop

**Routes people understand.\
Fares people can trust.**
