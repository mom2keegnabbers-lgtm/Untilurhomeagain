import { Link, useRouterState } from "@tanstack/react-router";

const items = [
  { to: "/", label: "Home" },
  { to: "/send", label: "Send" },
  { to: "/money", label: "Money" },
  { to: "/chat", label: "Chat" },
  { to: "/calendar", label: "Dates" },
  { to: "/ask", label: "Ask" },
  { to: "/notice", label: "Notice" },
  { to: "/help", label: "Help" },
  { to: "/membership", label: "Plans" },
] as const;

export function AppNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="sticky bottom-4 z-10 mt-6 flex items-center justify-around rounded-full border border-border bg-secondary px-2 py-3 backdrop-blur-xl">
      {items.map((item) => {
        const active =
          item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
              active ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                active ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
