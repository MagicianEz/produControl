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
import { FilterFn } from "@tanstack/react-table";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/Select";
import { Badge } from "../ui/Badge";

export type User = {
    id: number;
    username: string;
    name: string;
    created_at: Date;
    updated_at: Date;
};

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

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "user_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Nama Pengguna
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("user_name")}</div>
        ),
    },
    {
        accessorKey: "log_action",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Aksi
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const logAction: string = row.getValue("log_action");
            let badgeColor = "";
            switch (logAction) {
                case "tambah":
                    badgeColor = "bg-green-600 hover:bg-green-700";
                    break;
                case "move":
                    badgeColor = "bg-blue-600 hover:bg-blue-700";
                    break;
                case "edit":
                    badgeColor = "bg-yellow-600 hover:bg-yellow-700";
                    break;
                case "hapus":
                    badgeColor = "bg-red-600 hover:bg-red-700";
                    break;
                case "merge":
                    badgeColor = "bg-purple-600 hover:bg-purple-700";
                    break;
                default:
                    badgeColor = "bg-gray-600 hover:bg-gray-700";
            }

            return (
                <Badge className={`capitalize cursor-pointer ${badgeColor}`}>
                    {logAction === "edit" ? "ubah" : logAction}
                </Badge>
            );
        },
    },
    {
        accessorKey: "log_category",
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
        cell: ({ row }) => {
            const logCategory: string = row.getValue("log_category");
            let badgeColor = "";
            let badgeName = "";
            switch (logCategory) {
                case "production":
                    badgeColor = "bg-blue-600 hover:bg-yellow-700";
                    badgeName = "Produksi";
                    break;
                case "stock":
                    badgeColor = "bg-green-600 hover:bg-blue-700";
                    badgeName = "Stok";
                    break;
                case "delivery":
                    badgeColor = "bg-red-600 hover:bg-green-700";
                    badgeName = "Pengiriman";
                    break;
                default:
                    badgeColor = "bg-gray-600 hover:bg-gray-700";
            }
            return (
                <Badge className={`capitalize cursor-pointer ${badgeColor}`}>
                    {badgeName}
                </Badge>
            );
        },
    },
    {
        accessorKey: "log_sku",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    SKU Produk
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("log_sku")}</div>
        ),
    },
    {
        accessorKey: "log_keterangan",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Keterangan
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const text: string = row.getValue("log_keterangan");
            const fixText: string[] = text.split(/\\n|\n/);
            return (
                <div>
                    {fixText.map((str: string, index: number) => {
                        return <p key={index}>{str}</p>;
                    })}
                </div>
            );
        },
    },
    {
        accessorKey: "log_createdAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="w-32"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Tanggal
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const createdAt: string = row.getValue("log_createdAt");
            const now = new Date(createdAt);
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
        accessorKey: "Aksi",
        header: () => {},
        cell: ({ row }) => {
            const text: string = row.getValue("log_keterangan");
            const aksi: string = row.getValue("log_action");
            const category: string = row.getValue("log_category");
            let tujuan: string = "";
            switch (aksi) {
                case "tambah":
                    tujuan = category;
                    break;
                case "edit":
                    tujuan = category;
                    break;
                case "move":
                    if (category === "production") {
                        tujuan = "stock";
                    } else {
                        tujuan = "delivery";
                    }
                    break;
                case "merge":
                    tujuan = "stock";
                    break;
                case "retur":
                    tujuan = "stock";
                    break;
                case "hapus":
                    tujuan = "";
                    break;
                default:
                    break;
            }
            const sku: string = row.getValue("log_sku");
            const resiRegex = /Nomor\s*Invoice[:：]?\s*([\w\d-_]+)/i;
            const resi = text.match(resiRegex);
            let invoice = "";
            if (resi && resi[1]) {
                invoice = resi[1];
            }
            return aksi === "hapus" ? (
                <p></p>
            ) : tujuan === "production" ? (
                <Link
                    className="text-nowrap pr-6 text-blue-600 hover:text-blue-700 hover:underline"
                    href={route("production.show", { search: sku })}
                >
                    Lihat data
                </Link>
            ) : tujuan === "stock" ? (
                <Link
                    className="text-nowrap pr-6 text-blue-600 hover:text-blue-700 hover:underline"
                    href={route("stock.show", { search: sku })}
                >
                    Lihat data
                </Link>
            ) : tujuan === "delivery" ? (
                <Link
                    className="text-nowrap pr-6 text-blue-600 hover:text-blue-700 hover:underline"
                    href={route("delivery.show", { search: invoice })}
                >
                    Lihat data
                </Link>
            ) : (
                <p></p>
            );
        },
    },
];

