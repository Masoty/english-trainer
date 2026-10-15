import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  backTo?: string;
  backLabel?: string;
  title?: string;
  subtitle?: string;
  score?: number;
  streak?: number;
  headerExtra?: ReactNode;
  shellClassName?: string;
  mainClassName?: string;
};

export function Layout({
  children,
  backTo,
  backLabel = "Назад",
  title,
  subtitle,
  score,
  streak,
  headerExtra,
  shellClassName,
  mainClassName,
}: LayoutProps) {
  return (
    <div className={shellClassName ? `app-shell ${shellClassName}` : "app-shell"}>
      <header className="app-header">
        <div className="header-left">
          {backTo ? (
            <Link to={backTo} className="back-link" title={backLabel} aria-label={backLabel}>
              <span className="back-link-short" aria-hidden="true">
                ⟵
              </span>
              <span className="back-link-full">⟵ {backLabel}</span>
            </Link>
          ) : (
            <span className="logo">English Trainer</span>
          )}
        </div>
        <div className="header-right">
          {headerExtra}
          {(score !== undefined || streak !== undefined) && (
            <div className="header-stats">
              {score !== undefined && <span className="stat-pill">⭐ {score}</span>}
              {streak !== undefined && streak > 0 && (
                <span className="stat-pill streak">🔥 {streak}</span>
              )}
            </div>
          )}
        </div>
      </header>

      {(title || subtitle) && (
        <div className="page-heading">
          {title && <h1>{title}</h1>}
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}

      <main className={mainClassName ? `app-main ${mainClassName}` : "app-main"}>{children}</main>
    </div>
  );
}
