import { useState, useEffect } from "react";
import { PageProps } from "@/types";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardHeader, CardTitle } from "@/Components/ui/Card";
import { DataTableLogging } from "../../Components/datatable/DataTableLogging";
import { UsersRound, Truck, NotebookPen, ListCollapse, BookKey } from "lucide-react";

interface Total {
    users: number;
    category: number;
    tagsProduction: number;
    tagsStock: number;
    master_data: number;
    production: number;
    stock: number;
    delivery: number;
    delivery_progress: number;
    delivery_hold: number;
    delivery_delivery: number;
    delivery_delivered: number;
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
                                        total.category
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Kategori yang Terdaftar
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
                                        total.tagsProduction
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Tags Produksi
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
                                        total.tagsStock
                                    )}
                                </h1>
                                <p className="text-sm text-right">
                                    Total Tags Pada Stok
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
            </div>
            <div className="p-4">
                <h1 className="text-2xl mb-4 font-semibold">Product Logs</h1>
                <DataTableLogging data={loggingData} />
            </div>
        </AdminLayout>
    );
}
