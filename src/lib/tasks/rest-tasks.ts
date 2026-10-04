import type { TaskDefinition } from "./library";

export const REST_TASKS: TaskDefinition[] = [
  {
    slug: "rest-user-api",
    title: "Fix the user API",
    skills: ["REST APIs"],
    timeLimitMs: 3000,
    instructions: `This task checks your grasp of REST fundamentals (methods, paths and status codes) in plain Java. No framework is needed.

The program below simulates a tiny in-memory user API. It reads HTTP-style requests and prints one response line for each.

Input format
- The first line contains n, the number of requests.
- Each of the next n lines is a request: a method, a path, and optionally a body, separated by single spaces. For POST /users the body is the new user's name, which may contain spaces.

Rules
- /users supports only POST. Any other method on /users responds 405.
- POST /users creates a user named by the body. If the body is empty, respond 400. Otherwise the user gets the next id (1, 2, 3 and so on, in creation order, never reused) and the response is "201 <id>". A rejected request does not use up an id.
- A path of the form /users/<segment>, with one non-empty segment and no further slashes, is checked like this. If the segment is not a whole number written with digits only (at most 9 digits), respond 400, whatever the method.
- GET /users/<id> responds "200 <name>" if that user exists, otherwise 404.
- DELETE /users/<id> removes the user and responds 204 if the user existed, otherwise 404.
- Any other method on /users/<id> responds 405.
- Every other path, including /users/ and /users/1/extra, responds 404.

Output format
- One line per request: the status code, followed by a space and the extra text only for "200 <name>" and "201 <id>".

The program has bugs and does not give the correct answer. Find and fix them. Your solution is judged on the sample cases and on hidden test cases.`,
    starterCode: `import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

public class Main {
    static Map<Integer, String> users = new HashMap<>();
    static int nextId = 1;

    static String handle(String method, String path, String body) {
        if (path.equals("/users")) {
            if (!method.equals("POST")) return "404";
            int id = nextId++;
            users.put(id, body);
            return "200 " + id;
        }
        if (path.startsWith("/users/")) {
            String segment = path.substring("/users/".length());
            int id = Integer.parseInt(segment);
            if (method.equals("GET")) {
                return users.containsKey(id) ? "200 " + users.get(id) : "404";
            }
            if (method.equals("DELETE")) {
                return users.remove(id) != null ? "200" : "404";
            }
            return "404";
        }
        return "404";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        for (int i = 0; i < n; i++) {
            String[] parts = sc.nextLine().split(" ", 3);
            String body = parts.length > 2 ? parts[2].trim() : "";
            System.out.println(handle(parts[0], parts[1], body));
        }
    }
}
`,
    testCases: [
      {
        label: "Sample 1",
        input: "4\nPOST /users Asha\nGET /users/1\nGET /users/2\nDELETE /users/1\n",
        expectedOutput: "201 1\n200 Asha\n404\n204",
        hidden: false,
      },
      {
        label: "Sample 2",
        input: "5\nPOST /users Ben\nGET /users\nPOST /users\nGET /users/abc\nGET /missing\n",
        expectedOutput: "201 1\n405\n400\n400\n404",
        hidden: false,
      },
      {
        label: "Names with spaces",
        input: "4\nPOST /users Mary Ann Lee\nPOST /users Raj\nGET /users/1\nGET /users/2\n",
        expectedOutput: "201 1\n201 2\n200 Mary Ann Lee\n200 Raj",
        hidden: true,
      },
      {
        label: "Deleted users stay deleted",
        input: "5\nPOST /users A\nDELETE /users/1\nGET /users/1\nDELETE /users/1\nPOST /users B\n",
        expectedOutput: "201 1\n204\n404\n404\n201 2",
        hidden: true,
      },
      {
        label: "Unsupported methods",
        input: "4\nPOST /users/1\nPUT /users/1\nDELETE /users\nPATCH /users\n",
        expectedOutput: "405\n405\n405\n405",
        hidden: true,
      },
      {
        label: "Bad paths and ids",
        input: "6\nGET /users/\nGET /users/1/extra\nGET /users/-5\nGET /users/1x\nGET /user/1\nGET /\n",
        expectedOutput: "404\n404\n400\n400\n404\n404",
        hidden: true,
      },
      {
        label: "Rejected requests keep ids",
        input: "3\nPOST /users\nPOST /users Zed\nGET /users/1\n",
        expectedOutput: "400\n201 1\n200 Zed",
        hidden: true,
      },
    ],
  },
  {
    slug: "rest-paginated-list",
    title: "Fix the paginated list",
    skills: ["REST APIs"],
    timeLimitMs: 3000,
    instructions: `This task checks your grasp of REST fundamentals (query parameters, validation and status codes) in plain Java. No framework is needed.

The program below simulates a list endpoint with pagination. It reads a list of items, then a list of requests, and prints one response line for each request.

Input format
- The first line contains m (0 <= m <= 100), then m lines each containing one item name (no spaces).
- The next line contains r, the number of requests, then r lines, each of the form "GET <path>".

Rules
- The path may have a query string after a "?", with parameters separated by "&", in any order. Each parameter appears at most once.
- If the path before the "?" is not exactly /items, respond 404.
- The parameters are page (default 1) and size (default 3). Any other parameter is ignored.
- A page or size value that is present must be a whole number written with digits only (1 to 6 digits). Otherwise respond 400. After that, page must be at least 1, and size must be between 1 and 5, or respond 400.
- Otherwise respond "200 total=<m> items=<names on that page, separated by commas>". Page k with size s holds items number (k-1)*s + 1 up to k*s, counting from 1. A page past the end has no items, so the response ends with "items=".

Output format
- One line per request.

The program has bugs and does not give the correct answer. Find and fix them. Your solution is judged on the sample cases and on hidden test cases.`,
    starterCode: `import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Main {
    static List<String> items = new ArrayList<>();

    static String handle(String path) {
        String route = path;
        String query = "";
        int q = path.indexOf('?');
        if (q >= 0) {
            route = path.substring(0, q);
            query = path.substring(q + 1);
        }
        if (!route.equals("/items")) return "404";

        int page = 1;
        int size = 3;
        if (!query.isEmpty()) {
            for (String pair : query.split("&")) {
                String[] kv = pair.split("=", 2);
                if (kv[0].equals("page")) page = Integer.parseInt(kv[1]);
                if (kv[0].equals("size")) size = Integer.parseInt(kv[1]);
            }
        }

        int from = page * size;
        List<String> out = items.subList(from, from + size);
        return "200 total=" + items.size() + " items=" + String.join(",", out);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int m = Integer.parseInt(sc.nextLine().trim());
        for (int i = 0; i < m; i++) {
            items.add(sc.nextLine().trim());
        }
        int r = Integer.parseInt(sc.nextLine().trim());
        for (int i = 0; i < r; i++) {
            String[] parts = sc.nextLine().trim().split(" ", 2);
            System.out.println(handle(parts[1]));
        }
    }
}
`,
    testCases: [
      {
        label: "Sample 1",
        input:
          "5\napple\nbanana\ncherry\ndate\nelder\n3\nGET /items\nGET /items?page=2\nGET /items?page=1&size=2\n",
        expectedOutput:
          "200 total=5 items=apple,banana,cherry\n200 total=5 items=date,elder\n200 total=5 items=apple,banana",
        hidden: false,
      },
      {
        label: "Sample 2",
        input:
          "5\napple\nbanana\ncherry\ndate\nelder\n4\nGET /items?size=5\nGET /items?size=2&page=3\nGET /items?page=9\nGET /users\n",
        expectedOutput:
          "200 total=5 items=apple,banana,cherry,date,elder\n200 total=5 items=elder\n200 total=5 items=\n404",
        hidden: false,
      },
      {
        label: "Invalid values",
        input:
          "3\nant\nbee\ncat\n6\nGET /items?page=0\nGET /items?size=0\nGET /items?page=abc\nGET /items?size=6\nGET /items?page=-1\nGET /items?page=\n",
        expectedOutput: "400\n400\n400\n400\n400\n400",
        hidden: true,
      },
      {
        label: "Exact boundaries",
        input:
          "6\none\ntwo\nthree\nfour\nfive\nsix\n4\nGET /items?page=2&size=3\nGET /items?page=3&size=3\nGET /items?page=2&size=5\nGET /items?page=1&size=5\n",
        expectedOutput:
          "200 total=6 items=four,five,six\n200 total=6 items=\n200 total=6 items=six\n200 total=6 items=one,two,three,four,five",
        hidden: true,
      },
      {
        label: "Empty list",
        input: "0\n2\nGET /items\nGET /items?page=2\n",
        expectedOutput: "200 total=0 items=\n200 total=0 items=",
        hidden: true,
      },
      {
        label: "Other routes and unknown parameters",
        input:
          "2\nant\nbee\n4\nGET /items/\nGET /items?color=red\nGET /itemsx\nGET /items?size=1&page=2&color=red\n",
        expectedOutput: "404\n200 total=2 items=ant,bee\n404\n200 total=2 items=bee",
        hidden: true,
      },
      {
        label: "Very large page number",
        input: "3\nant\nbee\ncat\n2\nGET /items?page=100000&size=5\nGET /items?page=1&size=5\n",
        expectedOutput: "200 total=3 items=\n200 total=3 items=ant,bee,cat",
        hidden: true,
      },
    ],
  },
];