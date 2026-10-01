import { extractResumeData } from "../src/lib/ai/gemini";

async function main() {
  try {
    const result = await extractResumeData(
      "Aditi Sharma\nJava Developer, Acme Corp, Sep 2019 - Aug 2021\nBuilt REST APIs using Java and Spring MVC with MySQL. Used Git and Maven daily to ship features and write JUnit tests for the backend services we maintained."
    );
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();