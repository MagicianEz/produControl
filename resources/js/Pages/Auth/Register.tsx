import InputError from "@/Components/InputError";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { Button } from "@/Components/ui/Button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/Card";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        username: "",
        password: "",
        password_confirmation: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Login" />
            <div className="flex h-screen w-full items-center justify-center px-4">
                <Card className="mx-auto max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Daftar</CardTitle>
                        <CardDescription>
                            Masukkan data diri untuk mendaftar. Ingat data yang didaftarkan untuk masuk nanti.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        autoComplete="name"
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        required
                                    />

                                    <InputError
                                        message={errors.username}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        name="username"
                                        value={data.username}
                                        autoComplete="username"
                                        onChange={(e) =>
                                            setData("username", e.target.value)
                                        }
                                        required
                                    />

                                    <InputError
                                        message={errors.username}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Konfirmasi Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        autoComplete="password_confirmation"
                                        onChange={(e) =>
                                            setData(
                                                "password_confirmation",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    Daftar
                                </Button>
                            </div>
                        </form>
                        <div className="mt-4 text-center text-sm">
                            Sudah punya akun?{" "}
                            <a href={route("login")} className="underline">
                                Masuk
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
