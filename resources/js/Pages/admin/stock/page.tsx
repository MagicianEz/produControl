import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { DataTableStock } from "@/Components/datatable/DataTableStock";

interface FlashType extends PageProps {
    flash: {
        success?: string | null;
        error?: string | null;
    };
}

interface Product {
    category_id: number;
    category_name: string;
    master_id: number;
    product_name: string;
    product_price: number;
    product_quantity: number;
    sku: string;
    stock_id: number;
    tags: { id: number; name: string }[];
    created_at: Date;
    updated_at: Date;
}

export default function StockDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    search,
    products,
    allCategory,
    allTag,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    search: string;
    products: Product[];
    allCategory: { value: string; label: string }[];
    allTag: { value: string; label: string }[];
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
            sku: product.sku,
            nama_produk: product.product_name,
            kategori: product.category_name,
            tags: product.tags,
            jumlah: product.product_quantity,
            harga: product.product_price,
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
            breadcumb2={"Stok"}
        >
            <Head title={"Stok"} />
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
                <h1 className="font-semibold mb-4">STOK</h1>
                <DataTableStock
                    data={data}
                    role={roleUser}
                    allCategory={allCategory}
                    allTag={allTag}
                    search={search}
                />
            </div>
        </AdminLayout>
    );
}
