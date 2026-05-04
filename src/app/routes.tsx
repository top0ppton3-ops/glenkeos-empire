import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { CorporateLayout } from "./layouts/CorporateLayout";
import { Home } from "./pages/Home";
import { Menu } from "./pages/Menu";
import { ItemDetails } from "./pages/ItemDetails";
import { Locations } from "./pages/Locations";
import { Rewards } from "./pages/Rewards";
import { About } from "./pages/About";
import { Support } from "./pages/Support";
import { Legal } from "./pages/Legal";
import { Privacy } from "./pages/Privacy";
import { Accessibility } from "./pages/Accessibility";
import { Cart } from "./pages/Cart";
import { CartPage } from "./pages/CartPage";
import { Checkout } from "./pages/Checkout";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderTracking } from "./pages/OrderTracking";
import { Account } from "./pages/Account";
import { NotFound } from "./pages/NotFound";

// Corporate Pages
import { GlenKeosOverview } from "./pages/corporate/GlenKeosOverview";
import { Divisions } from "./pages/corporate/Divisions";
import { Compliance as CorporateCompliance } from "./pages/corporate/Compliance";
import { RiskGovernance } from "./pages/corporate/RiskGovernance";
import { TechnologyData } from "./pages/corporate/TechnologyData";
import { GovernanceVault } from "./pages/corporate/GovernanceVault";
import { CorporateContact } from "./pages/corporate/CorporateContact";

// Internal Portal
import { InternalLayout } from "./layouts/InternalLayout";
import { InternalLogin } from "./pages/internal/InternalLogin";
import { InternalDashboard } from "./pages/internal/InternalDashboard";
import { Compliance as InternalCompliance } from "./pages/internal/Compliance";
import { OperationsNew as Operations } from "./pages/internal/OperationsNew";
import { Analytics } from "./pages/internal/Analytics";
import { Settings } from "./pages/internal/Settings";
import { ExecutionDashboard } from "./pages/internal/ExecutionDashboard";

// Backend Test
import { BackendTest } from "./components/BackendTest";
import { ApiDemo } from "./pages/ApiDemo";

// Brand Pages
import { BrandSelector } from "./pages/BrandSelector";
import { ChicOnChain } from "./pages/brands/ChicOnChain";
import { GhettoEats } from "./pages/brands/GhettoEats";
import { GoldKey } from "./pages/brands/GoldKey";

// Brand Storefronts (Customer-Facing)
import { ChicOnChainStore } from "./pages/brands/ChicOnChainStore";
import { GhettoEatsStore } from "./pages/brands/GhettoEatsStore";
import { GoldKeyStore } from "./pages/brands/GoldKeyStore";
import { GoldKeyEvents } from "./pages/brands/GoldKeyEvents";

// RBAC Portals - 5-Tier Hierarchy + Governance + Executive
import { CustomerPortal } from "./portals/customer/CustomerPortal";
import EmployeePortal from "./portals/employee/EmployeePortal";
import ManagerPortal from "./portals/manager/ManagerPortal";
import { SupervisorPortal } from "./portals/supervisor/SupervisorPortal";
import { AuthRepPortal } from "./portals/authrep/AuthRepPortal";
import { OwnerPortal } from "./portals/owner/OwnerPortal";
import { GovernancePortal } from "./portals/governance/GovernancePortal";
import { ExecutivePortal } from "./portals/executive/ExecutivePortal";
import { CorporatePortal } from "./portals/corporate/CorporatePortal";

