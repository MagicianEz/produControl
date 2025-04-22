import { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Button } from "@/Components/ui/Button";
import InputError from "@/Components/InputError";
import { Checkbox } from "@/Components/ui/Checkbox";
import axios from "axios";

export default function AddProductDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    production,
    categoryProduction,
    categoryWithTags,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    production: any;
    categoryProduction: any;
    categoryWithTags: any;
}>) {
    const appTitleArray: string[] = appTitle.split(" ");
    const title: string | undefined = appTitleArray.shift();
    const subTitle: string = appTitleArray.join(" ");
    const titleRev: string = subTitle + " " + title;

    const [dataExist, setDataExist] = useState(false);
    const [productionExist, setProductionExist] = useState<any>(null);
    const [productionExistQuantity, setProductionExistQuantity] =
        useState<any>(0);

    const { data, setData, reset, errors, processing, patch } = useForm({
        sku: production.sku,
        product_name: production.name,
        quantity: production.quantity,
        category_id: categoryProduction.category_id,
        tags: categoryProduction.tags.map(
            (tag: { id: number; name: string }) => tag.id
        ),
    });

    useEffect(() => {
        console.log("Data: ", data);
        axios
            .get(route("api.production.check.product.exist"), {
                params: {
                    sku: data.sku,
                    category_id: data.category_id,
                    tags: data.tags,
                },
            })
            .then((response: any) => {
                setDataExist(response.status === 200);
                setProductionExist(
                    response.status === 200 && response.data.production.id
                );
                setProductionExistQuantity(
                    response.status === 200 && response.data.production.quantity
                );
            })
            .catch(() => {
                setDataExist(false);
                setProductionExist(null);
                setProductionExistQuantity(0);
            });
    }, [data.tags]);

    const submit = (e: any) => {
        e.preventDefault();
        patch(
            route("production.update", {
                id: Number(production.id),
            }),
            {
                onSuccess: () =>
                    reset("sku", "product_name", "quantity", "tags"),
            }
        );
    };

    const changeTagSelected = (checked: any, tagId: number) => {
        const updatedTags = checked
            ? [...data.tags, tagId]
            : data.tags.filter((tag: number) => tag !== tagId);
        setData("tags", updatedTags as any);
    };

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={"Produksi"}
            breadcumb3={"Ubah Detail Produk"}
            breadcumb2Href={route("production.show")}
        >
            <Head title={"Ubah Detail Produk - Produksi"} />
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
                            onChange={(e) => {
                                setData("product_name", e.target.value);
                            }}
                        />
                        <InputError
                            message={errors.product_name}
                            className="mt-2"
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
                            value={categoryProduction.category_name}
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

                    {dataExist &&
                        productionExist &&
                        production.id !== productionExist && (
                            <div className="grid w-full max-w-sm items-center gap-2">
                                <Label htmlFor="quantityTarget">
                                    Jumlah Produk Tujuan
                                </Label>
                                <Input
                                    type="text"
                                    id="quantityTarget"
                                    placeholder="Quantity Product Tujuan"
                                    className="bg-gray-300 font-semibold"
                                    value={productionExistQuantity}
                                    disabled
                                />
                            </div>
                        )}

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="quantity">Jumlah Produk</Label>
                        {dataExist &&
                        productionExist &&
                        production.id !== productionExist ? (
                            <Input
                                type="text"
                                id="quantity"
                                placeholder="contoh: 10"
                                value={data.quantity}
                                onChange={(e) => {
                                    const value = e.target.value.replace(
                                        /\D/g,
                                        ""
                                    );
                                    const quantityValue = parseInt(value) || 0;
                                    if (quantityValue <= production.quantity) {
                                        setData("quantity", quantityValue);
                                    } else {
                                        setData(
                                            "quantity",
                                            production.quantity
                                        );
                                    }
                                }}
                            />
                        ) : (
                            <Input
                                type="text"
                                id="quantity"
                                placeholder="contoh: 10"
                                value={data.quantity}
                                onChange={(e) => {
                                    const value = e.target.value.replace(
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

                    {dataExist &&
                        productionExist &&
                        production.id !== productionExist && (
                            <div className="grid w-full max-w-sm items-center gap-2">
                                <p className="text-xs mt-2 text-red-600">
                                    Data dengan SKU{" "}
                                    <span className="font-semibold">
                                        {data.sku}
                                    </span>{" "}
                                    dan tag yang dipilih ditemukan. Jika Anda
                                    melakukan pembaruan, data ini akan
                                    digabungkan dengan data lain yang memiliki
                                    tag yang sama!
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
                        UBAH
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}
