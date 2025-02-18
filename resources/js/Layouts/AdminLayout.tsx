import { AppSidebar } from "@/Components/AppSidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/Breadcrumb";
import { Separator } from "@/Components/ui/Separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/Components/ui/Sidebar";
import Dropdown from "@/Components/Dropdown";
import { Head, Link } from "@inertiajs/react";

export default function AdminLayout({
    children,
    appName,
    title,
    name,
    role,
    breadcumb1,
    breadcumb2,
    breadcumb3,
    breadcumb2Href,
}: {
    children: any;
    appName?: string;
    title: string;
    name: string;
    role: string;
    breadcumb1: string;
    breadcumb2: string;
    breadcumb3?: string;
    breadcumb2Href?: string;
}) {
    return (
        <SidebarProvider>
            <Head title={title} />
            <AppSidebar title={"ProduControl"} role={role} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between border-b">
                    <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcumb1 && (
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink asChild>
                                            <Link
                                                href={route("dashboard.show")}
                                            >
                                                {breadcumb1}
                                            </Link>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                )}

                                {breadcumb2 && breadcumb3 && (
                                    <>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                        <BreadcrumbItem className="hidden md:block">
                                            <BreadcrumbLink asChild>
                                                <Link
                                                    href={
                                                        breadcumb2Href ||
                                                        route("dashboard.show")
                                                    }
                                                >
                                                    {breadcumb2}
                                                </Link>
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                    </>
                                )}

                                {breadcumb2 && !breadcumb3 && (
                                    <>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                        <BreadcrumbItem className="hidden md:block">
                                            <BreadcrumbPage>
                                                {breadcumb2}
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                )}

                                {breadcumb3 && (
                                    <>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>
                                                {breadcumb3}
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                )}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="sm:ms-6 sm:flex sm:items-center mr-4">
                        <div className="relative ms-3">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-900 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                        >
                                            <p className="flex flex-col items-start">
                                                <span className="text-xs font-semibold capitalize">
                                                    {name}
                                                </span>
                                                <span className="text-xs font-thin capitalize">
                                                    {role}
                                                </span>
                                            </p>
                                            <svg
                                                className="-me-0.5 ms-2 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown>
                                        <Link
                                            className="px-4 py-1 mb-1 text-sm w-full text-left"
                                            href={route("profile.edit")}
                                            as="button"
                                        >
                                            Profil Saya
                                        </Link>
                                    </Dropdown>
                                    <Dropdown>
                                        <Link
                                            className="px-4 py-1 text-sm w-full text-left"
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                        >
                                            Keluar
                                        </Link>
                                    </Dropdown>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}
