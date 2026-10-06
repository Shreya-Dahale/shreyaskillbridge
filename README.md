# SkillBridge — AI-Assisted Career Re-entry & Skill Evidence Platform

> **Don't judge the gap. Evaluate the work.**

SkillBridge is an AI-assisted, human-in-the-loop career re-entry platform designed to help professionals returning after career breaks demonstrate their current capabilities through structured skill analysis, practical projects, employer-defined assessments, and verified skill evidence.

---

## 1. Problem Statement

Career breaks can create a gap between a professional's previous experience and the evidence employers can see about their current capabilities.

A candidate may have valuable previous experience but may lack:

- Recent project experience
- Updated skill evidence
- Current assessment results
- Recent employer validation
- A structured way to demonstrate refreshed skills

The problem is therefore not necessarily a lack of capability, but a **lack of recent, structured and verifiable evidence of current capability**.

### Example

A professional may have:

- 4 years of previous experience
- 3 years of career break
- Previous technical skills
- Limited recent evidence of those skills

For example:

```text
Previous Skills
       ↓
Java
Spring
SQL
REST APIs
Git

But a current target role may require:
Current Job Requirements
       ↓
Java
Spring Boot
REST APIs
SQL
Docker

The candidate needs a way to understand what needs refreshing and demonstrate what they can do today.
Problem Flow
Career Break
      ↓
Reduced Recent Work Evidence
      ↓
Unclear Current Skill Status
      ↓
Employer Uncertainty
      ↓
Difficult Career Re-entry

2. Proposed Solution
SkillBridge connects a candidate's previous experience with current job requirements and helps them build recent, structured and verifiable evidence of their skills.
The platform follows this workflow:
Career History
      ↓
Resume Upload
      ↓
AI Skill Extraction
      ↓
Target Role
      ↓
Skill Gap Analysis
      ↓
Practical Project / Assessment
      ↓
Project Submission
      ↓
Employer Evaluation
      ↓
Verified Skill Evidence
      ↓
Skill Freshness Passport
      ↓
Interview / Returnship Consideration

Core Principle
AI assists. Humans evaluate. Employers decide.

SkillBridge does not make final hiring decisions and does not guarantee interviews or jobs.
3. Key Features
3.1 Candidate Profile
Candidates can create and manage their professional profile.
Features include:
- Previous work experience
- Career history
- Existing skills
- Target role
- Relevant projects
- Career break information
3.2 Resume Upload
Candidates can upload their resume in PDF format.
The platform extracts relevant information such as:
- Previous roles
- Technical skills
- Technologies
- Projects
- Experience
- Responsibilities
Candidates can review and modify the extracted information.
3.3 AI Skill Extraction
Gemini API is used to assist in extracting skills from the candidate's resume.
Example:
Java             4 Years
Spring Boot      3 Years
SQL              3 Years
REST API         2 Years
Git              3 Years

The candidate can review and modify the extracted skills.
3.4 Target Role Selection
Candidates can select the role they want to return to.
Example:
Target Role:
Java Backend Developer

The selected role is used to identify the skills and capabilities required for the target position.
3.5 Job Requirement Analysis
SkillBridge analyzes job descriptions and identifies the skills required for the target role.
Example:
Required Skills

✓ Java
✓ Spring Boot
✓ REST API
✓ SQL
✓ Docker

Employers can review and verify the extracted requirements.
3.6 Skill Gap Analysis
SkillBridge compares the candidate's previous skills and current evidence with the requirements of the target role.
Historical Skills
       +
Current Evidence
       +
Target Job Requirements
       ↓
Skill Gap Analysis

Example:
Java             ✓ Demonstrated
SQL              ✓ Demonstrated
REST API         ✓ Demonstrated
Spring Boot      ⚠ Needs Refresh
Docker           ○ Not Yet Demonstrated

3.7 Practical Projects
Candidates can demonstrate their current capabilities through practical projects.
Example:
Project:
Employee Management REST API

Skills:
- Spring Boot
- REST API
- SQL

Requirements:
- CRUD APIs
- Input Validation
- Error Handling
- Database Integration
- API Testing

Projects can be recommended based on identified skill gaps.
3.8 Company-Defined Projects
Employers can create practical projects and assessments based on their own requirements.
Examples:
- Coding tasks
- Technical assignments
- Practical projects
- Case studies
- Domain-specific assessments
The employer defines what capability needs to be demonstrated.
3.9 Hybrid Assessment Model
SkillBridge supports both SkillBridge-recommended projects and company-defined assessments.
SkillBridge Project
        +
Company Assessment
        ↓
     Candidate
        ↓
 Current Evidence

3.10 Project Workspace
Candidates can work on assigned projects and provide supporting evidence such as:
- Source code
- GitHub repository
- Documentation
- Project files
- Test results
- Live demo
- Supporting documents
3.11 Project Submission
After completing the project, the candidate submits it for evaluation.
Project Started
      ↓
In Progress
      ↓
Evidence Added
      ↓
Project Submitted
      ↓
Employer Review
      ↓
Evaluation

Possible submission states:
Draft
In Progress
Submitted
Under Review
Evaluated

3.12 Employer Dashboard
Employers can manage:
- Jobs
- Projects
- Candidates
- Applications
- Assessments
- Pending evaluations
- Shortlisted candidates
3.13 Candidate Discovery
Employers can discover candidates based on:
- Required skills
- Demonstrated skills
- Previous experience
- Target role
- Project evidence
- Assessment completion
3.14 Candidate Evidence View
Instead of viewing only a traditional resume, employers can view structured evidence.
Example:
Candidate:
Aditi Sharma

Previous Experience:
4 Years Java Development

Current Evidence:

✓ Java
✓ SQL
✓ REST API
✓ Spring Boot
⚠ Docker

Employers can also view:
- Projects
- Assessment results
- Supporting evidence
- Employer feedback
3.15 Employer Evaluation
Employers can evaluate project submissions using structured criteria.
Example:
Functionality       18 / 20
Code Quality        17 / 20
API Design          18 / 20
Database            16 / 20
Documentation        9 / 10
--------------------------------
Total               78 / 90

Employers can also provide written feedback.
3.16 Skill Verification
After evaluating a project, the employer can verify the relevant skills.
Example:
Before Project:

Spring Boot
⚠ Needs Refresh


After Successful Evaluation:

Spring Boot
✓ Demonstrated / Verified

Evidence:
Employee Management REST API

Verified:
October 2026

3.17 Skill Freshness Passport
The Skill Freshness Passport maintains a structured record of recently demonstrated capabilities.
Example:
SKILL FRESHNESS PASSPORT

Java
✓ Demonstrated / Verified

SQL
✓ Demonstrated / Verified

REST API
✓ Demonstrated / Verified

Spring Boot
✓ Demonstrated / Verified

Docker
○ Not Yet Demonstrated

Skill Statuses
✓ Demonstrated / Verified
⚠ Needs Refresh
◐ Developing
○ Not Yet Demonstrated

3.18 Candidate-Controlled Evidence
Candidates can control which evidence is shared with employers.
Possible evidence includes:
- Resume
- Skills
- Projects
- Assessments
- Certifications
- Employer feedback
- Supporting documents
4. Artificial Intelligence
SkillBridge uses the Gemini API as its AI processing layer.
AI Components
The AI layer assists with:
- Resume and skill extraction
- Job requirement analysis
- Skill gap analysis
- Project recommendation
- Candidate-project matching
- Evidence summarization
- Feedback summarization
AI Workflow
Resume
   ↓
Gemini API
   ↓
Skill Extraction
   ↓
Job Requirement Analysis
   ↓
Skill Gap Analysis
   ↓
Project Recommendation
   ↓
Candidate-Project Matching
   ↓
Evidence Summarization

Human-in-the-Loop Approach
AI Assists
    ↓
Candidate Reviews
    ↓
Candidate Demonstrates
    ↓
Employer Evaluates
    ↓
Employer Decides

AI assists. Humans evaluate. Employers decide.

AI Does Not
The AI does not:
- Make final hiring decisions
- Automatically reject candidates
- Guarantee interviews
- Guarantee jobs
- Replace employer evaluation
5. Technologies / Tech Stack Used
Frontend
- React
- Vite
- TypeScript
- HTML5
- CSS3
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts
Backend
- Java
- Spring Boot
- REST APIs
- JWT Authentication
AI Processing
- Gemini API
Used for:
- Resume & Skill Extraction
- Job Requirement Analysis
- Skill Gap Analysis
- Project Recommendation
- Candidate–Project Matching
- Evidence Summarization
Database
- PostgreSQL
- Supabase
Storage
- Supabase Storage
Used for:
- Resume files
- Project submissions
- Evidence documents
Security
- JWT Authentication
- Role-Based Access Control
- Candidate Role
- Company Role
- Admin Role
Development & Deployment
- Git
- GitHub
- Vercel
- Render
6. System Architecture
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                                                             │
│ Candidate / Returner     Company / Employer       Admin      │
│                                                             │
│ Upload Resume            Post Projects           Manage      │
│ View Skills              View Candidates         Platform    │
│ Explore Projects         Evaluate Projects       Monitor     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND                              │
│                                                             │
│ React + Vite + TypeScript                                  │
│ Tailwind CSS + shadcn/ui                                   │
│ Framer Motion + Recharts                                   │
│                                                             │
│ Candidate UI | Company UI | Admin UI                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│                                                             │
│ Java + Spring Boot                                          │
│ REST APIs | JWT | Role-Based Access                         │
│                                                             │
│ User & Profile Service                                      │
│ Project Service                                              │
│ Application Service                                          │
│ Evaluation Service                                           │
│ Skill Passport Service                                       │
└───────────────────────┬──────────────────┬──────────────────┘
                        │                  │
                        ▼                  ▼
┌─────────────────────────────┐   ┌───────────────────────────┐
│       AI LAYER              │   │ PROJECT & EVALUATION      │
│                             │   │                           │
│ Gemini API                  │   │ SkillBridge Projects      │
│ Resume Skill Extraction     │   │ Company Projects          │
│ Job Requirement Analysis    │   │ Project Submission        │
│ Skill Gap Analysis          │   │ Employer Evaluation       │
│ Recommendations             │   │ Feedback & Verification   │
│ Candidate Matching          │   │                           │
└─────────────────────────────┘   └───────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                         DATA LAYER                          │
│                                                             │
│ PostgreSQL + Supabase                                      │
│                                                             │
│ Users | Profiles | Skills | Projects | Jobs                │
│ Applications | Evaluations | Evidence | Skill Records      │
│                                                             │
│ Supabase Storage                                            │
│ Resumes | Project Submissions | Evidence Documents          │
└─────────────────────────────────────────────────────────────┘

7. Installation & Setup Instructions
Prerequisites
Make sure the following are installed:
- Node.js
- npm
- Java 17+
- Maven
- Git
- PostgreSQL / Supabase
- Gemini API Key
Clone the Repository
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd SkillBridge

Frontend Setup
cd frontend
npm install

Create the environment file:
cp .env.example .env

For Windows:
copy .env.example .env

Run the frontend:
npm run dev

Frontend:
http://localhost:5173

Backend Setup
Open another terminal:
cd backend

For Windows:
mvnw.cmd spring-boot:run

For Linux/macOS:
./mvnw spring-boot:run

Or:
mvn spring-boot:run

Backend:
http://localhost:8080

8. Environment Variables
Create a .env file using .env.example.
Example:
GEMINI_API_KEY=your_gemini_api_key

SUPABASE_URL=your_supabase_url

SUPABASE_ANON_KEY=your_supabase_anon_key

DATABASE_URL=your_database_url

JWT_SECRET=your_jwt_secret

VITE_API_BASE_URL=http://localhost:8080/api

Important: Never commit real API keys, database passwords or JWT secrets to GitHub.

Use .env.example for safe example values.
9. How to Run the Project
Start Backend
cd backend
mvn spring-boot:run

Start Frontend
Open another terminal:
cd frontend
npm install
npm run dev

Open the application:
http://localhost:5173

10. Project Structure
SkillBridge/
│
├── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   └── assets/
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   │
│   ├── pom.xml
│   └── ...
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── screenshots/
│   ├── landing-page.png
│   ├── candidate-dashboard.png
│   ├── resume-upload.png
│   ├── ai-skill-extraction.png
│   ├── skill-gap.png
│   ├── project-marketplace.png
│   ├── project-workspace.png
│   ├── employer-dashboard.png
│   ├── candidate-evidence.png
│   ├── evaluation.png
│   └── skill-freshness-passport.png
│
├── docs/
│   ├── system-architecture.png
│   ├── workflow.png
│   └── presentation.pdf
│
├── .env.example
├── .gitignore
└── LICENSE

11. Complete Prototype Workflow
Candidate Workflow
Login
  ↓
Candidate Profile
  ↓
Upload Resume
  ↓
AI Skill Extraction
  ↓
Review Extracted Skills
  ↓
Select Target Role
  ↓
Skill Gap Analysis
  ↓
Explore Projects
  ↓
Apply for Project
  ↓
Complete Project
  ↓
Submit Evidence
  ↓
Employer Evaluation
  ↓
Skill Passport Update

Employer Workflow
Employer Login
      ↓
Company Dashboard
      ↓
Create Job
      ↓
Define Required Skills
      ↓
Create / Select Assessment
      ↓
View Candidates
      ↓
Review Evidence
      ↓
Review Project Submission
      ↓
Evaluate Candidate
      ↓
Provide Feedback
      ↓
Verify Skills
      ↓
Interview / Returnship Consideration

12. What Happens After Project Submission?
Once a candidate submits a project:
Candidate Submits Project
          ↓
Submission Stored
          ↓
Employer Notification
          ↓
Employer Opens Submission
          ↓
Project & Evidence Review
          ↓
Structured Evaluation
          ↓
Score + Feedback
          ↓
Skill Verification
          ↓
Skill Freshness Passport Update
          ↓
Employer Decision

The employer can decide:
Interview
   OR
Returnship
   OR
Further Assessment
   OR
No Further Action

Completing a project does not guarantee an interview or job. It creates structured evidence that helps the employer evaluate the candidate.

13. Assessment & Evaluation
SkillBridge supports structured evaluation.
Objective Technical Assessments
Where possible, objective technical components can use deterministic evaluation.
Candidate Submission
        ↓
Test Execution
        ↓
Test Cases
        ↓
Functional Correctness
        ↓
Performance
        ↓
Assessment Result
        ↓
Skill Evidence

Subjective Assessments
For subjective work:
Project Submission
        ↓
Structured Rubric
        ↓
Human Review
        ↓
Feedback
        ↓
Skill Evidence

This approach avoids relying on unrestricted AI judgement for final hiring decisions.
14. AI vs Human Responsibilities
Activity	AI	Human
Resume Parsing	✓	Review
Skill Extraction	✓	Review / Correct
Job Analysis	✓	Employer Verifies
Skill Gap Analysis	✓	Candidate Reviews
Project Recommendation	✓	Candidate / Employer Selects
Objective Assessment	Assist	Review
Subjective Evaluation	Assist	✓
Evidence Organization	✓	Candidate Controls
Candidate Discovery	Assist	Employer Evaluates
Hiring Decision	✕	✓


15. Security & Privacy
SkillBridge uses authentication and role-based access to protect user information.
Security Features
- JWT Authentication
- Role-Based Access Control
- Candidate / Company / Admin roles
- Protected APIs
- Controlled evidence sharing
- Secure file storage
- Secure project evidence handling
Candidate-Controlled Evidence
Candidates can control the evidence they share with employers.
Possible evidence includes:
- Resume
- Skills
- Projects
- Assessment results
- Certifications
- Employer feedback
- Supporting documents
16. Example Candidate Journey
Consider a candidate named Aditi.
Previous Experience
Java Developer
4 Years Experience

Career Break
3 Years

Previous Skills
Java
Spring
SQL
REST
Git

Target Role
Java Backend Developer

Current Job Requirements
Java
Spring Boot
REST
SQL
Docker

Skill Gap
Java          → Demonstrated
SQL           → Demonstrated
REST          → Demonstrated
Spring Boot   → Needs Refresh
Docker        → Not Yet Demonstrated

Recommended Projects
1. Java Debugging Task
2. SQL Challenge
3. REST API Implementation
4. Spring Boot Mini Project
5. Optional Docker Deployment

After Evaluation
Spring Boot
✓ Demonstrated / Verified

Evidence:
Employee Management REST API

Employer Evaluation:
Successful

Verified:
October 2026

17. Benefits
For Candidates
- Identifies current skill gaps
- Provides practical ways to refresh skills
- Builds recent evidence
- Provides structured employer feedback
- Creates a Skill Freshness Passport
- Supports career re-entry
- Provides project-based opportunities
For Employers
- Structured candidate evidence
- Practical assessment workflow
- Employer-defined projects
- Skill-based candidate discovery
- Structured evaluation
- Verified skill evidence
- Reduced uncertainty around current capability
For the Ecosystem
- Encourages evidence-based evaluation
- Supports inclusive career re-entry
- Connects experience with current capability
- Creates a structured pathway toward employment
18. Differentiation
SkillBridge is not intended to replace existing professional networks or job portals.
Platform Type	Primary Focus
Job Portals	Job discovery & applications
Professional Networks	Networking & professional profiles
Course Platforms	Learning & certifications
Micro-Internship Platforms	Short-term practical work
Returnship Programs	Employer-specific re-entry
SkillBridge	Current skill evidence & employer evaluation for career re-entry


SkillBridge Differentiation
Career Re-entry
      +
AI Skill Analysis
      +
Skill Gap Identification
      +
Practical Projects
      +
Company-Defined Assessments
      +
Employer Evaluation
      +
Skill Freshness Passport

19. Business Model
SkillBridge can follow a B2B / B2B2C model.
Employer Subscriptions
Companies can pay for:
- Candidate discovery
- Project creation
- Assessments
- Evidence review
- Analytics
Project / Assessment Fees
Companies can pay for custom project and assessment workflows.
Hiring / Recruitment Fees
Organizations can use SkillBridge as an additional hiring pathway.
Returnship Programs
Companies can use SkillBridge to manage structured return-to-work programs.
Enterprise Partnerships
Large organizations can use customized assessment and evidence workflows.
Candidate Services
Basic candidate access can remain free, with optional premium services.
20. Feasibility
SkillBridge is technically feasible using existing web and cloud technologies.
Technical Feasibility
- React + Vite + TypeScript
- Spring Boot
- REST APIs
- Gemini API
- PostgreSQL
- Supabase
- JWT Authentication
- Cloud Deployment
Implementation Advantages
- Modular architecture
- Pre-trained AI API
- Standard REST APIs
- Cloud database
- No special hardware required
- No custom AI model training required for the MVP
21. Future Scope
Future versions can include:
- Support for additional job roles
- Advanced technical assessments
- Automated objective evaluation
- GitHub integration
- ATS integration
- Employer analytics
- Advanced candidate discovery
- Returnship program integration
- Skill revalidation reminders
- Multilingual support
- Accessibility improvements
- Enterprise assessment workflows
- Advanced project recommendation
- Improved candidate-project matching
- Long-term skill freshness tracking
22. Limitations
The current prototype focuses on demonstrating the core concept.
SkillBridge is not intended to be:
- A replacement for LinkedIn
- A replacement for Naukri
- A complete Learning Management System
- A fully autonomous AI recruiter
- An automatic hiring system
- A platform covering every possible job role in the MVP
The prototype focuses on:
Past Experience
      ↓
Current Skill Analysis
      ↓
Practical Demonstration
      ↓
Employer Evaluation
      ↓
Verified Current Evidence

23. Screenshots / Demo Images
Place your screenshots inside the screenshots/ folder.
Landing Page
 
Candidate Dashboard
 
Resume Upload
 
AI Skill Extraction
 
Skill Gap Analysis
 
Project Marketplace
 
Project Workspace
 
Employer Dashboard
 
Candidate Evidence
 
Employer Evaluation
 
Skill Freshness Passport
 
24. Demo Video
Add the prototype demonstration video here:
Demo Video: [Add Demo Video URL]
Suggested Demo Flow
Candidate Login
      ↓
Upload Resume
      ↓
AI Skill Extraction
      ↓
Target Role
      ↓
Skill Gap Analysis
      ↓
Project Recommendation
      ↓
Project Application
      ↓
Project Submission
      ↓
Employer Dashboard
      ↓
Project Evaluation
      ↓
Skill Passport Update

25. Research & References
The project is informed by research related to:
- Career breaks
- Workforce re-entry
- Returning professionals
- Skill revalidation
- Employer hiring practices
- Returnship programs
- Career transitions
References
1. D'hert, Lippens & Baert (2026)
   Not a Lucky Break? Why and When a Career Hiatus Hijacks Hiring Chances.
   Labour Economics, Volume 100, Article 102881.
   https://doi.org/10.1016/j.labeco.2026.102881
2. Returning Women Professionals in India (2024)
   Unpacking the Career Transition Process of Returning Women Professionals in the Indian Workplaces.
   Gender in Management.
   https://doi.org/10.1108/GM-05-2022-0175
3. Gupta, Sharma & Bisht (2025)
   Navigating Conflicting Accountabilities: Post-Maternity Re-entry Transitions in India.
   Journal of Vocational Behavior, Volume 163, Article 104193.
   https://doi.org/10.1016/j.jvb.2025.104193
4. CEDA, Ashoka University & Godrej DEI Lab (2025)
   The Returnship Road.
   https://ceda.ashoka.edu.in/the-returnship-report/
5. UK Government (2023)
   Employer Guidance: Helping People Return to Work.
   https://www.gov.uk/government/publications/employer-guidance-helping-people-return-to-work
26. Team Members
Team SkillBridge
Name	Role
[Team Member 1]	[Role]
[Team Member 2]	[Role]
[Team Member 3]	[Role]
[Team Member 4]	[Role]
[Team Member 5]	[Role]
[Team Member 6]	[Role]


27. Project Links
Live Prototype
[Add Live Prototype URL]
GitHub Repository
[Add GitHub Repository URL]
Demo Video
[Add Demo Video URL]
Research Paper
[Add Research Paper URL]
Presentation
[Add Presentation URL]
28. Expected Outcome
SkillBridge aims to create a structured bridge between a professional's past experience and their current demonstrated capabilities.
Career Break
      ↓
Historical Experience
      ↓
AI Skill Analysis
      ↓
Current Skill Gap
      ↓
Practical Project
      ↓
Project Submission
      ↓
Employer Evaluation
      ↓
Verified Skill Evidence
      ↓
Skill Freshness Passport
      ↓
Interview / Returnship Consideration

The platform helps candidates demonstrate what they can do now, while giving employers structured evidence to support their evaluation.
29. Key Principle
Past experience tells an employer where a candidate has been.

Current evidence shows what the candidate can do today.

SkillBridge connects these two through:
Experience
    +
AI-Assisted Skill Analysis
    +
Practical Demonstration
    +
Employer Evaluation
    +
Verified Evidence

30. Conclusion
SkillBridge provides an evidence-based approach to career re-entry.
Instead of relying only on historical resumes, the platform helps candidates:
- Understand current skill gaps
- Refresh and demonstrate relevant capabilities
- Complete practical projects
- Build recent evidence
- Receive structured employer feedback
- Maintain a Skill Freshness Passport
- Share relevant evidence with employers
For employers, SkillBridge provides structured information about:
- Previous experience
- Current demonstrated skills
- Practical project work
- Assessment results
- Employer evaluations
- Supporting evidence
This creates a structured bridge between:
Career History
       ↓
Current Capability
       ↓
Practical Evidence
       ↓
Employer Evaluation
       ↓
Career Re-entry

SkillBridge
Don't judge the gap. Evaluate the work.
AI assists. Humans evaluate. Employers decide.
