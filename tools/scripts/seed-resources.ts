import { PrismaClient, ResourceType } from "@prisma/client";

const prisma = new PrismaClient();

const resources = [
  // Resume Writing Videos
  {
    title: "How to Write a Resume - Complete Guide",
    description:
      "Learn how to write a professional resume with expert tips on formatting, content structure, and key sections to include. Perfect for job seekers at all levels.",
    type: "VIDEO" as ResourceType,
    category: "Resume Writing",
    videoUrl: "https://www.youtube.com/watch?v=Tt08KmFfIYQ",
    featured: true,
    published: true,
    order: 1,
  },
  {
    title: "Resume Writing Tips and Tricks",
    description:
      "Discover essential resume writing tips that will help you stand out from other candidates. Learn what recruiters really look for in a resume.",
    type: "VIDEO" as ResourceType,
    category: "Resume Writing",
    videoUrl: "https://www.youtube.com/watch?v=y8YH0Qbu5h4",
    featured: false,
    published: true,
    order: 2,
  },
  {
    title: "ATS Resume: How to Beat Applicant Tracking Systems",
    description:
      "Master the art of writing resumes that pass Applicant Tracking Systems (ATS). Learn keyword optimization and formatting techniques that actually work.",
    type: "VIDEO" as ResourceType,
    category: "Resume Writing",
    videoUrl: "https://www.youtube.com/watch?v=dLo7iDJpOws",
    featured: false,
    published: true,
    order: 3,
  },

  // Interview Preparation Videos
  {
    title: "Top Job Interview Tips: Common Questions & Best Answers",
    description:
      "Prepare for your next interview with expert answers to the most common interview questions. Learn how to present your skills and experience effectively.",
    type: "VIDEO" as ResourceType,
    category: "Interview Preparation",
    videoUrl: "https://www.youtube.com/watch?v=HG68Ymazo18",
    featured: true,
    published: true,
    order: 1,
  },
  {
    title: "STAR Interview Method Explained",
    description:
      "Master the STAR technique (Situation, Task, Action, Result) to answer behavioral interview questions with confidence and clarity.",
    type: "VIDEO" as ResourceType,
    category: "Interview Preparation",
    videoUrl: "https://www.youtube.com/watch?v=2VIZ7cHbhvg",
    featured: false,
    published: true,
    order: 2,
  },
  {
    title: "Virtual Interview Tips: How to Look Professional",
    description:
      "Ace your virtual interviews with these essential tips on setup, lighting, background, and professional presentation for video calls.",
    type: "VIDEO" as ResourceType,
    category: "Interview Preparation",
    videoUrl: "https://www.youtube.com/watch?v=KYnBdDj6ZqQ",
    featured: false,
    published: true,
    order: 3,
  },

  // Cover Letter Videos
  {
    title: "How to Write an Effective Cover Letter",
    description:
      "Write compelling cover letters that get noticed. Learn the modern approach to cover letter writing with real examples and templates.",
    type: "VIDEO" as ResourceType,
    category: "Cover Letters",
    videoUrl: "https://www.youtube.com/watch?v=Vn3VrcbdXOw",
    featured: false,
    published: true,
    order: 1,
  },

  // LinkedIn Optimization
  {
    title: "LinkedIn Profile Tips: Stand Out to Recruiters",
    description:
      "Transform your LinkedIn profile into a powerful job-search tool. Learn how to optimize your headline, summary, and experience sections to attract recruiters.",
    type: "VIDEO" as ResourceType,
    category: "LinkedIn Optimization",
    videoUrl: "https://www.youtube.com/watch?v=SG5TjXu1t4A",
    featured: true,
    published: true,
    order: 1,
  },
  {
    title: "LinkedIn Networking Strategies for Job Seekers",
    description:
      "Master LinkedIn networking strategies to connect with recruiters and professionals in your industry. Build meaningful professional relationships that lead to opportunities.",
    type: "VIDEO" as ResourceType,
    category: "LinkedIn Optimization",
    videoUrl: "https://www.youtube.com/watch?v=UaMhS0dZhM8",
    featured: false,
    published: true,
    order: 2,
  },

  // Job Search Strategies
  {
    title: "Job Search Tips: How to Find Your Dream Job",
    description:
      "Discover effective job search techniques for the modern market. Learn how to find hidden job opportunities and stand out from the competition.",
    type: "VIDEO" as ResourceType,
    category: "Job Search Strategies",
    videoUrl: "https://www.youtube.com/watch?v=JJ1S3hwMuyk",
    featured: false,
    published: true,
    order: 1,
  },

  // Salary Negotiation
  {
    title: "Salary Negotiation Tips: Get Paid What You're Worth",
    description:
      "Learn proven negotiation tactics to secure the salary you deserve. Understand when and how to negotiate compensation packages effectively.",
    type: "VIDEO" as ResourceType,
    category: "Salary Negotiation",
    videoUrl: "https://www.youtube.com/watch?v=dYC7Cd3IvlA",
    featured: false,
    published: true,
    order: 1,
  },

  // Career Development
  {
    title: "How to Make a Career Change Successfully",
    description:
      "Transitioning careers? Learn how to leverage transferable skills and position yourself for success in a new industry or role.",
    type: "VIDEO" as ResourceType,
    category: "Career Development",
    videoUrl: "https://www.youtube.com/watch?v=FYCJfbxpUiY",
    featured: false,
    published: true,
    order: 1,
  },

  // Article: Resume Writing Guide
  {
    title: "Complete Resume Writing Guide",
    description:
      "A comprehensive guide to writing professional resumes that get results. Master every section from contact information to references.",
    type: "ARTICLE" as ResourceType,
    category: "Resume Writing",
    content: `# Complete Resume Writing Guide

## Introduction

Your resume is often the first impression you make on potential employers. A well-crafted resume can open doors to interviews and job opportunities, while a poorly written one can close them. This comprehensive guide will walk you through every aspect of creating a professional resume that stands out.

## Resume Structure

### 1. Contact Information
- Full name (use a professional name)
- Phone number (professional voicemail)
- Email address (professional address)
- LinkedIn profile URL
- Location (City, State - full address not required)
- Portfolio/Website (if relevant)

### 2. Professional Summary
Write a compelling 2-3 sentence summary that highlights:
- Your professional identity
- Years of experience
- Key areas of expertise
- What you bring to the table

Example: "Results-driven Marketing Manager with 5+ years of experience developing and executing data-driven campaigns. Proven track record of increasing brand awareness by 150% and driving 40% revenue growth through strategic digital marketing initiatives."

### 3. Work Experience
List your work history in reverse chronological order. For each position include:
- Job title
- Company name and location
- Employment dates (Month Year - Month Year)
- 3-5 bullet points describing achievements and responsibilities

**Use the STAR method in your bullet points:**
- Situation: The context
- Task: Your responsibility
- Action: What you did
- Result: The measurable outcome

**Example bullet points:**
- "Increased sales by 35% year-over-year by implementing a new customer relationship management system"
- "Managed a team of 8 developers to deliver 12 projects on time and 15% under budget"
- "Reduced operational costs by $200,000 annually through process optimization and automation"

### 4. Education
Include:
- Degree name
- Major/Field of study
- University name and location
- Graduation year
- GPA (if above 3.5 and recent graduate)
- Relevant coursework or honors (optional)

### 5. Skills
Organize skills into categories:
- Technical Skills: Software, tools, programming languages
- Soft Skills: Communication, leadership, problem-solving
- Language Skills: Fluency levels in different languages
- Certifications: Relevant professional certifications

## Formatting Best Practices

### Layout
- Use 1-inch margins on all sides
- Keep it to 1-2 pages (1 page for <10 years experience)
- Use consistent formatting throughout
- Include plenty of white space for readability

### Typography
- Use professional fonts: Arial, Calibri, Helvetica, or Times New Roman
- Font size: 10-12pt for body text, 14-16pt for headers
- Bold for headers and company names
- Use bullet points, not paragraphs

### File Format
- Save as PDF to preserve formatting
- Name your file: "FirstName_LastName_Resume.pdf"

## Common Mistakes to Avoid

1. **Typos and Grammar Errors**: Proofread multiple times and use spell check
2. **Generic Objectives**: Replace with a targeted professional summary
3. **Too Long**: Keep it concise and relevant
4. **Unexplained Gaps**: Address employment gaps honestly
5. **Irrelevant Information**: Tailor content to the job you're applying for
6. **Poor Formatting**: Ensure consistent styling and easy readability
7. **Lying**: Never fabricate information or exaggerate achievements
8. **Personal Information**: Omit age, marital status, photo (unless required)

## ATS (Applicant Tracking System) Optimization

Many companies use ATS software to screen resumes. To ensure yours passes:

1. **Use Standard Section Headings**: "Work Experience" not "Career Journey"
2. **Include Keywords**: Mirror language from the job description
3. **Avoid Graphics and Tables**: Stick to simple formatting
4. **Use Standard Fonts**: Avoid decorative or uncommon fonts
5. **Save as .docx or PDF**: Check which format the employer prefers
6. **Spell Out Acronyms**: Write "Search Engine Optimization (SEO)" first time

## Tailoring Your Resume

**Never send the same resume for every application.** Customize by:

1. Reading the job description carefully
2. Identifying key requirements and desired skills
3. Highlighting relevant experiences that match
4. Using similar language and keywords
5. Emphasizing achievements related to the role

## Industry-Specific Tips

### Tech Industry
- Emphasize technical skills and technologies
- Include GitHub profile or portfolio
- List relevant projects and contributions
- Mention specific frameworks and tools

### Creative Fields
- Include portfolio link prominently
- Showcase creative projects
- List relevant software proficiency
- Consider a more visual resume design

### Finance/Business
- Quantify all achievements with numbers
- Highlight analytical skills
- Include relevant certifications (CFA, CPA, etc.)
- Emphasize ROI and business impact

### Healthcare
- List all certifications and licenses
- Include clinical experience details
- Mention specialized training
- Highlight patient care outcomes

## Final Checklist

Before submitting your resume, verify:
- ✓ No spelling or grammar errors
- ✓ Consistent formatting throughout
- ✓ All dates are accurate
- ✓ Contact information is current
- ✓ Tailored to the specific job
- ✓ Saved as PDF with professional filename
- ✓ Fits on 1-2 pages
- ✓ Easy to scan in 6-10 seconds
- ✓ Includes measurable achievements
- ✓ Free of personal pronouns (I, me, my)

## Conclusion

Creating a strong resume takes time and effort, but it's one of the most important investments in your career. Use this guide as a reference, continuously update your resume as you gain experience, and always tailor it for each application. Remember, your resume is a marketing document designed to get you an interview – make every word count!

**Pro Tip:** Ask 2-3 trusted professionals to review your resume before sending it out. Fresh eyes can catch errors you might miss and provide valuable feedback on clarity and impact.`,
    featured: false,
    published: true,
    order: 10,
  },

  // Article: Interview Preparation
  {
    title: "Interview Preparation Checklist",
    description:
      "Everything you need to prepare for your next job interview. From research to follow-up, this checklist ensures you're fully prepared.",
    type: "ARTICLE" as ResourceType,
    category: "Interview Preparation",
    content: `# Ultimate Interview Preparation Checklist

Preparing for a job interview can be stressful, but with the right preparation, you can walk in with confidence. Use this comprehensive checklist to ensure you're ready for success.

## Before the Interview (1-2 Weeks Prior)

### Research the Company
- ✓ Study the company website thoroughly
- ✓ Read recent news articles about the company
- ✓ Review their social media profiles
- ✓ Understand their products, services, and mission
- ✓ Research the company culture and values
- ✓ Look up the company on Glassdoor for insights
- ✓ Identify their main competitors
- ✓ Note recent achievements or challenges

### Research the Role
- ✓ Re-read the job description carefully
- ✓ Identify key skills and requirements
- ✓ Prepare examples demonstrating these skills
- ✓ Research typical responsibilities for this role
- ✓ Understand how the role fits into the organization
- ✓ Research salary ranges for the position

### Research Your Interviewers
- ✓ Look up interviewers on LinkedIn
- ✓ Find common connections or interests
- ✓ Note their role and tenure at the company
- ✓ Prepare relevant questions based on their background

### Prepare Your Stories
- ✓ Identify 5-7 key achievement stories
- ✓ Structure stories using the STAR method
- ✓ Practice telling these stories concisely
- ✓ Ensure stories demonstrate relevant skills
- ✓ Prepare examples of challenges overcome
- ✓ Have examples of teamwork and leadership

### Practice Common Questions
- Tell me about yourself
- Why do you want to work here?
- What are your greatest strengths?
- What are your weaknesses?
- Where do you see yourself in 5 years?
- Why should we hire you?
- Tell me about a time you faced a challenge
- Describe a conflict with a coworker
- What's your management style?
- Why are you leaving your current job?

### Prepare Questions to Ask
**About the Role:**
- What does a typical day look like in this position?
- What are the immediate priorities for this role?
- What does success look like in the first 90 days?
- What are the biggest challenges facing the team?

**About the Team:**
- Can you tell me about the team I'd be working with?
- What's the team's working style?
- How does the team collaborate?

**About Growth:**
- What are the opportunities for professional development?
- What does the career path look like for this role?
- How do you support employee growth?

**About the Company:**
- How would you describe the company culture?
- What are the company's goals for the next year?
- What do you enjoy most about working here?

## One Day Before

### Logistics
- ✓ Confirm interview time and location
- ✓ Plan your route (add 15 minutes buffer)
- ✓ Test technology for virtual interviews
- ✓ Charge phone and laptop fully
- ✓ Prepare your outfit (professional and comfortable)
- ✓ Print multiple copies of your resume
- ✓ Prepare a portfolio or work samples if relevant

### Mental Preparation
- ✓ Review your notes on the company
- ✓ Practice answers one more time
- ✓ Get a good night's sleep
- ✓ Eat a healthy meal
- ✓ Set multiple alarms

## Day of Interview

### Morning Of
- ✓ Eat a light, nutritious breakfast
- ✓ Review your notes briefly
- ✓ Do a final appearance check
- ✓ Arrive 10-15 minutes early (not too early!)
- ✓ Turn off phone or set to silent
- ✓ Bring pen and notepad
- ✓ Have breath mints handy

### During the Interview

**First Impression:**
- Make eye contact
- Offer a firm handshake
- Smile and be friendly
- Use the interviewer's name
- Express enthusiasm for the opportunity

**Communication:**
- Listen carefully to questions
- Take a moment to think before answering
- Speak clearly and at a moderate pace
- Be honest and authentic
- Stay positive about past employers
- Show enthusiasm and energy
- Ask for clarification if needed

**Body Language:**
- Maintain good posture
- Make appropriate eye contact
- Use hand gestures naturally
- Avoid fidgeting
- Lean slightly forward to show engagement
- Mirror the interviewer's energy level

**Content:**
- Answer questions concisely (1-2 minutes)
- Use specific examples with results
- Connect your experience to the role
- Demonstrate cultural fit
- Ask thoughtful questions
- Take notes on important points
- Show you've done your research

## After the Interview

### Immediate Follow-Up (Same Day)
- ✓ Send thank-you email within 24 hours
- ✓ Personalize for each interviewer
- ✓ Reference specific topics discussed
- ✓ Reiterate your interest in the role
- ✓ Address any concerns that came up
- ✓ Keep it brief (3-4 paragraphs)

### Self-Evaluation
- ✓ Note what went well
- ✓ Identify areas for improvement
- ✓ Record any specific requirements mentioned
- ✓ Note next steps discussed
- ✓ Track follow-up date in calendar

### Continue Your Job Search
- Don't put all eggs in one basket
- Continue applying to other positions
- Follow up appropriately if no response
- Stay positive and persistent

## Virtual Interview Specific Tips

### Technical Setup
- ✓ Test your internet connection
- ✓ Check camera and microphone
- ✓ Use good lighting (face the light)
- ✓ Choose a clean, professional background
- ✓ Close unnecessary programs
- ✓ Have phone number ready as backup

### Virtual Best Practices
- ✓ Look at camera, not screen
- ✓ Position camera at eye level
- ✓ Dress professionally (full outfit)
- ✓ Minimize distractions in environment
- ✓ Have water nearby
- ✓ Keep notes out of camera view

## Red Flags to Avoid

**Don't:**
- Arrive late without calling ahead
- Badmouth previous employers
- Lie or exaggerate
- Bring up salary too early
- Be unprepared with answers
- Check your phone during interview
- Appear disinterested or unenthusiastic
- Interrupt the interviewer
- Ask about time off or benefits too early
- Forget to ask questions

## Key Reminders

**Remember:**
- The interview is a two-way conversation
- They want you to succeed
- Nervousness is normal and often not noticeable
- Authenticity matters more than perfection
- You're evaluating them too
- One bad answer won't ruin your chances
- Follow-up can make a significant difference

## Success Metrics

You've had a successful interview if:
- You connected with the interviewer
- You clearly communicated your value
- You learned about the role and company
- You asked thoughtful questions
- You left a positive impression
- You can envision yourself in the role

Good luck with your interview! Preparation is the key to confidence, and confidence leads to success. You've got this!`,
    featured: false,
    published: true,
    order: 10,
  },

  // Article: Job Search Strategies
  {
    title: "Effective Job Search Strategies",
    description:
      "Navigate the modern job market with proven strategies. Learn where to look, how to apply, and tactics to land your dream job faster.",
    type: "ARTICLE" as ResourceType,
    category: "Job Search Strategies",
    content: `# Effective Job Search Strategies for 2024

Finding the right job can feel overwhelming, but with the right strategy, you can streamline your search and increase your success rate. Here's your comprehensive guide to modern job hunting.

## 1. Define Your Target

### Know What You Want
Before starting your search, clarify:
- Ideal job titles and roles
- Preferred industries
- Company size preferences
- Location requirements (remote, hybrid, on-site)
- Salary requirements
- Non-negotiables vs. nice-to-haves

### Create Your Ideal Job Profile
Write down:
- Required skills and experience
- Company culture preferences
- Growth opportunities desired
- Work-life balance needs
- Values that matter to you

## 2. Optimize Your Application Materials

### Resume
- Tailor for each application
- Use keywords from job descriptions
- Quantify achievements
- Keep to 1-2 pages
- Ensure ATS compatibility

### LinkedIn Profile
- Professional headshot
- Compelling headline
- Detailed experience section
- Skill endorsements
- Recommendations from colleagues
- Active engagement with content

### Portfolio (if applicable)
- Showcase best work
- Include case studies
- Demonstrate problem-solving
- Keep updated regularly

## 3. Where to Look for Jobs

### Online Job Boards
- **LinkedIn**: Most comprehensive, great networking
- **Indeed**: Largest job aggregator
- **Glassdoor**: Company reviews + job listings
- **ZipRecruiter**: AI-powered matching
- **AngelList**: Startups and tech companies
- **FlexJobs**: Remote and flexible positions

### Industry-Specific Sites
- **Tech**: Stack Overflow, GitHub Jobs, AngelList
- **Creative**: Behance, Dribbble, Coroflot
- **Non-Profit**: Idealist, DevNetJobs
- **Government**: USAJobs, Government Jobs
- **Academia**: HigherEdJobs, Chronicle Vitae

### Company Websites
- Visit career pages directly
- Sign up for job alerts
- Research company culture
- Apply directly when possible

### Professional Associations
- Industry-specific job boards
- Member directories
- Networking events
- Exclusive opportunities

## 4. The Hidden Job Market

70% of jobs are never publicly advertised. Access them through:

### Networking
- **LinkedIn connections**: Reach out to 2nd-degree connections
- **Informational interviews**: Learn about companies and roles
- **Professional events**: Conferences, meetups, webinars
- **Alumni networks**: Leverage school connections
- **Former colleagues**: Stay in touch with past coworkers

### Direct Outreach
- Identify target companies
- Find hiring managers on LinkedIn
- Send personalized messages
- Express genuine interest
- Ask about upcoming opportunities

### Referrals
- Let your network know you're looking
- Be specific about what you want
- Make it easy for them to help
- Follow up appropriately
- Thank referrers regardless of outcome

## 5. Application Strategy

### Quality Over Quantity
- Apply to 5-10 well-matched jobs per week
- Spend time tailoring each application
- Research each company thoroughly
- Write custom cover letters

### Track Your Applications
Create a spreadsheet with:
- Company name
- Job title
- Application date
- Contact person
- Follow-up dates
- Interview stages
- Status updates

### Follow-Up Timeline
- Week 1: Apply
- Week 2: Follow up if no response
- Week 3: Send second follow-up
- Week 4: Move on, but keep monitoring

## 6. Optimize Your LinkedIn Presence

### Profile Optimization
- Use keywords throughout
- Complete all sections (aim for All-Star)
- Add media and projects
- Get recommendations
- Join relevant groups

### Active Engagement
- Post thoughtful content weekly
- Comment on others' posts
- Share relevant articles
- Celebrate others' achievements
- Use relevant hashtags

### Networking on LinkedIn
- Send personalized connection requests
- Engage with your network's content
- Join industry conversations
- Participate in LinkedIn groups
- Use the "Open to Work" feature strategically

## 7. Master the Application Process

### Reading Job Descriptions
- Identify "must-have" vs. "nice-to-have" qualifications
- Note specific keywords and phrases
- Understand reporting structure
- Identify key responsibilities
- Check for red flags

### Writing Cover Letters
- Address hiring manager by name
- Open with a strong hook
- Explain why you're interested
- Connect your experience to requirements
- Include specific examples
- Keep to one page
- End with a call to action

### Application Best Practices
- Apply early in the posting period
- Submit during business hours (Tuesday-Thursday)
- Follow instructions exactly
- Save files with professional names
- Proofread everything twice

## 8. Interview Preparation

### Before the Interview
- Research company thoroughly
- Prepare STAR method stories
- Practice common questions
- Prepare thoughtful questions
- Plan your outfit
- Test technology (for virtual)

### During the Interview
- Arrive 10-15 minutes early
- Bring copies of your resume
- Take notes
- Show enthusiasm
- Ask clarifying questions
- Discuss your value proposition

### After the Interview
- Send thank-you email within 24 hours
- Reference specific discussion points
- Reiterate interest
- Address any concerns raised
- Follow up appropriately

## 9. Negotiation Strategies

### Research Salary Ranges
- Use Glassdoor, PayScale, Salary.com
- Consider location differences
- Factor in total compensation
- Know your minimum acceptable offer

### When to Negotiate
- After receiving a formal offer
- Not during initial screening
- With data to support your ask
- While remaining professional

### What to Negotiate
- Base salary
- Signing bonus
- Stock options/equity
- Benefits and perks
- Vacation time
- Remote work options
- Professional development budget
- Start date

## 10. Stay Organized and Motivated

### Daily Job Search Routine
- **Morning (1 hour):**
  - Check new postings
  - Apply to 2-3 jobs
  - Send networking messages

- **Afternoon (30 minutes):**
  - Research companies
  - Update tracking sheet
  - Engage on LinkedIn

### Weekly Activities
- Attend one networking event
- Conduct one informational interview
- Update resume based on feedback
- Review and adjust strategy
- Celebrate small wins

### Monthly Check-Ins
- Assess what's working
- Adjust search parameters
- Update application materials
- Expand your network
- Learn new skills

## 11. Avoid Common Mistakes

### Don't:
- Apply to jobs you're not qualified for
- Use the same resume for every job
- Neglect your network
- Forget to follow up
- Bad mouth previous employers
- Stop searching after one interview
- Get discouraged by rejections
- Burn bridges
- Lie or exaggerate
- Ignore red flags during interviews

## 12. Maintain Your Mental Health

Job searching is stressful. Remember to:
- Set realistic daily goals
- Take breaks when needed
- Exercise regularly
- Maintain social connections
- Celebrate small victories
- Keep perspective
- Practice self-care
- Seek support when needed

## Tools and Resources

### Job Search Tools
- **Huntr**: Visual job search organizer
- **Jobscan**: ATS optimization
- **Calendly**: Easy interview scheduling
- **Grammarly**: Proofread applications

### Learning Platforms
- LinkedIn Learning
- Coursera
- Udemy
- Skillshare

### Networking Tools
- LinkedIn
- Meetup
- Eventbrite
- Professional association websites

## Final Tips

**Remember:**
- Job searching is a full-time job itself
- Quality applications beat quantity
- Networking is your secret weapon
- Persistence pays off
- Every "no" gets you closer to "yes"
- Keep learning and improving
- Stay positive and professional
- The right opportunity will come

**Success Formula:**
(Preparation + Networking + Strategy + Persistence) × Time = Dream Job

Good luck with your job search! Stay focused, stay positive, and keep moving forward. Your next great opportunity is out there waiting for you!`,
    featured: false,
    published: true,
    order: 10,
  },
];

async function main() {
  console.log("🌱 Starting resource seeding...");

  for (const resource of resources) {
    try {
      const created = await prisma.resource.create({
        data: resource,
      });
      console.log(`✅ Created: ${created.title}`);
    } catch (error) {
      console.error(`❌ Failed to create: ${resource.title}`, error);
    }
  }

  console.log("✨ Seeding completed!");

  // Print statistics
  const stats = await prisma.resource.groupBy({
    by: ["type"],
    _count: true,
  });

  console.log("\n📊 Resources Created:");
  stats.forEach((stat) => {
    console.log(`  ${stat.type}: ${stat._count} resources`);
  });

  const total = await prisma.resource.count();
  console.log(`  TOTAL: ${total} resources\n`);
}

main()
  .catch((e) => {
    console.error("Error seeding resources:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

