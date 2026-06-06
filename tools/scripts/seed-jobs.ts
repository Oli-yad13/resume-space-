import { PrismaClient, LocationType, EmploymentType, ExperienceLevel } from "@prisma/client";

const prisma = new PrismaClient();

const sampleJobs = [
  // Software Engineering
  {
    title: "Senior Full Stack Engineer",
    company: "TechCorp",
    companyLogo: "https://via.placeholder.com/100?text=TechCorp",
    location: "San Francisco, CA",
    locationType: LocationType.HYBRID,
    employmentType: EmploymentType.FULL_TIME,
    description: `We're looking for an experienced Full Stack Engineer to join our growing team. You'll work on cutting-edge technologies to build scalable web applications.

Key Responsibilities:
• Design and implement robust backend systems
• Build responsive and intuitive user interfaces
• Collaborate with product and design teams
• Mentor junior developers`,
    requirements: `• 5+ years of experience in full stack development
• Proficiency in React, Node.js, and TypeScript
• Experience with PostgreSQL or MongoDB
• Strong problem-solving skills
• Excellent communication abilities`,
    responsibilities: `• Develop and maintain web applications
• Write clean, maintainable code
• Participate in code reviews
• Contribute to technical architecture decisions
• Ensure application performance and security`,
    salaryMin: 120000,
    salaryMax: 180000,
    salaryCurrency: "USD",
    category: "Engineering",
    tags: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
    experienceLevel: ExperienceLevel.SENIOR,
    featured: true,
    published: true,
  },
  {
    title: "Frontend Developer",
    company: "DesignHub",
    location: "Remote",
    locationType: LocationType.REMOTE,
    employmentType: EmploymentType.FULL_TIME,
    description: `Join our design-forward team to create beautiful and performant web applications. We value creativity, attention to detail, and user-centric thinking.`,
    requirements: `• 3+ years of frontend development experience
• Expert knowledge of React and modern CSS
• Experience with design systems
• Portfolio of previous work`,
    responsibilities: `• Build responsive user interfaces
• Implement design specifications
• Optimize application performance
• Collaborate with designers`,
    salaryMin: 90000,
    salaryMax: 130000,
    salaryCurrency: "USD",
    category: "Engineering",
    tags: ["React", "CSS", "JavaScript", "Figma"],
    experienceLevel: ExperienceLevel.MID_LEVEL,
    featured: false,
    published: true,
  },
  {
    title: "Backend Engineer",
    company: "DataFlow Inc",
    location: "New York, NY",
    locationType: LocationType.ONSITE,
    employmentType: EmploymentType.FULL_TIME,
    description: `We're building the next generation of data processing systems. Join us to work on high-performance, distributed systems at scale.`,
    requirements: `• 4+ years backend development experience
• Strong knowledge of Python or Go
• Experience with microservices architecture
• Understanding of distributed systems`,
    responsibilities: `• Design and implement scalable APIs
• Optimize database queries
• Build data processing pipelines
• Ensure system reliability`,
    salaryMin: 110000,
    salaryMax: 160000,
    salaryCurrency: "USD",
    category: "Engineering",
    tags: ["Python", "Go", "PostgreSQL", "Redis", "Kubernetes"],
    experienceLevel: ExperienceLevel.SENIOR,
    featured: true,
    published: true,
  },

  // Mobile Development
  {
    title: "iOS Developer",
    company: "MobileFirst",
    location: "Austin, TX",
    locationType: LocationType.HYBRID,
    employmentType: EmploymentType.FULL_TIME,
    description: `Create exceptional iOS experiences for millions of users. Work with SwiftUI and the latest iOS technologies.`,
    requirements: `• 3+ years iOS development experience
• Proficiency in Swift and SwiftUI
• Experience with iOS frameworks
• Understanding of Apple HIG`,
    responsibilities: `• Develop iOS applications
• Implement new features
• Fix bugs and optimize performance
• Collaborate with design team`,
    salaryMin: 100000,
    salaryMax: 145000,
    salaryCurrency: "USD",
    category: "Mobile Development",
    tags: ["Swift", "SwiftUI", "iOS", "Xcode"],
    experienceLevel: ExperienceLevel.MID_LEVEL,
    featured: false,
    published: true,
  },

  // Data Science & AI
  {
    title: "Machine Learning Engineer",
    company: "AI Innovations",
    location: "Seattle, WA",
    locationType: LocationType.HYBRID,
    employmentType: EmploymentType.FULL_TIME,
    description: `Join our AI team to build and deploy machine learning models that power our intelligent products.`,
    requirements: `• Master's degree in CS, ML, or related field
• 4+ years of ML engineering experience
• Strong Python skills
• Experience with TensorFlow or PyTorch`,
    responsibilities: `• Develop and train ML models
• Deploy models to production
• Optimize model performance
• Research new ML techniques`,
    salaryMin: 130000,
    salaryMax: 200000,
    salaryCurrency: "USD",
    category: "Data Science",
    tags: ["Python", "TensorFlow", "PyTorch", "MLOps", "AWS"],
    experienceLevel: ExperienceLevel.SENIOR,
    featured: true,
    published: true,
  },

  // Product & Design
  {
    title: "Product Manager",
    company: "ProductCo",
    location: "Boston, MA",
    locationType: LocationType.HYBRID,
    employmentType: EmploymentType.FULL_TIME,
    description: `Lead product strategy and execution for our core platform. Work cross-functionally to deliver value to users.`,
    requirements: `• 5+ years product management experience
• Strong analytical skills
• Experience with agile methodologies
• Excellent stakeholder management`,
    responsibilities: `• Define product roadmap
• Write product specifications
• Prioritize features
• Work with engineering and design`,
    salaryMin: 120000,
    salaryMax: 170000,
    salaryCurrency: "USD",
    category: "Product",
    tags: ["Product Management", "Agile", "User Research", "Analytics"],
    experienceLevel: ExperienceLevel.SENIOR,
    featured: false,
    published: true,
  },
  {
    title: "UX/UI Designer",
    company: "CreativeSpace",
    location: "Remote",
    locationType: LocationType.REMOTE,
    employmentType: EmploymentType.FULL_TIME,
    description: `Design beautiful and intuitive user experiences. Work closely with product and engineering teams.`,
    requirements: `• 4+ years of UX/UI design experience
• Proficiency in Figma and design tools
• Portfolio showcasing your work
• Understanding of design systems`,
    responsibilities: `• Create user flows and wireframes
• Design high-fidelity mockups
• Conduct user research
• Collaborate with developers`,
    salaryMin: 95000,
    salaryMax: 140000,
    salaryCurrency: "USD",
    category: "Design",
    tags: ["Figma", "UI/UX", "Prototyping", "User Research"],
    experienceLevel: ExperienceLevel.MID_LEVEL,
    featured: false,
    published: true,
  },

  // Entry Level & Internships
  {
    title: "Junior Software Engineer",
    company: "StartupHub",
    location: "Remote",
    locationType: LocationType.REMOTE,
    employmentType: EmploymentType.FULL_TIME,
    description: `Start your career with us! We're looking for motivated junior engineers eager to learn and grow.`,
    requirements: `• Bachelor's degree in CS or related field
• Basic knowledge of web development
• Familiarity with JavaScript/TypeScript
• Passion for learning`,
    responsibilities: `• Contribute to codebases
• Learn from senior engineers
• Fix bugs and implement features
• Participate in code reviews`,
    salaryMin: 65000,
    salaryMax: 85000,
    salaryCurrency: "USD",
    category: "Engineering",
    tags: ["JavaScript", "React", "Git", "Entry Level"],
    experienceLevel: ExperienceLevel.JUNIOR,
    featured: false,
    published: true,
  },
  {
    title: "Software Engineering Intern",
    company: "BigTech Corp",
    location: "Mountain View, CA",
    locationType: LocationType.ONSITE,
    employmentType: EmploymentType.INTERNSHIP,
    description: `Join our summer internship program to work on real projects and learn from industry experts.`,
    requirements: `• Currently pursuing a degree in CS
• Knowledge of one programming language
• Strong problem-solving skills
• Team player`,
    responsibilities: `• Work on assigned projects
• Attend team meetings
• Learn from mentors
• Present final project`,
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: "USD",
    category: "Engineering",
    tags: ["Internship", "Python", "Java", "Learning"],
    experienceLevel: ExperienceLevel.ENTRY,
    featured: false,
    published: true,
  },

  // DevOps & Infrastructure
  {
    title: "DevOps Engineer",
    company: "CloudSystems",
    location: "Denver, CO",
    locationType: LocationType.HYBRID,
    employmentType: EmploymentType.FULL_TIME,
    description: `Build and maintain our cloud infrastructure. Ensure high availability and reliability of our services.`,
    requirements: `• 4+ years DevOps experience
• Strong knowledge of AWS or GCP
• Experience with Kubernetes and Docker
• Proficiency in scripting languages`,
    responsibilities: `• Manage cloud infrastructure
• Implement CI/CD pipelines
• Monitor system performance
• Respond to incidents`,
    salaryMin: 110000,
    salaryMax: 155000,
    salaryCurrency: "USD",
    category: "DevOps",
    tags: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD"],
    experienceLevel: ExperienceLevel.SENIOR,
    featured: false,
    published: true,
  },

  // Contract & Part-Time
  {
    title: "Freelance React Developer",
    company: "FreelanceHub",
    location: "Remote",
    locationType: LocationType.REMOTE,
    employmentType: EmploymentType.FREELANCE,
    description: `Looking for experienced React developers for project-based work. Flexible hours and remote work.`,
    requirements: `• 3+ years React experience
• Portfolio of completed projects
• Good communication skills
• Available 20+ hours per week`,
    responsibilities: `• Build React components
• Implement features
• Ensure code quality
• Meet project deadlines`,
    salaryMin: 75,
    salaryMax: 125,
    salaryCurrency: "USD",
    category: "Engineering",
    tags: ["React", "JavaScript", "Freelance", "Remote"],
    experienceLevel: ExperienceLevel.MID_LEVEL,
    featured: false,
    published: true,
  },
];

async function main() {
  console.log("\n🌱 Seeding jobs...\n");

  for (const job of sampleJobs) {
    const created = await prisma.job.upsert({
      where: { id: `job-${job.title.toLowerCase().replace(/\s+/g, "-")}` },
      update: job,
      create: {
        id: `job-${job.title.toLowerCase().replace(/\s+/g, "-")}`,
        ...job,
      },
    });
    console.log(`  ✅ ${created.title} at ${created.company}`);
  }

  const stats = await prisma.job.groupBy({
    by: ["category"],
    _count: true,
  });

  console.log("\n📊 Jobs seeded by category:");
  stats.forEach((stat) => {
    console.log(`  - ${stat.category}: ${stat._count} jobs`);
  });

  console.log(`\n✅ Total jobs seeded: ${sampleJobs.length}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding jobs:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

