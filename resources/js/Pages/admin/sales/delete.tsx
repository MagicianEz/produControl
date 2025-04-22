import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Checkbox } from "@/Components/ui/Checkbox";
import { Button } from "@/Components/ui/Button";

export default function SalesAddDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    productInStock,
    salesData,
    salesDetailList,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    productInStock: any;
    salesData: any;
    salesDetailList: any;
}>) {
    const [countList, setCountList] = useState<number>(1);
    const [productList, setProductList] = useState<
        Array<{ master_id: number | null; stock_id: number | null; quantity: number | null; price: number | null }>
    >([{ master_id: null, stock_id: null, quantity: null, price: null }]);
    const [isChecked, setIsChecked] = useState<boolean>(false);

    const {
        reset,
        processing,
        delete: destroy,
    } = useForm({
        id: salesData.id,
    });

    const submit = (e: any) => {
        e.preventDefault();
        destroy(
            route("sales.destroy", {
                id: Number(salesData.id),
            })
        );
    };

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={"Penjualan"}
            breadcumb3={appTitle}
            breadcumb2Href={route("sales.show")}
        >
            <Head title={"Create Sales Order"} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">{appTitle}</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="invoice">Invoice</Label>
                        <Input
                            type="text"
                            id="invoice"
                            placeholder="Nomor Invoice"
                            className="bg-gray-300 font-semibold" 
                            value={salesData.invoice}
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="customer_name">Nama Pembeli</Label>
                        <Input
                            type="text"
                            id="customer_name"
                            placeholder="Nama Pembeli"
                            className="bg-gray-300 font-semibold" 
                            value={salesData.customer_name}
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <Label htmlFor="tags">List Produk yang Dijual</Label>
                        <ul className="list-disc pl-5">
                            {salesDetailList.map((item: any, index: number) => (
                                <li key={index} className="text-sm">
                                    {item.sku} - {item.product_name} - Tags: {item.tags.map((tag: any) => tag.name).join(", ")} - Jumlah: {item.quantity} - Harga: {item.price.toLocaleString("id-ID")}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-4">
                        <div className="grid w-full items-center gap-2">
                            <Label>Subtotal</Label>
                            <Input 
                                type="text" 
                                className="bg-gray-300 font-semibold" 
                                value={`Rp ${salesData.sub_total?.toLocaleString("id-ID") || 0}`} 
                                disabled 
                            />
                        </div>

                        <div className="grid w-full items-center gap-2">
                            <Label htmlFor="tax">Pajak</Label>
                            <Input 
                                type="text" 
                                id="tax" 
                                placeholder="Rp 0" 
                                className="bg-gray-300 font-semibold" 
                                value={`Rp ${salesData.vat?.toLocaleString("id-ID") || 0}`} 
                                disabled
                            />
                        </div>

                        <div className="grid w-full items-center gap-2">
                            <Label htmlFor="discount">Diskon</Label>
                            <Input 
                                type="text" 
                                id="discount" 
                                placeholder="Rp 0" 
                                className="bg-gray-300 font-semibold" 
                                value={`Rp ${salesData.discount?.toLocaleString("id-ID") || 0}`} 
                                disabled
                            />
                        </div>

                        <div className="grid w-full items-center gap-2">
                            <Label>Grand Total</Label>
                            <Input 
                                type="text" 
                                className="bg-gray-300 font-semibold"
                                value={`Rp ${salesData.grand_total?.toLocaleString("id-ID") || 0}`} 
                                disabled 
                            />
                        </div>

                        <div className="grid w-full items-center gap-2">
                        <Label htmlFor="name">Status Pengiriman</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Pilih Status Pengiriman"
                            className="bg-gray-300 font-semibold"
                            value={salesData.delivery_status}
                            disabled
                        />
                        </div>
                    </div>

                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <div className="flex gap-2 items-center">
                            <Checkbox
                                id="aggree"
                                name="aggree"
                                className="cursor-pointer"
                                onCheckedChange={() =>
                                    setIsChecked((prev) => !prev)
                                }
                            />
                            <Label htmlFor="aggree" className="cursor-pointer">
                                Saya setuju untuk menghapus data ini.
                            </Label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing || !isChecked}
                        className={`inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-700 focus:bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-red-900 ${
                            processing && "opacity-25"
                        } `}
                    >
                        HAPUS
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}