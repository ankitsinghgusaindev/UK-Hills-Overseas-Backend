"use client";

import { useProducts } from "@/hooks/use-products";

export default function ProductsPage() {
  const {
    products,
    loading,
    error,
    pagination,
    refetch,
  } = useProducts({
    page: 1,
    limit: 10,
  });

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={refetch}>Try again</button>
      </div>
    );
  }

  return (
    <section>
      <h1>UK Hills Products</h1>

      {products.map((product) => (
        <article key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p>Starting price: ₹{product.minPrice}</p>
        </article>
      ))}

      {pagination && (
        <p>
          Page {pagination.page} of {pagination.totalPages}
        </p>
      )}
    </section>
  );
}