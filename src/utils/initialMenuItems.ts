import { MenuItem } from "@/contexts/LayoutDisclosure";

export const initialMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    link: "/",
    icon: "bx bxs-layout",
  },
  {
    id: "usuario",
    label: "Usuario",
    icon: "bx bx-user",
    subItems: [
      {
        id: "read-live-stream",
        label: "Cadastrar",
        link: "/usuario",
        parentId: "usuario",
      },
    ],
  },
  {
    id: "repasse",
    label: "Repasse",
    icon: "bx bx-file",
    link: '/repasse',
  },
];
