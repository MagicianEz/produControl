"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/Components/ui/Button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/Components/ui/DropdownMenu";
import { Input } from "@/Components/ui/Input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/Table";
import { Link } from "@inertiajs/react";
import { Badge } from "../ui/Badge";
import { FilterFn } from "@tanstack/react-table";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/Select";
import { default as SelectTwo } from "react-select";

interface Product {
    master_id: number;
    category_id: number;
    category_name: string;
    product_name: string;
    product_quantity: number;
    sku: string;
    tags: { id: number; name: string }[];
    product_price: number;
    created_at: Date;
    updated_at: Date;
}

const customFilter: FilterFn<any> = (row, columnId, filterValue) => {
    const tagsRow = row.getValue(columnId);
    if (Array.isArray(tagsRow)) {
        return tagsRow.some((tag) =>
            tag.name.toLowerCase().includes(filterValue.toLowerCase())
        );
    }
    return false;
};

const customJumlahFilter: FilterFn<any> = (row, columnId, filterValue) => {
    const min = filterValue[0];
    const max = filterValue[1];
    const jumlah = row.getValue(columnId);

    if (typeof jumlah === "number") {
        const inMinRange = min !== "" ? jumlah >= min : true;
        const inMaxRange = max !== "" ? jumlah <= max : true;
        return inMinRange && inMaxRange;
    }
    return false;
};

const customTagsFilter: FilterFn<any> = (row, columnId, filterValue) => {
    if (columnId === "kategori") {
        const filterArray = filterValue.map(
            (item: { value: string; label: string }) => item.value
        );
        const rowTags: any = row.getValue(columnId);
        const match = filterArray.every(
            (filterTag: string) =>
                rowTags.toLowerCase() === filterTag.toLowerCase()
        );
        return match;
    }
    return false;
};

const dataDeliveryUnique: any[] = [];