// Error Boundary
import { RouteErrorBoundary } from "./components/ErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: BrandSelector,
    errorElement: <RouteErrorBoundary />,
  },
  // Chic-on-Chain Routes
  {
    path: "/chic-on-chain",
    Component: ChicOnChain,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/chic-on-chain/menu",
    Component: ChicOnChainStore,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/chic-on-chain/cart",
    Component: Cart,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/chic-on-chain/checkout",
    Component: Checkout,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/chic-on-chain/locations",
    Component: Locations,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/chic-on-chain/catering",
    Component: Home,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/chic-on-chain/reservations",
    Component: Home,
    errorElement: <RouteErrorBoundary />,
  },
  // Ghetto Eats Routes
  {
    path: "/ghetto-eats",
    Component: GhettoEats,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/ghetto-eats/menu",
    Component: GhettoEatsStore,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/ghetto-eats/cart",
    Component: Cart,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/ghetto-eats/checkout",
    Component: Checkout,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/ghetto-eats/deals",
    Component: Home,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/ghetto-eats/track",
    Component: OrderTracking,
    errorElement: <RouteErrorBoundary />,
  },
  // GoldKey Routes
  {
    path: "/goldkey",
    Component: GoldKey,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/goldkey/concierge",
    Component: GoldKeyStore,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/goldkey/events",
    Component: GoldKeyEvents,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/goldkey/travel",
    Component: Home,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/customer",
    Component: RootLayout,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, Component: Home },
      { path: "menu", Component: Menu },
      { path: "menu/:itemId", Component: ItemDetails },
      { path: "locations", Component: Locations },
      { path: "rewards", Component: Rewards },
      { path: "about", Component: About },
      { path: "support", Component: Support },
      { path: "legal", Component: Legal },
      { path: "privacy", Component: Privacy },
      { path: "accessibility", Component: Accessibility },
      { path: "cart", Component: Cart },
      { path: "cart-page", Component: CartPage },
      { path: "checkout", Component: Checkout },
      { path: "orders/:orderId", Component: OrderTracking },
      { path: "account", Component: Account },
      { path: "*", Component: NotFound },
      { path: "test-backend", Component: BackendTest },
      { path: "api-demo", Component: ApiDemo },
    ],
  },
  {
    path: "/corporate",
    Component: CorporateLayout,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, Component: GlenKeosOverview },
      { path: "divisions", Component: Divisions },
      { path: "compliance", Component: CorporateCompliance },
      { path: "risk-governance", Component: RiskGovernance },
      { path: "technology", Component: TechnologyData },
      { path: "vault", Component: GovernanceVault },
      { path: "contact", Component: CorporateContact },
    ],
  },
  {
    path: "/internal",
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "login", Component: InternalLogin },
      {
        path: "",
        Component: InternalLayout,
        children: [
          { index: true, Component: InternalDashboard },
          { path: "compliance", Component: InternalCompliance },
          { path: "operations", Component: Operations },
          { path: "analytics", Component: Analytics },
          { path: "settings", Component: Settings },
          { path: "execution", Component: ExecutionDashboard },
        ],
      },
    ],
  },
  {
    path: "/test-backend",
    Component: BackendTest,
    errorElement: <RouteErrorBoundary />,
  },
  // Account route (accessible from all brands)
  {
    path: "/account",
    Component: Account,
    errorElement: <RouteErrorBoundary />,
  },
  // Universal Cart (accessible from all brands)
  {
    path: "/cart",
    Component: CartPage,
    errorElement: <RouteErrorBoundary />,
  },
  // Universal Checkout (accessible from all brands)
  {
    path: "/checkout",
    Component: CheckoutPage,
    errorElement: <RouteErrorBoundary />,
  },
  // RBAC Portals - Identity-Based Access (7 Portals)
  // Tier 5: Employee
  {
    path: "/employee/*",
    Component: EmployeePortal,
    errorElement: <RouteErrorBoundary />,
  },
  // Tier 4: Manager
  {
    path: "/manager/*",
    Component: ManagerPortal,
    errorElement: <RouteErrorBoundary />,
  },
  // Tier 3: Supervisor (MFA Required)
  {
    path: "/supervisor",
    Component: SupervisorPortal,
    errorElement: <RouteErrorBoundary />,
  },
  // Tier 2: Authorized Representative (MFA Required)
  {
    path: "/authrep",
    Component: AuthRepPortal,
    errorElement: <RouteErrorBoundary />,
  },
  // Tier 1: Owner (MFA Required)
  {
    path: "/owner",
    Component: OwnerPortal,
    errorElement: <RouteErrorBoundary />,
  },
  // Governance: Auditor/IRS/Compliance (Read-Only, MFA Required)
  {
    path: "/governance",
    Component: GovernancePortal,
    errorElement: <RouteErrorBoundary />,
  },
  // Executive: IAM/Security/High-Risk Approvals (MFA Required)
  {
    path: "/executive",
    Component: ExecutivePortal,
    errorElement: <RouteErrorBoundary />,
  },
  // Legacy Customer/Corporate Portals
  {
    path: "/portal/customer",
    Component: CustomerPortal,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/portal/corporate",
    Component: CorporatePortal,
    errorElement: <RouteErrorBoundary />,
  },
]);