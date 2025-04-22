import * as React from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/Components/ui/Sidebar";
import { Link } from "@inertiajs/react";

const data = {
    navMain: [
        {
            title: "Aplikasi",
            url: route("dashboard.show"),
            items: [
                {
                    title: "Dashboard",
                    url: route("dashboard.show"),
                    isActive:
                        route(`${route().current()}`) ===
                        route("dashboard.show"),
                    roleAvailable: "all",
                },
                {
                    title: "Kategori & Tag",
                    url: route("category.show"),
                    isActive:
                        route(`${route().current()}`) ===
                        route("category.show"),
                    roleAvailable: "all",
                },
                {
                    title: "Produksi",
                    url: route("production.show"),
                    isActive:
                        route(`${route().current()}`) ===
                        route("production.show"),
                    roleAvailable: "all",
                },
                {
                    title: "Stok",
                    url: route("stock.show"),
                    isActive:
                        route(`${route().current()}`) === route("stock.show"),
                    roleAvailable: "all",
                },
                {
                    title: "Penjualan",
                    url: route("sales.show"),
                    isActive:
                        route(`${route().current()}`) ===
                        route("sales.show"),
                    roleAvailable: "all",
                },
                {
                    title: "Akun",
                    url: route("user.show"),
                    isActive:
                        route(`${route().current()}`) === route("user.show"),
                    roleAvailable: "admin",
                },
            ],
            
        },
        {
            title: "Shortcut",
            url: route("dashboard.show"),
            items: [
                {
                    title: "Tambah Produk",
                    url: route("production.add.show"),
                    isActive:
                        route(`${route().current()}`) ===
                        route("production.add.show"),
                    roleAvailable: ["admin", "operator"],
                },
                {
                    title: "Tambah Kategori",
                    url: route("category.add.show"),
                    isActive:
                        route(`${route().current()}`) ===
                        route("category.add.show"),
                    roleAvailable: ["admin", "operator"],
                },
            ],
        },
    ],
};

const bg = "bg-slate-900";

export function AppSidebar({
    title,
    role,
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar variant="sidebar" {...props} className={bg}>
            <SidebarHeader className={bg}>
                <a
                    href={route("dashboard.show")}
                    className="font-semibold text-center py-4 text-white text-2xl"
                >
                    {title}
                </a>
            </SidebarHeader>
            <SidebarContent className={bg}>
    {data.navMain
        .filter((group: any) => {
            // Filter group jika ada setidaknya satu item yang sesuai dengan role
            return group.items.some(
                (item: any) =>
                    item.roleAvailable === "all" ||
                    item.roleAvailable.includes(role)
            );
        })
        .map((item: any) => (
            <SidebarGroup key={item.title}>
                <SidebarGroupLabel className="text-gray-500">
                    {item.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {item.items
                            .filter(
                                (item: any) =>
                                    item.roleAvailable === "all" ||
                                    item.roleAvailable.includes(role)
                            )
                            .map((item: any) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href={item.url}
                                            className="text-gray-200 hover:text-slate-800"
                                        >
                                            {item.title}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        ))}
</SidebarContent>

            <SidebarRail className={bg} />
        </Sidebar>
    );
}
