import { useState, useEffect } from "react";
import { PageProps } from "@/types";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardHeader, CardTitle } from "@/Components/ui/Card";
import { DataTableLogging } from "../../Components/datatable/DataTableLogging";
import { Box, Package, UsersRound, Truck, NotebookText, UserPen, UserCheck, Check, Notebook, NotebookPen, List, ListCheck, ListCollapse, IdCard, BookKey } from "lucide-react";
import { Item, ItemIndicator } from "@radix-ui/react-dropdown-menu";
// import { saveData, getData } from "@/lib/indexedDb";

interface Total {
    users: number;
    keseluruhan: number;
    categoryProduction: number;
    categoryStock: number;
    master_data: number;
    production: number;
    stock: number;
    delivery: number;
    delivery_progress: number;
    delivery_hold: number;
    delivery_delivery: number;
    delivery_delivered: number;
    product_progress: number;
    product_hold: number;
    product_delivery: number;
    product_delivered: number;
}

interface LogsType {
    user_id: number;
    user_name: string;
    log_action: string;
    log_category: string;
    log_sku: string;
    log_keterangan: string;
    log_createdAt: string;
}

export default function Dashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    total,
    loggingData,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    total: Total;
    loggingData: LogsType[];
}>) {
    const [data, setdata] = useState<any>([]);

    // useEffect(() => {
    //     const saveToIndexedDB = async () => {
    //         const dataLogging = loggingData.map((item: any, index: number) => ({
    //             ...item,
    //             logging_id: index + 1,
    //         }));
    //         await saveData("logging", dataLogging);
    //         setData(dataLogging);
    //     };

    //     const fetchFromIndexedDB = async () => {
    //         const storedData = await getData("logging");
    //         if (storedData.length > 0) {
    //             setData(storedData);
    //         } else {
    //             saveToIndexedDB();
    //         }
    //     };

    //     fetchFromIndexedDB();
    // }, [loggingData]);

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={appTitle}
        >
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-yellow-600 p-4 rounded-full max-w-fit max-h-fit">
                                <BookKey className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.master_data
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Produk / SKU Yang Terdaftar
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-blue-600 p-4 rounded-full max-w-fit max-h-fit">
                                <ListCollapse className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.categoryProduction
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Kategori Pada Produksi
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-green-600 p-4 rounded-full max-w-fit max-h-fit">
                                <ListCollapse className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.categoryStock
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Kategori Pada Stok
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-red-600 p-4 rounded-full max-w-fit max-h-fit">
                                <UsersRound className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.users
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Pengguna Terdaftar
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-yellow-600 p-4 rounded-full max-w-fit max-h-fit">
                                <NotebookPen className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.keseluruhan
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Data Produk Keseluruhan
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-blue-600 p-4 rounded-full max-w-fit max-h-fit">
                                <NotebookPen className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.production
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Data Pada Produksi
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-green-600 p-4 rounded-full max-w-fit max-h-fit">
                                <NotebookPen className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.stock
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Data Pada Stok
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-red-600 p-4 rounded-full max-w-fit max-h-fit">
                                <NotebookPen className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.delivery
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Data Pada Pengiriman
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-yellow-600 p-4 rounded-full max-w-fit max-h-fit">
                                <Truck className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.delivery_progress
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Pengiriman On Progress
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-blue-600 p-4 rounded-full max-w-fit max-h-fit">
                                <Truck className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.delivery_delivery
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Pengiriman On Delivery
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-green-600 p-4 rounded-full max-w-fit max-h-fit">
                                <Truck className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.delivery_delivered
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Pengiriman Delivered
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-red-600 p-4 rounded-full max-w-fit max-h-fit">
                                <Truck className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.delivery_hold
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Pengiriman On Hold
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-yellow-600 p-4 rounded-full max-w-fit max-h-fit">
                                <Package className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.product_progress
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Produk On Progress
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-blue-600 p-4 rounded-full max-w-fit max-h-fit">
                                <Package className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.product_delivery
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Produk On Delivery
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-green-600 p-4 rounded-full max-w-fit max-h-fit">
                                <Package className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.product_delivered
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Pengiriman Delivered
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="font-normal text-sm grid grid-cols-3">
                            <div className="bg-red-600 p-4 rounded-full max-w-fit max-h-fit">
                                <Package className="text-white" />
                            </div>
                            <div className="col-span-2 pl-2">
                                <h1 className="text-4xl font-bold text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                        total.product_hold
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Produk On Hold
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>
            <div className="p-4">
                <h1 className="text-2xl mb-4 font-semibold">Product Logs</h1>
                <DataTableLogging data={loggingData} />
            </div>
        </AdminLayout>
    );
}
