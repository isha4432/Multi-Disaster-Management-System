# Original project spec (master prompt)

This is the original AI-generation prompt used to bootstrap this project via Lovable.
It describes an aspirational full-stack system (Node/Express/MongoDB backend, Python
FastAPI AI service, RoBERTa/CLIP/ViT models, Copernicus satellite integration, etc).
Kept here for historical reference only — see the main README.md for what is
actually implemented in this repo today.

---

🚨 First: the API keys

I cannot give you someone else's real API keys. The AI coding tool must never invent them either.

You will create:

ServiceCredentialGoogle MapsGOOGLE_MAPS_API_KEYOpenWeatherOPENWEATHER_API_KEYNASA FIRMSNASA_FIRMS_MAP_KEYCopernicusCOPERNICUS_CLIENT_ID + COPERNICUS_CLIENT_SECRETUSGSNo key for the basic public earthquake feedKaggleYour dataset/account access

For Google Maps, use Google's official setup. Google Maps JavaScript API setup

For FIRMS, request your free MAP_KEY here. NASA FIRMS MAP_KEY

For Copernicus, create an OAuth client in your Sentinel Hub dashboard. Copernicus Sentinel Hub authentication

MASTER PROMPT — GENERATE THE WHOLE PROJECT

Copy everything below into your AI coding tool.

You are a Senior Full-Stack Architect, AI/ML Engineer,
Geospatial Engineer and UI/UX Designer.

Build a complete production-style prototype called:

AI-Agent for Multimodal Disaster Intelligence & Humanitarian Relief

IMPORTANT:

Do NOT create a generic admin dashboard.

Do NOT use a black/dark background.

Do NOT create excessive cards.

Do NOT make the UI overly bold.

Do NOT use fake maps.

Use the REAL Google Maps JavaScript API.

The primary visual element of the application must be
the interactive Google Map.

The design must use:

- white
- warm white
- orange
- green
- subtle grey
- small amounts of red/amber only for emergency status

Design should feel:

- professional
- modern
- clean
- humanitarian
- intelligent
- calm
- trustworthy
- geospatial
- lightweight
- elegant

The application must be responsive.

==================================================
1. PROJECT PURPOSE
==================================================

Build an AI-powered disaster intelligence and humanitarian
decision-support platform.

The system combines:

1. Social-media disaster reports
2. Satellite imagery
3. Weather information
4. NASA FIRMS fire observations
5. USGS earthquake information
6. SOS requests
7. Relief-center resources

The AI should:

- detect possible disasters
- classify disaster-related social posts
- analyze satellite imagery
- combine multimodal evidence
- calculate confidence
- calculate uncertainty
- identify information gaps
- recommend what information should be collected next
- reassess when new evidence arrives
- estimate humanitarian requirements
- prioritize SOS cases
- recommend relief-center allocation

IMPORTANT INNOVATION:

The system should NOT simply detect disasters.

It must answer:

"WHAT INFORMATION ARE WE MISSING?"

and then recommend:

"WHAT SHOULD WE OBSERVE NEXT?"

This Information Gap + Next Observation system is a
central feature of the project.

==================================================
2. TECHNOLOGY STACK
==================================================

FRONTEND

React
Vite
Tailwind CSS
Google Maps JavaScript API
React Google Maps
Recharts
Lucide React
Axios
React Router

BACKEND

Node.js
Express.js
MongoDB Atlas
Mongoose
Axios
JWT authentication

AI SERVICE

Python
FastAPI
PyTorch
Transformers
Hugging Face
RoBERTa
CLIP
Vision Transformer
Pandas
NumPy
scikit-learn
Pillow

GEOSPATIAL

Google Maps JavaScript API
Google Maps marker/layer system
Google Maps geometry utilities
Google Maps Routes API where appropriate

DATA SOURCES

Global Disaster Tweets dataset
Copernicus Sentinel-1
Copernicus Sentinel-2
NASA FIRMS
OpenWeather
USGS earthquake feed

