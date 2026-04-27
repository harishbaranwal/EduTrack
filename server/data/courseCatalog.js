/**
 * Course Recommendation Data
 * Categorized courses based on interests and career goals
 */

export const courseCatalog = {
  // Programming & Development
  programming: [
    {
      title: "Complete Python Bootcamp",
      platform: "Udemy",
      url: "https://www.udemy.com/course/complete-python-bootcamp/",
      description: "Master Python programming from basics to advanced topics",
      level: "Beginner to Advanced",
      duration: "22 hours",
      rating: 4.6,
      skills: ["Python", "OOP", "Data Structures", "Web Scraping"],
    },
    {
      title: "The Complete JavaScript Course",
      platform: "Udemy",
      url: "https://www.udemy.com/course/the-complete-javascript-course/",
      description: "Modern JavaScript from beginner to advanced",
      level: "Beginner to Advanced",
      duration: "69 hours",
      rating: 4.7,
      skills: ["JavaScript", "ES6", "Async/Await", "DOM"],
    },
    {
      title: "Java Programming Masterclass",
      platform: "Udemy",
      url: "https://www.udemy.com/course/java-the-complete-java-developer-course/",
      description: "Learn Java In This Course And Become a Computer Programmer",
      level: "Beginner",
      duration: "80 hours",
      rating: 4.6,
      skills: ["Java", "OOP", "Data Structures", "Algorithms"],
    },
  ],

  // Web Development
  webDevelopment: [
    {
      title: "The Complete Web Development Bootcamp",
      platform: "Udemy",
      url: "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
      description: "Become a Full-Stack Web Developer with just ONE course",
      level: "Beginner to Advanced",
      duration: "65 hours",
      rating: 4.7,
      skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"],
    },
    {
      title: "React - The Complete Guide",
      platform: "Udemy",
      url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
      description: "Dive in and learn React.js from scratch!",
      level: "Intermediate",
      duration: "48 hours",
      rating: 4.6,
      skills: ["React", "Redux", "Hooks", "Next.js"],
    },
    {
      title: "Node.js, Express, MongoDB & More",
      platform: "Udemy",
      url: "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/",
      description: "Master Node.js by building a real-world RESTful API and web app",
      level: "Intermediate",
      duration: "42 hours",
      rating: 4.8,
      skills: ["Node.js", "Express", "MongoDB", "REST API"],
    },
  ],

  // Data Science & AI
  dataScience: [
    {
      title: "Machine Learning A-Z",
      platform: "Udemy",
      url: "https://www.udemy.com/course/machinelearning/",
      description: "Learn to create Machine Learning Algorithms in Python and R",
      level: "Intermediate",
      duration: "44 hours",
      rating: 4.5,
      skills: ["Machine Learning", "Python", "R", "Data Science"],
    },
    {
      title: "Data Science and Machine Learning Bootcamp",
      platform: "Udemy",
      url: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
      description: "Learn how to use NumPy, Pandas, Seaborn, Matplotlib, Scikit-Learn",
      level: "Beginner to Intermediate",
      duration: "25 hours",
      rating: 4.6,
      skills: ["Python", "Pandas", "NumPy", "Scikit-Learn", "TensorFlow"],
    },
    {
      title: "Deep Learning Specialization",
      platform: "Coursera",
      url: "https://www.coursera.org/specializations/deep-learning",
      description: "Master Deep Learning and Break into AI",
      level: "Advanced",
      duration: "3 months",
      rating: 4.9,
      skills: ["Deep Learning", "Neural Networks", "TensorFlow", "CNNs"],
    },
  ],

  // Mobile Development
  mobileDevelopment: [
    {
      title: "The Complete React Native Course",
      platform: "Udemy",
      url: "https://www.udemy.com/course/the-complete-react-native-and-redux-course/",
      description: "Build and deploy React Native apps for iOS and Android",
      level: "Intermediate",
      duration: "31 hours",
      rating: 4.6,
      skills: ["React Native", "Redux", "iOS", "Android"],
    },
    {
      title: "Flutter & Dart - The Complete Guide",
      platform: "Udemy",
      url: "https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/",
      description: "Build iOS and Android Apps with Flutter and Dart",
      level: "Beginner to Advanced",
      duration: "40 hours",
      rating: 4.6,
      skills: ["Flutter", "Dart", "iOS", "Android"],
    },
  ],

  // Cloud & DevOps
  cloudDevOps: [
    {
      title: "Docker and Kubernetes: The Complete Guide",
      platform: "Udemy",
      url: "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
      description: "Build, test, and deploy Docker applications with Kubernetes",
      level: "Intermediate",
      duration: "22 hours",
      rating: 4.6,
      skills: ["Docker", "Kubernetes", "CI/CD", "DevOps"],
    },
    {
      title: "AWS Certified Solutions Architect",
      platform: "Udemy",
      url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/",
      description: "Pass the AWS Solutions Architect Associate Certification",
      level: "Intermediate",
      duration: "27 hours",
      rating: 4.7,
      skills: ["AWS", "Cloud Computing", "EC2", "S3", "Lambda"],
    },
  ],

  // Cybersecurity
  cybersecurity: [
    {
      title: "The Complete Cyber Security Course",
      platform: "Udemy",
      url: "https://www.udemy.com/course/the-complete-internet-security-privacy-course-volume-1/",
      description: "Hackers Exposed! : Network Security Secrets & Cyber Security",
      level: "Beginner to Advanced",
      duration: "12 hours",
      rating: 4.5,
      skills: ["Network Security", "Ethical Hacking", "Encryption", "Firewalls"],
    },
    {
      title: "Ethical Hacking: Penetration Testing",
      platform: "Udemy",
      url: "https://www.udemy.com/course/learn-ethical-hacking-from-scratch/",
      description: "Learn ethical hacking from scratch",
      level: "Beginner",
      duration: "15 hours",
      rating: 4.6,
      skills: ["Ethical Hacking", "Penetration Testing", "Kali Linux"],
    },
  ],

  // UI/UX Design
  design: [
    {
      title: "Complete Web & Mobile Designer",
      platform: "Udemy",
      url: "https://www.udemy.com/course/complete-web-designer-mobile-designer-zero-to-mastery/",
      description: "Learn UI/UX design, Figma, Mobile & Web Design",
      level: "Beginner to Advanced",
      duration: "24 hours",
      rating: 4.7,
      skills: ["UI/UX", "Figma", "Adobe XD", "Design Thinking"],
    },
    {
      title: "User Experience Design Fundamentals",
      platform: "Udemy",
      url: "https://www.udemy.com/course/ultimate-guide-to-ux/",
      description: "Master UX design fundamentals and create great user experiences",
      level: "Beginner",
      duration: "8 hours",
      rating: 4.5,
      skills: ["UX Design", "Wireframing", "Prototyping", "User Research"],
    },
  ],

  // Database
  database: [
    {
      title: "The Complete SQL Bootcamp",
      platform: "Udemy",
      url: "https://www.udemy.com/course/the-complete-sql-bootcamp/",
      description: "Learn to use SQL quickly and effectively",
      level: "Beginner to Intermediate",
      duration: "9 hours",
      rating: 4.6,
      skills: ["SQL", "PostgreSQL", "Database Design", "Queries"],
    },
    {
      title: "MongoDB - The Complete Developer's Guide",
      platform: "Udemy",
      url: "https://www.udemy.com/course/mongodb-the-complete-developers-guide/",
      description: "Master MongoDB Development for Web & Mobile Apps",
      level: "Beginner to Advanced",
      duration: "17 hours",
      rating: 4.6,
      skills: ["MongoDB", "NoSQL", "Database Design", "Aggregation"],
    },
  ],

  // Business & Leadership
  business: [
    {
      title: "Business Strategy Fundamentals",
      platform: "Coursera",
      url: "https://www.coursera.org/learn/strategy-business",
      description: "Learn the fundamentals of business strategy",
      level: "Beginner",
      duration: "4 weeks",
      rating: 4.7,
      skills: ["Business Strategy", "Strategic Planning", "Management"],
    },
    {
      title: "Digital Marketing Masterclass",
      platform: "Udemy",
      url: "https://www.udemy.com/course/learn-digital-marketing-course/",
      description: "Learn Digital Marketing Strategy, Social Media Marketing & More",
      level: "Beginner to Advanced",
      duration: "23 hours",
      rating: 4.5,
      skills: ["Digital Marketing", "SEO", "Social Media", "Analytics"],
    },
  ],

  // Soft Skills
  softSkills: [
    {
      title: "Communication Skills: Persuasion and Motivation",
      platform: "Coursera",
      url: "https://www.coursera.org/learn/persuasion",
      description: "Master the art of persuasive communication",
      level: "Beginner",
      duration: "4 weeks",
      rating: 4.6,
      skills: ["Communication", "Persuasion", "Public Speaking"],
    },
    {
      title: "Time Management Mastery",
      platform: "Udemy",
      url: "https://www.udemy.com/course/time-management-mastery/",
      description: "Learn to manage your time effectively",
      level: "Beginner",
      duration: "4 hours",
      rating: 4.5,
      skills: ["Time Management", "Productivity", "Goal Setting"],
    },
  ],
};

