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

export type User = {
    id: number;
    username: string;
    name: string;
    created_at: Date;
    updated_at: Date;
};

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "username",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Username
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="lowercase">{row.getValue("username")}</div>
        ),
    },
    {
        accessorKey: "name",
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
            <div className="capitalize">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "role",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Role
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("role")}</div>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const user = row.original;
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
                            href={route("user.detail.show", {
                                id: Number(user.id),
                            })}
                            className="bg-red-500"
                        >
                            <DropdownMenuItem className="cursor-pointer">
                                Edit
                            </DropdownMenuItem>
                        </Link>
                        <Link
                            href={route("user.delete.show", {
                                id: Number(user.id),
                            })}
                            className="bg-red-500"
                        >
                            <DropdownMenuItem className="cursor-pointer">
                                Delete
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

type FilterType = "username" | "name" | "role" | "";

export function DataTable({ data }: { data: any[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [filterName, setFilterName] = React.useState<FilterType>("");

    const searchUsername = React.useRef<HTMLInputElement>(null);
    const searchName = React.useRef<HTMLInputElement>(null);
    const searchRole = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (searchUsername.current) searchUsername.current.value = "";
        if (searchName.current) searchName.current.value = "";
        if (searchRole.current) searchRole.current.value = "";

        table.getColumn("username")?.setFilterValue("");
        table.getColumn("name")?.setFilterValue("");
        table.getColumn("role")?.setFilterValue("");
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
            pagination: { pageSize: 20 },
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
                                <SelectItem value="username">
                                    Username
                                </SelectItem>
                                <SelectItem value="name">
                                    Nama Pengguna
                                </SelectItem>
                                <SelectItem value="role">Role</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {filterName === "username" && (
                        <Input
                            placeholder="Cari kategori berdasarkan username pengguna..."
                            ref={searchUsername}
                            value={
                                (table
                                    .getColumn("username")
                                    ?.getFilterValue() as string) || ""
                            }
                            onChange={(event) => {
                                const value = event.target.value;
                                table
                                    .getColumn("username")
                                    ?.setFilterValue(value);
                            }}
                            className="max-w-sm"
                        />
                    )}

                    {filterName === "name" && (
                        <Input
                            placeholder="Cari kategori berdasarkan nama pengguna..."
                            ref={searchName}
                            value={
                                (table
                                    .getColumn("name")
                                    ?.getFilterValue() as string) || ""
                            }
                            onChange={(event) => {
                                const value = event.target.value;
                                table.getColumn("name")?.setFilterValue(value);
                            }}
                            className="max-w-sm"
                        />
                    )}

                    {filterName === "role" && (
                        <Select
                            onValueChange={(value) => {
                                table.getColumn("role")?.setFilterValue(value);
                            }}
                            value={
                                (table
                                    .getColumn("role")
                                    ?.getFilterValue() as string) || ""
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih role yang ingin dicari" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="operator">
                                        Operator
                                    </SelectItem>
                                    <SelectItem value="marketing">
                                        Marketing
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <div className="w-full flex justify-end pr-2">
                    <Link href={route("user.create.show")}>
                        <Button className="bg-white text-gray-700 border hover:bg-gray-100">
                            Tambah Akun
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
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize cursor-pointer"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
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
                                    Pengguna tidak ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex flex-col">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} Total user
                        terdaftar.
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
