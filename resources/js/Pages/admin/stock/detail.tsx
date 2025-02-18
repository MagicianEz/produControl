import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Button } from "@/Components/ui/Button";
import InputError from "@/Components/InputError";
import { Checkbox } from "@/Components/ui/Checkbox";
import { useState, useEffect } from "react";
import axios from "axios";

export default function DetailStockDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    stock,
    categoryStock,
    categoryWithTags,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    stock: any;
    categoryStock: any;
    categoryWithTags: any;
}>) {
    const appTitleArray: string[] = appTitle.split(" ");
    const title: string | undefined = appTitleArray.shift();
    const subTitle: string = appTitleArray.join(" ");
    const titleRev: string = subTitle + " " + title;

    const [dataExist, setDataExist] = useState(false);
    const [stockExist, setStockExist] = useState<any>(null);
    const [stockExistQuantity, setStockExistQuantity] = useState<any>(0);
    const [stockExistPrice, setStockExistPrice] = useState<any>(0);

    const { data, setData, reset, errors, processing, patch } = useForm({
        sku: stock.sku,
        product_name: stock.name,
        quantity: stock.quantity,
        price: stock.price,
        category_id: categoryStock.category_id,
        tags: categoryStock.tags.map(
            (tag: { id: number; name: string }) => tag.id
        ),
    });

    const submit = (e: any) => {
        e.preventDefault();
        patch(
            route("stock.update", {
                id: Number(stock.id),
            }),
            {
                onSuccess: () =>
                    reset("sku", "product_name", "quantity", "price", "tags"),
            }
        );
    };

    useEffect(() => {
        axios
            .get(route("api.stock.check.product.exist"), {
                params: {
                    sku: data.sku,
                    category_id: data.category_id,
                    tags: data.tags,
                },
            })
            .then((response: any) => {
                setDataExist(response.status === 200);
                setStockExist(
                    response.status === 200 && response.data.stock.id
                );
                setStockExistQuantity(
                    response.status === 200 && response.data.stock.quantity
                );
                setStockExistPrice(
                    response.status === 200 && response.data.stock.price
                );
            })
            .catch(() => {
                setDataExist(false);
                setStockExist(null);
                setStockExistQuantity(0);
                setStockExistPrice(0);
            });
    }, [data.tags]);

    useEffect(() => {
        setData("price", stockExistPrice);
    }, [stockExistPrice]);

    const changeTagSelected = (checked: any, tagId: number) => {
        const updatedTags = checked
            ? [...data.tags, tagId]
            : data.tags.filter((tag: number) => tag !== tagId);
        setData("tags", updatedTags as any);
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
            breadcumb3={"Ubah Detail Produk"}
            breadcumb2Href={route("stock.show")}
        >
            <Head title={"Ubah Detail Produk - Stok"} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">UBAH DETAIL PRODUK</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            type="text"
                            id="sku"
                            placeholder="SKU Product"
                            className="bg-gray-300 font-semibold"
                            value={data.sku}
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="name">Nama Produk</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Product Name"
                            value={data.product_name}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setData("product_name", event.target.value);
                            }}
                        />
                        <p className="text-xs mt-2 text-red-600">
                            <span className="font-semibold">Catatan:</span>{" "}
                            Hati-hati saat mengubah nama product, karena semua
                            nama product dengan SKU yang sama akan juga berubah.
                            Harap diperhatikan kembali dan teliti.
                        </p>
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="name">Kategori</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Kategori"
                            className="bg-gray-300 font-semibold"
                            value={categoryStock.category_name}
                            disabled
                        />
                    </div>

                    {categoryWithTags.tags.length > 0 && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label htmlFor="tag" className="mb-1">
                                Tags
                            </Label>
                            <div className="text-sm font-medium flex flex-col gap-2">
                                {categoryWithTags.tags.map(
                                    (tag: { id: number; name: string }) => (
                                        <div
                                            key={tag.id}
                                            className="flex items-center gap-2"
                                        >
                                            <Checkbox
                                                id={tag.name}
                                                name="tags"
                                                value={tag.name}
                                                checked={data.tags.includes(
                                                    tag.id
                                                )}
                                                className="cursor-pointer"
                                                onCheckedChange={(checked) =>
                                                    changeTagSelected(
                                                        checked,
                                                        tag.id
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={tag.name}
                                                className="cursor-pointer"
                                            >
                                                {tag.name}
                                            </Label>
                                        </div>
                                    )
                                )}
                            </div>
                            <InputError
                                message={errors.tags}
                                className="mt-2"
                            />
                        </div>
                    )}

                    {dataExist && stockExist && stock.id !== stockExist && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label htmlFor="quantityTarget">
                                Jumlah Product Tujuan
                            </Label>
                            <Input
                                type="text"
                                id="quantityTarget"
                                placeholder="Quantity Product Tujuan"
                                className="bg-gray-300 font-semibold"
                                value={stockExistQuantity}
                                disabled
                            />
                        </div>
                    )}

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="quantity">Jumlah</Label>
                        {dataExist && stockExist && stock.id !== stockExist ? (
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
                                    if (quantityValue <= stock.quantity) {
                                        setData("quantity", quantityValue);
                                    } else {
                                        setData("quantity", stock.quantity);
                                    }
                                }}
                            />
                        ) : (
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
                                    setData("quantity", parseInt(value) || 0);
                                }}
                            />
                        )}
                        <InputError
                            message={errors.quantity}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="price">Harga Satuan</Label>
                        <Input
                            type="text"
                            id="price"
                            placeholder="contoh: 1000000"
                            className={`${
                                dataExist &&
                                stockExist &&
                                stock.id !== stockExist
                                    ? "bg-gray-300 font-semibold"
                                    : ""
                            }`}
                            value={formatCurrency(data.price)}
                            disabled={
                                dataExist &&
                                stockExist &&
                                stock.id !== stockExist
                            }
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                const value = event.target.value.replace(
                                    /\D/g,
                                    ""
                                );
                                setData("price", parseInt(value) || 0);
                            }}
                        />
                        <InputError message={errors.price} className="mt-2" />
                    </div>

                    {dataExist && stockExist && stock.id !== stockExist && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <p className="text-xs mt-2 text-red-600">
                                Data dengan SKU{" "}
                                <span className="font-semibold">
                                    {data.sku}
                                </span>{" "}
                                dan tag yang dipilih ditemukan. Jika Anda
                                melakukan pembaruan, data ini akan digabungkan
                                dengan data lain yang memiliki tag yang sama!
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={processing}
                        className={`inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 ${
                            processing && "opacity-25"
                        } `}
                    >
                        PERBARUI
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}