const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "no",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    No
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("no")}</div>
        ),
    },
    {
        accessorKey: "invoice",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Invoice
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("invoice")}</div>
        ),
    },
    {
        accessorKey: "sku",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    SKU
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("sku")}</div>
        ),
    },
    {
        accessorKey: "nama_produk",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Nama Produk
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("nama_produk")}</div>
        ),
    },
    {
        accessorKey: "kategori",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Kategori
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("kategori")}</div>
        ),
        filterFn: customTagsFilter,
    },
    {
        accessorKey: "jumlah",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Jumlah
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("jumlah")}</div>
        ),
    },
    {
        accessorKey: "total_harga",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Total Harga
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="capitalize">
                {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(row.getValue("total_harga"))}
            </div>
        ),
    },
    {
        accessorKey: "status_pengiriman",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Status Pengiriman
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const type: string = row.getValue("status_pengiriman");
            const badgeColor =
                type === "on hold"
                    ? "bg-red-600 hover:bg-red-700"
                    : type === "on progress"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : type === "on delivery"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : type === "delivered"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-600 hover:bg-gray-700";
            return (
                <Badge
                    className={`text-xs capitalize cursor-default ${badgeColor}`}
                >
                    {type}
                </Badge>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Tanggal Pengiriman
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const updatedAt: string = row.getValue("created_at");
            const now = new Date(updatedAt);
            const formattedDate = `${now.getDate()} ${
                months[now.getMonth()]
            } ${now.getFullYear()}`;
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");
            const time = `${hours}:${minutes}:${seconds}`;
            return (
                <div className="flex-col">
                    <div className="capitalize font-semibold">
                        {formattedDate}
                    </div>
                    <div className="capitalize">{time}</div>
                </div>
            );
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const delivery = row.original;
            const isSKUExists = dataDeliveryUnique.some(
                (uniqueDelivery) => uniqueDelivery.sku === delivery.sku
            );
            if (!isSKUExists) {
                dataDeliveryUnique.push(delivery);
            }
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <Link
                            href={route("delivery.detail.show", {
                                id: Number(delivery.delivery_id),
                            })}
                            className="bg-red-500"
                        >
                            <DropdownMenuItem className="cursor-pointer">
                                Ubah
                            </DropdownMenuItem>
                        </Link>
                        <Link
                            href={route("delivery.retur.show", {
                                id: Number(delivery.delivery_id),
                            })}
                            className="bg-red-500"
                        >
                            <DropdownMenuItem className="cursor-pointer">
                                Retur
                            </DropdownMenuItem>
                        </Link>
                        <Link
                            href={route("delivery.delete.show", {
                                id: Number(delivery.delivery_id),
                            })}
                            className="bg-red-500"
                        >
                            <DropdownMenuItem className="cursor-pointer">
                                Hapus
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

type FilterType =
    | "invoice"
    | "sku"
    | "name"
    | "category"
    | "jumlah"
    | "total_harga"
    | "status_pengiriman"
    | "";

const formatCurrency = (value: any) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

type CatTagType = { value: string; label: string };

export function DataTableDelivery({
    data,
    role,
    allCategory: ALLCATEGORY,
    search,
    isSku,
}: {
    data: Product[];
    role: string;
    allCategory: CatTagType[];
    search: string;
    isSku: boolean;
}) {
    const QUANTITY_PRODUCT = data
        .map((item) => item.product_quantity)
        .reduce((acc: number, current: number) => acc + current, 0);

    const allCategory = ALLCATEGORY.filter(
        (item: CatTagType, index: number, self) =>
            index === self.findIndex((x) => x.value === item.value)
    );

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [filterName, setFilterName] = React.useState<FilterType>("");
    const [minJumlah, setMinJumlah] = React.useState<number | "">("");
    const [maxJumlah, setMaxJumlah] = React.useState<number | "">("");
    const [minJumlahHarga, setMinJumlahHarga] = React.useState<number | "">("");
    const [maxJumlahHarga, setMaxJumlahHarga] = React.useState<number | "">("");

    const searchInvoice = React.useRef<HTMLInputElement>(null);
    const searchSku = React.useRef<HTMLInputElement>(null);
    const searchName = React.useRef<HTMLInputElement>(null);
    const searchCategory = React.useRef<HTMLInputElement>(null);
    const searchTags = React.useRef<HTMLInputElement>(null);
    const searchMinJumlah = React.useRef<HTMLInputElement>(null);
    const searchMaxJumlah = React.useRef<HTMLInputElement>(null);
    const searchMinHarga = React.useRef<HTMLInputElement>(null);
    const searchMaxHarga = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isSku) return setFilterName("sku");
        if (search) return setFilterName("invoice");
    }, []);

    React.useEffect(() => {
        if (searchInvoice.current) searchInvoice.current.value = "";
        if (searchSku.current) searchSku.current.value = "";
        if (searchName.current) searchName.current.value = "";
        if (searchCategory.current) searchCategory.current.value = "";
        if (searchTags.current) searchTags.current.value = "";

        setMinJumlah("");
        setMaxJumlah("");
        setMinJumlahHarga("");
        setMaxJumlahHarga("");

        table.getColumn("invoice")?.setFilterValue("");
        table.getColumn("sku")?.setFilterValue("");
        table.getColumn("nama_produk")?.setFilterValue("");
        table.getColumn("kategori")?.setFilterValue("");
        table.getColumn("status_pengiriman")?.setFilterValue("");
        table.getColumn("jumlah")?.setFilterValue(["", ""]);
        table.getColumn("total_harga")?.setFilterValue(["", ""]);

        if (isSku) return table.getColumn("sku")?.setFilterValue(search);
        if (search) return table.getColumn("invoice")?.setFilterValue(search);
    }, [filterName]);

    const table = useReactTable({
        data,
        columns: role === "marketing" ? columns.slice(0, -1) : columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        initialState: {
            pagination: { pageSize: 20 },
        },
        filterFns: {
            customFilter,
            customJumlah: customJumlahFilter,
        },
    });

    return (
        <div className="grid grid-cols-1">
            <div className="flex items-center mb-4">
                <div className="flex flex-col gap-2 w-1/2">
                    <Select
                        onValueChange={(value: FilterType) =>
                            setFilterName(value)
                        }
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Cari berdasarkan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="invoice">Invoice</SelectItem>
                                <SelectItem value="sku">SKU Produk</SelectItem>
                                <SelectItem value="name">
                                    Nama Produk
                                </SelectItem>
                                <SelectItem value="category">
                                    Nama Kategori
                                </SelectItem>
                                <SelectItem value="jumlah">
                                    Jumlah Produk
                                </SelectItem>
                                <SelectItem value="total_harga">
                                    Total Harga
                                </SelectItem>
                                <SelectItem value="status_pengiriman">
                                    Status Pengiriman
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {filterName === "invoice" && (
                        <Input
                            placeholder="Cari delivery berdasarkan invoice..."
                            ref={searchInvoice}
                            value={
                                (table
                                    .getColumn("invoice")
                                    ?.getFilterValue() as string) || ""
                            }
                            onChange={(event) => {
                                const value = event.target.value;
                                table
                                    .getColumn("invoice")
                                    ?.setFilterValue(value);
                            }}
                            className="max-w-full"
                        />
                    )}

                    {filterName === "sku" && (
                        <Input
                            placeholder="Cari delivery berdasarkan sku produk..."
                            ref={searchSku}
                            value={
                                (table
                                    .getColumn("sku")
                                    ?.getFilterValue() as string) || ""
                            }
                            onChange={(event) => {
                                const value = event.target.value;
                                table.getColumn("sku")?.setFilterValue(value);
                            }}
                            className="max-w-full"
                        />
                    )}

                    {filterName === "name" && (
                        <Input
                            placeholder="Cari delivery berdasarkan nama produk..."
                            ref={searchName}
                            value={
                                (table
                                    .getColumn("nama_produk")
                                    ?.getFilterValue() as string) || ""
                            }
                            onChange={(event) => {
                                const value = event.target.value;
                                table
                                    .getColumn("nama_produk")
                                    ?.setFilterValue(value);
                            }}
                            className="max-w-full"
                        />
                    )}

                    {filterName === "category" && (
                        <SelectTwo
                            isMulti
                            name="kategori"
                            options={allCategory}
                            className="basic-multi-select h-9 max-w-full rounded-md border bg-transparent text-sm font-normal"
                            classNamePrefix="select"
                            onChange={(value: any) =>
                                table
                                    .getColumn("kategori")
                                    ?.setFilterValue(value)
                            }
                        />
                    )}

                    {filterName === "status_pengiriman" && (
                        <Select
                            onValueChange={(value) => {
                                table
                                    .getColumn("status_pengiriman")
                                    ?.setFilterValue(value);
                            }}
                            value={
                                (table
                                    .getColumn("status_pengiriman")
                                    ?.getFilterValue() as string) || ""
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih status pengiriman yang ingin dicari" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="on hold">
                                        On Hold
                                    </SelectItem>
                                    <SelectItem value="on progress">
                                        On Progress
                                    </SelectItem>
                                    <SelectItem value="on delivery">
                                        On Delivery
                                    </SelectItem>
                                    <SelectItem value="delivered">
                                        Delivered
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}

                    {filterName === "jumlah" && (
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Jumlah terendah"
                                ref={searchMinJumlah}
                                className="w-1/2"
                                value={minJumlah}
                                onChange={(event) => {
                                    const value = event.target.value
                                        ? Number(event.target.value)
                                        : "";
                                    setMinJumlah(value);
                                    table
                                        .getColumn("jumlah")
                                        ?.setFilterValue([value, maxJumlah]);
                                }}
                            />
                            <Input
                                type="number"
                                placeholder="Jumlah tertinggi"
                                ref={searchMaxJumlah}
                                className="w-1/2"
                                value={maxJumlah}
                                onChange={(event) => {
                                    const value = event.target.value
                                        ? Number(event.target.value)
                                        : "";
                                    setMaxJumlah(value);
                                    table
                                        .getColumn("jumlah")
                                        ?.setFilterValue([minJumlah, value]);
                                }}
                            />
                        </div>
                    )}

                    {filterName === "total_harga" && (
                        <div className="flex gap-2">
                            <div className="w-1/2 flex-col">
                                <p className="mt-2 text-sm">
                                    Total harga terendah
                                </p>
                                <Input
                                    type="text"
                                    placeholder="Total harga terendah"
                                    ref={searchMinHarga}
                                    className="w-full"
                                    value={formatCurrency(minJumlahHarga)}
                                    onChange={(
                                        event: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        const value =
                                            event.target.value.replace(
                                                /\D/g,
                                                ""
                                            );
                                        const quantityValue =
                                            parseInt(value) || 0;
                                        setMinJumlahHarga(quantityValue);
                                        table
                                            .getColumn("total_harga")
                                            ?.setFilterValue([
                                                value,
                                                maxJumlahHarga,
                                            ]);
                                    }}
                                />
                            </div>
                            <div className="w-1/2 flex-col">
                                <p className="mt-2 text-sm">
                                    Total harga tertinggi
                                </p>
                                <Input
                                    type="text"
                                    placeholder="Total harga tertinggi"
                                    ref={searchMaxHarga}
                                    className="w-full"
                                    value={formatCurrency(maxJumlahHarga)}
                                    onChange={(
                                        event: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        const value =
                                            event.target.value.replace(
                                                /\D/g,
                                                ""
                                            );
                                        const quantityValue =
                                            parseInt(value) || 0;
                                        setMaxJumlahHarga(quantityValue);
                                        table
                                            .getColumn("total_harga")
                                            ?.setFilterValue([
                                                minJumlahHarga,
                                                value,
                                            ]);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Kolom <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                const columnNames: Record<string, string> = {
                                    sku: "SKU Produk",
                                    nama_produk: "Nama Produk",
                                    total_harga: "Total Harga",
                                    status_pengiriman: "Status Pengiriman",
                                    created_at: "Tanggal Pengiriman",
                                };
                                const text =
                                    columnNames[column.id] || column.id;
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={text}
                                        className="capitalize cursor-pointer"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {text}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            className="pl-12"
                                            key={header.id}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            className="pl-12"
                                            key={cell.id}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Product tidak ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex flex-col">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} Total data
                        delivery dengan jumlah {QUANTITY_PRODUCT} product.
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Selanjutnya
                        </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Page{" "}
                        <span className="font-semibold">
                            {table.getState().pagination.pageIndex + 1}
                        </span>{" "}
                        dari {table.getPageCount()}.
                    </div>
                </div>
            </div>
        </div>
    );
}
