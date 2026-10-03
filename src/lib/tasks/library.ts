import { SQL_TASKS } from "./sql-tasks";
export type TaskTestCaseDef = {
  label: string;
  input: string;
  expectedOutput: string;
  hidden: boolean;
};

export type TaskDefinition = {
  slug: string;
  kind?: "JAVA_CODE" | "SQL";
  title: string;
  skills: string[];
  instructions: string;
  starterCode: string;
  timeLimitMs: number;
  testCases: TaskTestCaseDef[];
};

const JAVA_TASKS: TaskDefinition[] = [
  {
    slug: "java-average",
    title: "Fix the average calculator",
    skills: ["Java"],
    timeLimitMs: 3000,
    instructions: `The program below should read an integer n (1 <= n <= 1000), then n integers, and print their average rounded to 2 decimal places.

Input format
- The first line contains n.
- The second line contains n integers separated by spaces. Each integer fits in a 32-bit signed integer.

Output format
- One line containing the average with exactly 2 decimal places.

The program has bugs and does not give the correct answer. Find and fix them. Your solution is judged on the sample cases and on hidden test cases.`,
    starterCode: `import java.util.Locale;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int sum = 0;
        for (int i = 0; i <= n; i++) {
            sum += sc.nextInt();
        }
        double average = sum / n;
        System.out.printf(Locale.US, "%.2f%n", average);
    }
}
`,
    testCases: [
      { label: "Sample 1", input: "3\n1 2 3\n", expectedOutput: "2.00", hidden: false },
      { label: "Sample 2", input: "4\n1 2 3 4\n", expectedOutput: "2.50", hidden: false },
      { label: "Single number", input: "1\n7\n", expectedOutput: "7.00", hidden: true },
      { label: "Negative numbers", input: "5\n-1 -2 -3 -4 -5\n", expectedOutput: "-3.00", hidden: true },
      { label: "Rounding", input: "3\n1 1 2\n", expectedOutput: "1.33", hidden: true },
      {
        label: "Large values",
        input: "3\n2000000000 2000000000 2000000000\n",
        expectedOutput: "2000000000.00",
        hidden: true,
      },
    ],
  },
  {
    slug: "java-palindromes",
    title: "Fix the palindrome checker",
    skills: ["Java"],
    timeLimitMs: 3000,
    instructions: `For each line of text, the program should print YES if the line is a palindrome and NO otherwise. When checking, ignore upper and lower case, and ignore every character that is not a letter or a digit. A line with no letters or digits counts as a palindrome.

Input format
- The first line contains t, the number of lines to check.
- The next t lines each contain one line of text.

Output format
- t lines, each YES or NO.

The program has bugs and does not give the correct answer. Find and fix them. Your solution is judged on the sample cases and on hidden test cases.`,
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int t = Integer.parseInt(sc.nextLine().trim());
        for (int i = 0; i < t; i++) {
            String line = sc.nextLine();
            String cleaned = line.replaceAll("[^a-z0-9]", "").toLowerCase();
            String reversed = new StringBuilder(cleaned).reverse().toString();
            System.out.println(cleaned == reversed ? "YES" : "NO");
        }
    }
}
`,
    testCases: [
      {
        label: "Sample 1",
        input: "3\nracecar\nhello\nA man, a plan, a canal: Panama\n",
        expectedOutput: "YES\nNO\nYES",
        hidden: false,
      },
      {
        label: "Sample 2",
        input: "2\nWas it a car or a cat I saw\nopenai\n",
        expectedOutput: "YES\nNO",
        hidden: false,
      },
      {
        label: "Mixed case and punctuation",
        input: "2\nNo lemon, no melon\nAbc\n",
        expectedOutput: "YES\nNO",
        hidden: true,
      },
      { label: "No letters or digits", input: "1\n!!!\n", expectedOutput: "YES", hidden: true },
      {
        label: "Digits and case",
        input: "3\n12321\n12345\nAa\n",
        expectedOutput: "YES\nNO\nYES",
        hidden: true,
      },
      { label: "Short words", input: "2\nab\nba\n", expectedOutput: "NO\nNO", hidden: true },
    ],
  },
  {
    slug: "java-inventory",
    title: "Fix the inventory totals",
    skills: ["Java"],
    timeLimitMs: 3000,
    instructions: `A shop records stock deliveries as lines of "name quantity". The same name can appear many times. The program should print the total quantity for each name, one per line, as "name total", with the names in alphabetical order (normal string order, case-sensitive).

Input format
- The first line contains n, the number of deliveries.
- The next n lines each contain a name (no spaces) and an integer quantity, which may be negative for returns.

Output format
- One line per distinct name: the name, a space, then its total quantity. Totals fit in a 32-bit signed integer.

The program has bugs and does not give the correct answer. Find and fix them. Your solution is judged on the sample cases and on hidden test cases.`,
    starterCode: `import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Map<String, Integer> totals = new HashMap<>();
        for (int i = 0; i < n; i++) {
            String name = sc.next();
            int quantity = sc.nextInt();
            totals.put(name, quantity);
        }
        for (Map.Entry<String, Integer> entry : totals.entrySet()) {
            System.out.println(entry.getKey() + " " + entry.getValue());
        }
    }
}
`,
    testCases: [
      {
        label: "Sample 1",
        input: "3\napple 5\nbanana 2\napple 3\n",
        expectedOutput: "apple 8\nbanana 2",
        hidden: false,
      },
      {
        label: "Sample 2",
        input: "2\nzebra 1\nyak 4\n",
        expectedOutput: "yak 4\nzebra 1",
        hidden: false,
      },
      { label: "One item", input: "1\nsolo 10\n", expectedOutput: "solo 10", hidden: true },
      {
        label: "Repeated names",
        input: "5\ncherry 1\napple 1\nbanana 1\ncherry 2\napple 2\n",
        expectedOutput: "apple 3\nbanana 1\ncherry 3",
        hidden: true,
      },
      {
        label: "Alternating names",
        input: "4\nb 1\na 1\nb 1\na 1\n",
        expectedOutput: "a 2\nb 2",
        hidden: true,
      },
      { label: "Returns", input: "2\nx 5\nx -2\n", expectedOutput: "x 3", hidden: true },
      {
        label: "Many names",
        input: "6\nkiwi 1\nfig 2\ndate 3\nlime 4\nplum 5\nnut 6\n",
        expectedOutput: "date 3\nfig 2\nkiwi 1\nlime 4\nnut 6\nplum 5",
        hidden: true,
      },
    ],
  },
];

export const TASK_LIBRARY: TaskDefinition[] = [...JAVA_TASKS, ...SQL_TASKS];