import WorkspaceNavItem, { type WorkspaceNavLink } from './WorkspaceNavItem';

interface WorkspaceShellProps {
  /** Sidebar card heading — e.g. "Artist Dashboard" / "Admin Console". */
  title: string;
  navItems: WorkspaceNavLink[];
  children: React.ReactNode;
}

/**
 * Shared premium workspace shell for the Artist and Admin dashboards
 * (Phase 2.2). Purely visual — each layout keeps its own role-specific
 * auth/hydration guard and passes already-authorized children through.
 *
 * Desktop: fixed vertical sidebar card + content, ivory workspace floor.
 * Mobile: sidebar collapses to a horizontal scrollable tab strip so page
 * content isn't pushed below a full nav list.
 */
export default function WorkspaceShell({ title, navItems, children }: WorkspaceShellProps) {
  return (
    <div className="section container min-h-screen bg-workspace">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <nav className="flex lg:hidden gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {navItems.map((item) => (
              <WorkspaceNavItem key={item.href} {...item} variant="tab" />
            ))}
          </nav>

          <div className="hidden lg:block bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-brand mb-6">{title}</h2>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <WorkspaceNavItem key={item.href} {...item} variant="sidebar" />
              ))}
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}