type FilterType = "user_name" | "log_action" | "log_category" | "log_sku" | "";

export function DataTableLogging({ data }: { data: any[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [filterName, setFilterName] = React.useState<FilterType>("");

    const searchUsername = React.useRef<HTMLInputElement>(null);
    const searchSku = React.useRef<HTMLInputElement>(null);
    const searchAction = React.useRef<HTMLInputElement>(null);
    const searchCategory = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (searchUsername.current) searchUsername.current.value = "";
        if (searchSku.current) searchSku.current.value = "";

        table.getColumn("user_name")?.setFilterValue("");
        table.getColumn("log_sku")?.setFilterValue("");

        if (searchAction.current) searchAction.current.value = "";
        if (searchCategory.current) searchCategory.current.value = "";

        table.getColumn("log_action")?.setFilterValue("");
        table.getColumn("log_category")?.setFilterValue("");
    }, [filterName]);

    const table = useReactTable({
        data,
        columns,
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
    });

    return (
        <div className="grid grid-cols-1">
            <div className="flex items-center mb-4">
                <div className="flex flex-col gap-2 w-1/3">
                    <Select
                        onValueChange={(value: FilterType) =>
                            setFilterName(value)
                        }
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Cari berdasarkan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="user_name">
                                    Nama Pengguna
                                </SelectItem>
                                <SelectItem value="log_action">Aksi</SelectItem>
                                <SelectItem value="log_category">
                                    Kategori
                                </SelectItem>
                                <SelectItem value="log_sku">
                                    SKU Produk
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {filterName === "user_name" && (
                        <Input
                            placeholder="Cari kategori berdasarkan username pengguna..."
                            ref={searchUsername}
                            value={
                                (table
                                    .getColumn("user_name")
                                    ?.getFilterValue() as string) || ""
                            }
                            onChange={(event) => {
                                const value = event.target.value;
                                table
                                    .getColumn("user_name")
                                    ?.setFilterValue(value);
                            }}
                            className="max-w-sm"
                        />
                    )}

                    {filterName === "log_sku" && (
                        <Input
                            placeholder="Cari kategori berdasarkan nama pengguna..."
                            ref={searchSku}
                            value={
                                (table
                                    .getColumn("log_sku")
                                    ?.getFilterValue() as string) || ""
                            }
                            onChange={(event) => {
                                const value = event.target.value;
                                table
                                    .getColumn("log_sku")
                                    ?.setFilterValue(value);
                            }}
                            className="max-w-sm"
                        />
                    )}

                    {filterName === "log_action" && (
                        <Select
                            onValueChange={(value) => {
                                table
                                    .getColumn("log_action")
                                    ?.setFilterValue(value);
                            }}
                            value={
                                (table
                                    .getColumn("log_action")
                                    ?.getFilterValue() as string) || ""
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih aksi yang ingin dicari" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="tambah">
                                        Tambah
                                    </SelectItem>
                                    <SelectItem value="edit">Ubah</SelectItem>
                                    <SelectItem value="move">Move</SelectItem>
                                    <SelectItem value="merge">Merge</SelectItem>
                                    <SelectItem value="retur">Retur</SelectItem>
                                    <SelectItem value="hapus">Hapus</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}

                    {filterName === "log_category" && (
                        <Select
                            onValueChange={(value) => {
                                table
                                    .getColumn("log_category")
                                    ?.setFilterValue(value);
                            }}
                            value={
                                (table
                                    .getColumn("log_category")
                                    ?.getFilterValue() as string) || ""
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih kategori yang ingin dicari" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="production">
                                        Production
                                    </SelectItem>
                                    <SelectItem value="stock">Stock</SelectItem>
                                    <SelectItem value="delivery">
                                        Delivery
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
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
                                    user_name: "Nama Pengguna",
                                    log_action: "Aksi",
                                    log_category: "Kategori",
                                    log_sku: "SKU Produk",
                                    log_keterangan: "Keterangan",
                                    log_createdAt: "Tanggal",
                                };
                                const text =
                                    columnNames[column.id] || column.id;
                                return (
                                    text !== "Aksi" && (
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
                                    )
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
                                    Log tidak ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex flex-col">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} total log.
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
