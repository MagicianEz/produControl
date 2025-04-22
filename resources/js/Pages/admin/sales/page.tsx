import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { DataTableDelivery } from "@/Components/datatable/DataTableDelivery";

interface FlashType extends PageProps {
    flash: {
        success?: string | null;
        error?: string | null;
    };
}

interface Product {
    sales_id: number;
    invoice: string;
    customer_name: string;
    grand_total: number;
    delivery_status: string;
    created_at: Date;
    updated_at: Date;
}

export default function SalesDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    search,
    isSku = false,
    products,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    search: string;
    isSku: boolean;
    products: Product[];
}>) {
    const [data, setData] = useState<any>([]);
    const [flashMessage, setFlashMessage] = useState<FlashType["flash"]>({
        success: null,
        error: null,
    });

    const { flash } = usePage<FlashType>().props;

    useEffect(() => {
        setFlashMessage({
            success: flash?.success || null,
            error: flash?.error || null,
        });
    }, [flash]);

    useEffect(() => {
        const dataProduction = products.map((product, index) => ({
            ...product,
            no: index + 1,
        }));
        setData(dataProduction);
    }, []);

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={"Penjualan"}
        >
            <Head title={"Penjualan"} />
            {flashMessage.success && (
                <p className="w-full rounded-md text-sm py-3 px-4 capitalize text-green-800 bg-green-300">
                    {flash.success}
                </p>
            )}
            {flashMessage.error && (
                <p className="w-full rounded-md text-sm py-3 px-4 capitalize text-red-800 bg-red-300">
                    {flash.error}
                </p>
            )}
            <div className="p-4">
                <h1 className="font-semibold mb-4">PENJUALAN</h1>
                <DataTableDelivery
                    data={data}
                    role={roleUser}
                    search={search}
                    isSku={isSku}
                />
            </div>
        </AdminLayout>
    );
}
