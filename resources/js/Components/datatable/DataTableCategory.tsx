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
import { Badge } from "../ui/Badge";
import { Link } from "@inertiajs/react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/Select";
import { FilterFn } from "@tanstack/react-table";
import { default as SelectTwo } from "react-select";

interface Category {
    category_id: number;
    category_name: string;
    production_tags: {
        id: number;
        name: string;
    }[];
    stock_tags: {
        id: number;
        name: string;
    }[];
}

const customTagsFilter: FilterFn<any> = (row, columnId, filterValue) => {
    if (columnId === "nama_kategori") {
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
    if (columnId === "tags_produksi") {
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
    if (columnId === "tags_stok") {
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
        accessorKey: "nama_kategori",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Nama Kategori
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("nama_kategori")}</div>
        ),
        filterFn: customTagsFilter,
    },
    {
        accessorKey: "tags_produksi",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Tags Produksi
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const tagsRowProduction = row.getValue("tags_produksi");
            if (Array.isArray(tagsRowProduction)) {
                return (
                    <div className="flex gap-1 flex-wrap w-52">
                        {tagsRowProduction.map((tag, index) => (
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
        accessorKey: "tags_stok",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Tags Stok
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const tagsRowStock = row.getValue("tags_stok");
            if (Array.isArray(tagsRowStock)) {
                return (
                    <div className="flex gap-1 flex-wrap w-52">
                        {tagsRowStock.map((tag, index) => (
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
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const category = row.original;
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
                            href={route("category.detail.show", {
                                id: Number(category.category_id),
                            })}
                            className="bg-red-500"
                        >
                            <DropdownMenuItem className="cursor-pointer">
                                Ubah
                            </DropdownMenuItem>
                        </Link>
                        <Link
                            href={route("category.delete.show", {
                                id: Number(category.category_id),
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

type FilterType = "category" | "type" | "tagsProduction" | "tagsStock" | "";

type CatTagType = { value: string; label: string };

const options: CatTagType[] = [
    { value: "production", label: "Produksi" },
    { value: "stock", label: "Stok" },
];

export function DataTableCategory({
    data,
    role,
    allCategory: ALLCATEGORY,
    allTagProduction: ALLTAGPRODUCTION,
    allTagStock: ALLTAGSTOCK,
}: {
    data: Category[];
    role: string;
    allCategory: CatTagType[];
    allTagProduction: CatTagType[];
    allTagStock: CatTagType[];
}) {
    const allCategory = ALLCATEGORY.filter(
        (item: CatTagType, index: number, self) =>
            index === self.findIndex((x) => x.value === item.value)
    );

    const allTagProduction = ALLTAGPRODUCTION.filter(
        (item: CatTagType, index: number, self) =>
            index === self.findIndex((x) => x.value === item.value)
    );

    const allTagStock = ALLTAGSTOCK.filter(
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

    const searchCategory = React.useRef<HTMLInputElement>(null);
    const searchType = React.useRef<HTMLInputElement>(null);
    const searchTagsProduction = React.useRef<HTMLInputElement>(null);
    const searchTagsStock = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (searchCategory.current) searchCategory.current.value = "";
        if (searchType.current) searchType.current.value = "";
        if (searchTagsProduction.current) searchTagsProduction.current.value = "";
        if (searchTagsStock.current) searchTagsStock.current.value = "";

        table.getColumn("nama_kategori")?.setFilterValue("");
        table.getColumn("tags_produksi")?.setFilterValue("");
        table.getColumn("tags_stok")?.setFilterValue("");
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
            customTags: customTagsFilter,
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
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Cari berdasarkan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="category">
                                    Kategori
                                </SelectItem>
                                <SelectItem value="type">
                                    Tipe Kategori
                                </SelectItem>
                                <SelectItem value="tagsProduction">
                                    Tags Produksi
                                </SelectItem>
                                <SelectItem value="tagsStock">
                                    Tags Stok
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {filterName === "category" && (
                        <SelectTwo
                            isMulti
                            name="nama_kategori"
                            options={allCategory}
                            className="basic-multi-select h-9 max-w-full rounded-md border bg-transparent text-sm font-normal"
                            classNamePrefix="select"
                            onChange={(value: any) =>
                                table
                                    .getColumn("nama_kategori")
                                    ?.setFilterValue(value)
                            }
                        />
                    )}

                    {filterName === "tagsProduction" && (
                        <SelectTwo
                            isMulti
                            name="tags_produksi"
                            options={allTagProduction}
                            className="basic-multi-select h-9 max-w-full rounded-md border bg-transparent text-sm font-normal"
                            classNamePrefix="select"
                            onChange={(value: any) =>
                                table.getColumn("tags_produksi")?.setFilterValue(value)
                            }
                        />
                    )}

                    {filterName === "tagsStock" && (
                        <SelectTwo
                            isMulti
                            name="tags_stok"
                            options={allTagStock}
                            className="basic-multi-select h-9 max-w-full rounded-md border bg-transparent text-sm font-normal"
                            classNamePrefix="select"
                            onChange={(value: any) =>
                                table.getColumn("tags_stok")?.setFilterValue(value)
                            }
                        />
                    )}
                </div>
                <div className="w-full flex justify-end pr-2">
                    <Link href={route("category.add.show")}>
                        <Button className="bg-white text-gray-700 border hover:bg-gray-100">
                            Tambah Kategori
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
                                const text = column.id.replace("_", " ");
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
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
                                    Kategori tidak ditemukan.
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
                        kategori.
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