==================================================
3. FOLDER STRUCTURE
==================================================

Create:

AI-DISASTER-INTELLIGENCE/

frontend/
backend/
ai-service/
data/
models/
scripts/
docs/
tests/

Frontend:

frontend/
  src/
    components/
      layout/
      map/
      intelligence/
      sos/
      relief/
      evidence/
      common/
    pages/
      Dashboard.jsx
      LiveMap.jsx
      AIAgent.jsx
      SOS.jsx
      Relief.jsx
      Reports.jsx
      Settings.jsx
    services/
    hooks/
    utils/
    styles/
    App.jsx
    main.jsx

Backend:

backend/
  src/
    controllers/
    routes/
    models/
    services/
      google/
      weather/
      firms/
      usgs/
      copernicus/
      ai/
    middleware/
    utils/
    config/
    server.js

AI:

ai-service/
  app/
    api/
    models/
      nlp/
      vision/
      multimodal/
    services/
      roberta/
      clip/
      vit/
      satellite/
      fusion/
      uncertainty/
      information_gap/
      relief/
    agents/
    schemas/
    utils/
    main.py

Data:

data/
  raw/
  processed/
  global-disaster-tweets/

Models:

models/
  roberta/
  vision/

Tests:

tests/
  frontend/
  backend/
  ai/

==================================================
4. ENVIRONMENT VARIABLES
==================================================

Create .env.example.

NEVER hard-code secrets.

NEVER expose private backend credentials
to the frontend.

Frontend:

VITE_GOOGLE_MAPS_API_KEY=

Backend:

PORT=5000
MONGODB_URI=
JWT_SECRET=

OPENWEATHER_API_KEY=
NASA_FIRMS_MAP_KEY=

COPERNICUS_CLIENT_ID=
COPERNICUS_CLIENT_SECRET=

GOOGLE_MAPS_SERVER_KEY=

AI_SERVICE_URL=http://localhost:8000

Optional:

X_BEARER_TOKEN=

AI service:

MODEL_PATH=
DATA_PATH=

Create .gitignore.

Include:

.env
.env.local
node_modules
__pycache__
.venv
models
data/raw

==================================================
5. GOOGLE MAPS
==================================================

Use the REAL Google Maps JavaScript API.

Do not use:

- OpenStreetMap
- Leaflet as the primary map
- static image
- fake map
- iframe map

Use Google Maps.

The map must be the largest visual element.

Default center:

Use a configurable disaster monitoring location.

Do not hard-code the user's private location.

Create:

GoogleMap.jsx

Features:

- zoom
- pan
- satellite view
- roadmap view
- terrain view
- fullscreen
- zoom controls
- layer controls
- markers
- polygons
- circles
- info windows
- clustering where appropriate

Create layers:

1. SOS
2. Disaster zones
3. Fire detections
4. Earthquakes
5. Social reports
6. Relief centers
7. Satellite observations

Marker colors:

SOS critical = red
SOS high = orange
relief center = green
fire = orange
earthquake = amber
social report = blue

Add map legend.

Add map layer toggle.

Add selected-event side panel.

==================================================
6. FRONTEND DESIGN
==================================================

IMPORTANT:

No black background.

No giant hero section.

No oversized typography.

No excessive cards.

Use a command-center layout.

Main colors:

Orange:
#F97316

Dark orange:
#EA580C

Green:
#16A34A

Light green:
#DCFCE7

Warm white:
#FFFDF9

White:
#FFFFFF

Text:
#263238

Muted:
#64748B

Emergency red:
#DC2626

Background:
#F7F7F5

Layout:

------------------------------------------------
HEADER
------------------------------------------------

Logo:
Disaster Intelligence

Subtitle:
AI-powered multimodal disaster response

Right:

LIVE
system status
alert count
user/profile

------------------------------------------------
LEFT SIDEBAR
------------------------------------------------

Overview
Live Map
AI Intelligence
SOS
Relief
Reports
Settings

Sidebar must be slim.

