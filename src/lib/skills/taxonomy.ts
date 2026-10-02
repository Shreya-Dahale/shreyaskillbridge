export type RelationKind = "IMPLIES" | "RELATED";

export type TaxonomySkill = { name: string; aliases: string[] };

// "from" -> "to": having `from` counts toward a requirement for `to`.
export type TaxonomyRelation = { from: string; to: string; kind: RelationKind };

export const TAXONOMY_SKILLS: TaxonomySkill[] = [
  { name: "Java", aliases: ["Core Java", "Java SE", "Java 8", "Java 11", "Java 17", "Java 21"] },
  { name: "Spring", aliases: ["Spring Framework", "Spring Core"] },
  { name: "Spring Boot", aliases: ["SpringBoot"] },
  { name: "Spring MVC", aliases: ["SpringMVC"] },
  { name: "Hibernate", aliases: ["Hibernate ORM"] },
  { name: "SQL", aliases: ["SQL Queries", "Structured Query Language"] },
  { name: "MySQL", aliases: ["My SQL"] },
  { name: "PostgreSQL", aliases: ["Postgres", "Postgre SQL"] },
  {
    name: "REST APIs",
    aliases: ["REST", "REST API", "RESTful", "RESTful API", "RESTful APIs", "REST API Design", "RESTful Web Services"],
  },
  { name: "Git", aliases: ["Git Workflow", "Git Workflows"] },
  { name: "Docker", aliases: ["Docker Containers"] },
  { name: "Kubernetes", aliases: ["K8s"] },
  { name: "Maven", aliases: ["Apache Maven"] },
  { name: "Gradle", aliases: [] },
  { name: "JUnit", aliases: ["JUnit 4", "JUnit 5"] },
  { name: "AWS", aliases: ["Amazon Web Services"] },
  { name: "CI/CD", aliases: ["CI CD", "Continuous Integration", "CI/CD Pipelines"] },
  { name: "Jenkins", aliases: [] },
  { name: "GitHub Actions", aliases: [] },
  { name: "Microservices", aliases: ["Microservice", "Microservice Architecture"] },
];

export const TAXONOMY_RELATIONS: TaxonomyRelation[] = [
  { from: "Spring Boot", to: "Spring", kind: "IMPLIES" },
  { from: "Spring MVC", to: "Spring", kind: "IMPLIES" },
  { from: "Spring", to: "Spring Boot", kind: "RELATED" },
  { from: "Spring MVC", to: "Spring Boot", kind: "RELATED" },
  { from: "MySQL", to: "SQL", kind: "IMPLIES" },
  { from: "PostgreSQL", to: "SQL", kind: "IMPLIES" },
  { from: "Docker", to: "Kubernetes", kind: "RELATED" },
  { from: "Maven", to: "Gradle", kind: "RELATED" },
  { from: "Gradle", to: "Maven", kind: "RELATED" },
  { from: "Jenkins", to: "CI/CD", kind: "IMPLIES" },
  { from: "GitHub Actions", to: "CI/CD", kind: "IMPLIES" },
];