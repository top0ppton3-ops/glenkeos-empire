import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, showHome = true }) => {
  const allItems = showHome
    ? [{ label: "Home", href: "/", icon: <Home className="w-4 h-4" /> }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 flex-wrap">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="flex items-center gap-2 transition-colors hover:opacity-70"
                  style={{
                    color: "var(--b1-neutral-gray)",
                    fontSize: "var(--font-size-sm)"
                  }}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className="flex items-center gap-2"
                  style={{
                    color: isLast ? "var(--b1-white-space)" : "var(--b1-neutral-gray)",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: isLast ? "var(--font-weight-medium)" : "var(--font-weight-regular)"
                  }}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span className="truncate max-w-xs">{item.label}</span>
                </span>
              )}

              {!isLast && (
                <ChevronRight
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "var(--b1-neutral-gray)" }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