------------------------------------------------
MAIN AREA
------------------------------------------------

Large Google Map.

Map should occupy approximately
60% of initial dashboard visual space.

Below/alongside map:

AI Situation Intelligence

Response Priority

------------------------------------------------
RIGHT/LOWER INTELLIGENCE PANEL
------------------------------------------------

Situation:

FLOOD DETECTED

Confidence:
91%

Evidence:

Social
Satellite
Weather
FIRMS

Information Gap:

Recent SAR observation unavailable.

Recommended:

Request Sentinel-1 SAR.

------------------------------------------------

Use thin borders.

Use subtle shadows.

Use medium font weights.

Avoid giant rounded containers.

==================================================
7. DASHBOARD
==================================================

Dashboard must contain:

LIVE MAP

Current situation

Active disasters

SOS count

AI confidence

Information gap

Recommended next observation

Relief requirements

Recent events

Do not put everything into separate giant cards.

Use a balanced grid and map-first hierarchy.

==================================================
8. SOCIAL MEDIA DATA
==================================================

Use:

Global Disaster Tweets dataset.

Expected fields:

id
keyword
location
text
target

Download from:

Kaggle Global Disaster Tweets.

Create preprocessing.

Steps:

- load CSV
- validate columns
- remove null text
- remove duplicates
- normalize whitespace
- preserve disaster terms
- inspect class balance
- split stratified train/validation/test

Generate report:

class distribution
missing values
duplicates
text length
sample records

==================================================
9. ROBERTA
==================================================

Fine-tune:

roberta-base

Task:

binary classification:

disaster
non-disaster

Input:

tweet text

Output:

{
  "prediction": "disaster",
  "confidence": 0.91,
  "probabilities": {
     "disaster": 0.91,
     "non_disaster": 0.09
  }
}

Calculate ACTUAL:

accuracy
precision
recall
F1
confusion matrix

Do not invent metrics.

Save:

models/roberta/

Create:

train.py
evaluate.py
inference.py

Expose FastAPI endpoint:

POST /predict/social

==================================================
10. LOCATION EXTRACTION
==================================================

Extract location information from social reports.

Use:

keyword
location field
text

Do not assume that every location string is valid.

Normalize location.

If coordinates cannot be reliably obtained:

mark:

location_confidence = low

Do not fabricate coordinates.

==================================================
11. SATELLITE
==================================================

Integrate:

Copernicus Data Space Sentinel Hub.

Use:

Sentinel-1
Sentinel-2

Sentinel-1:

SAR analysis.

Sentinel-2:

optical analysis.

Create:

satellite_client.py

Capabilities:

- authenticate
- search imagery
- retrieve imagery
- retrieve acquisition time
- retrieve cloud information when available
- return metadata

Inputs:

latitude
longitude
bbox
start_date
end_date

Do not hard-code credentials.

==================================================
12. CLIP
==================================================

Use CLIP for initial zero-shot image classification.

Candidate classes:

flood
wildfire
landslide
earthquake damage
cyclone damage
normal landscape

Output:

class
confidence
all probabilities

IMPORTANT:

Label this as:

"AI-assisted visual classification"

until a disaster-specific trained model is evaluated.

==================================================
13. VISION TRANSFORMER
==================================================

Create ViT pipeline.

Initially:

use a pretrained ViT model.

Prepare the architecture so it can later be fine-tuned
on disaster-specific satellite imagery.

Create:

image_processor.py
vit_model.py
vision_inference.py

==================================================
14. WEATHER
==================================================

Integrate OpenWeather.

Input:

latitude
longitude

Retrieve:

temperature
humidity
wind speed
pressure
visibility
rain
weather condition

Create contextual signals:

heavy rainfall
strong wind
extreme weather
possible flood conditions

Do NOT call this a prediction unless supported by a trained
predictive model.

Return:

weather evidence
timestamp
confidence

==================================================
15. NASA FIRMS
==================================================

Integrate NASA FIRMS.

