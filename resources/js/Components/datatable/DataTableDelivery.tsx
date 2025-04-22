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

interface Product {
    sales_id: number;
    invoice: string;
    customer_name: string;
    grand_total: number;
    delivery_status: string;
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
        accessorKey: "customer_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Nama Pembeli
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("customer_name")}</div>
        ),
    },
    {
        accessorKey: "grand_total",
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
                }).format(row.getValue("grand_total"))}
            </div>
        ),
    },
    {
        accessorKey: "delivery_status",
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
            const type: string = row.getValue("delivery_status");
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
                    Tanggal Pembelian
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
            const sales = row.original;
            dataDeliveryUnique.push(sales);
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
                            href={route("sales.detail.show", {
                                id: Number(sales.id),
                            })}
                            className="bg-red-500"
                        >
                            <DropdownMenuItem className="cursor-pointer">
                                Detail
                            </DropdownMenuItem>
                        </Link>
                        <Link
                            href={route("sales.delete.show", {
                                id: Number(sales.id),
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
    | "customer_name"
    | "grand_total"
    | "delivery_status"
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
    search,
    isSku,
}: {
    data: Product[];
    role: string;
    search: string;
    isSku: boolean;
}) {

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
    const searchCustomerName = React.useRef<HTMLInputElement>(null);
    const searchName = React.useRef<HTMLInputElement>(null);
    const searchCategory = React.useRef<HTMLInputElement>(null);
    const searchTags = React.useRef<HTMLInputElement>(null);
    const searchMinJumlah = React.useRef<HTMLInputElement>(null);
    const searchMaxJumlah = React.useRef<HTMLInputElement>(null);
    const searchMinHarga = React.useRef<HTMLInputElement>(null);
    const searchMaxHarga = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (search) return setFilterName("invoice");
    }, []);

    React.useEffect(() => {
        if (searchInvoice.current) searchInvoice.current.value = "";
        if (searchCustomerName.current) searchCustomerName.current.value = "";
        if (searchName.current) searchName.current.value = "";
        if (searchCategory.current) searchCategory.current.value = "";
        if (searchTags.current) searchTags.current.value = "";

        setMinJumlah("");
        setMaxJumlah("");
        setMinJumlahHarga("");
        setMaxJumlahHarga("");

        table.getColumn("invoice")?.setFilterValue("");
        table.getColumn("customer_name")?.setFilterValue("");
        table.getColumn("grand_total")?.setFilterValue("");
        table.getColumn("delivery_status")?.setFilterValue("");

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
            pagination: { pageSize: 10 },
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
                                <SelectItem value="customer_name">
                                    Nama Pembeli
                                </SelectItem>
                                <SelectItem value="grand_total">
                                    Total Harga
                                </SelectItem>
                                <SelectItem value="delivery_status">
                                    Status Pengiriman
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {filterName === "invoice" && (
                        <Input
                            placeholder="Cari penjualan berdasarkan invoice..."
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

                    {filterName === "customer_name" && (
                        <Input
                            placeholder="Cari penjualan berdasarkan nama pembeli..."
                            ref={searchCustomerName}
                            value={
                                (table
                                    .getColumn("customer_name")
                                    ?.getFilterValue() as string) || ""
                            }
                            onChange={(event) => {
                                const value = event.target.value;
                                table.getColumn("customer_name")?.setFilterValue(value);
                            }}
                            className="max-w-full"
                        />
                    )}

                    {filterName === "delivery_status" && (
                        <Select
                            onValueChange={(value) => {
                                table
                                    .getColumn("delivery_status")
                                    ?.setFilterValue(value);
                            }}
                            value={
                                (table
                                    .getColumn("delivery_status")
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
                                    <SelectItem value="in progress">
                                        In Progress
                                    </SelectItem>
                                    <SelectItem value="in delivery">
                                        In Delivery
                                    </SelectItem>
                                    <SelectItem value="delivered">
                                        Delivered
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}

                    {filterName === "grand_total" && (
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
                                            .getColumn("grand_total")
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
                                            .getColumn("grand_total")
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
                <div className="w-full flex justify-end pr-2">
                    <Link href={route("sales.add.show")}>
                        <Button className="bg-white text-gray-700 border hover:bg-gray-100">
                            Tambah Penjualan
                        </Button>
                    </Link>
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
                                    customer_name: "Nama Pembeli",
                                    grand_total: "Total Harga",
                                    delivery_status: "Status Pengiriman",
                                    created_at: "Tanggal Penjualan",
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
                                    Penjualan masih kosong.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex flex-col">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} total data Penjualan.
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
