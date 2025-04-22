import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import InputError from "@/Components/InputError";
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

export default function SalesAddDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    productInStock,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    productInStock: any;
}>) {
    const [countList, setCountList] = useState<number>(1);
    const [productList, setProductList] = useState<
        Array<{ master_id: number | null; stock_id: number | null; quantity: number | null; price: number | null }>
    >([{ master_id: null, stock_id: null, quantity: null, price: null }]);

    const { data, setData, reset, errors, processing, post } = useForm<{
        invoice: string;
        customer_name: string;
        product_list: Array<{ stock_id: number | null; quantity: number | null; price: number | null }>;
        delivery_status: string;
        tax: number;
        discount: number;
        sub_total: number;
        grand_total: number;
    }>({
        invoice: "",
        customer_name: "",
        product_list: [],
        delivery_status: "In Progress",
        tax: 0,
        discount: 0,
        sub_total: 0,
        grand_total: 0,
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route("sales.store"), {
            onSuccess: () => reset(),
        });
    };

    const changeProductList = (index: number, field: string, value: any) => {
        setProductList((prev) => {
            const newList = [...prev];
    
            if (field === "stock_id") {
                const selectedProduct = productInStock.find((p: any) => p.stock_id === Number(value));
                newList[index] = {
                    master_id: selectedProduct?.master_id || null,
                    stock_id: Number(value),
                    quantity: null,
                    price: selectedProduct?.price || null,
                };
            } else if (field === "quantity") {
                const stock_id = newList[index].stock_id;
                const selectedProduct = productInStock.find((p: any) => p.stock_id === stock_id);
    
                const unitPrice = selectedProduct?.price || 0;
                const quantityValue = Number(value);
    
                newList[index] = {
                    ...newList[index],
                    quantity: quantityValue,
                    price: unitPrice * quantityValue,
                };
            } else {
                newList[index] = { ...newList[index], [field]: value };
            }
    
            return newList;
        });
    };

    useEffect(() => {
        const formattedProducts = productList.map((list) => ({
            stock_id: list.stock_id,
            quantity: list.quantity,
            price: list.price,
        }));
        setData("product_list", formattedProducts);
    }, [productList]);

    useEffect(() => {
        const subTotal = data.product_list.reduce((total, product) => total + (product.price || 0), 0);
        const grandTotal = subTotal + data.tax - data.discount;

        setData((prevData) => ({
            ...prevData,
            sub_total: subTotal,
            grand_total: grandTotal,
        }));
    }, [data.product_list, data.tax, data.discount]);

    const selectedStockIds = productList.map((p) => p.stock_id).filter((id) => id !== null);
    const totalPrice = productList.reduce((total, product) => total + (product.price || 0), 0);

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={"Penjualan"}
            breadcumb3={appTitle}
            breadcumb2Href={route("sales.show")}
        >
            <Head title={"Create Sales Order"} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">{appTitle}</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="invoice">Invoice</Label>
                        <Input
                            type="text"
                            id="invoice"
                            placeholder="Nomor Invoice"
                            value={data.invoice}
                            onChange={(event) => setData("invoice", event.target.value)}
                        />
                        <InputError message={errors.invoice} className="mt-2" />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="customer_name">Nama Pembeli</Label>
                        <Input
                            type="text"
                            id="customer_name"
                            placeholder="Nama Pembeli"
                            value={data.customer_name}
                            onChange={(event) => setData("customer_name", event.target.value)}
                        />
                        <InputError message={errors.customer_name} className="mt-2" />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label>List Produk yang Ingin Dijual</Label>
                        <div className="flex gap-1">
                            <Button
                                onClick={(event) => {
                                    event.preventDefault();
                                    setCountList((prev) => prev + 1);
                                    setProductList((prev) => [...prev, { master_id: null, stock_id: null, quantity: null, price: null }]);
                                }}
                                className="text-xs mt-2 h-auto max-w-max"
                            >
                                +
                            </Button>
                            <Button
                                disabled={countList === 1}
                                onClick={(event) => {
                                    event.preventDefault();
                                    setCountList((prev) => (prev > 1 ? prev - 1 : 1));
                                    setProductList((prev) => prev.slice(0, -1));
                                }}
                                className="text-xs mt-2 h-auto max-w-max"
                            >
                                -
                            </Button>
                        </div>

                        {Array.from({ length: countList }).map((_, index) => (
                            <div key={index} className="mt-2">
                                <Label>Produk</Label>
                                <Select
                                    onValueChange={(value) => changeProductList(index, "stock_id", Number(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih produk yang ingin ditambahkan ke data penjualan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {productInStock.map((product: any) => {
                                                const allTags = product.tags?.map((tag: { name: string }) => tag.name).join(", ");
                                                return (
                                                    <SelectItem
                                                        key={product.stock_id}
                                                        value={product.stock_id.toString()}
                                                        className="capitalize cursor-pointer"
                                                        disabled={selectedStockIds.includes(product.stock_id)}
                                                    >
                                                        {`${product.sku} - ${product.product_name} - Tags: ${allTags} - Stok: ${product.quantity}`}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                {productList[index].stock_id !== null && (
                                    <>
                                        <Label htmlFor={`quantity-${index}`}>Jumlah</Label>
                                        <Input
                                            type="text"
                                            id={`quantity-${index}`}
                                            placeholder="Jumlah Produk"
                                            value={productList[index].quantity || "1"}
                                            onChange={(event) => {
                                                const value = event.target.value.replace(/\D/g, "");
                                                const quantityValue = parseInt(value) || 0;

                                                const stock_id = productList[index]?.stock_id;
                                                const selectedProduct = productInStock.find((p: any) => p.stock_id === stock_id);
                                                const maxStock = selectedProduct?.quantity ?? 1;

                                                if (quantityValue > maxStock) {
                                                    changeProductList(index, "quantity", maxStock);
                                                } else if (quantityValue < 1) {
                                                    changeProductList(index, "quantity", 1);
                                                } else {
                                                    changeProductList(index, "quantity", quantityValue);
                                                }
                                            }}
                                        />

                                        <Label htmlFor={`price-${index}`}>Harga</Label>
                                        <Input
                                            type="text"
                                            id={`price-${index}`}
                                            placeholder="Rp 0"
                                            className="bg-gray-300 font-semibold"
                                            value={`Rp ${(productList[index].price || 0).toLocaleString("id-ID")}`}
                                            disabled
                                        />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {totalPrice > 0 && (
                        <div className="grid w-full lg:max-w-lg items-center gap-4">
                            <div className="grid w-full items-center gap-2">
                                <Label>Subtotal</Label>
                                <Input 
                                    type="text" 
                                    className="bg-gray-300 font-semibold" 
                                    value={`Rp ${totalPrice.toLocaleString("id-ID")}`} 
                                    disabled 
                                />
                            </div>

                            <div className="grid w-full items-center gap-2">
                                <Label htmlFor="tax">Pajak</Label>
                                <Input 
                                    type="text" 
                                    id="tax" 
                                    placeholder="Rp 0" 
                                    value={`Rp ${data.tax?.toLocaleString("id-ID") || 0}`} 
                                    onChange={(event) => {
                                        const value = event.target.value.replace(/\D/g, "");
                                        setData("tax", Number(value) || 0);
                                    }}
                                />
                            </div>

                            <div className="grid w-full items-center gap-2">
                                <Label htmlFor="discount">Diskon</Label>
                                <Input 
                                    type="text" 
                                    id="discount" 
                                    placeholder="Rp 0" 
                                    value={`Rp ${data.discount?.toLocaleString("id-ID") || 0}`} 
                                    onChange={(event) => {
                                        const value = event.target.value.replace(/\D/g, "");
                                        setData("discount", Number(value) || 0);
                                    }}
                                />
                            </div>

                            <div className="grid w-full items-center gap-2">
                                <Label>Grand Total</Label>
                                <Input 
                                    type="text" 
                                    className="bg-gray-300 font-semibold"
                                    value={`Rp ${Math.max(0, totalPrice + (data.tax || 0) - (data.discount || 0)).toLocaleString("id-ID")}`} 
                                    disabled 
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="delivery_status">Status Pengiriman</Label>
                        <Select
                            value={data.delivery_status}
                            onValueChange={(value) => setData("delivery_status", value)}
                        >
                            <SelectTrigger id="delivery_status">
                                <SelectValue placeholder="Pilih Status Pengiriman" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="On Hold">On Hold</SelectItem>
                                    <SelectItem value="In Delivery">In Delivery</SelectItem>
                                    <SelectItem value="Delivered">Delivered</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.delivery_status} className="mt-2" />
                    </div>

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