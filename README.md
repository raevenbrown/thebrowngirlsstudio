# The Brown Girls Creative Studio 🚀
> **Data Architecture • AI Innovation • Workforce Impact**

The Brown Girls Creative Studio delivers high-impact operational data architectures and marketing engines for growing businesses, while running hands-on Applied AI & STEM workforce practicums for K–12 school districts and aspiring technical fellows.

---

## 🌐 Live Web Infrastructure

* **Primary Landing Portal & Diagnostic Hub:**  
  [`https://raevenbrown.github.io/thebrowngirlsstudio/`](https://raevenbrown.github.io/thebrowngirlsstudio/)
* **Applied AI Labs & Portfolio Engine Gallery:**  
  [`https://raevenbrown.github.io/thebrowngirlsstudio/labs.html`](https://raevenbrown.github.io/thebrowngirlsstudio/labs.html)

---

## 🏢 Core Practice Areas

### 1. Studio Services & Growth Analytics
We eliminate disconnected operational bottlenecks and turn data silos into automated revenue engines:
* **Growth Marketing Attribution:** End-to-end tracking across multi-channel campaigns.
* **Operational BI & KPI Monitoring:** Centralized reporting for client lifecycle tracking, service desk metrics, and risk mitigation.
* **Workflow Automation & Systems Integration:** API-level connectivity across Meta, Google Ads, CRMs, and ticketing infrastructures.

### 2. Education & Workforce Labs (K–12 to Higher Ed)
A tiered learning arc preparing the next generation of engineers, data analysts, and tech founders:
* **Grades K–5 (Play-Based Logic & Foundations):** Gamified visual logic, interactive ten-frame numeracy, and early prompt-engineering discovery.
* **Grades 6–12 (Applied AI & Python Fluency):** Practical prompt architecture, chatbot design, vector retrieval, and personal AI study tools.
* **HS & Beyond (Practicum & Work-Based Learning):** Hands-on development using live client-style data schemas, dashboard deployment, and portfolio builds eligible for WBL credit and studio internships.

---

## 📊 Live Deployed Engines & Capstones

| Platform / Engine | Core Tech Stack | Application & Real-World Scope | Live Spec |
| :--- | :--- | :--- | :--- |
| **Creative Metrix** | Next.js, REST APIs, Vercel | Multi-channel attribution engine tracking sync health, user funnels, and data collection rates. | [Launch Platform ↗](https://v0-open-in-v0-gamma-nine-95.vercel.app/integrations) |
| **AutoGuard Claims Portal** | Python, Streamlit, Pandas | Enterprise warranty claim dispatch registry, rental allocation tracking, and insurer turnaround analytics. | [Launch Dashboard ↗](https://autoguard-claims-dashboard-lyuc6v8avzfjjmt5kt4qn3.streamlit.app/) |
| **Coles Navigate360 IR Engine** | Python, Streamlit, Plotly | Institutional research engine modeling student retention risk markers, yield progression, and automated advisor nudges. | [Launch Engine ↗](https://ksu-institutional-ir-engine-nsfzyeyxgrogvxuzssmxib.streamlit.app/) |
| **Omnimetrix MSP Console** | Python, Streamlit, Syncro API | Telemetry desk monitoring endpoint SLAs, automated RMM status alerts, and SOC 2 scope mapping. | [Launch Console ↗](https://omnimetrix-msp-engine-mbx2qgs8zkdv2vx5jkprkd.streamlit.app/) |

---

## 🗄️ Backend Data Architecture (Supabase)

The studio portal leverages a real-time **Supabase PostgreSQL** backend configured with Row Level Security (RLS) policies:

* **`public.audit_results`**: Captures anonymous diagnostic metrics (operational leaks, health scores, and recommended tier mapping).
* **`public.submissions`**: Securely logs verified business inquiries, scheduled consultations, project scopes, and estimated budgets.
* **`public.student_milestones`**: Records real-time student gamification events, star unlocks, streak progressions, and phonics/math assessment logs.

---

## 🛠️ Repository File Structure

```text
thebrowngirlsstudio/
├── index.html         # Main studio portal, service breakdown & diagnostic tool
├── labs.html          # Portfolio gallery of live Streamlit/Vercel engines
├── README.md          # Project architecture & system documentation
└── assets/            # Static media, icons, and styling components
