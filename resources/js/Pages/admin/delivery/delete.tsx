import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Button } from "@/Components/ui/Button";
import { Checkbox } from "@/Components/ui/Checkbox";
import { useState } from "react";

interface Delivery {
    category_id: number;
    category_name: string;
    invoice: string;
    master_id: number;
    sku: string;
    name: string;
    id: number;
    quantity: number;
    total_price: number;
    price: number;
    tags: {
        id: number;
        name: string;
    }[];
}

export default function DetailDeliveryDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    delivery,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    delivery: Delivery;
}>) {
    const appTitleArray: string[] = appTitle.split(" ");
    const title: string | undefined = appTitleArray.shift();
    const subTitle: string = appTitleArray.join(" ");
    const titleRev: string = subTitle + " " + title;

    const hargaPadaStock: number = delivery.total_price / delivery.quantity;

    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [checkedError, setCheckedError] = useState<string>("");
    const {
        reset,
        processing,
        delete: destroy,
    } = useForm({
        id: delivery.id,
    });

    const submit = (e: any) => {
        e.preventDefault();
        if (!isChecked) {
            return setCheckedError("Anda harus menyetujui terlebih dahulu");
        } else {
            setCheckedError("");
        }
        destroy(route("delivery.destroy"), {
            onSuccess: () => reset("id"),
        });
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
            breadcumb2={"Pengiriman"}
            breadcumb3={"Hapus Data Pengiriman"}
            breadcumb2Href={route("delivery.show")}
        >
            <Head title={"Hapus Data Pengiriman"} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">{"Hapus Data Pengiriman"}</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="invoice">Nomor Invoice</Label>
                        <Input
                            type="text"
                            id="invoice"
                            placeholder="Nomor Invoice"
                            className="bg-gray-300 font-semibold"
                            value={delivery.invoice}
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            type="text"
                            id="sku"
                            placeholder="SKU Product"
                            className="bg-gray-300 font-semibold"
                            value={delivery.sku}
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="name">Nama Produk</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Product Name"
                            className="bg-gray-300 font-semibold"
                            value={delivery.name}
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="name">Kategori</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Kategori"
                            className="bg-gray-300 font-semibold"
                            value={delivery.category_name}
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="name">Harga Satuan</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Kategori"
                            className="bg-gray-300 font-semibold"
                            value={formatCurrency(hargaPadaStock)}
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="quantity">Jumlah</Label>
                        <Input
                            type="text"
                            id="quantity"
                            placeholder="Kategori"
                            className="bg-gray-300 font-semibold"
                            value={delivery.quantity}
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="price">Total Harga</Label>
                        <Input
                            type="text"
                            id="price"
                            placeholder="contoh: 1000000"
                            className="bg-gray-300 font-semibold"
                            value={formatCurrency(delivery.total_price)}
                            disabled
                        />
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
                        <div className="flex gap-2 items-center">
                            <Checkbox
                                id="aggree"
                                name="aggree"
                                className="cursor-pointer"
                                onCheckedChange={(checked) =>
                                    setIsChecked((prev) => !prev)
                                }
                            />
                            <Label htmlFor="aggree" className="cursor-pointer">
                                Saya setuju untuk menghapus data ini.
                            </Label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing || !isChecked}
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