Use MAP_KEY.

Retrieve:

active fires
latitude
longitude
brightness
confidence
acquisition time
satellite

Display fire points on Google Maps.

Create:

firms_service.js

Add caching to avoid unnecessary repeated requests.

Respect API limits.

==================================================
16. USGS
==================================================

Integrate the USGS earthquake GeoJSON feed.

Retrieve:

event ID
magnitude
location
depth
timestamp
coordinates

Display earthquakes on Google Maps.

Use magnitude-based marker size.

==================================================
17. EVIDENCE MODEL
==================================================

Every evidence item must have:

id
source
prediction
confidence
timestamp
latitude
longitude
freshness
reliability
details

Example:

{
 "source": "satellite",
 "prediction": "flood",
 "confidence": 0.88,
 "timestamp": "...",
 "latitude": 16.5,
 "longitude": 80.6
}

==================================================
18. MULTIMODAL FUSION
==================================================

Combine:

RoBERTa
Satellite
Weather
FIRMS
USGS

Do NOT blindly average confidence.

Consider:

confidence
source reliability
freshness
geographic relevance
agreement
contradiction

Output:

disaster_type
overall_confidence
uncertainty
supporting_evidence
contradicting_evidence

Example:

{
 "disaster_type": "flood",
 "confidence": 0.91,
 "uncertainty": 0.09,
 "supporting_evidence": [],
 "contradicting_evidence": []
}

==================================================
19. INFORMATION GAP AGENT
==================================================

THIS IS A CORE INNOVATION.

The system must identify missing or weak evidence.

Examples:

Satellite missing:

"Recent satellite evidence unavailable."

Optical image cloud-covered:

"Optical imagery unreliable. Recommend SAR."

Old satellite:

"Satellite observation is stale."

Social and satellite disagree:

"Ground-level evidence required."

Fire suspected:

"Recommend active-fire observation."

Return:

information_gap
reason
missing_evidence
recommended_observation
priority

==================================================
20. NEXT OBSERVATION AGENT
==================================================

Based on information gap, recommend:

Sentinel-1 SAR
Sentinel-2 optical
weather update
FIRMS
social reports
ground report
SOS verification

Example:

INPUT:

Optical image
cloud coverage high

OUTPUT:

{
 "recommendation": "Sentinel-1 SAR",
 "reason":
 "SAR can provide useful observations when optical imagery is obscured",
 "priority": "HIGH"
}

==================================================
21. ADAPTIVE LOOP
==================================================

Implement:

evidence
 ↓
assessment
 ↓
uncertainty
 ↓
information gap
 ↓
next observation
 ↓
new evidence
 ↓
reassessment

Store every iteration.

Create an audit trail.

==================================================
22. SOS SYSTEM
==================================================

Create SOS submission.

Fields:

SOS ID
latitude
longitude
people
food needed
water needed
medical needed
trapped
message
contact available
timestamp
status
priority

Statuses:

NEW
VERIFIED
ASSIGNED
IN_PROGRESS
RESOLVED

Priority:

CRITICAL
HIGH
MEDIUM
LOW

Do not automatically dispatch emergency services.

==================================================
23. HUMANITARIAN NEED ESTIMATION
==================================================

Input:

people
duration
medical cases
children if available
elderly if available

Calculate estimated:

food meals
water liters
medical kits

Clearly display:

ESTIMATED REQUIREMENT

Never claim it is a confirmed requirement.

==================================================
24. RELIEF CENTERS
==================================================

MongoDB model:

ReliefCenter

Fields:

name
latitude
longitude
foodInventory
waterInventory
medicalInventory
capacity
status

Display on Google Maps.

Green marker.

Clicking marker opens:

name
available food
available water
medical resources
capacity

==================================================
25. RELIEF ALLOCATION
==================================================

Recommend relief center using:

distance
SOS priority
available resources
capacity
medical need

Output:

SOS
recommended center
estimated resources
reason

Do not claim actual route accessibility unless verified
by routing/accessibility data.

