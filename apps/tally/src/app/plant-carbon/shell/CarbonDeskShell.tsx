import type { ReactNode } from "react";
import {
  Content,
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  HeaderName,
  HeaderPanel,
  Switcher,
  SwitcherDivider,
  SwitcherItem,
  SideNav,
  SideNavItems,
  SideNavLink,
  SkipToContent,
} from "@carbon/react";
import {
  Asleep,
  ChevronLeft,
  ChevronRight,
  Light,
  Notification,
  Switcher as SwitcherIcon,
  UserAvatar,
} from "@carbon/icons-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useCarbonTheme } from "../CarbonThemeContext";
import {
  type CarbonPersonaId,
  useCarbonPersonaCycle,
} from "./personaCycle";

export type CarbonNavItem = {
  id: string;
  label: string;
  badge?: number | string;
};

type CarbonDeskShellProps = {
  personaId: CarbonPersonaId;
  productLabel: string;
  navItems: readonly CarbonNavItem[];
  activeNav: string;
  onNavChange: (id: string) => void;
  children: ReactNode;
  /** Optional page header row rendered above children inside Content */
  pageTitle?: string;
  pageActions?: ReactNode;
};

/**
 * Whole-product Carbon UI Shell — Header + SideNav + Content.
 * Persona ←→ cycle (and Switcher) mirrors plant PlantBrandMark.
 */
export function CarbonDeskShell({
  personaId,
  productLabel,
  navItems,
  activeNav,
  onNavChange,
  children,
  pageTitle,
  pageActions,
}: CarbonDeskShellProps) {
  const { isDark, setIsDark } = useCarbonTheme();
  const navigate = useNavigate();
  const { goPrev, goNext, label, personas } = useCarbonPersonaCycle(personaId);
  const [sideNavExpanded, setSideNavExpanded] = useState(true);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  return (
    <div className="plant-carbon-shell" style={{ minHeight: "100vh" }}>
      <Header aria-label={`${productLabel} ${label}`}>
        <SkipToContent />
        <HeaderMenuButton
          aria-label={sideNavExpanded ? "Close menu" : "Open menu"}
          isActive={sideNavExpanded}
          onClick={() => setSideNavExpanded((v) => !v)}
        />
        <HeaderName
          href="/prototype-carbon"
          prefix="Tally"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          {productLabel}
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label="Previous persona"
            tooltipAlignment="end"
            onClick={goPrev}
          >
            <ChevronLeft size={20} />
          </HeaderGlobalAction>
          <span
            className="cds--header__action"
            style={{
              display: "inline-flex",
              alignItems: "center",
              paddingInline: "0.5rem",
              fontSize: "0.75rem",
              opacity: 0.9,
              pointerEvents: "none",
              minWidth: "7rem",
              justifyContent: "center",
            }}
          >
            {label}
          </span>
          <HeaderGlobalAction
            aria-label="Next persona"
            tooltipAlignment="end"
            onClick={goNext}
          >
            <ChevronRight size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction
            aria-label="Switch persona"
            tooltipAlignment="end"
            isActive={switcherOpen}
            onClick={() => setSwitcherOpen((v) => !v)}
          >
            <SwitcherIcon size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            tooltipAlignment="end"
            onClick={() => setIsDark((v: boolean) => !v)}
          >
            {isDark ? <Light size={20} /> : <Asleep size={20} />}
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="Notifications" tooltipAlignment="end">
            <Notification size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="Account" tooltipAlignment="end">
            <UserAvatar size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
        <HeaderPanel
          aria-label="Persona switcher"
          expanded={switcherOpen}
        >
          <Switcher aria-label="Personas">
            <SwitcherItem
              aria-label="Prototype Carbon hub"
              href="/prototype-carbon"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                setSwitcherOpen(false);
                navigate("/");
              }}
            >
              Hub
            </SwitcherItem>
            <SwitcherDivider />
            {personas.map((p) => (
              <SwitcherItem
                key={p.id}
                aria-label={p.label}
                aria-current={p.id === personaId ? "page" : undefined}
                href={`/prototype-carbon${p.path}`}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  setSwitcherOpen(false);
                  navigate(p.path);
                }}
              >
                {p.label}
              </SwitcherItem>
            ))}
            <SwitcherDivider />
            <SwitcherItem
              aria-label="Open original Plant prototype"
              href="/prototype"
            >
              Open /prototype (separate doc)
            </SwitcherItem>
          </Switcher>
        </HeaderPanel>
      </Header>

      <SideNav
        aria-label={`${label} navigation`}
        expanded={sideNavExpanded}
        isChildOfHeader
        onSideNavBlur={() => {
          /* keep expanded on desktop-style plant */
        }}
      >
        <SideNavItems>
          {navItems.map((item) => (
            <SideNavLink
              key={item.id}
              aria-current={activeNav === item.id ? "page" : undefined}
              isActive={activeNav === item.id}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                onNavChange(item.id);
              }}
              href={`#${item.id}`}
            >
              {item.label}
              {item.badge != null && item.badge !== 0 ? (
                <span style={{ marginLeft: "0.5rem", opacity: 0.7 }}>
                  ({item.badge})
                </span>
              ) : null}
            </SideNavLink>
          ))}
        </SideNavItems>
      </SideNav>

      <Content id="main-content">
        {(pageTitle || pageActions) && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "1rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {pageTitle ? (
              <h1 className="cds--type-productive-heading-04">{pageTitle}</h1>
            ) : (
              <span />
            )}
            {pageActions}
          </div>
        )}
        {children}
      </Content>
    </div>
  );
}
