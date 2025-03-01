import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Button } from "@/Components/ui/Button";
import { useEffect } from "react";
import InputError from "@/Components/InputError";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
} from "@/Components/ui/Select";

interface Delivery {
    category_id: number;
    category_name: string;
    master_id: number;
    sku: string;
    invoice: string;
    name: string;
    id: number;
    quantity: number;
    total_price: number;
    price: number;
    tags: {
        id: number;
        name: string;
    }[];
    status_pengiriman: string;
}

export default function DeliveryDetailDashboard({
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
    const { data, setData, reset, errors, processing, patch } = useForm<{
        id: number;
        invoice: string;
        total_price: number;
        quantity: number;
        status_pengiriman: string;
    }>({
        id: delivery.id,
        invoice: delivery.invoice,
        total_price: delivery.total_price,
        quantity: delivery.quantity,
        status_pengiriman: delivery.status_pengiriman,
    });

    useEffect(() => {
        const totalPrice: number = hargaPadaStock * data.quantity;
        setData("total_price", totalPrice);
    }, [data.quantity]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        patch(route("delivery.update"), {
            onSuccess: () => reset("id", "total_price", "quantity"),
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
            breadcumb3={"Ubah Detail Pengiriman"}
            breadcumb2Href={route("delivery.show")}
        >
            <Head title={"Ubah Detail Pengiriman"} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">
                    Ubah Detail Pengiriman
                </h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="invoice">Nomor Invoice</Label>
                        <Input
                            type="text"
                            id="invoice"
                            placeholder="Nomor invoice pengiriman"
                            value={data.invoice}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setData("invoice", event.target.value);
                            }}
                        />
                        <InputError
                            message={errors.invoice}
                            className="mt-2"
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
                            value={delivery.category_name}
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="name">Harga Satuan Produk</Label>
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
                        <Label htmlFor="statusPengiriman">
                            Status Pengiriman
                        </Label>
                        <Select
                            name="statusPengiriman"
                            onValueChange={(value) =>
                                setData("status_pengiriman", value)
                            }
                            value={data.status_pengiriman}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih status pengiriman" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {[
                                        "on hold",
                                        "on progress",
                                        "on delivery",
                                        "delivered",
                                    ].map((item: any, index: number) => (
                                        <SelectItem
                                            key={index}
                                            className="capitalize cursor-pointer"
                                            value={`${item}`}
                                        >
                                            {item
                                                .split(" ")
                                                .map(
                                                    (word: string) =>
                                                        word
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                        word.slice(1)
                                                )
                                                .join(" ")}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="quantity">Jumlah Produk</Label>
                        <Input
                            type="text"
                            id="quantity"
                            placeholder="Kategori"
                            value={data.quantity}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                const value = event.target.value.replace(
                                    /\D/g,
                                    ""
                                );
                                setData("quantity", parseInt(value, 10) || 0);
                            }}
                        />
                        <InputError
                            message={errors.quantity}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="price">Total Harga Produk</Label>
                        <Input
                            type="text"
                            id="price"
                            placeholder="contoh: 1000000"
                            className="bg-gray-300 font-semibold"
                            value={formatCurrency(data.total_price)}
                            disabled
                        />
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
