import { PageProps } from "@/types";
import AdminLayout from "@/Layouts/AdminLayout";
import InputError from "@/Components/InputError";
import { Head } from "@inertiajs/react";
import { Label } from "@/Components/ui/Label";
import { Button } from "@/Components/ui/Button";
import { useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Checkbox } from "@/Components/ui/Checkbox";

interface User {
    id: number;
    username: string;
    name: string;
    password: string;
    role: string;
    created_at: Date;
    updated_at: Date;
}

export default function DeleteUserDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    user,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    user: User;
}>) {
    const appTitleArray: string[] = appTitle.split(" ");
    const title: string | undefined = appTitleArray.shift();
    const subTitle: string = appTitleArray.join(" ");
    const titleRev: string = subTitle + " " + title;

    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [checkedError, setCheckedError] = useState<string>("");
    const [checkError, setCheckError] = useState("");
    const {
        setData,
        reset,
        processing,
        delete: destroy,
    } = useForm<{
        id: number | null;
    }>({
        id: null,
    });

    useEffect(() => {
        setData({
            id: Number(user.id) || null,
        });
    }, []);

    const submit = (e: any) => {
        e.preventDefault();
        if (!isChecked) {
            setCheckError("* Anda belum menyetujui ingin menghapus data!");
            return;
        } else {
            setCheckError("");
            destroy(route("user.destroy"), {
                onSuccess: () => reset("id"),
            });
        }
    };

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={"Akun"}
            breadcumb3={"Hapus Akun"}
            breadcumb2Href={route("user.show")}
        >
            <Head title={"Hapus Akun"} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">{"Hapus Akun"}</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full max-w-sm items-center gap-2">
                        <p>
                            Apakah Anda yakin ingin menghapus pengguna dengan
                            Username{" "}
                            <span className="font-semibold">
                                {user.username}
                            </span>{" "}
                            dan Role{" "}
                            <span className="font-semibold">{user.role}</span>
                        </p>
                    </div>

                    {checkedError && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <div className="flex gap-2 items-center">
                                <p className="text-sm text-red-600">
                                    {checkedError}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <div className="flex gap-2">
                            <Checkbox
                                id="setuju"
                                name="setuju"
                                className="cursor-pointer"
                                onCheckedChange={(checked: any) =>
                                    setIsChecked(checked)
                                }
                            />
                            <Label htmlFor="setuju" className="cursor-pointer">
                                Saya yakin ingin menghapus data ini!
                            </Label>
                        </div>
                        <InputError message={checkError} className="mt-2" />
                    </div>

                    <Button
                        type="submit"
                        disabled={processing || !setIsChecked}
                        className={`inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-600 focus:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 active:bg-red-700 ${
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
