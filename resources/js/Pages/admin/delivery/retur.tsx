import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import InputError from "@/Components/InputError";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Button } from "@/Components/ui/Button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/Select";
import axios from "axios";

interface Delivery {
    id: number;
    delivery_id: number;
    master_id: number;
    invoice: string;
    product_name: string;
    product_price: number;
    product_quantity: number;
    sku: string;
    status_pengiriman: string;
    total_price: number;
    created_at: string;
    updated_at: string;
}

interface Tag {
    id: number;
    name: string;
}

interface ProductTujuanItem {
    tujuan_id: number;
    master_id: number;
    product_name: string;
    sku: string;
    stock_quantity: number;
    category_id: number;
    category_name: string;
    tags: Tag[];
    created_at: string;
    updated_at: string;
}

export default function DeliveryReturDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    delivery,
    stock,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    delivery: Delivery;
    stock: ProductTujuanItem[];
}>) {
    const appTitleArray: string[] = appTitle.split(" ");
    const title: string | undefined = appTitleArray.shift();
    const subTitle: string = appTitleArray.join(" ");
    const titleRev: string = subTitle + " " + title;

    const [categoryName, setCategoryName] = useState<string>("");
    const [listTag, setListTag] = useState<string[]>([]);
    const [productTujuan, setProductTujuan] = useState<ProductTujuanItem[]>([]);

    const { data, setData, reset, errors, processing, patch } = useForm<{
        delivery_id: number;
        tujuan_id: number | null;
        category_id: number | null;
        tujuan: "production" | "stock" | "";
        tags: number[];
        quantity: number;
    }>({
        delivery_id: delivery.delivery_id,
        tujuan_id: null,
        category_id: null,
        tujuan: "",
        tags: [],
        quantity: 0,
    });

    const changeStockId = (value: string) => {
        const [tujuan_id, category_id, itemTags, listTagName, category_name] =
            value.split("-");
        const listTag = itemTags
            .split(", ")
            .map((tag: string) => parseInt(tag, 10))
            .filter((tag: number) => !isNaN(tag));
        const tujuanIdNumber = parseInt(tujuan_id, 10) || null;
        const categoryIdNumber = parseInt(category_id, 10) || null;
        setCategoryName(category_name);
        setListTag(listTagName.split(", "));
        setData((prev) => ({
            ...prev,
            tujuan_id: tujuanIdNumber,
            category_id: categoryIdNumber,
            tags: listTag,
        }));
    };

    useEffect(() => {
        setProductTujuan([]);
        axios
            .get(route("api.delivery.retur.tujuan"), {
                params: {
                    sku: delivery.sku,
                    tujuan: data.tujuan,
                },
            })
            .then((response: any) => {
                setProductTujuan(response.data.data);
            })
            .catch(() => {
                setProductTujuan([]);
            });
    }, [data.tujuan]);

    const submit = (e: any) => {
        e.preventDefault();
        patch(route("delivery.retur.update"), {
            onSuccess: () =>
                reset("category_id", "tujuan_id", "tujuan", "tags", "quantity"),
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
            breadcumb2={"Pengiriman"}
            breadcumb3={"Retur Pengiriman"}
            breadcumb2Href={route("delivery.show")}
        >
            <Head title={"Retur Pengiriman"} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">{"Retur Pengiriman"}</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="invoice">Nomor Invoice</Label>
                        <Input
                            type="text"
                            id="invoice"
                            placeholder="Masukkan nomor resi pengiriman"
                            value={delivery.invoice}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            type="text"
                            id="sku"
                            placeholder="SKU Product"
                            value={delivery.sku}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="name">Nama Produk</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Product Name"
                            value={delivery.product_name}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="tujuan">Pilih Tujuan Retur</Label>
                        <Select
                            onValueChange={(value: "production" | "stock") =>
                                setData("tujuan", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih tujuan retur..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem
                                        value="production"
                                        className="capitalize cursor-pointer"
                                    >
                                        Produksi
                                    </SelectItem>
                                    <SelectItem
                                        value="stock"
                                        className="capitalize cursor-pointer"
                                    >
                                        Stok
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="category">Pilih Produk Tujuan</Label>
                        <Select
                            onValueChange={changeStockId}
                            disabled={
                                !data.tujuan || productTujuan.length === 0
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih produk tujuan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {productTujuan.map(
                                        (
                                            item: ProductTujuanItem,
                                            index: number
                                        ) => {
                                            const listTag = item.tags
                                                .map((item: Tag) => item.name)
                                                .join(", ");
                                            const listIdTag = item.tags
                                                .map((item: Tag) => item.id)
                                                .join(", ");
                                            return (
                                                <SelectItem
                                                    key={index}
                                                    value={`${item.tujuan_id}-${item.category_id}-${listIdTag}-${listTag}-${item.category_name}`}
                                                    className="capitalize cursor-pointer"
                                                >
                                                    {`${item.sku} - ${item.product_name} - Kategori: ${item.category_name} - Tags: ${listTag}`}
                                                </SelectItem>
                                            );
                                        }
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <InputError
                            message={errors.category_id}
                            className="mt-2"
                        />
                    </div>

                    {categoryName && (
                        <div className="grid w-full lg:max-w-lg items-center gap-2">
                            <Label htmlFor="categoryTujuan">
                                Kategori Tujuan
                            </Label>
                            <Input
                                type="text"
                                id="categoryTujuan"
                                placeholder="Kategory Tujuan"
                                value={categoryName}
                                className="bg-gray-300 font-semibold"
                                disabled
                            />
                        </div>
                    )}

                    {listTag?.length > 0 && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label htmlFor="tags">Tag Tujuan</Label>
                            <ul className="list-disc pl-5">
                                {listTag.map((tag: string, index: number) => (
                                    <li key={index}>{tag}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="total_harga">Total Harga Produk</Label>
                        <Input
                            type="text"
                            id="total_harga"
                            placeholder="Total Harga"
                            value={formatCurrency(delivery.product_price)}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="harga_satuan">Harga Satuan Produk</Label>
                        <Input
                            type="text"
                            id="harga_satuan"
                            placeholder="Total Harga"
                            value={formatCurrency(
                                delivery.product_price /
                                    delivery.product_quantity
                            )}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="jumlah_delivery">Jumlah Produk Pada Pengiriman Ini</Label>
                        <Input
                            type="text"
                            id="jumlah_delivery"
                            placeholder="Jumlah Produk"
                            value={delivery.product_quantity}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-lg items-center gap-2">
                        <Label htmlFor="quantity">
                            Jumlah Produk yang Diretur
                        </Label>
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
                                if (
                                    quantityValue <= delivery.product_quantity
                                ) {
                                    setData("quantity", quantityValue);
                                } else {
                                    setData(
                                        "quantity",
                                        delivery.product_quantity
                                    );
                                }
                            }}
                        />
                        <InputError
                            message={errors.quantity}
                            className="mt-2"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={
                            processing ||
                            !data.category_id ||
                            !data.tujuan_id
                        }
                        className={`inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 ${
                            processing && "opacity-25"
                        } `}
                    >
                        RETUR
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}