"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { productService } from "@/lib/api/product-service";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/shop/product-filters";
import { ProductSort } from "@/components/shop/product-sort";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Package } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Product, ProductQuery } from "@/lib/api/product-service";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ProductQuery>({});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query: ProductQuery = {
        page,
        limit: 12,
        ...filters,
      };

      // Apply URL params
      const category = searchParams.get("category");
      if (category) query.category = category;

      const search = searchParams.get("search");
      if (search) query.search = search;

      const vendor = searchParams.get("vendor");
      if (vendor) query.vendorId = vendor;

      const response = await productService.getProducts(query);
      console.log("Products response:", response);
      console.log("First product:", response.products[0]);
      setProducts(response.products);
      setTotalPages(response.pages);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, filters, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    const tokens = searchQuery.trim().split(/\s+/);

    // tokens that start with @ become tag filters
    const tagTokens = tokens
      .filter((t) => /^@/.test(t))
      .map((t) => t.slice(1).toLowerCase());

    // everything else is part of the name search
    const nameTokens = tokens.filter((t) => !/^@/.test(t));
    const nameQuery = nameTokens.join(" ");

    setFilters((prev) => ({
      ...prev,
      search: nameQuery || undefined, // text search for product names
      tags: tagTokens.length ? tagTokens : undefined,
    }));

    // optional: keep URL in sync so the search can be shared / refreshed
    const params = new URLSearchParams();
    if (nameQuery) params.set("search", nameQuery);
    if (tagTokens.length) params.set("tags", tagTokens.join(","));
    router.push(`/products?${params.toString()}`);

    setPage(1);
  };

  const handleFilterChange = (newFilters: ProductQuery) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (sort: string) => {
    setFilters((prev) => ({ ...prev, sort: sort as ProductQuery["sort"] }));
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-muted/50 to-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Package className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">
                {searchParams.get("category") ? (
                  <>
                    <span className="capitalize">
                      {searchParams.get("category")}
                    </span>
                    <span className="text-muted-foreground text-2xl ml-2">
                      Products
                    </span>
                  </>
                ) : searchParams.get("vendor") ? (
                  "Shop Products"
                ) : (
                  "All Products"
                )}
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {searchParams.get("category")
                ? `Discover amazing ${searchParams.get(
                    "category"
                  )} products from verified vendors`
                : searchParams.get("vendor")
                ? "Browse products from this shop"
                : "Explore our complete collection of quality products"}
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products or type @tag"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              <ProductFilters
                onFilterChange={handleFilterChange}
                initialFilters={filters}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Mobile Filter & Sort */}
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <ProductFilters
                        onFilterChange={handleFilterChange}
                        initialFilters={filters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <ProductSort onSortChange={handleSortChange} />
            </div>

            {/* Results count and breadcrumb */}
            <div className="flex items-center justify-between mb-6">
              <div>
                {(searchParams.get("category") ||
                  searchParams.get("vendor")) && (
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Link
                      href="/products"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      All Products
                    </Link>
                    {searchParams.get("category") && (
                      <>
                        <span className="text-muted-foreground">/</span>
                        <span className="font-medium capitalize">
                          {searchParams.get("category")}
                        </span>
                      </>
                    )}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Showing {products.length} products
                </p>
              </div>
              {(searchParams.get("category") || searchParams.get("vendor")) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters({});
                    router.push("/products");
                  }}
                  className="text-xs"
                >
                  Clear Filter
                </Button>
              )}
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="h-48 bg-muted animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-6 bg-muted animate-pulse rounded w-20" />
                        <div className="h-10 bg-muted animate-pulse rounded w-28" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">
                  No products found
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.productId || `product-${index}`}
                    variants={itemVariants}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
