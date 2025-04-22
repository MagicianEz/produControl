<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Http\Requests\CategoryUpdateRequest;
use App\Http\Requests\CategoryDestroyRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = DB::table('tag')
            ->join('category', 'tag.category_id', '=', 'category.id')
            ->select(
                'category.id as category_id',
                'category.name as category_name',
                'tag.id as tag_id',
                'tag.name as tag_name',
                'tag.type as tag_type'
            )
            ->get()
            ->groupBy('category_id')
            ->map(function ($items) {
                $category = $items->first();
                return [
                    'category_id' => $category->category_id,
                    'category_name' => $category->category_name,
                    'production_tags' => $items->filter(function ($item) {
                        return $item->tag_type === 'production';
                    })->map(function ($item) {
                        return [
                            'id' => $item->tag_id,
                            'name' => $item->tag_name,
                        ];
                    })->values()->all(),
                    'stock_tags' => $items->filter(function ($item) {
                        return $item->tag_type === 'stock';
                    })->map(function ($item) {
                        return [
                            'id' => $item->tag_id,
                            'name' => $item->tag_name,
                        ];
                    })->values()->all(),
                ];
            })
            ->values();

        return Inertia::render('admin/category/page', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Kategori',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'categories' => $categories,
        ]);
    }


    public function create_show(Request $request)
    {
        $my_role = $request->user()->role;

        if ($my_role == 'marketing') {
            return Redirect::route('production.show');
        }

        return Inertia::render('admin/category/category', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Production Tambah Kategori',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
        ]);
    }

    public function store(CategoryRequest $request)
    {
        $categoryData = $request->validated();

        DB::beginTransaction();
        try {
            $category = Category::create([
                'name' => $categoryData['name'],
            ]);

            $tagsProduction = explode(',', $categoryData['tagsProduction']);
            $tagsStock = explode(',', $categoryData['tagsStock']);

            foreach ($tagsProduction as $tag) {
                Tag::create([
                    'category_id' => $category->id,
                    'name' => ucwords(trim($tag)),
                    'type' => 'production',
                ]);
            }

            foreach ($tagsStock as $tag) {
                Tag::create([
                    'category_id' => $category->id,
                    'name' => ucwords(trim($tag)),
                    'type' => 'stock',
                ]);
            }

            DB::commit();
            return Redirect::route('category.show')->with('success', 'Kategori berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('category.show')->with('error', 'Terjadi kesalahan saat membuat kategori.');
        }
    }

    public function detail_show(Request $request)
    {
        $my_role = $request->user()->role;

        $id = $request->query('id');

        if ($my_role == 'marketing' || $id == null) {
            return Redirect::route('dashboard.show');
        }

        $category = Category::with(relations: 'tags')
            ->where('id', '=', $id)
            ->get()
            ->map(function ($category) {
                return [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'production_tags' => $category->tags->where('type', 'production')->map(function ($tag) {
                        return [
                            'id' => $tag->id,
                            'name' => $tag->name,
                        ];
                    })->values()->all(),
                    'stock_tags' => $category->tags->where('type', 'stock')->map(function ($tag) {
                        return [
                            'id' => $tag->id,
                            'name' => $tag->name,
                        ];
                    })->values()->all(),
                ];
            });
        
        if ($category->isEmpty()) {
            return Redirect::route('category.show');
        }

        return Inertia::render('admin/category/detail', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Kategori Ubah Detail Kategori',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'category' => $category->first(),
        ]);
    }

    public function update(CategoryUpdateRequest $request)
    {
        $productData = $request->validated();
        
        DB::beginTransaction();
        try {
            $category = Category::find($productData['category_id']);
            if (!$category) {
                return Redirect::route('category.show')->with('error', 'Kategori tidak tersedia.');
            }
            
            $category->name = $productData['category_name'];
            $category->save();

            if (!empty($productData['production_tags_checked'])) {
                foreach ($productData['production_tags_checked'] as $tag) {
                    $tagExist = Tag::find($tag['id']);
                    if (!$tagExist) {
                        DB::rollBack();
                        return Redirect::route('category.show')->with('error', 'Tag Produksi tidak tersedia.');
                    }
                    $tagExist->name = $tag['name'];
                    $tagExist->save();
                }
            }

            if (!empty($productData['stock_tags_checked'])) {
                foreach ($productData['stock_tags_checked'] as $tag) {
                    $tagExist = Tag::find($tag['id']);
                    if (!$tagExist) {
                        DB::rollBack();
                        return Redirect::route('category.show')->with('error', 'Tag Stok tidak tersedia.');
                    }
                    $tagExist->name = $tag['name'];
                    $tagExist->save();
                }
            }

            if (!empty($productData['tags_delete'])) {
                foreach ($productData['tags_delete'] as $tag) {
                    $tagExist = Tag::find($tag['id']);
                    if (!$tagExist) {
                        DB::rollBack();
                        return Redirect::route('category.show')->with('error', 'Tag tidak tersedia.');
                    }
                    $tagExist->delete();
                }
            }

            if (!empty($productData['new_production_tags'])) {
                foreach ($productData['new_production_tags'] as $tag) {
                    Tag::create([
                        'name' => ucwords($tag),
                        'category_id' => $category->id,
                        'type' => 'production',
                    ]);
                }
            }

            if (!empty($productData['new_stock_tags'])) {
                foreach ($productData['new_stock_tags'] as $tag) {
                    Tag::create([
                        'name' => ucwords($tag),
                        'category_id' => $category->id,
                        'type' => 'stock',
                    ]);
                }
            }

            DB::commit();
            return Redirect::route('category.show')->with('success', 'Berhasil mengubah data kategori.');

        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('category.show')->with('error', 'Terjadi kesalahan saat mengubah data kategori.');
        }
    }

    public function delete_show(CategoryDestroyRequest $request)
    {
        $my_role = $request->user()->role;

        $id = $request->query('id');

        if ($my_role == 'marketing' || $id == null) {
            return Redirect::route('dashboard.show');
        }

        $category = Category::with('tags')
            ->where('id', '=', $id)
            ->get()
            ->map(function ($category) {
                return [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'production_tags' => $category->tags
                        ->where('type', 'production')
                        ->map(function ($tag) {
                            return [
                                'id' => $tag->id,
                                'name' => $tag->name,
                            ];
                        })
                        ->values()
                        ->all(),
                    'stock_tags' => $category->tags
                        ->where('type', 'stock')
                        ->map(function ($tag) {
                            return [
                                'id' => $tag->id,
                                'name' => $tag->name,
                            ];
                        })
                        ->values()
                        ->all(),
                ];
            });

        if ($category->isEmpty()) {
            return Redirect::route('category.show')->with('error', 'Kategori tidak ditemukan.');
        }

        return Inertia::render('admin/category/delete', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Kategori Hapus Data',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'category' => $category->first(),
        ]);
}

    public function destroy(CategoryDestroyRequest $request)
    {
        $productData = $request->validated();

        $id = $productData['id'];
        
        DB::beginTransaction();
        try {
            $category = Category::find($id);
            if (!$category) {
                DB::rollBack();
                return Redirect::route('category.show')->with('error', 'Kategori tidak tersedia.');
            }
            Tag::where('category_id', $id)->delete();
            $category->delete();
            DB::commit();
            return Redirect::route('category.show')->with('success', 'Kategori berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('category.show')->with('error', 'Terjadi kesalahan saat mengubah data kategori.');
        }
    }
}
