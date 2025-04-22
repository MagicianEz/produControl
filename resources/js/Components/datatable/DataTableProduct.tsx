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
import { Badge } from "@/Components/ui/Badge";
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
import { default as SelectTwo } from "react-select";

interface Product {
    production_id: number;
    master_id: number;
    category_id: number;
    category_name: string;
    product_name: string;
    product_quantity: number;
    sku: string;
    tags: { id: number; name: string }[];
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
    if (columnId === "tags") {
        const filterArray = filterValue.map(
            (item: { value: string; label: string }) => item.value
        );
        const rowTags: any = row.getValue(columnId);
        const match = filterArray.every((filterTag: string) =>
            rowTags.some(
                (tag: any) => tag.name.toLowerCase() === filterTag.toLowerCase()
            )
        );
        return match;
    }
    return false;
};

const dataProductionUnique: any[] = [];

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

export const columns: ColumnDef<Product>[] = [
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
        accessorKey: "tags",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Tags
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const tagsRow = row.getValue("tags");
            if (Array.isArray(tagsRow)) {
                return (
                    <div className="flex gap-1 flex-wrap w-52">
                        {tagsRow.map((tag, index) => (
                            <Badge key={index} className="text-xs">
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                );
            }
            return null;
        },
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
        filterFn: customJumlahFilter,
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
                    Dibuat Pada
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const createdAt: string = row.getValue("created_at");
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
        accessorKey: "updated_at",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Diubah Pada
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const createdAt: string = row.getValue("created_at");
            const updatedAt: string = row.getValue("updated_at");
            const nowCreatedAt = new Date(createdAt).getTime();
            const now = new Date(updatedAt);
            const formattedDate = `${now.getDate()} ${
                months[now.getMonth()]
            } ${now.getFullYear()}`;
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");
            const time = `${hours}:${minutes}:${seconds}`;
            if (nowCreatedAt === now.getTime())
                return (
                    <div className="text-gray-800/40 italic font-semibold">
                        Belum ada perubahan
                    </div>
                );
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
            const product = row.original;
            const isSKUExists = dataProductionUnique.some(
                (uniqueProduct) => uniqueProduct.sku === product.sku
            );
            if (!isSKUExists) {
                dataProductionUnique.push(product);
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
                            href={route("production.move.show", {
                                id: Number(product.production_id),
                            })}
                            className="bg-red-500"
                        >
                            <DropdownMenuItem className="cursor-pointer">
                                Move to Stock
                            </DropdownMenuItem>
                        </Link>
                        <Link
                            href={route("production.merge.show", {
                                id: Number(product.production_id),
                            })}
                            className="bg-red-500"
                        >
                            <DropdownMenuItem className="cursor-pointer">
                                Move to Stock (Merge)
                            </DropdownMenuItem>
                        </Link>
                        <Link
                            href={route("production.detail.show", {
                                id: Number(product.production_id),
                            })}
                            className="bg-red-500"
                        >
                            <DropdownMenuItem className="cursor-pointer">
                                Ubah
                            </DropdownMenuItem>
                        </Link>
                        <Link
                            href={route("production.delete.show", {
                                id: Number(product.production_id),
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

type FilterType = "sku" | "name" | "category" | "tags" | "jumlah" | "";

type CatTagType = { value: string; label: string };

export function DataTableProduct({
    data,
    role,
    allCategory: ALLCATEGORY,
    allTag: ALLTAG,
    search,
}: {
    data: Product[];
    role: string;
    allCategory: CatTagType[];
    allTag: CatTagType[];
    search: string;
}) {
    const QUANTITY_PRODUCT = data
        .map((item) => item.product_quantity)
        .reduce((acc: number, current: number) => acc + current, 0);

    const allCategory = ALLCATEGORY.filter(
        (item: CatTagType, index: number, self) =>
            index === self.findIndex((x) => x.value === item.value)
    );

    const allTag = ALLTAG.filter(
        (item: CatTagType, index: number, self) =>
            index === self.findIndex((x) => x.value === item.value)
    );

    console.log({ search });

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [filterName, setFilterName] = React.useState<FilterType>("");
    const [minJumlah, setMinJumlah] = React.useState<number | "">("");
    const [maxJumlah, setMaxJumlah] = React.useState<number | "">("");

    const searchSku = React.useRef<HTMLInputElement>(null);
    const searchName = React.useRef<HTMLInputElement>(null);
    const searchCategory = React.useRef<HTMLInputElement>(null);
    const searchTags = React.useRef<HTMLInputElement>(null);
    const searchMinJumlah = React.useRef<HTMLInputElement>(null);
    const searchMaxJumlah = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (search) setFilterName("sku");
    }, []);

    React.useEffect(() => {
        if (searchSku.current) searchSku.current.value = "";
        if (searchName.current) searchName.current.value = "";
        if (searchCategory.current) searchCategory.current.value = "";
        if (searchTags.current) searchTags.current.value = "";
        if (searchMinJumlah.current) searchMinJumlah.current.value = "";
        if (searchMaxJumlah.current) searchMaxJumlah.current.value = "";

        setMinJumlah("");
        setMaxJumlah("");

        table.getColumn("sku")?.setFilterValue("");
        table.getColumn("nama_produk")?.setFilterValue("");
        table.getColumn("kategori")?.setFilterValue("");
        table.getColumn("tags")?.setFilterValue("");
        table.getColumn("jumlah")?.setFilterValue(["", ""]);

        if (search) table.getColumn("sku")?.setFilterValue(search);
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
            customTags: customTagsFilter,
        },
    });

    return (
        <div className="grid grid-cols-1">
            <div className="flex items-center mb-4">
                <div className="flex flex-col gap-2 w-full">
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
                                <SelectItem value="sku">SKU Produk</SelectItem>
                                <SelectItem value="name">
                                    Nama Produk
                                </SelectItem>
                                <SelectItem value="category">
                                    Nama Kategori
                                </SelectItem>
                                <SelectItem value="tags">Nama Tags</SelectItem>
                                <SelectItem value="jumlah">
                                    Jumlah Produk
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {filterName === "sku" && (
                        <Input
                            placeholder="Cari kategori berdasarkan sku produk..."
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
                            placeholder="Cari kategori berdasarkan nama produk..."
                            value={
                                (table
                                    .getColumn("nama_produk")
                                    ?.getFilterValue() as string) || ""
                            }
                            onChange={(event: any) => {
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

                    {filterName === "tags" && (
                        <SelectTwo
                            isMulti
                            name="tag"
                            options={allTag}
                            className="basic-multi-select h-9 max-w-full rounded-md border bg-transparent text-sm font-normal"
                            classNamePrefix="select"
                            onChange={(value) =>
                                table.getColumn("tags")?.setFilterValue(value)
                            }
                        />
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
                </div>
                <div className="w-full flex justify-end pr-2">
                    <Link href={route("production.add.show")}>
                        <Button className="bg-white text-gray-700 border hover:bg-gray-100">
                            Tambah Produk
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
                                    sku: "SKU Produk",
                                    nama_produk: "Nama Produk",
                                    created_at: "Dibuat Pada",
                                    updated_at: "Diubah Pada",
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
                        {table.getFilteredRowModel().rows.length} total data
                        Produksi dengan jumlah {QUANTITY_PRODUCT} produk.
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
