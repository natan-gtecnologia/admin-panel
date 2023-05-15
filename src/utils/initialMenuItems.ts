import { MenuItem } from "@/contexts/LayoutDisclosure";

export const initialMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    link: "/",
    icon: "bx bxs-layout",
  },
  {
    id: "live-stream",
    label: "Live Shopping",
    icon: "bx bx-tv",
    subItems: [
      {
        id: "read-live-stream",
        label: "Lista de Lives",
        link: "/live-stream",
        parentId: "live-stream",
      },
      {
        id: "create-live-stream",
        label: "Nova Live",
        link: "/live-stream/criar",
        parentId: "live-stream",
      },
    ],
  },
];