==================================================
26. GOOGLE ROUTING
==================================================

If enabled:

use Google Maps Routes API.

Use for:

relief-center route visualization
distance
estimated travel time

Do not treat travel time as guaranteed during disasters.

Display:

"Estimated route"

not:

"Guaranteed route"

==================================================
27. REAL-TIME EVENT MONITOR
==================================================

Create polling service.

Monitor:

USGS
NASA FIRMS
weather
SOS
satellite observations

Normalize into:

event_id
event_type
source
timestamp
latitude
longitude
severity
confidence

Avoid duplicate events.

==================================================
28. MONGODB
==================================================

Create models:

User
DisasterEvent
Evidence
SocialReport
SatelliteObservation
WeatherObservation
FireObservation
Earthquake
SOS
ReliefCenter
ReliefAllocation
AIAnalysis
AgentDecision
AuditLog

Add indexes:

location
timestamp
event_type
priority

==================================================
29. API ROUTES
==================================================

Backend:

GET /api/health

GET /api/disasters

GET /api/disasters/:id

GET /api/evidence

GET /api/weather

GET /api/fires

GET /api/earthquakes

GET /api/satellite/search

GET /api/satellite/image

POST /api/ai/social

POST /api/ai/vision

POST /api/ai/fusion

POST /api/ai/information-gap

POST /api/ai/next-observation

POST /api/agent/analyze

POST /api/sos

GET /api/sos

PATCH /api/sos/:id

GET /api/relief-centers

POST /api/relief/estimate

POST /api/relief/allocate

GET /api/events

==================================================
30. API VALIDATION
==================================================

Use schema validation.

Reject:

invalid coordinates
invalid dates
negative people
negative inventory
empty SOS messages where required

Return clear error messages.

==================================================
31. SECURITY
==================================================

Implement:

Helmet
CORS
rate limiting
input validation
JWT authentication
password hashing

Never expose:

API secrets
Copernicus client secret
server-side Google key
database URI

Do not store passwords in plain text.

==================================================
32. REAL-TIME FRONTEND
==================================================

Use WebSocket or Server-Sent Events where appropriate.

When a new:

SOS
earthquake
fire
disaster event

arrives:

update map
update counters
update timeline
update intelligence panel

==================================================
33. MAP EXPERIENCE
==================================================

The map is the central experience.

Controls:

Layers
Satellite
Disaster
SOS
Fires
Earthquakes
Social reports
Relief centers

Map legend.

Search location.

Selected marker opens a compact information panel.

Do not make the map tiny.

==================================================
34. AI SITUATION PANEL
==================================================

Display:

Current situation

Disaster:
FLOOD

Confidence:
91%

Uncertainty:
9%

Evidence:

Social ✓
Satellite ✓
Weather ✓

Information Gap:

Recent SAR unavailable

Recommended:

Sentinel-1 SAR

Use elegant typography.

==================================================
35. RESPONSE PANEL
==================================================

Show:

Critical SOS
High SOS
Medium SOS

Food required
Water required
Medical required

Relief centers

Do not make these huge cards.

Use compact data visualization.

==================================================
36. EVENT TIMELINE
==================================================

Show:

10:31
Social reports increased

10:34
Weather signal detected

10:37
Satellite observation received

10:39
AI classified flood

10:41
Information gap identified

10:42
SAR recommended

10:49
New observation received

11:00
AI reassessment

==================================================
37. REPORT GENERATION
==================================================

Create disaster report:

Situation
Location
Evidence
AI assessment
Confidence
Uncertainty
Information gap
Recommended observation
SOS
Humanitarian requirements
Relief allocation
Timeline

Export:

PDF
JSON

Clearly label AI-generated content.

==================================================
38. SIMULATION MODE
==================================================

Create a DEMO MODE.

This is extremely important for hackathon presentation.

Allow:

Select disaster:

Flood
Wildfire
Earthquake
Cyclone

Generate controlled demonstration data.

