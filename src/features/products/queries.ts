import { queryOptions } from "@tanstack/react-query";
import {
  getProductBySlug,
  listAllProducts,
  listCategories,
  listFeaturedProducts,
  listProducts,
} from "./products.functions";

export interface ProductFilters {
  search?: string;
  category?: string;
}

export const productsQueryOptions = (filters: ProductFilters = {}) =>
  queryOptions({
    queryKey: ["products", "list", filters],
    queryFn: () => listProducts({ data: filters }),
  });

export const featuredProductsQueryOptions = () =>
  queryOptions({
    queryKey: ["products", "featured"],
    queryFn: () => listFeaturedProducts(),
  });

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: ["products", "categories"],
    queryFn: () => listCategories(),
    staleTime: 5 * 60 * 1000,
  });

export const productDetailsQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["products", "details", slug],
    queryFn: () => getProductBySlug({ data: slug }),
  });

export const adminProductsQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "products"],
    queryFn: () => listAllProducts(),
  });
