# Future Enhancement Roadmap

While the EduRisk platform is currently a robust, production-ready system, there are several avenues for future expansion and commercialization.

## Phase 1: Deep Learning & NLP (Next 6 Months)
- **Sequential Deep Learning**: Transition from Random Forest to Recurrent Neural Networks (RNN/LSTM) to better capture the temporal sequence of a student's grades over time.
- **NLP Sentiment Analysis**: Integrate Natural Language Processing to analyze student feedback forms or discussion board posts to gauge emotional well-being and engagement.

## Phase 2: Multi-Tenancy & SaaS Transition (6 - 12 Months)
- **Multi-University Support**: Update the database schema to introduce a `Tenant` model, allowing multiple universities to use the same cloud instance securely without data leakage.
- **SSO Integration**: Add Single Sign-On (SSO) integrations for Azure Active Directory and Google Workspace, as most universities use these for existing student logins.

## Phase 3: Omnichannel Communication (12 - 18 Months)
- **Mobile Application**: Develop a React Native mobile app so students can receive instant push notifications regarding their risk score or upcoming faculty interventions.
- **Parent Portal**: Create a read-only role for parents/guardians to monitor academic progress for underage or consent-providing students.
- **AI Chat Assistant**: Integrate a Large Language Model (LLM) chatbot on the student dashboard that can answer syllabus questions, summarize weak points, and suggest study schedules based on the student's personal risk factors.

## Phase 4: Career & Placement Readiness
- **Predictive Placement**: Expand the ML model to predict not just dropout risk, but also the likelihood of securing an internship or job placement, recommending specific courses or certifications to improve their odds.
