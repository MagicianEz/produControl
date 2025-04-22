import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Button } from "@/Components/ui/Button";
import { useEffect, useState } from "react";
import InputError from "@/Components/InputError";
import { Checkbox } from "@/Components/ui/Checkbox";

interface Tag {
    id: number;
    name: string;
}

interface Category {
    category_id: number;
    category_name: string;
    production_tags: Tag[];
    stock_tags: Tag[];
}

export default function CategoryDetailDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    category,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    category: Category;
}>) {
    const appTitleArray: string[] = appTitle.split(" ");
    const title: string | undefined = appTitleArray.shift();
    const subTitle: string = appTitleArray.join(" ");
    const titleRev: string = subTitle + " " + title;

    const [isTambahProduksi, setIsTambahProduksi] = useState<boolean>(false);
    const [isTambahStok, setIsTambahStok] = useState<boolean>(false);
    const [listTagProduksi, setListTagProduksi] = useState<string[]>([]);
    const [listTagStok, setListTagStok] = useState<string[]>([]);
    const [categoryProductionTags, setCategoryProductionTags] = useState(category.production_tags);
    const [categoryStockTags, setCategoryStockTags] = useState(category.stock_tags);


    const { data, setData, reset, errors, processing, patch } = useForm<any>({
        category_id: category.category_id,
        category_name: category.category_name,
        production_tags_checked: category.production_tags.map((tag: Tag) => ({
            id: tag.id,
            name: tag.name,
        })),
        stock_tags_checked: category.stock_tags.map((tag: Tag) => ({
            id: tag.id,
            name: tag.name,
        })),
        new_production_tags: [],
        new_stock_tags: [],
        tags_delete: [],
    });

    const submit = (e: any) => {
        e.preventDefault();
        patch(route("category.update"), {
            onSuccess: () => reset(),
        });
    };

    useEffect(() => {
        const productionTagsDelete = categoryProductionTags.filter(
            (item: Tag) => !data.production_tags_checked.some((selectedItem: Tag) => selectedItem.id === item.id)
        );
    
        const stockTagsDelete = categoryStockTags.filter(
            (item: Tag) => !data.stock_tags_checked.some((selectedItem: Tag) => selectedItem.id === item.id)
        );
    
        setData("tags_delete", [...productionTagsDelete, ...stockTagsDelete]);
    }, [data.production_tags_checked, data.stock_tags_checked]);    

    useEffect(() => {
        setData("new_production_tags", listTagProduksi);
    }, [listTagProduksi]);

    useEffect(() => {
        setData("new_stock_tags", listTagStok);
    }, [listTagStok]);

    useEffect(() => {
        if (!isTambahProduksi) {
            setData("new_production_tags", []);
            setListTagProduksi([]);
        }
    }, [isTambahProduksi]);
    
    useEffect(() => {
        if (!isTambahStok) {
            setData("new_stock_tags", []);
            setListTagStok([]);
        }
    }, [isTambahStok]);

    const changeTagSelected = (
        checked: boolean,
        tagId: number,
        tagName: string,
        type: "production_tags_checked" | "stock_tags_checked"
    ) => {
        const tag = { id: tagId, name: tagName };
        const updatedTagsChecked = checked
            ? [...data[type], tag]
            : data[type].filter((t: Tag) => t.id !== tagId);
        setData(type, updatedTagsChecked);
    };
    

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={title!}
            breadcumb3={subTitle}
            breadcumb2Href={route("category.show")}
        >
            <Head title={subTitle} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">
                    {subTitle}
                </h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <Label htmlFor="sku">Nama Kategori</Label>
                        <Input
                            type="text"
                            id="sku"
                            placeholder="Nama Kategori"
                            value={data.category_name}
                            onChange={(e) =>
                                setData("category_name", e.target.value)
                            }
                        />
                        <InputError
                            message={errors.category_name}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <Label htmlFor="tags">Tags Produksi</Label>
                        {categoryProductionTags.map((tag: Tag) => {
                            const isChecked = data.production_tags_checked.some((t: Tag) => t.id === tag.id);
                            return (
                                <div key={`production-${tag.id}`} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`production-${tag.name}`}
                                        name="production_tags"
                                        value={tag.name}
                                        className="cursor-pointer"
                                        checked={isChecked}
                                        onCheckedChange={(checked) =>
                                            changeTagSelected(
                                                checked as boolean,
                                                tag.id,
                                                tag.name,
                                                "production_tags_checked"
                                            )
                                        }
                                    />
                                    <Label htmlFor={`production-${tag.name}`} className="cursor-pointer">
                                        {tag.name}
                                    </Label>
                                </div>
                            );
                        })}
                        <InputError message={errors.production_tags_checked} className="mt-2" />
                    </div>

                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                setIsTambahProduksi((prev) => !prev);
                            }}
                            className="text-xs mt-2 h-auto max-w-max"
                        >
                            {isTambahProduksi ? "Batalkan Tambah Tag Produksi" : "Tambah Tag Produksi"}
                        </Button>
                    </div>

                    {isTambahProduksi && (
                        <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                            <Label htmlFor="tags_produksi">Tags Produksi</Label>
                            <Input
                                type="text"
                                id="tags_produksi"
                                placeholder="Masukkan tag produksi, pisahkan dengan koma"
                                onChange={(e) => {
                                    const tags = e.target.value
                                        .split(",")
                                        .map((tag) => tag.trim())
                                        .filter((tag) => tag !== "");
                                    setListTagProduksi(tags);
                                    setData("new_production_tags", tags);
                                }}
                            />
                            <InputError message={errors.new_production_tags} className="mt-2" />
                        </div>
                    )}

                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <Label htmlFor="tags">Tags Stok</Label>
                        {categoryStockTags.map((tag: Tag) => {
                            const isChecked = data.stock_tags_checked.some((t: Tag) => t.id === tag.id);
                            return (
                                <div key={`stock-${tag.id}`} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`stock-${tag.name}`}
                                        name="stock_tags"
                                        value={tag.name}
                                        className="cursor-pointer"
                                        checked={isChecked}
                                        onCheckedChange={(checked) =>
                                            changeTagSelected(
                                                checked as boolean,
                                                tag.id,
                                                tag.name,
                                                "stock_tags_checked"
                                            )
                                        }
                                    />
                                    <Label htmlFor={`stock-${tag.name}`} className="cursor-pointer">
                                        {tag.name}
                                    </Label>
                                </div>
                            );
                        })}
                        <InputError message={errors.stock_tags_checked} className="mt-2" />
                    </div>

                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                setIsTambahStok((prev) => !prev);
                            }}
                            className="text-xs mt-2 h-auto max-w-max"
                        >
                            {isTambahStok ? "Batalkan Tambah Tag Stok" : "Tambah Tag Stok"}
                        </Button>
                    </div>

                    {isTambahStok && (
                        <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                            <Label htmlFor="tags_stok">Tags Stok</Label>
                            <Input
                                type="text"
                                id="tags_stok"
                                placeholder="Masukkan tag stok, pisahkan dengan koma"
                                onChange={(e) => {
                                    const tags = e.target.value
                                        .split(",")
                                        .map((tag) => tag.trim())
                                        .filter((tag) => tag !== "");
                                    setListTagStok(tags);
                                    setData("new_stock_tags", tags);
                                }}
                            />
                            <InputError message={errors.new_stock_tags} className="mt-2" />
                        </div>
                    )}

                    {listTagProduksi?.length > 0 && (
                        <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                            <Label htmlFor="tags">List Tag Produksi</Label>
                            <ul className="list-disc pl-5">
                                {listTagProduksi.map((tag: string, index: number) => (
                                    <li key={`production-${index}`} className="text-sm">
                                        {tag}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {listTagStok?.length > 0 && (
                        <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                            <Label htmlFor="tags">List Tag Stok</Label>
                            <ul className="list-disc pl-5">
                                {listTagStok.map((tag: string, index: number) => (
                                    <li key={`stock-${index}`} className="text-sm">
                                        {tag}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <p className="text-xs mt-2 text-red-600">
                            <span className="font-semibold">Catatan:</span>{" "}
                            Hati-hati saat mengubah nama kategori dan tags
                            kategori, karena semua produk yang memiliki
                            kategori tersebut akan berubah. Harap diperhatikan
                            kembali dengan teliti.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className={`inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 ${
                            processing && "opacity-25"
                        }`}
                    >
                        PERBARUI
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}
