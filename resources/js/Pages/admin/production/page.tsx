import { PageProps } from "@/types";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { DataTableProduct } from "@/Components/datatable/DataTableProduct";
// import { saveData, getData } from "@/lib/indexedDb";

interface FlashType extends PageProps {
    flash: {
        success?: string | null;
        error?: string | null;
    };
}

interface Product {
    production_id: number;
    master_id: number;
    category_id: number;
    category_name: string;
    product_name: string;
    product_quantity: number;
    sku: string;
    tags: { id: number; name: string }[];
    created_at: Date;
    updated_at: Date;
}

export default function ProductDashboard({
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
        }));
        setData(dataProduction);
    }, []);

    // useEffect(() => {
    //     const saveToIndexedDB = async () => {
    //         const dataProduction = products.map((product, index) => ({
    //             ...product,
    //             no: index + 1,
    //             sku: product.sku,
    //             nama_produk: product.product_name,
    //             kategori: product.category_name,
    //             tags: product.tags,
    //             jumlah: product.product_quantity,
    //         }));
    //         await saveData("productions", dataProduction);
    //         setData(dataProduction);
    //     };

    //     const fetchFromIndexedDB = async () => {
    //         const storedData = await getData("productions");
    //         if (storedData.length > 0) {
    //             setData(storedData);
    //         } else {
    //             saveToIndexedDB();
    //         }
    //     };

    //     fetchFromIndexedDB();
    // }, []);

    return (
        <AdminLayout
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={"Produksi"}
        >
            <Head title="Produksi" />
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
                <h1 className="font-semibold mb-4">PRODUKSI</h1>
                <DataTableProduct
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
