import datetime
import pandas as pd
import streamlit as st

# Page Configuration
st.set_page_config(
    page_title="The Brown Girls Creative Studio | Backend Pipeline",
    page_icon="🚀",
    layout="wide",
)

# Custom Styling for Studio Branding
st.markdown(
    """
    <style>
    .main-header { font-size: 2.2rem; font-weight: 700; color: #111111; margin-bottom: 0px; }
    .sub-header { font-size: 1rem; color: #555555; margin-bottom: 25px; }
    </style>
""",
    unsafe_allow_html=True,
)

st.markdown(
    '<div class="main-header">The Brown Girls Creative Studio 🚀</div>',
    unsafe_allow_html=True,
)
st.markdown(
    '<div class="sub-header">Internal Backend Operations & Partnership Pipeline</div>',
    unsafe_allow_html=True,
)

# Initialize Session State with Your Live Pipeline Data
if "pipeline_df" not in st.session_state:
  st.session_state.pipeline_df = pd.DataFrame([
      {
          "Stage": "Confirmed Contract",
          "Organization / Partner": "InspiHER Conference / Newton District",
          "Contact Person": "Dr. Jennifer Williams",
          "Goal / Scope": (
              "2-day non-tech leadership workshop (Dec 2-3, 2026) @ $750 rate"
          ),
          "Status": "W-9 & CP575 Submitted",
          "Next Action / Follow-Up": (
              "Connect early Nov to review schedule & ACH direct deposit setup"
          ),
      },
      {
          "Stage": "Prospecting / Pilot",
          "Organization / Partner": "Newton County STEAM Academy",
          "Contact Person": "Ms. Bunting",
          "Goal / Scope": (
              "1-hour follow-up student session & December 4-week AI Lab cohort"
          ),
          "Status": "Outreach Queued",
          "Next Action / Follow-Up": (
              "Send follow-up email to schedule 1-hour student session"
          ),
      },
      {
          "Stage": "District Expansion",
          "Organization / Partner": "Newton County District After-School",
          "Contact Person": "District After-School Coordinator",
          "Goal / Scope": "Turnkey after-school AI & tech enrichment program rollout",
          "Status": "Outreach Queued",
          "Next Action / Follow-Up": (
              "Submit enrichment proposal referencing NCSA 96% satisfaction / 100"
              " students"
          ),
      },
      {
          "Stage": "Community Partner",
          "Organization / Partner": "YES Program",
          "Contact Person": "Program Director",
          "Goal / Scope": (
              "Parent-pay or grant-funded cohorts with a revenue-share donation"
              " back"
          ),
          "Status": "Outreach Queued",
          "Next Action / Follow-Up": (
              "Send partnership pitch email proposing turnkey execution and"
              " giveback model"
          ),
      },
      {
          "Stage": "Private Market",
          "Organization / Partner": "Private Schools (Regional)",
          "Contact Person": "Admissions / Program Director",
          "Goal / Scope": (
              "Premium after-school tech and applied AI enrichment contracts"
          ),
          "Status": "Not Started",
          "Next Action / Follow-Up": (
              "Identify target private schools and draft introductory"
              " outreach"
          ),
      },
  ])

# Top KPI Metric Cards
df = st.session_state.pipeline_df
col1, col2, col3, col4 = st.columns(4)

with col1:
  st.metric(label="Total Studio Targets", value=len(df))
with col2:
  st.metric(
      label="Confirmed / Active",
      value=len(df[df["Stage"].isin(["Confirmed Contract", "Active Pilot"])]),
  )
with col3:
  st.metric(
      label="Outreach Queue", value=len(df[df["Status"] == "Outreach Queued"])
  )
with col4:
  st.metric(label="Demonstrated Impact", value="100 Students / 96%")

st.divider()

# Interactive Editable Data Grid
st.subheader("Live Pipeline & Partnership Management")
st.markdown(
    "Edit cells directly below to update statuses, notes, or next steps in"
    " real time."
)

edited_df = st.data_editor(
    df, num_rows="dynamic", use_container_width=True, key="pipeline_backend_grid"
)
st.session_state.pipeline_df = edited_df

st.divider()

# Add New Lead Section
with st.expander("➕ Add New Partnership or School Target"):
  with st.form("add_lead_backend"):
    c1, c2 = st.columns(2)
    with c1:
      stage = st.selectbox(
          "Pipeline Stage",
          [
              "Confirmed Contract",
              "Prospecting / Pilot",
              "District Expansion",
              "Community Partner",
              "Private Market",
          ],
      )
      org = st.text_input("Organization / Partner Name")
      contact = st.text_input("Contact Person")
    with c2:
      scope = st.text_input("Goal / Scope")
      status = st.selectbox(
          "Status",
          [
              "Outreach Queued",
              "In Discussion",
              "W-9 Submitted",
              "Confirmed",
              "Active",
          ],
      )
      action = st.text_input("Next Action / Follow-Up")

    submitted = st.form_submit_button("Save Target to Backend")
    if submitted and org:
      new_entry = {
          "Stage": stage,
          "Organization / Partner": org,
          "Contact Person": contact,
          "Goal / Scope": scope,
          "Status": status,
          "Next Action / Follow-Up": action,
      }
      st.session_state.pipeline_df = pd.concat(
          [st.session_state.pipeline_df, pd.DataFrame([new_entry])],
          ignore_index=True,
      )
      st.success(f"Successfully added {org} to your pipeline backend!")
      st.rerun()

# Export Button
st.download_button(
    label="📥 Export Live Pipeline Data (CSV)",
    data=st.session_state.pipeline_df.to_csv(index=False).encode("utf-8"),
    file_name=f"brown_girls_studio_pipeline_{datetime.date.today()}.csv",
    mime="text/csv",
)
