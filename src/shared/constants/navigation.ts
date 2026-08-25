import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  UserCog,
  Boxes,
  Truck,
  ShoppingBag,
  FlaskConical,
  Factory,
  Wallet,
  BarChart3,
  ShieldCheck,
  Settings,
  Store,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Módulos aún no implementados muestran un estado "Próximamente" en vez de 404. */
  implemented: boolean;
  /** Permiso requerido para ver el ítem. `null` = visible para cualquier sesión activa. */
  permission: string | null;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operación",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutDashboard, implemented: true, permission: null },
      { label: "Ventas", path: "/ventas", icon: ShoppingCart, implemented: true, permission: "sales.read_own" },
      { label: "Producción", path: "/produccion", icon: Factory, implemented: true, permission: "production.read_own" },
      { label: "Caja", path: "/caja", icon: Wallet, implemented: true, permission: "cash.open_own" },
      { label: "Clientes", path: "/clientes", icon: Users, implemented: true, permission: "customers.read" },
    ],
  },
  {
    label: "Inventario",
    items: [
      { label: "Insumos", path: "/insumos", icon: Boxes, implemented: true, permission: "inventory.read" },
      { label: "Recetas", path: "/recetas", icon: FlaskConical, implemented: true, permission: "recipes.read" },
      { label: "Compras", path: "/compras", icon: ShoppingBag, implemented: true, permission: "purchases.read" },
      { label: "Proveedores", path: "/proveedores", icon: Truck, implemented: true, permission: "suppliers.read" },
    ],
  },
  {
    label: "Análisis",
    items: [
      { label: "Reportes", path: "/reportes", icon: BarChart3, implemented: false, permission: "reports.read_own_sales" },
      { label: "Catálogo online", path: "/catalogo", icon: Store, implemented: false, permission: null },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Usuarios", path: "/usuarios", icon: UserCog, implemented: true, permission: "users.read" },
      { label: "Auditoría", path: "/auditoria", icon: ShieldCheck, implemented: false, permission: "audit.read" },
      { label: "Configuración", path: "/configuracion", icon: Settings, implemented: false, permission: "settings.manage" },
    ],
  },
];
