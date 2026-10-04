import { SQL_SOLUTIONS } from "./sql-solutions";
import { REST_SOLUTIONS } from "./rest-solutions";
// Reference solutions, used only by tools/verify-tasks.ts and tests.
// Never import this file from app pages or actions, and never store it in the database.
const JAVA_SOLUTIONS: Record<string, string> = {
  "java-average": `import java.util.Locale;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long sum = 0;
        for (int i = 0; i < n; i++) {
            sum += sc.nextInt();
        }
        double average = (double) sum / n;
        System.out.printf(Locale.US, "%.2f%n", average);
    }
}
`,
  "java-palindromes": `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int t = Integer.parseInt(sc.nextLine().trim());
        for (int i = 0; i < t; i++) {
            String line = sc.nextLine();
            String cleaned = line.toLowerCase().replaceAll("[^a-z0-9]", "");
            String reversed = new StringBuilder(cleaned).reverse().toString();
            System.out.println(cleaned.equals(reversed) ? "YES" : "NO");
        }
    }
}
`,
  "java-inventory": `import java.util.Map;
import java.util.Scanner;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Map<String, Integer> totals = new TreeMap<>();
        for (int i = 0; i < n; i++) {
            String name = sc.next();
            int quantity = sc.nextInt();
            totals.merge(name, quantity, Integer::sum);
        }
        for (Map.Entry<String, Integer> entry : totals.entrySet()) {
            System.out.println(entry.getKey() + " " + entry.getValue());
        }
    }
}
`,
};

export const REFERENCE_SOLUTIONS: Record<string, string> = { ...JAVA_SOLUTIONS, ...REST_SOLUTIONS, ...SQL_SOLUTIONS };