/**
 * Map career goals to course categories
 */
export const careerToCourseMap = {
  "Software Developer": ["programming", "webDevelopment", "database"],
  "Full Stack Developer": ["webDevelopment", "database", "cloudDevOps"],
  "Frontend Developer": ["webDevelopment", "design"],
  "Backend Developer": ["programming", "database", "cloudDevOps"],
  "Mobile App Developer": ["mobileDevelopment", "programming"],
  "Data Scientist": ["dataScience", "programming"],
  "Machine Learning Engineer": ["dataScience", "programming"],
  "AI Engineer": ["dataScience", "programming"],
  "DevOps Engineer": ["cloudDevOps", "programming"],
  "Cloud Architect": ["cloudDevOps"],
  "Cybersecurity Analyst": ["cybersecurity", "programming"],
  "UI/UX Designer": ["design", "softSkills"],
  "Product Manager": ["business", "softSkills"],
  "Business Analyst": ["business", "dataScience"],
  "Entrepreneur": ["business", "softSkills"],
};

/**
 * Map interests to course categories
 */
export const interestToCourseMap = {
  "Programming": ["programming"],
  "Web Development": ["webDevelopment"],
  "Mobile Development": ["mobileDevelopment"],
  "Data Science": ["dataScience"],
  "Machine Learning": ["dataScience"],
  "Artificial Intelligence": ["dataScience"],
  "Cloud Computing": ["cloudDevOps"],
  "DevOps": ["cloudDevOps"],
  "Cybersecurity": ["cybersecurity"],
  "UI Design": ["design"],
  "UX Design": ["design"],
  "Database": ["database"],
  "Business": ["business"],
  "Leadership": ["business", "softSkills"],
  "Communication": ["softSkills"],
};
