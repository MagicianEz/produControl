import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { DataTableCategory } from "@/Components/datatable/DataTableCategory";
// import { saveData, getData } from "@/lib/indexedDb";

interface FlashType extends PageProps {
    flash: {
        success?: string | null;
        error?: string | null;
    };
}

interface Category {
    category_id: number;
    category_name: string;
    category_type: string;
    tags: {
        id: number;
        name: string;
    }[];
}

export default function DeliveryDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    categories,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    categories: Category[];
}>) {
    const allCategory: { value: string; label: string }[] = Array.from(
        new Set<string>(categories.map((item) => item.category_name))
    ).map((item: string) => ({ value: item, label: item }));

    const allTag: { value: string; label: string }[] = Array.from(
        new Set<string>(
            categories
                .map((item) =>
                    item.tags.map(
                        (tag: { id: number; name: string }) => tag.name
                    )
                )
                .flat()
        )
    ).map((item: string) => ({ value: item, label: item }));

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
        const dataCategory = categories.map(
            (category: Category, index: number) => ({
                ...category,
                no: index + 1,
                id_kategori: category.category_id,
                nama_kategori: category.category_name,
                tipe_kategori: category.category_type,
            })
        );
        setData(dataCategory);
    }, []);

    // useEffect(() => {
    //     const saveToIndexedDB = async () => {
    //         const dataCategory = categories.map(
    //             (category: Category, index: number) => ({
    //                 ...category,
    //                 no: index + 1,
    //                 id_kategori: category.category_id,
    //                 nama_kategori: category.category_name,
    //                 tipe_kategori: category.category_type,
    //             })
    //         );
    //         await saveData("categories", dataCategory);
    //         setData(dataCategory);
    //     };

    //     const fetchFromIndexedDB = async () => {
    //         const storedData = await getData("categories");
    //         if (storedData.length > 0) {
    //             setData(storedData);
    //         } else {
    //             saveToIndexedDB();
    //         }
    //     };

    //     fetchFromIndexedDB();
    // }, [categories]);

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={appTitle}
        >
            <Head title={appTitle} />
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
                <h1 className="font-semibold mb-4">KATEGORI</h1>
                <DataTableCategory
                    data={data}
                    role={roleUser}
                    allCategory={allCategory}
                    allTag={allTag}
                />
            </div>
        </AdminLayout>
    );
}