Do not mix simulation data with real data.

Clearly show:

DEMO / SIMULATION

==================================================
39. OFFLINE/ERROR HANDLING
==================================================

If:

Google Maps unavailable
Weather API unavailable
Satellite unavailable
FIRMS unavailable
AI service unavailable

Do not crash.

Show:

"Data source temporarily unavailable."

Keep other modules working.

==================================================
40. LOADING STATES
==================================================

Every asynchronous operation needs:

loading
success
error
empty state

No blank screens.

==================================================
41. ACCESSIBILITY
==================================================

Use:

keyboard navigation
ARIA labels
accessible contrast
clear focus states
screen-reader labels

==================================================
42. RESPONSIVE
==================================================

Desktop:

full command center

Tablet:

map + collapsible panels

Mobile:

map first
bottom sheets
collapsible intelligence

==================================================
43. TESTING
==================================================

Create tests for:

dataset preprocessing
RoBERTa inference
evidence fusion
information gap
SOS validation
relief calculation
API validation
Google Maps component
map markers
frontend rendering

Test invalid API responses.

Test missing API keys.

Test missing satellite evidence.

==================================================
44. LOGGING
==================================================

Create structured logs.

Never log secrets.

Log:

request
source
timestamp
status
duration
error

==================================================
45. DOCUMENTATION
==================================================

Create README.md.

Include:

project overview
architecture
installation
environment variables
dataset setup
model training
API setup
Google Maps setup
Copernicus setup
NASA FIRMS setup
OpenWeather setup
MongoDB setup
development
testing
deployment
limitations
safety

==================================================
46. API KEY DOCUMENTATION
==================================================

Create:

docs/API_SETUP.md

Explain:

Google Maps API key
OpenWeather API key
NASA FIRMS MAP_KEY
Copernicus client ID
Copernicus client secret

Never include real credentials.

Use placeholders.

==================================================
47. DATASET DOCUMENTATION
==================================================

Create:

docs/DATASETS.md

Explain:

Global Disaster Tweets

what it is used for
fields
preprocessing
train/validation/test
limitations

Explain that it is not a live social media feed.

==================================================
48. MODEL DOCUMENTATION
==================================================

Create:

docs/MODELS.md

Explain:

RoBERTa
CLIP
ViT
multimodal fusion
uncertainty
information-gap reasoning

==================================================
49. ARCHITECTURE DIAGRAM
==================================================

Create Mermaid architecture diagram:

Social
Satellite
Weather
FIRMS
USGS
SOS

↓

Data ingestion

↓

AI models

↓

Evidence fusion

↓

Uncertainty

↓

Information gap

↓

Next observation

↓

Humanitarian intelligence

↓

Google Maps

↓

Responder dashboard

==================================================
50. DATABASE DIAGRAM
==================================================

Create Mermaid ER diagram.

==================================================
51. FINAL UI
==================================================

The final application should look approximately like:

-------------------------------------------------------
HEADER
-------------------------------------------------------
Disaster Intelligence
AI-powered disaster response

LIVE ●        Alerts       Profile

-------------------------------------------------------
SIDEBAR |                 GOOGLE MAP
        |                 
Overview|        SOS
Live Map|           🔥
AI      |       FLOOD
SOS     |
Relief  |                    Relief Center
Reports |
        |
-------------------------------------------------------
        AI SITUATION INTELLIGENCE

Flood detected
91% confidence

Social ✓
Satellite ✓
Weather ✓

Information gap:
Recent SAR unavailable

Recommended:
Request Sentinel-1 SAR

-------------------------------------------------------
        RESPONSE

Critical SOS: 6
Food: 420 meals
Water: 1260 L
Medical: 34 kits

-------------------------------------------------------

Use:

white
warm white
orange
green
soft grey

No black background.

No excessive cards.

No huge typography.

No unnecessary gradients.

No excessive animations.

==================================================
52. ANIMATIONS
==================================================

Use subtle animations only:

