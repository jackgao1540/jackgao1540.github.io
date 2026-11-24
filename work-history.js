// Employment dates and technical accomplishments supplied in the owner's resume.
// The three earlier retail/fulfilment roles were supplied separately by the owner.
// Contact details and the source document are deliberately not included.
export const workHistoryDeck = 'Software engineering, AI/ML, and the roles that came before.';

const roles = [
  {
    id:'amazon-2026', company:'Amazon', title:'Software Engineer Intern', location:'Vancouver, BC',
    start:'2026-06', end:'2026-09', dates:'June 2026 - September 2026',
    bullets:[
      'Architected a secure telemetry platform with CloudWatch Logs, Firehose, Lambda, S3, Parquet, and QuickSight. Unified seven event sources and captured <strong>1,300+ events/minute</strong> across <strong>50+ production ML workbenches</strong>.',
      'Automated detection of suspicious activity, including bulk customer-data downloads and uploads of unapproved third-party models to S3, using specialized Bedrock agents and Model Context Protocol (MCP) tools.',
      'Built a monitoring dashboard and investigation agent that gave engineering and leadership a unified view of security activity across ML workbenches.'
    ]
  },
  {
    id:'amazon-2025', company:'Amazon', title:'Software Engineer Intern', location:'Vancouver, BC',
    start:'2025-09', end:'2025-12', dates:'September 2025 - December 2025',
    bullets:[
      'Saved <strong>$250K/month</strong> in operational costs across <strong>3,200+ sites</strong> by architecting a monitoring orchestration layer that connected Strands agents to real-time site telemetry through MCP.',
      'Engineered an event-driven pipeline with EventBridge, Lambda, and S3 that processed <strong>11,000+ yard-activity events/hour</strong> and triggered responses in <strong>under one minute</strong>.',
      'Implemented least-privilege, fine-grained authorization for the MCP server using IAM and an internal authorization service.',
      "Increased managers' on-site operational availability by <strong>35%</strong> and reduced manual monitoring with a natural-language rule engine that triggered targeted agents through EventBridge."
    ]
  },
  {
    id:'sap-2024', company:'SAP', title:'Software Engineer Intern', location:'Vancouver, BC',
    start:'2024-09', end:'2025-08', dates:'September 2024 - August 2025',
    bullets:[
      'Reduced average page-load time by <strong>57%</strong> by leading a migration to RTK Query and implementing custom error-logging middleware and server-side rendering.',
      'Architected a high-throughput inference-gateway sidecar for multimodal LLM requests, with automated retries and fallback logic for production reliability.',
      'Built a scalable data-access layer with Java, Spring Boot, and DynamoDB, plus a full-stack query engine supporting search, sort, and filter operations across <strong>millions of data points</strong>.',
      'Created a high-fidelity MirageJS mock environment for local integration testing of distributed microservices, reducing reliance on live staging environments.'
    ]
  },
  {
    id:'ibm-2024', company:'IBM', title:'AI/ML Intern', location:'Toronto, ON',
    start:'2024-05', end:'2024-08', dates:'May 2024 - August 2024',
    bullets:[
      'Built a retrieval-augmented generation pipeline to ingest and index legacy technical documentation, cutting information-retrieval latency from <strong>15+ minutes to under 10 seconds</strong>.',
      'Implemented FAISS-powered semantic search and vector-database storage, optimizing embedding retrieval throughput for a large technical-documentation corpus.',
      'Developed scraping microservices that synchronized disparate documentation sources into a centralized vector store and kept the retrieval index current.'
    ]
  },
  {
    id:'intel-2023', company:'Intel', title:'Software Engineer Intern', location:'Vancouver, BC',
    start:'2023-01', end:'2023-08', dates:'January 2023 - August 2023',
    bullets:[
      'Built a real-time pipeline streaming telemetry from up to <strong>6,650 concurrent ASIC verification runners</strong> into MongoDB. Created Splunk dashboards that saved each engineer up to <strong>one hour per day</strong> in manual checks.',
      'Automated CI/CD workflows with Python and Shell to trigger comprehensive unit-test suites on each pull request and track execution events from initiation through completion.'
    ]
  },
  {id:'hudsons-bay-2022', company:"Hudson's Bay", title:'Sales Associate', start:'2022', dates:'2022', bullets:[]},
  {id:'amazon-2021', company:'Amazon', title:'Fulfilment Associate', location:'Toronto', start:'2021', dates:'2021', bullets:[]},
  {id:'gap-2019', company:'Gap', title:'Sales Associate', location:'Toronto', start:'2019', end:'2020', dates:'2019 - 2020', bullets:[]}
];

function dateMarkup(role) {
  const [start,end]=role.dates.split(' - ');
  return `<time datetime="${role.start}">${start}</time>${role.end?` <span aria-hidden="true">-</span> <time datetime="${role.end}">${end}</time>`:''}`;
}

export const workHistoryBody = `<ol class="work-history" aria-label="Employment history, most recent first">${roles.map(role=>`
  <li class="work-role">
    <article aria-labelledby="work-${role.id}">
      <header class="work-role-header">
        <div><h2 id="work-${role.id}">${role.company}</h2><p class="work-role-title">${role.title}</p>${role.location?`<p class="work-role-location">${role.location}</p>`:''}</div>
        <p class="work-role-dates">${dateMarkup(role)}</p>
      </header>
      ${role.bullets.length?`<ul class="work-role-bullets">${role.bullets.map(bullet=>`<li>${bullet}</li>`).join('')}</ul>`:''}
    </article>
  </li>`).join('')}</ol>`;
