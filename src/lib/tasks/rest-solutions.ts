// Reference solutions for REST tasks. Never import this file from app pages or actions.
export const REST_SOLUTIONS: Record<string, string> = {
  "rest-user-api": `import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

public class Main {
    static Map<Integer, String> users = new HashMap<>();
    static int nextId = 1;

    static boolean isNumber(String s, int maxLen) {
        if (s.isEmpty() || s.length() > maxLen) return false;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c < '0' || c > '9') return false;
        }
        return true;
    }

    static String handle(String method, String path, String body) {
        if (path.equals("/users")) {
            if (!method.equals("POST")) return "405";
            if (body.isEmpty()) return "400";
            int id = nextId++;
            users.put(id, body);
            return "201 " + id;
        }
        if (path.startsWith("/users/")) {
            String segment = path.substring("/users/".length());
            if (segment.isEmpty() || segment.contains("/")) return "404";
            if (!isNumber(segment, 9)) return "400";
            int id = Integer.parseInt(segment);
            if (method.equals("GET")) {
                return users.containsKey(id) ? "200 " + users.get(id) : "404";
            }
            if (method.equals("DELETE")) {
                return users.remove(id) != null ? "204" : "404";
            }
            return "405";
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
  "rest-paginated-list": `import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Main {
    static List<String> items = new ArrayList<>();

    static boolean isNumber(String s, int maxLen) {
        if (s.isEmpty() || s.length() > maxLen) return false;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c < '0' || c > '9') return false;
        }
        return true;
    }

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
                String value = kv.length > 1 ? kv[1] : "";
                if (kv[0].equals("page")) {
                    if (!isNumber(value, 6)) return "400";
                    page = Integer.parseInt(value);
                } else if (kv[0].equals("size")) {
                    if (!isNumber(value, 6)) return "400";
                    size = Integer.parseInt(value);
                }
            }
        }
        if (page < 1 || size < 1 || size > 5) return "400";

        long from = (long) (page - 1) * size;
        long to = Math.min(from + size, (long) items.size());
        List<String> out = new ArrayList<>();
        for (long i = from; i < to; i++) {
            out.add(items.get((int) i));
        }
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
};