marker pulse for critical SOS
fade-in intelligence updates
smooth map panel transitions
small loading indicators

Do NOT use:

large 3D animations
heavy particle effects
neon effects
dark cyberpunk effects

The application must feel professional.

==================================================
53. AI SAFETY
==================================================

The system is decision support.

Never claim:

- guaranteed disaster prediction
- guaranteed survivor detection
- guaranteed rescue
- guaranteed route accessibility
- guaranteed food requirement
- autonomous emergency dispatch

Every AI recommendation should include:

confidence
source
timestamp
reason

==================================================
54. DEMO SCENARIO
==================================================

Create a demo scenario:

Flood.

Flow:

1. Social reports indicate flooding.
2. RoBERTa detects disaster-related posts.
3. Weather shows heavy rainfall.
4. Sentinel imagery provides evidence.
5. AI fuses evidence.
6. Flood confidence increases.
7. AI identifies missing recent SAR.
8. AI recommends Sentinel-1.
9. New observation arrives.
10. AI reassesses.
11. SOS requests appear.
12. Food/water requirements are estimated.
13. Relief centers appear.
14. Google Maps displays response locations.
15. Dashboard shows priority.

==================================================
55. IMPORTANT DEVELOPMENT RULE
==================================================

DO NOT generate everything blindly in one step.

First generate the complete folder structure.

Then implement in this order:

PHASE 1:
Frontend shell + Google Maps

PHASE 2:
Backend + MongoDB

PHASE 3:
Global Disaster Tweets preprocessing

PHASE 4:
RoBERTa

PHASE 5:
Satellite integration

PHASE 6:
CLIP/ViT

PHASE 7:
Weather

PHASE 8:
FIRMS

PHASE 9:
USGS

PHASE 10:
Multimodal fusion

PHASE 11:
Information-gap agent

PHASE 12:
SOS

PHASE 13:
Food/water/medical

PHASE 14:
Relief optimization

PHASE 15:
Real-time updates

PHASE 16:
Reports

PHASE 17:
Testing

PHASE 18:
Deployment

After each phase:

1. run the application
2. run tests
3. check errors
4. fix errors
5. explain what was completed
6. only then continue

Never leave broken imports.

Never leave undefined variables.

Never invent API responses.

Never use fake API keys.

Never replace Google Maps with another map.

==================================================
56. FINAL REQUIREMENT
==================================================

At completion provide:

1. Complete source code
2. README
3. API setup guide
4. Dataset guide
5. Model training guide
6. Environment variable template
7. Database schema
8. API documentation
9. Testing instructions
10. Deployment instructions
11. Architecture diagram
12. ER diagram
13. Demo scenario
14. Hackathon presentation explanation

The final result must be a working full-stack
multimodal disaster intelligence prototype.

START WITH PHASE 1 ONLY.

Do not implement later phases until Phase 1
runs successfully.


What this gives you

The final system will have this flow:

Google Maps → real-world event → AI evidence → multimodal fusion → uncertainty → information gap → next observation → SOS → food/water/medical → relief allocation → responder dashboard.

And the Google Map is not an accessory—it is the central workspace.

The satellite component is also genuinely connected to the Copernicus ecosystem rather than using made-up satellite images. Copernicus documents Sentinel Hub as providing APIs for searching, processing, visualizing, and downloading Sentinel data. (Copernicus Documentation)

NASA FIRMS can supply active-fire observations using your own MAP_KEY, with documented transaction limits, so the AI tool should implement caching rather than continuously hammering the API. (NASA FIRMS)

One important change from our earlier version

I would not ask the AI tool to generate the entire application in one shot. The master prompt explicitly forces it to build Phase 1 → test → fix → Phase 2 → test → .... That's how we'll avoid ending up with another project that looks complete but has broken imports, fake API integrations, or mismatched frontend/backend code.

This is now the complete project specification. The only things you personally need to supply are your own API credentials and the Kaggle dataset; the coding agent can generate the actual source code around them. and use 3d animatoins in it
