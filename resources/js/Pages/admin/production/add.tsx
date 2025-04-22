import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Button } from "@/Components/ui/Button";
import InputError from "@/Components/InputError";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/Select";
import { Checkbox } from "@/Components/ui/Checkbox";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function AddProductDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    categoriesWithTags,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    categoriesWithTags: any;
}>) {
    const [tags, setTags] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [dataExist, setDataExist] = useState(false);
    const [skuExist, setSkuExist] = useState(false);

    const { data, setData, reset, errors, processing, post } = useForm<{
        sku: string;
        name: string;
        category_id: number | null;
        quantity: number;
        tags: any[];
    }>({
        sku: "",
        name: "",
        category_id: null,
        quantity: 0,
        tags: [],
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(route("production.add.store"), {
            onSuccess: () => reset(),
        });
    };

    useEffect(() => {
        if(!data.sku){
            if(skuExist){
                setData((prev) => ({
                    ...prev,
                    name: "",
                    category_id: null,
                    tags: [],
                }));
                setTags([]);
                setSkuExist(false);
                setDataExist(false);
            }
            return;
        }

        const timeoutId = setTimeout(() => {
            setIsFetching(true);

            axios
                .get(route("api.product.name"), { params: { sku: data.sku } })
                .then((productRes) => {
                    const productName = productRes.data.data?.name || "";
                    const categoryData = productRes.data.data?.category || null;

                    setData((prev) => ({
                        ...prev,
                        name: productName || "",
                        category_id: categoryData?.id || null,
                        tags: [],
                    }));

                    setSkuExist(true);
                })
                .catch(() => {
                    if(skuExist){
                        setData((prev) => ({
                            ...prev,
                            name: "",
                            category_id: null,
                            tags: [],
                        }));
                        setTags([]);
                        setSkuExist(false);
                        setDataExist(false);
                    }
                })
                .finally(() => {
                    setIsFetching(false);
                });
        }, 500);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [data.sku]);

    useEffect(() => {
        if (data.category_id) {
            const selectedCategory = categoriesWithTags.find(
                (category: any) => category.id === data.category_id
            );

            if (selectedCategory) {
                const filteredTags = selectedCategory.tags.map((tag: any) => ({
                    id: tag.id,
                    name: tag.name,
                }));

                setTags(filteredTags);
            }
        }
    }, [data.category_id]);

    useEffect(() => {
        if (data.tags.length === 0) {
            return;
        }
    
        setIsFetching(true);
    
        axios
            .get(route("api.production.check.product.exist"), {
                params: {
                    sku: data.sku,
                    category_id: data.category_id,
                    tags: data.tags,
                },
            })
            .then((response: any) => {
                if (response.status === 200) {
                    setDataExist(true);
                } else {
                    setDataExist(false);
                }
            })
            .catch(() => {
                setDataExist(false);
            })
            .finally(() => {
                setIsFetching(false);
            });
    }, [JSON.stringify(data.tags)]);
    

    const changeCategoryId = (value: string | undefined) => {
        if (!value) {
            setTags([]);
            setData((prev) => ({
                ...prev,
                category_id: null,
                tags: [],
            }));
            return;
        }
    
        const categoryId = Number(value);

        setData((prev) => ({
            ...prev,
            category_id: categoryId,
            tags: [],
        }));
    };

    const changeTagSelected = (checked: any, tagId: number) => {
        const updatedTags = checked
            ? [...data.tags, tagId]
            : data.tags.filter((tag) => tag !== tagId);
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
            breadcumb2Href={route("production.show")}
            breadcumb3={"Tambah Produk"}
        >
            <Head title={"Tambah Produk"} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">{"Tambah Produk"}</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            type="text"
                            id="sku"
                            placeholder="SKU Product"
                            value={data.sku}
                            onChange={(e) => setData("sku", e.target.value)}
                        />
                        <InputError message={errors.sku} className="mt-2" />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="name">Nama Produk</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Product Name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            disabled={skuExist || isFetching}
                            className={`${
                                skuExist && "font-semibold bg-gray-300"
                            }`}
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="category">Kategori</Label>

                        {skuExist || isFetching ? (
                            <Input
                                type="text"
                                id="name"
                                placeholder="Pilih kategori produksi"
                                className="bg-gray-300 font-semibold"
                                value={
                                    categoriesWithTags.find((cat: any) => cat.id === data.category_id)?.name || ""
                                }
                                disabled
                            />
                        ) : (
                            <Select
                                onValueChange={changeCategoryId}
                                name="category"
                                value={data.category_id ? data.category_id.toString() : undefined}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori produksi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {categoriesWithTags.map((category: any) => (
                                            <SelectItem
                                                key={category.id}
                                                value={category.id.toString()}
                                                className="capitalize cursor-pointer"
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}

                        <InputError message={errors.category_id} className="mt-2" />
                    </div>

                    {tags.length > 0 && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label htmlFor="tag" className="mb-1">
                                Tags
                            </Label>
                            <div className="text-sm font-medium flex flex-col gap-2">
                                {tags.map((tag: { id: number; name: string }) => (
                                    <div key={tag.id} className="flex items-center gap-2">
                                        <Checkbox
                                            id={tag.name}
                                            name="tags"
                                            value={tag.name}
                                            className="cursor-pointer"
                                            checked={data.tags.includes(tag.id)}
                                            onCheckedChange={(checked) =>
                                                changeTagSelected(checked, tag.id)
                                            }
                                        />
                                        <Label
                                            htmlFor={tag.name}
                                            className="cursor-pointer"
                                        >
                                            {tag.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <InputError
                                message={errors.tags}
                                className="mt-2"
                            />
                        </div>
                    )}

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="quantity">Jumlah Produk</Label>
                        <Input
                            type="text"
                            id="quantity"
                            placeholder="contoh: 10"
                            value={data.quantity}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setData("quantity", parseInt(value) || 0);
                            }}
                            disabled={isFetching}
                        />
                        <InputError
                            message={errors.quantity}
                            className="mt-2"
                        />
                    </div>

                    {dataExist && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <p className="text-xs mt-2 text-red-600">
                                Data dengan SKU{" "}
                                <span className="font-semibold">
                                    {data.sku}
                                </span>{" "}
                                dan Tags yang dipilih ditemukan pada Produksi. Jika Anda
                                melakukan aksi tambah, data ini akan dimasukkan ke
                                data tujuan yang memiliki SKU dan Tags yang sama!
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={processing || isFetching}
                        className={`inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900`}
                    >
                        TAMBAH
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}
