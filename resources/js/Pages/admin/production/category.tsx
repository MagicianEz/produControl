import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Button } from "@/Components/ui/Button";
import InputError from "@/Components/InputError";
import { useState } from "react";

export default function AddProductCategoryDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
}>) {
    const appTitleArray: string[] = appTitle.split(" ");
    const title: string | undefined = appTitleArray.shift();
    const subTitle: string = appTitleArray.join(" ");
    const titleRev: string = subTitle + " " + title;

    const [listTag, setListTag] = useState<string[]>([]);
    const { data, setData, reset, errors, processing, post } = useForm({
        name: "",
        tags: "",
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(route("production.add.category.store"), {
            onSuccess: () => reset("name", "tags"),
        });
    };

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={"Produksi"}
            breadcumb3={subTitle}
            breadcumb2Href={route("production.show")}
        >
            <Head title={"Tambah Kategori - Produksi"} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">Tambah Kategori</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="name">Nama Kategori</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Category Name"
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="name">Tipe Kategori</Label>
                        <Input
                            type="text"
                            id="name"
                            value="Production"
                            className="bg-gray-200 text-black font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
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
                                setData("tags", tags.join(", "));
                            }}
                        />

                        <InputError message={errors.tags} className="mt-2" />
                    </div>

                    {listTag?.length > 0 && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label htmlFor="tags">List tag</Label>
                            <ul className="list-disc pl-5">
                                {listTag.map((tag: string, index: number) => (
                                    <li key={index}>{tag}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={processing}
                        className={`inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 ${
                            processing && "opacity-25"
                        } `}
                    >
                        TAMBAH
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}
