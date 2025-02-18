import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Button } from "@/Components/ui/Button";
import React, { useState, useEffect } from "react";

interface Product {
    category_name: string;
    price: number;
    product_name: string;
    quantity: number;
    sku: string;
    stock_id: number;
    tags: number[];
}

export default function StockMoveDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    product,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    product: Product;
}>) {
    const appTitleArray: string[] = appTitle.split(" ");
    const title: string | undefined = appTitleArray.shift();
    const subTitle: string = appTitleArray.join(" ");
    const titleRev: string = subTitle + " " + title;

    const [jumlahError, setJumlahError] = useState<boolean>(false);
    const { data, setData, reset, errors, processing, post, patch } = useForm<{
        invoice: string;
        stock_id: number;
        quantity: number;
    }>({
        invoice: "",
        stock_id: Number(product.stock_id),
        quantity: 0,
    });

    useEffect(() => {
        setJumlahError(data.quantity > product.quantity);
    }, [data.quantity]);

    const submit = (e: any) => {
        e.preventDefault();
        post(route("stock.move.store", { id: Number(product.stock_id) }), {
            onSuccess: () => reset("quantity"),
        });
    };

    const formatCurrency = (value: any) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={"Stok"}
            breadcumb3={subTitle}
            breadcumb2Href={route("stock.show")}
        >
            <Head title={subTitle} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">{subTitle}</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="invoice">Nomor Invoice</Label>
                        <Input
                            type="text"
                            id="invoice"
                            placeholder="Masukkan nomor resi pengiriman"
                            value={data.invoice}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => setData("invoice", event.target.value)}
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            type="text"
                            id="sku"
                            className="bg-gray-300 font-semibold"
                            value={product.sku}
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="product_name">Nama Produk</Label>
                        <Input
                            type="text"
                            id="product_name"
                            className="bg-gray-300 font-semibold"
                            value={product.product_name}
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="category">Kategori</Label>
                        <Input
                            type="text"
                            id="category"
                            className="bg-gray-300 font-semibold"
                            value={product.category_name}
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="price">Harga Satuan</Label>
                        <Input
                            type="text"
                            id="price"
                            className="bg-gray-300 font-semibold"
                            value={formatCurrency(product.price)}
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="stock_quantity">Jumlah Stok Saat Ini</Label>
                        <Input
                            type="number"
                            id="stock_quantity"
                            className="bg-gray-300 font-semibold"
                            value={product.quantity}
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="quantity">Jumlah</Label>
                        <Input
                            type="text"
                            id="quantity"
                            placeholder="contoh: 10"
                            value={data.quantity}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                const value = event.target.value.replace(
                                    /\D/g,
                                    ""
                                );
                                const quantityValue = parseInt(value) || 0;
                                if (quantityValue <= product.quantity) {
                                    setData("quantity", quantityValue);
                                } else {
                                    setData("quantity", product.quantity);
                                }
                            }}
                        />
                        <InputError
                            message={errors.quantity}
                            className="mt-2"
                        />

                        {jumlahError && (
                            <InputError
                                message="Jumlah barang yang dikirimkan tidak boleh melebihi dari jumlah stock"
                                className="mt-2"
                            />
                        )}
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="total_price">Total Harga</Label>
                        <Input
                            type="text"
                            id="total_price"
                            className="bg-gray-300 font-semibold"
                            value={formatCurrency(
                                product.price * data.quantity
                            )}
                            disabled
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={
                            processing ||
                            jumlahError ||
                            !data.invoice ||
                            !data.stock_id ||
                            !data.quantity
                        }
                        className={`inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 ${
                            processing && "opacity-25"
                        } `}
                    >
                        SIMPAN
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}
