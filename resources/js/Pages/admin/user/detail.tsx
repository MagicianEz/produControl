import { PageProps } from "@/types";
import AdminLayout from "@/Layouts/AdminLayout";
import InputError from "@/Components/InputError";
import { Head } from "@inertiajs/react";
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
import { useForm } from "@inertiajs/react";
import { useEffect } from "react";

interface User {
    id: number;
    username: string;
    name: string;
    password: string;
    role: string;
    created_at: Date;
    updated_at: Date;
}

export default function DetailUserDashboard({
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

    const { data, setData, reset, errors, processing, patch } = useForm<{
        username: string;
        name: string;
        password: string;
        role: string;
    }>({
        username: "",
        name: "",
        password: "",
        role: "",
    });

    useEffect(() => {
        setData({
            username: user.username || "",
            name: user.name || "",
            password: user.password || "",
            role: user.role || "",
        });
    }, []);

    const submit = (e: any) => {
        e.preventDefault();
        patch(route("user.update"), {
            onSuccess: () => reset("username", "name", "password", "role"),
        });
    };

    const changeRole = (value: any) => {
        setData("role", value);
    };

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={"Akun"}
            breadcumb3={"Ubah Detail Akun"}
            breadcumb2Href={route("user.show")}
        >
            <Head title={"Ubah Detail Akun"} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">{"Ubah Detail Akun"}</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            type="text"
                            id="username"
                            placeholder="Masukkan username pengguna, contoh: marketing1"
                            value={data.username}
                            disabled
                            className="font-semibold bg-gray-200"
                        />
                        <InputError
                            message={errors.username}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="name">Nama Pengguna</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Masukkan nama pengguna, contoh: Budi"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            type="password"
                            id="password"
                            placeholder="•••••••••••"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                        />
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            name="role"
                            onValueChange={changeRole}
                            value={data.role}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Role..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem
                                        className="capitalize cursor-pointer"
                                        value="admin"
                                    >
                                        Admin
                                    </SelectItem>
                                    <SelectItem
                                        className="capitalize cursor-pointer"
                                        value="operator"
                                    >
                                        Operator
                                    </SelectItem>
                                    <SelectItem
                                        className="capitalize cursor-pointer"
                                        value="marketing"
                                    >
                                        Marketing
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role} className="mt-2" />
                    </div>

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
