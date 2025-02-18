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
import { Pencil, Subtitles } from "lucide-react";

interface Tag {
    id: number;
    name: string;
}

interface Category {
    category_id: number;
    category_name: string;
    category_type: string;
    tags: Tag[];
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

    const [isTambah, setIsTambah] = useState<boolean>(false);
    const [listTag, setListTag] = useState<string[]>([]);
    const [categoryTags, setCategoryTags] = useState(category.tags);

    const { data, setData, reset, errors, processing, patch } = useForm<any>({
        category_id: category.category_id,
        category_name: category.category_name,
        tags_checked: category.tags.map((tag: Tag) => ({
            id: tag.id,
            name: tag.name,
        })),
        tags_delete: [],
        new_tags: [],
    });

    const submit = (e: any) => {
        e.preventDefault();
        patch(route("category.update"), {
            onSuccess: () =>
                reset(
                    "category_id",
                    "category_name",
                    "tags_checked",
                    "tags_delete",
                    "new_tags"
                ),
        });
    };

    useEffect(() => {
        const tagsDelete = categoryTags.filter(
            (item: Tag) =>
                !data.tags_checked.some(
                    (selectedItem: Tag) => selectedItem.id === item.id
                )
        );
        setData("tags_delete", tagsDelete);
    }, [data.tags_checked]);

    useEffect(() => {
        setData("new_tags", listTag);
    }, [listTag]);

    const changeTagSelected = (
        checked: boolean,
        tagId: number,
        tagName: string
    ) => {
        const tag = { id: tagId, name: tagName };
        const updatedTagsChecked = checked
            ? [...data.tags_checked, tag]
            : data.tags_checked.filter((t: Tag) => t.id !== tagId);
        setData("tags_checked", updatedTagsChecked);
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
                    </div>

                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <Label htmlFor="sku">Tipe Kategori</Label>
                        <Input
                            type="text"
                            id="sku"
                            placeholder="Nama Kategori"
                            value={category.category_type}
                            className="bg-gray-200 text-black font-semibold capitalize"
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <Label htmlFor="tags">List Tag Kategori Saat Ini</Label>
                        <p className="text-xs text-red-600">
                            * Hilangkan ceklis pada tag yang ingin dihapus.
                        </p>
                        {categoryTags.map((tag: Tag) => {
                            const isChecked = data.tags_checked.some(
                                (t: Tag) => t.id === tag.id
                            );
                            return (
                                <div
                                    key={tag.id}
                                    className="flex items-center gap-2"
                                >
                                    <div className="w-2/3 flex items-center gap-2">
                                        <Checkbox
                                            id={tag.name}
                                            name="tags"
                                            value={tag.name}
                                            className="cursor-pointer"
                                            checked={isChecked}
                                            onCheckedChange={(checked) =>
                                                changeTagSelected(
                                                    checked as boolean,
                                                    tag.id,
                                                    tag.name
                                                )
                                            }
                                        />
                                        <Input
                                            type="text"
                                            className={`h-8 p-2 w-full ${
                                                !isChecked
                                                    ? "bg-red-300 text-red-800 font-semibold"
                                                    : ""
                                            }`}
                                            placeholder="Nama Kategori"
                                            disabled={!isChecked}
                                            value={
                                                data.tags_checked.find(
                                                    (t: Tag) => t.id === tag.id
                                                )?.name || ""
                                            }
                                            onChange={(e) => {
                                                const updatedName =
                                                    e.target.value;
                                                const updatedTags =
                                                    data.tags_checked.map(
                                                        (t: Tag) =>
                                                            t.id === tag.id
                                                                ? {
                                                                      ...t,
                                                                      name: updatedName,
                                                                  }
                                                                : t
                                                    );
                                                setData(
                                                    "tags_checked",
                                                    updatedTags
                                                );
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <p className="text-xs mt-2 text-red-600">
                            <span className="font-semibold">Catatan:</span>{" "}
                            Hati-hati saat mengubah nama kategori dan juga tag
                            kategori, karena semua product yang memiliki
                            kategori tersebut akan berubah. Harap diperhatikan
                            kembali dan teliti.
                        </p>
                    </div>

                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                isTambah && setData("new_tags", []);
                                setIsTambah((prev) => !prev);
                            }}
                            className="text-xs mt-2 h-auto max-w-max"
                        >
                            {isTambah ? "Hapus Tag Baru" : "Tambah Tag"}
                        </Button>
                    </div>

                    {isTambah && (
                        <>
                            <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                                <Label htmlFor="tags">Tags</Label>
                                <Input
                                    type="text"
                                    id="tags"
                                    placeholder="Masukkan beberapa tag dan pisahkan dengan koma (,)"
                                    onChange={(e) => {
                                        const tags = e.target.value
                                            .split(",")
                                            .map((tag) => tag.trim())
                                            .filter((tag) => tag !== "");
                                        setListTag(tags);
                                        setData("new_tags", tags.join(", "));
                                    }}
                                />
                                <InputError
                                    message={errors.new_tags}
                                    className="mt-2"
                                />
                            </div>

                            {listTag?.length > 0 && (
                                <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                                    <Label htmlFor="tags">List tag</Label>
                                    <ul className="list-disc pl-5">
                                        {listTag.map(
                                            (tag: string, index: number) => (
                                                <li
                                                    key={index}
                                                    className="text-sm"
                                                >
                                                    {tag}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}

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
