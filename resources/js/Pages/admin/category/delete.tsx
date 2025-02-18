import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Button } from "@/Components/ui/Button";
import { Checkbox } from "@/Components/ui/Checkbox";
import { useState } from "react";

export default function CategoryDeleteDashboard({
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
    category: any;
}>) {
    const appTitleArray: string[] = appTitle.split(" ");
    const title: string | undefined = appTitleArray.shift();
    const subTitle: string = appTitleArray.join(" ");
    const titleRev: string = subTitle + " " + title;

    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [isChecked2, setIsChecked2] = useState<boolean>(false);
    const [checkedError, setCheckedError] = useState<string>("");
    const [checkedError2, setCheckedError2] = useState<string>("");
    const {
        reset,
        processing,
        delete: destroy,
    } = useForm({
        id: category.category_id,
    });

    const submit = (e: any) => {
        e.preventDefault();
        if (!isChecked) {
            return setCheckedError("Anda harus menyetujui terlebih dahulu");
        } else {
            setCheckedError("");
        }
        if (!isChecked2) {
            return setCheckedError(
                "Anda harus menyetujui bahwa anda benar-benar dalam keadaan sadar sepenuhnya menghapus kategori tersebut!"
            );
        } else {
            setCheckedError("");
        }
        destroy(route("category.destroy"), {
            onSuccess: () => reset("id"),
        });
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
            <Head title={titleRev} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">{titleRev}</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <Label htmlFor="category">Kategori</Label>
                        <Input
                            type="text"
                            id="category"
                            placeholder="Kategori"
                            className="bg-gray-300 font-semibold"
                            value={category.category_name}
                            disabled
                        />
                    </div>

                    {category.tags.length > 0 && (
                        <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                            <Label htmlFor="tags">List Tag</Label>
                            <ul className="list-disc pl-5">
                                {category.tags.map(
                                    (
                                        tag: { id: number; name: string },
                                        index: number
                                    ) => (
                                        <li key={index} className="text-sm">
                                            {tag.name}
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    )}

                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <div className="flex gap-2 items-center">
                            <p className="text-sm text-red-600">
                                <span className="font-semibold">Catatan: </span>
                                Hati-hati saat menghapus kategori dan tag.
                                Menghapus kategori atau tag dapat menyebabkan
                                semua data yang terkait dengan kategori atau tag
                                tersebut ikut terhapus. Pastikan Anda tidak
                                salah dalam memilih kategori yang akan dihapus.
                                Harap lebih cermat dan teliti!
                            </p>
                        </div>
                    </div>

                    {checkedError && (
                        <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                            <div className="flex gap-2 items-center">
                                <p className="text-sm text-red-600">
                                    {checkedError}
                                </p>
                            </div>
                        </div>
                    )}

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

                    {checkedError2 && (
                        <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                            <div className="flex gap-2 items-center">
                                <p className="text-sm text-red-600">
                                    {checkedError2}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid w-full max-w-sm lg:max-w-lg items-center gap-2">
                        <div className="flex gap-2 items-center">
                            <Checkbox
                                id="aggree2"
                                name="aggree2"
                                className="cursor-pointer"
                                onCheckedChange={() =>
                                    setIsChecked2((prev) => !prev)
                                }
                            />
                            <Label htmlFor="aggree2" className="cursor-pointer">
                                Saya dengan kesadaran penuh ingin menghapus
                                kategori tersebut!
                            </Label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing || !isChecked || !isChecked2}
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
